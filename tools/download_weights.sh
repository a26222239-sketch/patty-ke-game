#!/usr/bin/env bash
# Download the Real-ESRGAN model weights used by tools/enhance_art.py.
# Weights are NOT committed to git (see .gitignore) — run this once per machine.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/weights"
mkdir -p "$DIR"

dl() { # url, filename
  if [ -f "$DIR/$2" ]; then echo "[skip] $2 already exists"; return; fi
  echo "[get ] $2"
  curl -fSL -o "$DIR/$2" "$1"
}

# anime / illustration model (default, best for 立繪) — ~17MB
dl "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth" \
   "RealESRGAN_x4plus_anime_6B.pth"

# general / semi-realistic model — ~67MB
dl "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth" \
   "RealESRGAN_x4plus.pth"

echo "done -> $DIR"
