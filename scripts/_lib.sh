#!/bin/bash
# Shared helpers sourced by asset-forge scripts.
# Usage: source "$(dirname "$0")/_lib.sh"
#
# Font configuration (in priority order):
#   1. FORGE_FONT_BOLD / FORGE_FONT_REGULAR env vars   (per-run override)
#   2. forge config set fontBold / fontRegular          (persistent config)
#   3. Bundled Inter font (scripts/fonts/)              (always available)
#   4. fc-match (fontconfig)                            (auto-detect from system)
#   5. Known system font paths                          (macOS / common Linux)

_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_BUNDLED_FONT_DIR="$_SCRIPT_DIR/fonts"

_config_value() {
  local key="$1"
  local cfg="$HOME/.config/asset-forge/config.json"
  [ -f "$cfg" ] && command -v python3 >/dev/null && \
    python3 -c "import json,sys; d=json.load(open('$cfg')); print(d.get('$key',''))" 2>/dev/null
}

# Resolve a bold font path or name that ImageMagick can use.
_resolve_font_bold() {
  # 1. Env var
  [ -n "$FORGE_FONT_BOLD" ] && echo "$FORGE_FONT_BOLD" && return
  # 2. Persistent config
  local cfg_val; cfg_val="$(_config_value fontBold)"
  [ -n "$cfg_val" ] && echo "$cfg_val" && return
  # 3. Bundled Inter Bold
  local bundled="$_BUNDLED_FONT_DIR/Inter-Bold.ttf"
  [ -f "$bundled" ] && echo "$bundled" && return
  # 4. fontconfig (cross-platform, most reliable)
  if command -v fc-match >/dev/null 2>&1; then
    local f; f="$(fc-match -f '%{file}' 'sans-serif:bold' 2>/dev/null)"
    [ -n "$f" ] && [ -f "$f" ] && echo "$f" && return
  fi
  # 5. Known system paths (macOS then common Linux distros)
  for f in \
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf" \
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" \
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" \
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"; do
    [ -f "$f" ] && echo "$f" && return
  done
  # 6. Hope ImageMagick has it registered
  echo "Helvetica-Bold"
}

# Resolve a regular font path or name that ImageMagick can use.
_resolve_font_regular() {
  # 1. Env var
  [ -n "$FORGE_FONT_REGULAR" ] && echo "$FORGE_FONT_REGULAR" && return
  # 2. Persistent config
  local cfg_val; cfg_val="$(_config_value fontRegular)"
  [ -n "$cfg_val" ] && echo "$cfg_val" && return
  # 3. Bundled Inter Regular
  local bundled="$_BUNDLED_FONT_DIR/Inter-Regular.ttf"
  [ -f "$bundled" ] && echo "$bundled" && return
  # 4. fontconfig
  if command -v fc-match >/dev/null 2>&1; then
    local f; f="$(fc-match -f '%{file}' 'sans-serif' 2>/dev/null)"
    [ -n "$f" ] && [ -f "$f" ] && echo "$f" && return
  fi
  # 5. Known system paths
  for f in \
    "/System/Library/Fonts/Supplemental/Arial.ttf" \
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf" \
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf" \
    "/usr/share/fonts/truetype/freefont/FreeSans.ttf"; do
    [ -f "$f" ] && echo "$f" && return
  done
  # 6. Hope ImageMagick has it registered
  echo "Helvetica"
}
