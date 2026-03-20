#!/bin/bash
# Usage: ./add-text.sh <input> <text> [output.png] [gravity] [size] [color] [font]
# Adds a text overlay to an image.
# gravity: South (default), North, Center, NorthWest, SouthEast, etc.
# size:    font size in pt, default 48
# color:   text color, default white
# font:    font name, default Helvetica-Bold
# Requires: ImageMagick

INPUT="${1:?'Usage: ./add-text.sh <input> <text> [output.png] [gravity] [size] [color] [font]'}"
TEXT="${2:?'Text required'}"
OUTPUT="${3:-with-text.png}"
GRAVITY="${4:-South}"
FONT_SIZE="${5:-48}"
COLOR="${6:-white}"
FONT="${7:-${FONT:-Helvetica-Bold}}"

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

read -r W _ < <($IM identify -format "%w %h" "$INPUT")
TEXT_W=$(( W * 85 / 100 ))

$IM "$INPUT" \
  \( -size "${TEXT_W}x" -background none \
     -fill "$COLOR" -font "$FONT" -pointsize "$FONT_SIZE" \
     "caption:${TEXT}" \
  \) \
  -gravity "$GRAVITY" -geometry "+0+20" -composite \
  "$OUTPUT"

echo "Done → $OUTPUT"
