#!/bin/bash
# Usage: ./make-appiconset-ios.sh <input_logo> [output_dir]
# Generates iOS AppIcon.appiconset for Xcode (no squircle — iOS clips automatically).
# Requires: ImageMagick

INPUT="${1:?'Usage: ./make-appiconset-ios.sh <logo.png> [output_dir]'}"
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

make_icon() {
  local px="$1" name="$2"
  $IM "$INPUT" -resize "${px}x${px}" "$OUT_DIR/${name}.png"
  echo "  ${name}.png (${px}x${px})"
}

echo "Generating iOS AppIcon.appiconset..."

# Notification
make_icon 20  "icon-20"
make_icon 40  "icon-20@2x"
make_icon 60  "icon-20@3x"
# Settings
make_icon 29  "icon-29"
make_icon 58  "icon-29@2x"
make_icon 87  "icon-29@3x"
# Spotlight
make_icon 40  "icon-40"
make_icon 80  "icon-40@2x"
make_icon 120 "icon-40@3x"
# App icon
make_icon 120 "icon-60@2x"
make_icon 180 "icon-60@3x"
# iPad
make_icon 76  "icon-76"
make_icon 152 "icon-76@2x"
make_icon 167 "icon-83.5@2x"
# App Store
make_icon 1024 "icon-1024"

cat > "$OUT_DIR/Contents.json" <<'EOF'
{
  "images": [
    { "filename": "icon-20.png",      "idiom": "iphone", "scale": "1x", "size": "20x20" },
    { "filename": "icon-20@2x.png",   "idiom": "iphone", "scale": "2x", "size": "20x20" },
    { "filename": "icon-20@3x.png",   "idiom": "iphone", "scale": "3x", "size": "20x20" },
    { "filename": "icon-29.png",      "idiom": "iphone", "scale": "1x", "size": "29x29" },
    { "filename": "icon-29@2x.png",   "idiom": "iphone", "scale": "2x", "size": "29x29" },
    { "filename": "icon-29@3x.png",   "idiom": "iphone", "scale": "3x", "size": "29x29" },
    { "filename": "icon-40.png",      "idiom": "iphone", "scale": "1x", "size": "40x40" },
    { "filename": "icon-40@2x.png",   "idiom": "iphone", "scale": "2x", "size": "40x40" },
    { "filename": "icon-40@3x.png",   "idiom": "iphone", "scale": "3x", "size": "40x40" },
    { "filename": "icon-60@2x.png",   "idiom": "iphone", "scale": "2x", "size": "60x60" },
    { "filename": "icon-60@3x.png",   "idiom": "iphone", "scale": "3x", "size": "60x60" },
    { "filename": "icon-20.png",      "idiom": "ipad",   "scale": "1x", "size": "20x20" },
    { "filename": "icon-20@2x.png",   "idiom": "ipad",   "scale": "2x", "size": "20x20" },
    { "filename": "icon-29.png",      "idiom": "ipad",   "scale": "1x", "size": "29x29" },
    { "filename": "icon-29@2x.png",   "idiom": "ipad",   "scale": "2x", "size": "29x29" },
    { "filename": "icon-40.png",      "idiom": "ipad",   "scale": "1x", "size": "40x40" },
    { "filename": "icon-40@2x.png",   "idiom": "ipad",   "scale": "2x", "size": "40x40" },
    { "filename": "icon-76.png",      "idiom": "ipad",   "scale": "1x", "size": "76x76" },
    { "filename": "icon-76@2x.png",   "idiom": "ipad",   "scale": "2x", "size": "76x76" },
    { "filename": "icon-83.5@2x.png", "idiom": "ipad",   "scale": "2x", "size": "83.5x83.5" },
    { "filename": "icon-1024.png",    "idiom": "ios-marketing", "scale": "1x", "size": "1024x1024" }
  ],
  "info": { "author": "xcode", "version": 1 }
}
EOF

echo "Done → $OUT_DIR/"
