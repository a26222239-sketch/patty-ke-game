#!/usr/bin/env python3
"""Match the skin tone of one character (立繪) to another.

Reads the skin colour/light distribution of a REFERENCE image and applies it to
one or more TARGET images, using Reinhard colour transfer in LAB space computed
over detected skin pixels only. Clothes, stockings, hair and background are left
untouched (transfer is masked to skin and feathered at the edges).

Note: this matches the overall skin *colour tone* (statistics), not per-pixel
painting. It does not "relight" — it won't move highlights/shadows to new
positions; it aligns the colour/brightness basis.

Usage:
    # make B's skin match A's skin tone
    python tools/skin_transfer.py --ref A.png B.png            # -> B_skinmatched.png
    python tools/skin_transfer.py --ref A.png B.png -o out.png
    python tools/skin_transfer.py --ref A.png *.png            # batch many targets
    python tools/skin_transfer.py --ref A.png B.png --strength 0.7   # softer match
    python tools/skin_transfer.py --ref A.png B.png --check    # dump skin-mask overlay
    python tools/skin_transfer.py --ref A.png B.png --region all     # whole-image tone

Requires: opencv-python (or -headless), numpy.  CPU only, runs in ~1s.
"""
import argparse
import os
import sys

import cv2
import numpy as np


def skin_mask(bgr):
    """Heuristic skin detector for semi-realistic illustration.
    Combines YCrCb + HSV ranges; excludes near-white bg and dark hair/clothes."""
    ycrcb = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
    Y, Cr, Cb = ycrcb[..., 0], ycrcb[..., 1], ycrcb[..., 2]
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m = ((Cr >= 135) & (Cr <= 178) & (Cb >= 90) & (Cb <= 130) &
         (Y >= 80) & (S >= 20) & (S <= 170) & (V >= 120) &
         ((H <= 25) | (H >= 160)))
    m = m.astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, k)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k)
    return m


def transfer(ref_bgr, tgt_bgr, region="skin", strength=1.0):
    if region == "all":
        ref_m = np.ones(ref_bgr.shape[:2], bool)
        tgt_sel = np.ones(tgt_bgr.shape[:2], bool)
    else:
        ref_m = skin_mask(ref_bgr) > 0
        tgt_sel = skin_mask(tgt_bgr) > 0
        if ref_m.sum() < 50 or tgt_sel.sum() < 50:
            raise ValueError("too little skin detected (ref or target)")

    ref_lab = cv2.cvtColor(ref_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    tgt_lab = cv2.cvtColor(tgt_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    res_lab = tgt_lab.copy()
    for c in range(3):
        a, b = ref_lab[..., c][ref_m], tgt_lab[..., c][tgt_sel]
        ma, sa = a.mean(), a.std() + 1e-6
        mb, sb = b.mean(), b.std() + 1e-6
        ratio = np.clip(sa / sb, 0.5, 2.0)
        res_lab[..., c] = (tgt_lab[..., c] - mb) * ratio + ma
    res = cv2.cvtColor(np.clip(res_lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR).astype(np.float32)

    # feathered mask, scaled by strength; only selected region changes
    m = (tgt_sel.astype(np.float32)) * 255
    if region != "all":
        m = cv2.GaussianBlur(m, (0, 0), sigmaX=4)
    m = (m / 255.0)[..., None] * float(strength)
    out = res * m + tgt_bgr.astype(np.float32) * (1 - m)
    return np.clip(out, 0, 255).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser(description="Match skin tone of target(s) to a reference 立繪.")
    ap.add_argument("targets", nargs="+", help="target image(s) to recolour")
    ap.add_argument("--ref", required=True, help="reference image (skin-tone basis)")
    ap.add_argument("-o", "--output", help="output path (single target only)")
    ap.add_argument("--region", choices=["skin", "all"], default="skin",
                    help="skin = only skin pixels (default); all = whole-image tone")
    ap.add_argument("--strength", type=float, default=1.0, help="blend 0..1 (default 1.0)")
    ap.add_argument("--suffix", default="_skinmatched", help="batch output suffix")
    ap.add_argument("--check", action="store_true", help="also dump *_skinoverlay.png")
    args = ap.parse_args()

    if args.output and len(args.targets) > 1:
        sys.exit("[error] -o/--output only works with a single target")
    ref = cv2.imread(args.ref)
    if ref is None:
        sys.exit(f"[error] cannot read ref: {args.ref}")

    print(f"[ref] {os.path.basename(args.ref)}  region={args.region} strength={args.strength}")
    for path in args.targets:
        tgt = cv2.imread(path)
        if tgt is None:
            print(f"[skip] cannot read {path}"); continue
        out = args.output or f"{os.path.splitext(path)[0]}{args.suffix}.png"
        res = transfer(ref, tgt, region=args.region, strength=args.strength)
        cv2.imwrite(out, res)
        print(f"[ok] {os.path.basename(path)} -> {out}")
        if args.check:
            ov = tgt.copy(); ov[skin_mask(tgt) > 0] = (0, 255, 0)
            cv2.imwrite(out.replace(".png", "_skinoverlay.png"),
                        cv2.addWeighted(tgt, 0.55, ov, 0.45, 0))


if __name__ == "__main__":
    main()
