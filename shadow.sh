#!/bin/bash
# Usage: ./shadow.sh <input> [output.png] [blur] [opacity] [offset_x] [offset_y] [color]
# Adds a drop shadow to a PNG image.
# blur:      shadow blur radius in px, default 20
# opacity:   0-100, default 80
# offset_x:  horizontal offset in px, default 10
# offset_y:  vertical offset in px, default 10
# color:     shadow color, default black
# Requires: ImageMagick

INPUT="${1:?'Usage: ./shadow.sh <input> [output.png] [blur] [opacity] [offset_x] [offset_y] [color]'}"
OUTPUT="${2:-shadow.png}"
BLUR="${3:-20}"
OPACITY="${4:-80}"
OFFSET_X="${5:-10}"
OFFSET_Y="${6:-10}"
SHADOW_COLOR="${7:-black}"

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

$IM "$INPUT" \
  \( +clone \
     -background "$SHADOW_COLOR" \
     -shadow "${OPACITY}x${BLUR}+${OFFSET_X}+${OFFSET_Y}" \
  \) \
  +swap \
  -background none \
  -layers merge \
  +repage \
  "$OUTPUT"

echo "Done → $OUTPUT"
