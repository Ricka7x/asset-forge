#!/bin/bash
# Usage: ./convert-video.sh <input> <output.ext> [quality]
# Converts between video formats. Output format is inferred from extension.
# quality: 0-51 for H.264/H.265 (lower = better), default 23. For WebM: 0-63.
# Supported output: .mp4, .webm, .mov, .gif
# Requires: ffmpeg (brew install ffmpeg)

INPUT="${1:?'Usage: ./convert-video.sh <input> <output.ext> [quality]'}"
OUTPUT="${2:?'Usage: ./convert-video.sh <input> <output.ext> [quality]'}"
QUALITY="${3:-23}"

if ! command -v ffmpeg >/dev/null; then
  echo "Error: ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

EXT="${OUTPUT##*.}"
EXT="$(echo "$EXT" | tr '[:upper:]' '[:lower:]')"

echo "Converting $(basename "$INPUT") → $OUTPUT..."

case "$EXT" in
  mp4)
    ffmpeg -i "$INPUT" \
      -c:v libx264 -crf "$QUALITY" \
      -preset fast \
      -movflags faststart \
      -pix_fmt yuv420p \
      -c:a aac -b:a 128k \
      -y "$OUTPUT" -loglevel error
    ;;
  webm)
    ffmpeg -i "$INPUT" \
      -c:v libvpx-vp9 -crf "$QUALITY" -b:v 0 \
      -c:a libopus -b:a 128k \
      -y "$OUTPUT" -loglevel error
    ;;
  mov)
    ffmpeg -i "$INPUT" \
      -c:v libx264 -crf "$QUALITY" \
      -preset fast \
      -pix_fmt yuv420p \
      -c:a aac -b:a 128k \
      -y "$OUTPUT" -loglevel error
    ;;
  gif)
    # Delegate to video-to-gif for proper palette handling
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    exec "$SCRIPT_DIR/video-to-gif.sh" "$INPUT" "$OUTPUT"
    ;;
  *)
    echo "Error: unsupported output format '.${EXT}'. Supported: mp4, webm, mov, gif"
    exit 1
    ;;
esac

size_kb=$(( $(wc -c < "$OUTPUT") / 1024 ))
echo "Done → $OUTPUT (${size_kb}KB)"
