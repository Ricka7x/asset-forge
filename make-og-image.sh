#!/bin/bash
# Usage: ./make-og-image.sh <input> [output.png] [gravity]
# Resizes and center-crops to Open Graph spec (1200x630).
# gravity: Center (default), North, South, NorthWest, etc.
# Requires: ImageMagick

INPUT="${1:?'Usage: ./make-og-image.sh <image> [output.png] [gravity]'}"
OUTPUT="${2:-og-image.png}"
GRAVITY="${3:-Center}"

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

$IM "$INPUT" \
  -resize "1200x630^" \
  -gravity "$GRAVITY" \
  -extent 1200x630 \
  "$OUTPUT"

echo "Done → $OUTPUT (1200x630)"
