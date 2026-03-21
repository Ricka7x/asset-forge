#!/bin/bash
# Usage: ./make-og-image.sh -b <image> [-t <headline>] [-s <subtitle>] [-l <logo>] [-o output.png] [-g gravity] [-c overlay] [-f text_color]
# Resizes and center-crops to Open Graph spec (1200x630).
# All text/logo flags are optional — omit for a plain crop.
# Requires: ImageMagick

FONT="${FONT:-Helvetica-Bold}"
FONT_BODY="${FONT_BODY:-Helvetica}"

BG="" HEADLINE="" SUBTITLE="" LOGO=""
OUTPUT="og-image.png"
GRAVITY="Center"
OVERLAY_COLOR="rgba(0,0,0,0.45)"
TEXT_COLOR="white"

usage() {
  echo "Usage: ./make-og-image.sh -b <image> [-t headline] [-s subtitle] [-l logo] [-o output.png] [-g gravity] [-c overlay] [-f text_color]"
  exit 1
}

while getopts "b:t:s:l:o:g:c:f:h" opt; do
  case $opt in
    b) BG="$OPTARG" ;;
    t) HEADLINE="$OPTARG" ;;
    s) SUBTITLE="$OPTARG" ;;
    l) LOGO="$OPTARG" ;;
    o) OUTPUT="$OPTARG" ;;
    g) GRAVITY="$OPTARG" ;;
    c) OVERLAY_COLOR="$OPTARG" ;;
    f) TEXT_COLOR="$OPTARG" ;;
    h) usage ;;
    *) usage ;;
  esac
done

[ -z "$BG" ] && echo "Error: -b <background> required" && exit 1

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

W=1200 H=630
TEXT_W=$(( W * 80 / 100 ))

# Base: scale + crop
cmd=(
  "$IM"
  "(" "$BG" -resize "${W}x${H}^" -gravity "$GRAVITY" -extent "${W}x${H}" ")"
)

# Overlay (only if text or logo provided)
if [ -n "$HEADLINE" ] || [ -n "$LOGO" ]; then
  cmd+=(
    "(" -size "${W}x${H}" xc:"${OVERLAY_COLOR}" ")"
    -composite
  )
fi

# Logo
if [ -n "$LOGO" ]; then
  cmd+=(
    "(" "$LOGO" -resize "80x80" -background none ")"
    -gravity West -geometry "+80+0" -composite
  )
fi

# Headline
if [ -n "$HEADLINE" ]; then
  cmd+=(
    "(" -size "${TEXT_W}x" -background none -fill "$TEXT_COLOR"
        -font "$FONT" -pointsize 80 "caption:${HEADLINE}" ")"
    -gravity Center -geometry "+0-40" -composite
  )
fi

# Subtitle
if [ -n "$SUBTITLE" ]; then
  cmd+=(
    "(" -size "${TEXT_W}x" -background none -fill "$TEXT_COLOR"
        -font "$FONT_BODY" -pointsize 40
        -alpha set -channel alpha -evaluate multiply 0.8 +channel
        "caption:${SUBTITLE}" ")"
    -gravity Center -geometry "+0+60" -composite
  )
fi

cmd+=("$OUTPUT")
"${cmd[@]}"

echo "Done → $OUTPUT (1200x630)"
