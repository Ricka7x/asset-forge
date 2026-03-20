#!/bin/bash
# Usage: ./make-appiconset-android.sh <input_logo> [output_dir]
# Generates Android mipmap icon folders (ic_launcher + round variant).
# Requires: ImageMagick

INPUT="${1:?'Usage: ./make-appiconset-android.sh <logo.png> [output_dir]'}"
OUT_DIR="${2:-res}"

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

echo "Generating Android mipmap icons..."

# density -> size in px
declare -A SIZES=(
  ["mdpi"]=48
  ["hdpi"]=72
  ["xhdpi"]=96
  ["xxhdpi"]=144
  ["xxxhdpi"]=192
)

for density in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  px="${SIZES[$density]}"
  dir="$OUT_DIR/mipmap-${density}"
  mkdir -p "$dir"

  # Square launcher icon
  $IM "$INPUT" -resize "${px}x${px}" "$dir/ic_launcher.png"

  # Round variant — circular crop
  $IM "$INPUT" -resize "${px}x${px}" \
    \( +clone -alpha extract \
       -draw "fill black polygon 0,0 0,${px} ${px},0 fill white circle $((px/2)),$((px/2)) $((px/2)),0" \
       \( +clone -flip \) -compose Multiply -composite \
       \( +clone -flop \) -compose Multiply -composite \
    \) \
    -alpha off -compose CopyOpacity -composite \
    "$dir/ic_launcher_round.png"

  echo "  mipmap-${density}/ic_launcher.png + ic_launcher_round.png (${px}x${px})"
done

# Play Store icon (512x512, no density folder)
mkdir -p "$OUT_DIR"
$IM "$INPUT" -resize "512x512" "$OUT_DIR/ic_launcher-playstore.png"
echo "  ic_launcher-playstore.png (512x512)"

echo "Done → $OUT_DIR/"
