#!/bin/bash
# Usage: ./device-frame.sh <screenshot> [output.png] [device]
# Wraps a screenshot in a device frame mockup.
# device: iphone (default), android, browser
# Requires: ImageMagick

INPUT="${1:?'Usage: ./device-frame.sh <screenshot> [output.png] [device]'}"
OUTPUT="${2:-framed.png}"
DEVICE="${3:-iphone}"

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

read -r SW SH < <($IM identify -format "%w %h" "$INPUT")

case "$DEVICE" in
# ─── iPhone ───────────────────────────────────────────────────────────────────
iphone)
  PAD_X=$(( SW * 6 / 100 ))
  PAD_TOP=$(( SH * 8 / 100 ))
  PAD_BOT=$(( SH * 7 / 100 ))
  FW=$(( SW + PAD_X * 2 ))
  FH=$(( SH + PAD_TOP + PAD_BOT ))
  FRAME_RADIUS=$(( FW * 12 / 100 ))
  SCREEN_RADIUS=$(( SW * 8 / 100 ))

  # Dynamic island dimensions
  DI_W=$(( SW * 28 / 100 ))
  DI_H=$(( PAD_TOP * 38 / 100 ))
  DI_X=$(( FW / 2 - DI_W / 2 ))
  DI_Y=$(( PAD_TOP * 28 / 100 ))

  # Home indicator
  HI_W=$(( SW * 28 / 100 ))
  HI_H=5
  HI_X=$(( FW / 2 - HI_W / 2 ))
  HI_Y=$(( FH - PAD_BOT * 40 / 100 ))

  $IM \
    \( -size "${FW}x${FH}" xc:none \
       -fill "#1C1C1E" \
       -draw "roundrectangle 0,0,$((FW-1)),$((FH-1)),${FRAME_RADIUS},${FRAME_RADIUS}" \
    \) \
    \( "$INPUT" \
       \( +clone -alpha extract \
          -draw "fill black polygon 0,0 0,${SCREEN_RADIUS} ${SCREEN_RADIUS},0 fill white circle ${SCREEN_RADIUS},${SCREEN_RADIUS} ${SCREEN_RADIUS},0" \
          \( +clone -flip \) -compose Multiply -composite \
          \( +clone -flop \) -compose Multiply -composite \
       \) \
       -alpha off -compose CopyOpacity -composite \
    \) \
    -gravity NorthWest -geometry "+${PAD_X}+${PAD_TOP}" -composite \
    \( -size "${DI_W}x${DI_H}" xc="#1C1C1E" \
       -draw "roundrectangle 0,0,$((DI_W-1)),$((DI_H-1)),$((DI_H/2)),$((DI_H/2))" \
    \) \
    -gravity NorthWest -geometry "+${DI_X}+${DI_Y}" -composite \
    \( -size "${HI_W}x${HI_H}" xc:"rgba(255,255,255,0.4)" \
       -draw "roundrectangle 0,0,$((HI_W-1)),$((HI_H-1)),3,3" \
    \) \
    -gravity NorthWest -geometry "+${HI_X}+${HI_Y}" -composite \
    "$OUTPUT"
  ;;

