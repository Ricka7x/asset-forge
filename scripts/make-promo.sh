#!/bin/bash
# Usage: ./make-promo.sh [options]
#
# Options:
#   -b <file>    Background image (required)
#   -l <file>    Logo image (required)
#   -t <text>    Headline text (required)
#   -s <text>    Subtitle text (optional)
#   -c <color>   Overlay color in hex or rgba, default: "rgba(0,0,0,0.45)"
#   -f <color>   Text color, default: white
#   -o <dir>     Output directory, default: ./promo
#
# Requires: ImageMagick (brew install imagemagick)
# Tip: Use a font name from `convert -list font` for custom fonts.

source "$(dirname "$0")/_lib.sh"
FONT="${FONT:-$(_resolve_font_bold)}"
FONT_BODY="${FONT_BODY:-$(_resolve_font_regular)}"

usage() {
  sed -n '2,14p' "$0" | sed 's/^# //'
  exit 1
}

BG="" LOGO="" HEADLINE="" SUBTITLE=""
OVERLAY_COLOR="rgba(0,0,0,0.45)"
TEXT_COLOR="white"
OUT_DIR="./promo"

while getopts "b:l:t:s:c:f:o:h" opt; do
  case $opt in
    b) BG="$OPTARG" ;;
    l) LOGO="$OPTARG" ;;
    t) HEADLINE="$OPTARG" ;;
    s) SUBTITLE="$OPTARG" ;;
    c) OVERLAY_COLOR="$OPTARG" ;;
    f) TEXT_COLOR="$OPTARG" ;;
    o) OUT_DIR="$OPTARG" ;;
    h) usage ;;
    *) usage ;;
  esac
done

[ -z "$BG" ]       && echo "Error: -b <background> required" && exit 1
[ -z "$LOGO" ]     && echo "Error: -l <logo> required" && exit 1
[ -z "$HEADLINE" ] && echo "Error: -t <headline> required" && exit 1

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

mkdir -p "$OUT_DIR"

# ----------------------------------------------------------------------
# Core compositor
# Args: <width> <height> <logo_size> <headline_pt> <subtitle_pt>
#       <logo_offset_y> <headline_offset_y> <subtitle_offset_y> <out_file>
# ----------------------------------------------------------------------
make_promo() {
  local w="$1" h="$2" logo_px="$3"
  local head_pt="$4" sub_pt="$5"
  local logo_y="$6" head_y="$7" sub_y="$8"
  local out="$9"

  local text_w=$(( w * 80 / 100 ))  # text area is 80% of width

  # Build the headline text image
  local head_args=(
    -size "${text_w}x" -background none
    -fill "$TEXT_COLOR" -font "$FONT" -pointsize "$head_pt"
    "caption:${HEADLINE}"
  )

  # Base: scale+crop background, apply overlay
  local cmd=(
    "$IM"
    "(" "$BG" -resize "${w}x${h}^" -gravity Center -extent "${w}x${h}" ")"
    "(" -size "${w}x${h}" xc:"${OVERLAY_COLOR}" ")"
    -composite
  )

  # Logo
  cmd+=(
    "(" "$LOGO" -resize "${logo_px}x${logo_px}" -background none ")"
    -gravity North -geometry "+0+${logo_y}" -composite
  )

  # Headline
  cmd+=(
    "(" "${head_args[@]}" ")"
    -gravity North -geometry "+0+${head_y}" -composite
  )

  # Subtitle (if provided)
  if [ -n "$SUBTITLE" ]; then
    local sub_args=(
      -size "${text_w}x" -background none
      -fill "$TEXT_COLOR" -font "$FONT_BODY" -pointsize "$sub_pt"
      "caption:${SUBTITLE}"
    )
    cmd+=(
      "(" "${sub_args[@]}" ")"
      -gravity North -geometry "+0+${sub_y}" -composite
    )
  fi

  cmd+=("$out")
  "${cmd[@]}"
  echo "  $(basename "$out") (${w}x${h})"
}

echo "Generating promo assets..."

# iPhone 15 Pro Max App Store screenshot (portrait)
make_promo 1290 2796  300  120 60  180 560 720  "$OUT_DIR/promo-appstore-iphone.png"

# iPad App Store screenshot (landscape)
make_promo 2048 1536  260  110 54  200 560 700  "$OUT_DIR/promo-appstore-ipad.png"

# Social square (Instagram post, etc.)
make_promo 1080 1080  200  90  44  140 420 540  "$OUT_DIR/promo-social-square.png"

# Social story / Reels / TikTok (9:16)
make_promo 1080 1920  220  100 50  260 680 820  "$OUT_DIR/promo-social-story.png"

# Twitter/X banner
make_promo 1500 500   120  72  36  80  200 290  "$OUT_DIR/promo-twitter-banner.png"

# Open Graph / LinkedIn share image
make_promo 1200 630   160  80  40  90  280 380  "$OUT_DIR/promo-og.png"

# Reddit post image
make_promo 1200 628   160  78  38  90  275 375  "$OUT_DIR/promo-reddit.png"

# Product Hunt gallery image
make_promo 1270 952   200  90  44  120 400 510  "$OUT_DIR/promo-producthunt.png"

echo ""
echo "Done → $OUT_DIR/"
