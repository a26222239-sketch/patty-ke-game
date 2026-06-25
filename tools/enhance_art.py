#!/usr/bin/env python3
"""Enhance character art with Real-ESRGAN (4x) then downscale back to the
original size. The net effect is denoise / sharpen / cleanup at the SAME
resolution — useful for AI-generated 立繪 with compression noise or soft edges.

Self-contained: vendors the RRDBNet architecture so it does not depend on the
`basicsr` / `realesrgan` packages (which are painful to build on CPU-only boxes).
Transparent backgrounds are preserved — the alpha channel is taken straight from
the original image (output size == input size, so no alpha resampling needed).

Usage:
    python tools/enhance_art.py input.png
    python tools/enhance_art.py input.png -o output.png
    python tools/enhance_art.py *.png --model anime --suffix _hd
    python tools/enhance_art.py input.png --keep-4x      # skip the downscale

Models:
    anime  -> RealESRGAN_x4plus_anime_6B  (default; best for illustration/立繪)
    photo  -> RealESRGAN_x4plus           (general / semi-realistic)
"""
import argparse
import os
import sys
import time

import numpy as np
import torch
from torch import nn
from torch.nn import functional as F
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
WEIGHTS = {
    "anime": (os.path.join(HERE, "weights", "RealESRGAN_x4plus_anime_6B.pth"), 6),
    "photo": (os.path.join(HERE, "weights", "RealESRGAN_x4plus.pth"), 23),
}


# --------------------------------------------------------------------------
# RRDBNet architecture (vendored from BasicSR / Real-ESRGAN, inference only)
# --------------------------------------------------------------------------
def make_layer(block, n, **kw):
    return nn.Sequential(*[block(**kw) for _ in range(n)])


class ResidualDenseBlock(nn.Module):
    def __init__(self, nf=64, gc=32):
        super().__init__()
        self.conv1 = nn.Conv2d(nf, gc, 3, 1, 1)
        self.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1)
        self.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1)
        self.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
        self.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, inplace=True)

    def forward(self, x):
        x1 = self.lrelu(self.conv1(x))
        x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
        x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
        return x5 * 0.2 + x


class RRDB(nn.Module):
    def __init__(self, nf, gc=32):
        super().__init__()
        self.rdb1 = ResidualDenseBlock(nf, gc)
        self.rdb2 = ResidualDenseBlock(nf, gc)
        self.rdb3 = ResidualDenseBlock(nf, gc)

    def forward(self, x):
        out = self.rdb3(self.rdb2(self.rdb1(x)))
        return out * 0.2 + x


class RRDBNet(nn.Module):
    def __init__(self, in_ch=3, out_ch=3, nf=64, num_block=23, gc=32):
        super().__init__()
        self.conv_first = nn.Conv2d(in_ch, nf, 3, 1, 1)
        self.body = make_layer(RRDB, num_block, nf=nf, gc=gc)
        self.conv_body = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_last = nn.Conv2d(nf, out_ch, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, inplace=True)

    def forward(self, x):
        feat = self.conv_first(x)
        feat = feat + self.conv_body(self.body(feat))
        feat = self.lrelu(self.conv_up1(F.interpolate(feat, scale_factor=2, mode="nearest")))
        feat = self.lrelu(self.conv_up2(F.interpolate(feat, scale_factor=2, mode="nearest")))
        return self.conv_last(self.lrelu(self.conv_hr(feat)))


def load_model(model_key):
    path, num_block = WEIGHTS[model_key]
    if not os.path.exists(path):
        sys.exit(f"[error] weight not found: {path}")
    net = RRDBNet(num_block=num_block)
    sd = torch.load(path, map_location="cpu")
    # Real-ESRGAN checkpoints store the weights under 'params_ema' or 'params'
    for key in ("params_ema", "params"):
        if key in sd:
            sd = sd[key]
            break
    net.load_state_dict(sd, strict=True)
    net.eval()
    return net