# ─── Android ──────────────────────────────────────────────────────────────────
android)
  PAD_X=$(( SW * 5 / 100 ))
  PAD_TOP=$(( SH * 5 / 100 ))
  PAD_BOT=$(( SH * 6 / 100 ))
  FW=$(( SW + PAD_X * 2 ))
  FH=$(( SH + PAD_TOP + PAD_BOT ))
  FRAME_RADIUS=$(( FW * 8 / 100 ))
  SCREEN_RADIUS=$(( SW * 4 / 100 ))

  # Camera punch-hole
  CAM_R=18
  CAM_X=$(( FW / 2 ))
  CAM_Y=$(( PAD_TOP / 2 ))

  # Nav bar dots
  NAV_Y=$(( FH - PAD_BOT / 2 ))

  $IM \
    \( -size "${FW}x${FH}" xc:none \
       -fill "#111111" \
       -draw "roundrectangle 0,0,$((FW-1)),$((FH-1)),${FRAME_RADIUS},${FRAME_RADIUS}" \
    \) \
    \( "$INPUT" \
       \( +clone -alpha extract \
          -draw "fill black polygon 0,0 0,${SCREEN_RADIUS} ${SCREEN_RADIUS},0 fill white circle ${SCREEN_RADIUS},${SCREEN_RADIUS} ${SCREEN_RADIUS},0" \
          \( +clone -flip \) -compose Multiply -composite \
          \( +clone -flop \) -compose Multiply -composite \
       \) \
       -alpha off -compose CopyOpacity -composite \
    \) \
    -gravity NorthWest -geometry "+${PAD_X}+${PAD_TOP}" -composite \
    \( -size "${FW}x${FH}" xc:none \
       -fill "#111111" \
       -draw "circle ${CAM_X},${CAM_Y} ${CAM_X},$((CAM_Y+CAM_R))" \
    \) \
    -composite \
    "$OUTPUT"
  ;;

# ─── Browser ──────────────────────────────────────────────────────────────────
browser)
  BAR_H=$(( SH * 7 / 100 ))
  PAD=20
  FW=$(( SW + PAD * 2 ))
  FH=$(( SH + BAR_H + PAD * 2 ))
  RADIUS=12

  # URL bar dimensions
  URL_W=$(( SW * 55 / 100 ))
  URL_H=$(( BAR_H * 55 / 100 ))
  URL_X=$(( FW / 2 - URL_W / 2 ))
  URL_Y=$(( PAD + (BAR_H - URL_H) / 2 ))

  # Traffic light dots
  DOT_R=10
  DOT_Y=$(( PAD + BAR_H / 2 ))

  $IM \
    \( -size "${FW}x${FH}" xc:none \
       -fill "#2C2C2E" \
       -draw "roundrectangle 0,0,$((FW-1)),$((FH-1)),${RADIUS},${RADIUS}" \
    \) \
    \( -size "${FW}x${BAR_H}" xc:"#3A3A3C" \) \
    -gravity NorthWest -geometry "+0+${PAD}" -composite \
    \( "$INPUT" \) \
    -gravity NorthWest -geometry "+${PAD}+$((PAD+BAR_H))" -composite \
    \( -size "${URL_W}x${URL_H}" xc:"rgba(255,255,255,0.08)" \
       -draw "roundrectangle 0,0,$((URL_W-1)),$((URL_H-1)),$((URL_H/2)),$((URL_H/2))" \
    \) \
    -gravity NorthWest -geometry "+${URL_X}+${URL_Y}" -composite \
    \( -size "$((DOT_R*2))x$((DOT_R*2))" xc:none -fill "#FF5F57" -draw "circle ${DOT_R},${DOT_R} ${DOT_R},1" \) \
    -gravity NorthWest -geometry "+$((PAD+18))+$((DOT_Y-DOT_R))" -composite \
    \( -size "$((DOT_R*2))x$((DOT_R*2))" xc:none -fill "#FEBC2E" -draw "circle ${DOT_R},${DOT_R} ${DOT_R},1" \) \
    -gravity NorthWest -geometry "+$((PAD+46))+$((DOT_Y-DOT_R))" -composite \
    \( -size "$((DOT_R*2))x$((DOT_R*2))" xc:none -fill "#28C840" -draw "circle ${DOT_R},${DOT_R} ${DOT_R},1" \) \
    -gravity NorthWest -geometry "+$((PAD+74))+$((DOT_Y-DOT_R))" -composite \
    "$OUTPUT"
  ;;

*)
  echo "Unknown device: $DEVICE. Use: iphone, android, or browser"
  exit 1
  ;;
esac

echo "Done → $OUTPUT"
