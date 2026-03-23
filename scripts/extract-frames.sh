#!/bin/bash
# Usage: ./extract-frames.sh <input_video> [output_dir] [mode] [--format png|webp|jpg] [--count N] [--scroll]
# Extracts frames from a video as images.
#
# mode (positional, default 1):
#   1      — 1 frame per second
#   0.5    — 1 frame every 2 seconds
#   24     — 24 frames per second
#   all    — every frame
#
# --format png|webp|jpg   output image format (default: png, or webp with --scroll)
# --count N               extract exactly N frames, evenly distributed across the video
#                         (overrides mode; required intent for --scroll)
# --scroll                output manifest.json + JS scroll animation snippet
#
# Requires: ffmpeg

INPUT="${1:?'Usage: ./extract-frames.sh <video> [output_dir] [mode] [--format png|webp|jpg] [--count N] [--scroll]'}"
shift

# Parse remaining args: first non-flag positional = output_dir, second = mode
OUT_DIR=""
MODE="1"
FORMAT=""
COUNT=""
SCROLL=0

for arg in "$@"; do
  case "$arg" in
    --scroll)  SCROLL=1 ;;
  esac
done

i=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --format)  FORMAT="$2"; shift 2 ;;
    --format=*) FORMAT="${1#--format=}"; shift ;;
    --count)   COUNT="$2";  shift 2 ;;
    --count=*) COUNT="${1#--count=}"; shift ;;
    --scroll)  shift ;;
    --*)       shift ;;
    *)
      if [ -z "$OUT_DIR" ]; then
        OUT_DIR="$1"
      elif [ -z "$MODE" ] || [ "$i" -eq 1 ]; then
        MODE="$1"
      fi
      i=$((i + 1))
      shift
      ;;
  esac
done

# Defaults
[ -z "$OUT_DIR" ] && OUT_DIR="${SCROLL:+scroll-frames}" && OUT_DIR="${OUT_DIR:-frames}"
[ -z "$FORMAT" ] && FORMAT="${SCROLL:+webp}" && FORMAT="${FORMAT:-png}"
[ "$SCROLL" -eq 1 ] && [ -z "$COUNT" ] && COUNT=60

if ! command -v ffmpeg >/dev/null; then
  echo "Error: ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

mkdir -p "$OUT_DIR"
base="${INPUT##*/}"

echo "Extracting frames from $base..."

if [ -n "$COUNT" ]; then
  # Even distribution: calculate fps from video duration
  DURATION=$(ffprobe -v error \
    -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 \
    "$INPUT" 2>/dev/null)

  if [ -z "$DURATION" ] || [ "$DURATION" = "N/A" ]; then
    echo "Error: could not read video duration"
    exit 1
  fi

  FPS=$(awk "BEGIN { printf \"%.6f\", $COUNT / $DURATION }")
  VFRAMES_ARG="-vframes $COUNT"
else
  [ "$MODE" = "all" ] && FPS="" || FPS="$MODE"
  VFRAMES_ARG=""
fi

# Build ffmpeg filter
[ -n "$FPS" ] && VF="-vf fps=${FPS}" || VF=""

case "$FORMAT" in
  webp)
    ffmpeg -i "$INPUT" $VF $VFRAMES_ARG \
      -c:v libwebp -quality 85 \
      "$OUT_DIR/frame-%04d.webp" \
      -y -loglevel error
    ;;
  jpg|jpeg)
    FORMAT="jpg"
    ffmpeg -i "$INPUT" $VF $VFRAMES_ARG \
      -q:v 3 \
      "$OUT_DIR/frame-%04d.jpg" \
      -y -loglevel error
    ;;
  *)
    FORMAT="png"
    ffmpeg -i "$INPUT" $VF $VFRAMES_ARG \
      "$OUT_DIR/frame-%04d.png" \
      -y -loglevel error
    ;;
esac

ACTUAL=$(ls "$OUT_DIR/frame-"*."$FORMAT" 2>/dev/null | wc -l | tr -d ' ')

if [ "$ACTUAL" -eq 0 ]; then
  echo "Error: no frames were produced. Check that the input is a valid video."
  exit 1
fi

echo "  $ACTUAL frames ($FORMAT) -> $OUT_DIR/"

if [ "$SCROLL" -eq 1 ]; then
  cat > "$OUT_DIR/manifest.json" << EOF
{
  "total": $ACTUAL,
  "format": "$FORMAT",
  "prefix": "frame-",
  "padding": 4
}
EOF
  echo "  manifest.json"
  echo ""
  echo "JS scroll animation snippet:"
  echo "------------------------------------------------------------"
  cat << EOF
const frames = $ACTUAL;
const img = document.querySelector('#scroll-img');

const srcs = [];
for (let i = 1; i <= frames; i++) {
  const num = String(i).padStart(4, '0');
  const src = '$OUT_DIR/frame-' + num + '.$FORMAT';
  const image = new Image();
  image.src = src;
  srcs.push(src);
}

window.addEventListener('scroll', () => {
  const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  const index = Math.min(Math.floor(progress * frames), frames - 1);
  img.src = srcs[index];
});
EOF
  echo "------------------------------------------------------------"
fi

echo ""
echo "Done -> $OUT_DIR/"
