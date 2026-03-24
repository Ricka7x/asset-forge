# asset-forge

The complete asset toolkit for developers. Generate app icons, favicons, OG images, video conversions, and more — from the command line or as a library.

No system dependencies required. Zero-config by default.

## Installation

### Globally via npm

```bash
npm install -g asset-forge
```

### Or use via npx (no install)

```bash
npx asset-forge <command> [options]
```

## Programmatic API

Asset Forge is also a powerful Node.js library for your build scripts.

```bash
npm install asset-forge
```

### Modern, Smart API

```javascript
import { optimize, resize, ogImage, configure } from 'asset-forge'

// Optional: Configure global defaults
configure({
  outDir: './public/assets',
  quality: 85
})

// High-level asset generation
await ogImage({
  title: 'My Awesome Post',
  background: 'bg.jpg',
  logo: 'logo.png',
  output: 'og-image.png'
})

// Batch processing
await optimize('./src/images/**/*.{jpg,png}')
await resize('./src/images/hero.jpg', '1200x600^')
```

## Usage

```bash
asset-forge [command] [options]
# or
forge [command] [options]
```

Run without arguments to see the banner and version info.

## Configuration

Settings are stored in `~/.config/asset-forge/config.json`.

```bash
forge config set outDir ~/Desktop/assets      # default output directory
forge config set fonts.bold /path/to/font.ttf    # bold font for text commands
forge config set fonts.regular /path/to/font.ttf # regular font for text commands
forge config get                                 # show all current settings
forge config reset                               # restore defaults
```

### Output directory

The output argument is **optional** on every command. Priority order:

1. Explicit argument — `asset-forge favicon logo.png ./public`
2. `FORGE_OUT` env var — overrides for a single run
3. `outDir` config value — persistent default
4. Current working directory — fallback

### Fonts

Text commands (`og-image`, etc.) auto-detect fonts:

1. `FORGE_FONT_BOLD` / `FORGE_FONT_REGULAR` env vars
2. `forge config set fonts.bold` / `fonts.regular`
3. Auto-detected system fonts (macOS/Linux)

---

## Commands

### `optimize` — Compress images
Compresses images to modern formats (AVIF/WebP) with smart quality defaults.

```bash
forge optimize <src> [dest] [quality]
```

### `resize` — Smart resizing
Supports specs like `800` (width), `800x600` (inside), `800x600!` (fill), `800x600^` (cover/crop), and `50%`.

```bash
forge resize <src> <spec> [dest]
```

### `og-image` — Generate social sharing images
Generate stunning OG images from a background and text.

```bash
forge og-image --title "Hello World" --background bg.jpg --logo logo.png
```

### `favicon` — Generate favicon set
Generates `.ico`, Apple touch icons, and a `site.webmanifest`.

```bash
forge favicon logo.png [dest]
```

### `app-icons` — Universal app icon set
Generates icons for iOS (iPhone/iPad) and Android (including Adaptive Icons).

```bash
forge app-icons logo.png [dest]
```

### `palette` — Extract color palette
Extracts the dominant colors from an image.

```bash
forge palette photo.jpg [swatch-path]
```

### `blur-hash` — Generate BlurHash
Computes a compact BlurHash string for placeholders.

```bash
forge blur-hash photo.jpg
```

---

## Development

Requires [Node.js](https://nodejs.org) and [Bun](https://bun.sh).

```bash
bun install
bun run build
# test the local build
node ./dist/cli.js --help
```

License: MIT
