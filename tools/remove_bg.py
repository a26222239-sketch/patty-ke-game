#!/usr/bin/env python3
"""Remove the background from character art (立繪) using rembg, outputting a
transparent PNG. This is the project's default 去背 tool.

Default model is `isnet-anime`, which is tuned for anime / illustration
characters and gives the cleanest cutouts on this project's art.

Usage:
    python tools/remove_bg.py 立繪.png                  # -> 立繪_cutout.png
    python tools/remove_bg.py 立繪.png -o out.png
    python tools/remove_bg.py *.png --suffix _nobg      # batch
    python tools/remove_bg.py 圖.png --model u2net       # general model
    python tools/remove_bg.py 圖.png --check             # also write a
                                                         #   checkerboard preview

Models (downloaded automatically on first use, cached in ~/.u2net):
    isnet-anime  -> best for illustration / anime 立繪 (default)
    u2net        -> general purpose
    isnet-general-use -> general, sharper alpha
"""
import argparse
import os
import sys

from rembg import remove, new_session
from PIL import Image


def checker(size, s=24):
    bg = Image.new("RGB", size, (235, 235, 235))
    px = bg.load()
    for y in range(size[1]):
        for x in range(size[0]):
            if (x // s + y // s) % 2 == 0:
                px[x, y] = (200, 200, 200)
    return bg


def main():
    ap = argparse.ArgumentParser(description="Remove background -> transparent PNG (rembg).")
    ap.add_argument("inputs", nargs="+", help="input image(s)")
    ap.add_argument("-o", "--output", help="output path (single input only)")
    ap.add_argument("--model", default="isnet-anime",
                    help="rembg model (default: isnet-anime, best for 立繪)")
    ap.add_argument("--suffix", default="_cutout", help="suffix for batch output names")
    ap.add_argument("--check", action="store_true",
                    help="also save a *_onchecker.png preview to eyeball transparency")
    args = ap.parse_args()

    if args.output and len(args.inputs) > 1:
        sys.exit("[error] -o/--output only works with a single input")

    print(f"[model] {args.model}")
    session = new_session(args.model)

    for path in args.inputs:
        out = args.output or f"{os.path.splitext(path)[0]}{args.suffix}.png"
        img = Image.open(path).convert("RGBA")
        cut = remove(img, session=session)
        cut.save(out)
        print(f"[ok] {os.path.basename(path)} -> {out}  {cut.size}")
        if args.check:
            prev = out.replace(".png", "_onchecker.png")
            comp = Image.alpha_composite(checker(cut.size).convert("RGBA"), cut).convert("RGB")
            comp.save(prev)
            print(f"     preview -> {prev}")


if __name__ == "__main__":
    main()
