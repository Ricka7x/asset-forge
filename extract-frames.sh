#!/bin/bash
# Usage: ./extract-frames.sh <input_video> [output_dir] [fps|every_nth_sec|all]
# Extracts frames from a video as PNG images.
# mode:
#   all          — every frame
#   1 (default)  — 1 frame per second
#   0.5          — 1 frame every 2 seconds
#   fps=24       — 24 frames per second
# Requires: ffmpeg (brew install ffmpeg)

INPUT="${1:?'Usage: ./extract-frames.sh <input_video> [output_dir] [mode]'}"
OUT_DIR="${2:-frames}"
MODE="${3:-1}"

if ! command -v ffmpeg >/dev/null; then
  echo "Error: ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

mkdir -p "$OUT_DIR"

base="${INPUT##*/}"
name="${base%.*}"

echo "Extracting frames from $base..."

if [ "$MODE" = "all" ]; then
  ffmpeg -i "$INPUT" \
    "$OUT_DIR/${name}_%05d.png" \
    -y -loglevel error
else
  ffmpeg -i "$INPUT" \
    -vf "fps=${MODE}" \
    "$OUT_DIR/${name}_%05d.png" \
    -y -loglevel error
fi

COUNT=$(find "$OUT_DIR" -name "${name}_*.png" | wc -l | tr -d ' ')
echo "Done → $OUT_DIR/ ($COUNT frames)"