# --------------------------------------------------------------------------
# Tiled 4x inference (keeps peak memory bounded on CPU)
# --------------------------------------------------------------------------
@torch.no_grad()
def upscale_4x(net, rgb, tile=400, pad=16):
    """rgb: HxWx3 uint8 -> 4Hx4Wx3 uint8, processed tile by tile."""
    h, w, _ = rgb.shape
    img = torch.from_numpy(rgb.astype(np.float32) / 255.0).permute(2, 0, 1).unsqueeze(0)
    out = torch.zeros((1, 3, h * 4, w * 4), dtype=torch.float32)
    n_tiles = ((h + tile - 1) // tile) * ((w + tile - 1) // tile)
    done = 0
    for y in range(0, h, tile):
        for x in range(0, w, tile):
            ye, xe = min(y + tile, h), min(x + tile, w)
            # input tile with padding for seamless borders
            iy0, ix0 = max(y - pad, 0), max(x - pad, 0)
            iy1, ix1 = min(ye + pad, h), min(xe + pad, w)
            in_tile = img[:, :, iy0:iy1, ix0:ix1]
            out_tile = net(in_tile)
            # crop the padded border back out (x4 scaled)
            top = (y - iy0) * 4
            left = (x - ix0) * 4
            out_tile = out_tile[:, :, top:top + (ye - y) * 4, left:left + (xe - x) * 4]
            out[:, :, y * 4:ye * 4, x * 4:xe * 4] = out_tile
            done += 1
            print(f"\r    tile {done}/{n_tiles}", end="", flush=True)
    print()
    out = out.clamp(0, 1).squeeze(0).permute(1, 2, 0).numpy()
    return (out * 255.0).round().astype(np.uint8)


def process(path, net, out_path, keep_4x):
    t0 = time.time()
    im = Image.open(path)
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    alpha = im.convert("RGBA").getchannel("A") if has_alpha else None
    rgb = np.asarray(im.convert("RGB"))
    h, w, _ = rgb.shape
    print(f"[{os.path.basename(path)}] {w}x{h}{' +alpha' if has_alpha else ''} -> enhancing...")

    up = upscale_4x(net, rgb)                       # 4x
    result = Image.fromarray(up, "RGB")
    if not keep_4x:
        result = result.resize((w, h), Image.LANCZOS)  # back to original size

    if has_alpha:
        a = alpha if not keep_4x else alpha.resize((w * 4, h * 4), Image.LANCZOS)
        result = result.convert("RGBA")
        result.putalpha(a)

    result.save(out_path)
    print(f"    saved -> {out_path}  ({result.size[0]}x{result.size[1]}, "
          f"{os.path.getsize(out_path)//1024}KB, {time.time()-t0:.1f}s)")


def main():
    ap = argparse.ArgumentParser(description="Enhance art via Real-ESRGAN 4x then downscale back.")
    ap.add_argument("inputs", nargs="+", help="input image(s)")
    ap.add_argument("-o", "--output", help="output path (single input only)")
    ap.add_argument("--model", choices=list(WEIGHTS), default="anime",
                    help="anime (default, for illustration) or photo (general)")
    ap.add_argument("--suffix", default="_enhanced", help="suffix for batch output names")
    ap.add_argument("--keep-4x", action="store_true", help="keep the 4x upscale (skip downscale)")
    ap.add_argument("--threads", type=int, default=0, help="torch CPU threads (0=auto)")
    args = ap.parse_args()

    if args.threads > 0:
        torch.set_num_threads(args.threads)
    if args.output and len(args.inputs) > 1:
        sys.exit("[error] -o/--output only works with a single input")

    print(f"[model] {args.model}  | torch {torch.__version__} | "
          f"threads {torch.get_num_threads()}")
    net = load_model(args.model)

    for path in args.inputs:
        if args.output:
            out_path = args.output
        else:
            base, ext = os.path.splitext(path)
            out_path = f"{base}{args.suffix}{ext}"
        process(path, net, out_path, args.keep_4x)


if __name__ == "__main__":
    main()
