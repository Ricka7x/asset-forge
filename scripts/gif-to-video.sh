#!/bin/bash
# Usage: ./gif-to-video.sh <input.gif> [output_dir]
# Converts an animated GIF to MP4 and WebP for web performance.
# Requires: ffmpeg (brew install ffmpeg)

INPUT="${1:?'Usage: ./gif-to-video.sh <input.gif> [output_dir]'}"
OUT_DIR="${2:-gif-to-video}"

if ! command -v ffmpeg >/dev/null; then
  echo "Error: ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

mkdir -p "$OUT_DIR"

base="${INPUT##*/}"
name="${base%.*}"

echo "Converting $base..."

# MP4 — widest browser support, silent (no audio track)
ffmpeg -i "$INPUT" \
  -movflags faststart \
  -pix_fmt yuv420p \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
  -an \
  "$OUT_DIR/${name}.mp4" -y -loglevel error
echo "  ${name}.mp4"

# WebM — smaller, better quality, modern browsers
ffmpeg -i "$INPUT" \
  -c:v libvpx-vp9 \
  -pix_fmt yuva420p \
  -an \
  "$OUT_DIR/${name}.webm" -y -loglevel error
echo "  ${name}.webm"

echo ""
echo "HTML (replace your <img> tag):"
echo "  <video autoplay loop muted playsinline>"
echo "    <source src=\"${name}.webm\" type=\"video/webm\">"
echo "    <source src=\"${name}.mp4\" type=\"video/mp4\">"
echo "  </video>"
echo ""
echo "Done → $OUT_DIR/"
