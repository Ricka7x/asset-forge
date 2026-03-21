#!/bin/bash
# Usage: ./palette.sh <image> [num_colors] [output.png]
# Extracts dominant colors from an image and prints hex codes.
# Optionally saves a palette swatch PNG.
# num_colors: default 6
# Requires: ImageMagick

INPUT="${1:?'Usage: ./palette.sh <image> [num_colors] [output.png]'}"
NUM_COLORS="${2:-6}"
OUTPUT_PNG="${3:-}"

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

# Quantize image to N colors, extract hex values
COLORS=$($IM "$INPUT" \
  -resize 200x200 \
  +dither -colors "$NUM_COLORS" \
  -unique-colors \
  txt:- 2>/dev/null \
  | grep -oE '#[0-9A-Fa-f]{6}' \
  | head -"$NUM_COLORS")

echo "Dominant colors:"
while IFS= read -r hex; do
  echo "  $hex"
done <<< "$COLORS"

# Save swatch PNG if requested
if [ -n "$OUTPUT_PNG" ]; then
  SWATCH_W=80
  SWATCH_H=80

  args=()
  while IFS= read -r hex; do
    args+=( \( -size "${SWATCH_W}x${SWATCH_H}" "xc:${hex}" \) )
  done <<< "$COLORS"

  $IM "${args[@]}" +append "$OUTPUT_PNG"
  echo "Swatch → $OUTPUT_PNG"
fi
