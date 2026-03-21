#!/bin/bash
# Usage: ./make-email-banner.sh -b <bg> [-l logo] [-t headline] [-s subtitle] [-o output.png] [-c overlay] [-f text_color]
# Generates an email header banner (600x200 — standard email width).
# Requires: ImageMagick

FONT="${FONT:-Helvetica-Bold}"
FONT_BODY="${FONT_BODY:-Helvetica}"

BG="" LOGO="" HEADLINE="" SUBTITLE=""
OUTPUT="email-banner.png"
OVERLAY_COLOR="rgba(0,0,0,0.40)"
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
    h) echo "Usage: ./make-email-banner.sh -b <bg> [-l logo] [-t headline] [-s subtitle] [-o output.png]"; exit 0 ;;
    *) exit 1 ;;
  esac
done

[ -z "$BG" ] && echo "Error: -b <background> required" && exit 1

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

W=600 H=200
TEXT_W=$(( W * 65 / 100 ))

cmd=(
  "$IM"
  "(" "$BG" -resize "${W}x${H}^" -gravity Center -extent "${W}x${H}" ")"
)

if [ -n "$HEADLINE" ] || [ -n "$LOGO" ]; then
  cmd+=( "(" -size "${W}x${H}" xc:"${OVERLAY_COLOR}" ")" -composite )
fi

# Logo on the left
if [ -n "$LOGO" ]; then
  cmd+=(
    "(" "$LOGO" -resize "60x60" -background none ")"
    -gravity West -geometry "+20+0" -composite
  )
fi

# Text: centered or offset right if logo present
TEXT_OFFSET_X=$( [ -n "$LOGO" ] && echo "+40" || echo "+0" )

if [ -n "$HEADLINE" ]; then
  cmd+=(
    "(" -size "${TEXT_W}x" -background none -fill "$TEXT_COLOR"
        -font "$FONT" -pointsize 36 "caption:${HEADLINE}" ")"
    -gravity Center -geometry "${TEXT_OFFSET_X}-$( [ -n "$SUBTITLE" ] && echo "20" || echo "0" )" -composite
  )
fi

if [ -n "$SUBTITLE" ]; then
  cmd+=(
    "(" -size "${TEXT_W}x" -background none -fill "$TEXT_COLOR"
        -font "$FONT_BODY" -pointsize 20
        -alpha set -channel alpha -evaluate multiply 0.80 +channel
        "caption:${SUBTITLE}" ")"
    -gravity Center -geometry "${TEXT_OFFSET_X}+25" -composite
  )
fi

cmd+=("$OUTPUT")
"${cmd[@]}"

echo "Done → $OUTPUT (600x200)"
