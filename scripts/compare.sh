#!/bin/bash
# Usage: ./compare.sh <image_a> <image_b> [output.png] [direction]
# Creates a side-by-side (or top/bottom) visual comparison of two images.
# direction: horizontal (default), vertical
# Adds labels with filenames.
# Requires: ImageMagick

IMG_A="${1:?'Usage: ./compare.sh <image_a> <image_b> [output.png] [direction]'}"
IMG_B="${2:?'Usage: ./compare.sh <image_a> <image_b> [output.png] [direction]'}"
OUTPUT="${3:-compare.png}"
DIRECTION="${4:-horizontal}"

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

LABEL_H=40
LABEL_FONT="Helvetica"
LABEL_PT=24

label_image() {
  local img="$1" label="$2"
  read -r w h < <($IM identify -format "%w %h" "$img")
  $IM "$img" \
    \( -size "${w}x${LABEL_H}" xc:"#1C1C1E" \
       -fill white -font "$LABEL_FONT" -pointsize "$LABEL_PT" \
       -gravity Center -annotate +0+0 "$label" \
    \) \
    -append \
    png:-
}

LABEL_A="${IMG_A##*/}"
LABEL_B="${IMG_B##*/}"

if [ "$DIRECTION" = "vertical" ]; then
  $IM \
    <(label_image "$IMG_A" "$LABEL_A") \
    <(label_image "$IMG_B" "$LABEL_B") \
    -append \
    "$OUTPUT"
else
  $IM \
    <(label_image "$IMG_A" "$LABEL_A") \
    <(label_image "$IMG_B" "$LABEL_B") \
    +append \
    "$OUTPUT"
fi

echo "Done → $OUTPUT"
