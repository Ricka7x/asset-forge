#!/bin/bash
# Usage: ./make-feature-graphic.sh -b <bg> -l <logo> -t <headline> [-s <subtitle>] [-o output.png] [-c overlay] [-f text_color]
# Generates a Google Play Store feature graphic (1024x500).
# Requires: ImageMagick

FONT="${FONT:-Helvetica-Bold}"
FONT_BODY="${FONT_BODY:-Helvetica}"

BG="" LOGO="" HEADLINE="" SUBTITLE=""
OUTPUT="feature-graphic.png"
OVERLAY_COLOR="rgba(0,0,0,0.45)"
TEXT_COLOR="white"

while getopts "b:l:t:s:o:c:f:h" opt; do
  case $opt in
    b) BG="$OPTARG" ;;
    l) LOGO="$OPTARG" ;;
    t) HEADLINE="$OPTARG" ;;
    s) SUBTITLE="$OPTARG" ;;
    o) OUTPUT="$OPTARG" ;;
    c) OVERLAY_COLOR="$OPTARG" ;;
    f) TEXT_COLOR="$OPTARG" ;;
    h) echo "Usage: ./make-feature-graphic.sh -b <bg> -l <logo> -t <headline> [-s subtitle] [-o output.png]"; exit 0 ;;
    *) exit 1 ;;
  esac
done

[ -z "$BG" ]       && echo "Error: -b <background> required" && exit 1
[ -z "$HEADLINE" ] && echo "Error: -t <headline> required" && exit 1

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

W=1024 H=500
TEXT_W=$(( W * 75 / 100 ))

cmd=(
  "$IM"
  "(" "$BG" -resize "${W}x${H}^" -gravity Center -extent "${W}x${H}" ")"
  "(" -size "${W}x${H}" xc:"${OVERLAY_COLOR}" ")"
  -composite
)

if [ -n "$LOGO" ]; then
  cmd+=(
    "(" "$LOGO" -resize "100x100" -background none ")"
    -gravity West -geometry "+60+0" -composite
  )
fi

cmd+=(
  "(" -size "${TEXT_W}x" -background none -fill "$TEXT_COLOR"
      -font "$FONT" -pointsize 72 "caption:${HEADLINE}" ")"
  -gravity Center -geometry "+0-30" -composite
)

if [ -n "$SUBTITLE" ]; then
  cmd+=(
    "(" -size "${TEXT_W}x" -background none -fill "$TEXT_COLOR"
        -font "$FONT_BODY" -pointsize 36
        -alpha set -channel alpha -evaluate multiply 0.8 +channel
        "caption:${SUBTITLE}" ")"
    -gravity Center -geometry "+0+50" -composite
  )
fi

cmd+=("$OUTPUT")
"${cmd[@]}"

echo "Done → $OUTPUT (1024x500)"
