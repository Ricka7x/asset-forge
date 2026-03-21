#!/bin/bash
# Usage: ./make-ico.sh <input_logo> [output.ico]
# Generates a multi-size .ico with all standard embedded sizes.
# Requires: ImageMagick (brew install imagemagick)

INPUT="${1:?'Usage: ./make-ico.sh <logo.png> [output.ico]'}"
OUTPUT="${2:-favicon.ico}"

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

echo "Generating $OUTPUT..."

$IM "$INPUT" \
  \( -clone 0 -resize 256x256 \) \
  \( -clone 0 -resize 128x128 \) \
  \( -clone 0 -resize 64x64  \) \
  \( -clone 0 -resize 48x48  \) \
  \( -clone 0 -resize 32x32  \) \
  \( -clone 0 -resize 16x16  \) \
  -delete 0 \
  "$OUTPUT"

echo "Done → $OUTPUT (16, 32, 48, 64, 128, 256px embedded)"
