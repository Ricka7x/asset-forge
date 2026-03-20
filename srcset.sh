#!/bin/bash
# Usage: ./srcset.sh <image> [output_dir] [scales]
# Generates @1x, @2x, @3x variants of an image for use with HTML srcset.
# scales: comma-separated list, default "1,2,3"
# Requires: ImageMagick

INPUT="${1:?'Usage: ./srcset.sh <image> [output_dir] [scales]'}"
OUT_DIR="${2:-.}"
SCALES="${3:-1,2,3}"

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

mkdir -p "$OUT_DIR"

# Get base dimensions (@1x size = original)
read -r BASE_W BASE_H < <($IM identify -format "%w %h" "$INPUT")

base="${INPUT##*/}"
name="${base%.*}"
ext="${base##*.}"

echo "Base size: ${BASE_W}x${BASE_H}"
echo "Generating srcset variants..."

HTML_SRCSET=""

IFS=',' read -ra SCALE_LIST <<< "$SCALES"
for scale in "${SCALE_LIST[@]}"; do
  w=$(( BASE_W * scale ))
  h=$(( BASE_H * scale ))

  if [ "$scale" -eq 1 ]; then
    out_file="$OUT_DIR/${name}.${ext}"
    html_name="${name}.${ext}"
  else
    out_file="$OUT_DIR/${name}@${scale}x.${ext}"
    html_name="${name}@${scale}x.${ext}"
  fi

  $IM "$INPUT" -resize "${w}x${h}" "$out_file"
  echo "  ${out_file} (${w}x${h})"
  HTML_SRCSET="${HTML_SRCSET}${html_name} ${w}w, "
done

# Trim trailing comma+space
HTML_SRCSET="${HTML_SRCSET%, }"

echo ""
echo "HTML srcset:"
echo "  <img"
echo "    src=\"${name}.${ext}\""
echo "    srcset=\"${HTML_SRCSET}\""
echo "    sizes=\"(max-width: 768px) 100vw, 50vw\""
echo "    alt=\"\">"
