#!/bin/bash
# Usage: ./make-app-icons.sh <logo> [output_dir] [--platform macos|ios|android]
# Generates app icon sets for macOS (squircle), iOS, or Android.
# --platform: macos (default), ios, android
# Requires: ImageMagick

INPUT="${1:?'Usage: ./make-app-icons.sh <logo> [output_dir] [--platform macos|ios|android]'}"
shift

OUT_DIR=""
PLATFORM="macos"

# Second positional arg (if not a flag)
if [ $# -gt 0 ] && [[ "$1" != --* ]]; then
  OUT_DIR="$1"; shift
fi

# Parse flags
while [ $# -gt 0 ]; do
  case "$1" in
    --platform)   PLATFORM="$2"; shift 2 ;;
    --platform=*) PLATFORM="${1#--platform=}"; shift ;;
    *) shift ;;
  esac
done

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

case "$PLATFORM" in

# ─── macOS ────────────────────────────────────────────────────────────────────
macos)
  OUT_DIR="${OUT_DIR:-AppIcon.appiconset}"
  mkdir -p "$OUT_DIR"
  echo "Generating macOS AppIcon.appiconset..."

  make_icon() {
    local px="$1" name="$2"
    local content=$(( px * 80 / 100 ))
    local radius=$(( px * 22 / 100 ))
    local r=$(( px - 1 ))
    $IM \
      \( "$INPUT" -resize "${content}x${content}" -gravity center -background none -extent "${px}x${px}" \) \
      \( -size "${px}x${px}" xc:black -fill white -draw "roundrectangle 0,0,${r},${r},${radius},${radius}" \) \
      -alpha off -compose CopyOpacity -composite \
      "$OUT_DIR/${name}.png"
    echo "  ${name}.png (${px}x${px})"
  }

  make_icon 16   "icon_16x16"
  make_icon 32   "icon_16x16@2x"
  make_icon 32   "icon_32x32"
  make_icon 64   "icon_32x32@2x"
  make_icon 128  "icon_128x128"
  make_icon 256  "icon_128x128@2x"
  make_icon 256  "icon_256x256"
  make_icon 512  "icon_256x256@2x"
  make_icon 512  "icon_512x512"
  make_icon 1024 "icon_512x512@2x"

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
  ;;

# ─── iOS ──────────────────────────────────────────────────────────────────────
ios)
  OUT_DIR="${OUT_DIR:-AppIcon.appiconset}"
  mkdir -p "$OUT_DIR"
  echo "Generating iOS AppIcon.appiconset..."

  make_icon() {
    local px="$1" name="$2"
    $IM "$INPUT" -resize "${px}x${px}" "$OUT_DIR/${name}.png"
    echo "  ${name}.png (${px}x${px})"
  }

  make_icon 20   "icon-20"
  make_icon 40   "icon-20@2x"
  make_icon 60   "icon-20@3x"
  make_icon 29   "icon-29"
  make_icon 58   "icon-29@2x"
  make_icon 87   "icon-29@3x"
  make_icon 40   "icon-40"
  make_icon 80   "icon-40@2x"
  make_icon 120  "icon-40@3x"
  make_icon 120  "icon-60@2x"
  make_icon 180  "icon-60@3x"
  make_icon 76   "icon-76"
  make_icon 152  "icon-76@2x"
  make_icon 167  "icon-83.5@2x"
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
  ;;

# ─── Android ──────────────────────────────────────────────────────────────────
android)
  OUT_DIR="${OUT_DIR:-res}"
  echo "Generating Android mipmap icons..."

  make_density() {
    local density="$1" px="$2"
    local dir="$OUT_DIR/mipmap-${density}"
    mkdir -p "$dir"

    $IM "$INPUT" -resize "${px}x${px}" "$dir/ic_launcher.png"

    $IM "$INPUT" -resize "${px}x${px}" \
      \( +clone -alpha extract \
         -draw "fill black polygon 0,0 0,${px} ${px},0 fill white circle $((px/2)),$((px/2)) $((px/2)),0" \
         \( +clone -flip \) -compose Multiply -composite \
         \( +clone -flop \) -compose Multiply -composite \
      \) \
      -alpha off -compose CopyOpacity -composite \
      "$dir/ic_launcher_round.png"

    echo "  mipmap-${density}/ic_launcher.png + ic_launcher_round.png (${px}x${px})"
  }

  make_density mdpi    48
  make_density hdpi    72
  make_density xhdpi   96
  make_density xxhdpi  144
  make_density xxxhdpi 192

  mkdir -p "$OUT_DIR"
  $IM "$INPUT" -resize "512x512" "$OUT_DIR/ic_launcher-playstore.png"
  echo "  ic_launcher-playstore.png (512x512)"

  echo "Done → $OUT_DIR/"
  ;;

*)
  echo "Error: unknown platform '$PLATFORM'. Use: macos, ios, android"
  exit 1
  ;;
esac
