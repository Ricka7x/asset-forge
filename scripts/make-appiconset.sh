#!/bin/bash
# Usage: ./make-appiconset.sh <input_logo> [output_dir]
# Generates macOS AppIcon.appiconset for Xcode.
# Applies squircle mask + 10% padding on each side (logo fills 80% of canvas).
# Requires: ImageMagick (brew install imagemagick)

INPUT="${1:?'Usage: ./make-appiconset.sh <logo.png> [output_dir]'}"
OUT_DIR="${2:-AppIcon.appiconset}"

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

mkdir -p "$OUT_DIR"

# Args: <pixel_size> <filename_without_extension>
make_icon() {
  local px="$1" name="$2"
  local content=$(( px * 80 / 100 ))   # 10% margin on each side
  local radius=$(( px * 22 / 100 ))    # macOS squircle corner radius (~22%)
  local r=$(( px - 1 ))

  $IM \
    \( "$INPUT" -resize "${content}x${content}" -gravity center -background none -extent "${px}x${px}" \) \
    \( -size "${px}x${px}" xc:black -fill white -draw "roundrectangle 0,0,${r},${r},${radius},${radius}" \) \
    -alpha off -compose CopyOpacity -composite \
    "$OUT_DIR/${name}.png"

  echo "  ${name}.png (${px}x${px})"
}

echo "Generating AppIcon.appiconset..."

make_icon 16    "icon_16x16"
make_icon 32    "icon_16x16@2x"
make_icon 32    "icon_32x32"
make_icon 64    "icon_32x32@2x"
make_icon 128   "icon_128x128"
make_icon 256   "icon_128x128@2x"
make_icon 256   "icon_256x256"
make_icon 512   "icon_256x256@2x"
make_icon 512   "icon_512x512"
make_icon 1024  "icon_512x512@2x"

# Generate Contents.json for Xcode asset catalog
cat > "$OUT_DIR/Contents.json" <<'EOF'
{
  "images": [
    { "filename": "icon_16x16.png",      "idiom": "mac", "scale": "1x", "size": "16x16" },
    { "filename": "icon_16x16@2x.png",   "idiom": "mac", "scale": "2x", "size": "16x16" },
    { "filename": "icon_32x32.png",      "idiom": "mac", "scale": "1x", "size": "32x32" },
    { "filename": "icon_32x32@2x.png",   "idiom": "mac", "scale": "2x", "size": "32x32" },
    { "filename": "icon_128x128.png",    "idiom": "mac", "scale": "1x", "size": "128x128" },
    { "filename": "icon_128x128@2x.png", "idiom": "mac", "scale": "2x", "size": "128x128" },
    { "filename": "icon_256x256.png",    "idiom": "mac", "scale": "1x", "size": "256x256" },
    { "filename": "icon_256x256@2x.png", "idiom": "mac", "scale": "2x", "size": "256x256" },
    { "filename": "icon_512x512.png",    "idiom": "mac", "scale": "1x", "size": "512x512" },
    { "filename": "icon_512x512@2x.png", "idiom": "mac", "scale": "2x", "size": "512x512" }
  ],
  "info": { "author": "xcode", "version": 1 }
}
EOF

echo "Done → $OUT_DIR/"
