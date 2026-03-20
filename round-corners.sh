#!/bin/bash
# Usage: ./round-corners.sh <input> [output.png] [radius]
# Applies rounded corners to any image.
# radius: corner radius in px, or percentage like "10%" — default "10%"
# Requires: ImageMagick

INPUT="${1:?'Usage: ./round-corners.sh <input> [output.png] [radius]'}"
OUTPUT="${2:-rounded.png}"
RADIUS="${3:-10%}"

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

read -r W H < <($IM identify -format "%w %h" "$INPUT")

# Resolve percentage radius to pixels
if [[ "$RADIUS" == *% ]]; then
  PCT="${RADIUS%\%}"
  R=$(( W * PCT / 100 ))
else
  R="$RADIUS"
fi

$IM "$INPUT" \
  \( +clone -alpha extract \
     -draw "fill black polygon 0,0 0,${R} ${R},0 fill white circle ${R},${R} ${R},0" \
     \( +clone -flip \) -compose Multiply -composite \
     \( +clone -flop \) -compose Multiply -composite \
  \) \
  -alpha off -compose CopyOpacity -composite \
  "$OUTPUT"

echo "Done → $OUTPUT (radius: ${R}px)"
