#!/bin/bash
# Usage: ./video-to-gif.sh <input_video> [output.gif] [fps] [width]
# Converts a video clip to an optimized GIF using a 2-pass palette approach.
# fps:   frames per second, default 15
# width: output width in px (height auto), default 480
# Requires: ffmpeg (brew install ffmpeg)

INPUT="${1:?'Usage: ./video-to-gif.sh <input_video> [output.gif] [fps] [width]'}"
OUTPUT="${2:-output.gif}"
FPS="${3:-15}"
WIDTH="${4:-480}"

if ! command -v ffmpeg >/dev/null; then
  echo "Error: ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

PALETTE=$(mktemp /tmp/palette-XXXXXX.png)
trap 'rm -f "$PALETTE"' EXIT

echo "Generating palette..."
ffmpeg -i "$INPUT" \
  -vf "fps=${FPS},scale=${WIDTH}:-1:flags=lanczos,palettegen=stats_mode=diff" \
  -y "$PALETTE" -loglevel error

echo "Encoding GIF..."
ffmpeg -i "$INPUT" -i "$PALETTE" \
  -lavfi "fps=${FPS},scale=${WIDTH}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
  -y "$OUTPUT" -loglevel error

size_kb=$(( $(wc -c < "$OUTPUT") / 1024 ))
echo "Done → $OUTPUT (${size_kb}KB)"
