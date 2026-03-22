#!/bin/bash
# Usage: ./make-sprites.sh <images_dir> [output_name] [css_prefix]
# Combines all PNG/SVG images in a directory into a horizontal sprite sheet.
# Outputs: <output_name>.png + <output_name>.css
# Requires: ImageMagick

SRC_DIR="${1:?'Usage: ./make-sprites.sh <images_dir> [output_name] [css_prefix]'}"
OUTPUT_NAME="${2:-sprite}"
CSS_PREFIX="${3:-.sprite}"

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

# Collect images (sorted for deterministic output)
IFS=$'\n' read -r -d '' -a IMAGES < <(find "$SRC_DIR" -maxdepth 1 -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.svg' \) | sort && printf '\0')

if [ ${#IMAGES[@]} -eq 0 ]; then
  echo "Error: No images found in $SRC_DIR"
  exit 1
fi

echo "Building sprite from ${#IMAGES[@]} images..."

# Combine horizontally
$IM "${IMAGES[@]}" +append "${OUTPUT_NAME}.png"

# Generate CSS with background-position offsets
CSS_FILE="${OUTPUT_NAME}.css"
{
  echo "${CSS_PREFIX} {"
  echo "  background-image: url('${OUTPUT_NAME}.png');"
  echo "  background-repeat: no-repeat;"
  echo "  display: inline-block;"
  echo "}"
  echo ""

  x_offset=0
  for img in "${IMAGES[@]}"; do
    # Get dimensions
    read -r w h < <($IM identify -format "%w %h" "$img")
    name="$(basename "${img%.*}" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')"

    echo "${CSS_PREFIX}-${name} {"
    echo "  background-position: -${x_offset}px 0px;"
    echo "  width: ${w}px;"
    echo "  height: ${h}px;"
    echo "}"

    x_offset=$(( x_offset + w ))
  done
} > "$CSS_FILE"

echo "Done → ${OUTPUT_NAME}.png + ${CSS_FILE}"
