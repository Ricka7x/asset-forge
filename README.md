# asset-forge

A collection of image processing scripts for web and app development. Use them individually or through the unified `forge` entrypoint.

## Prerequisites

```bash
brew install imagemagick   # required by all scripts
brew install svgo          # optional — SVG optimization
brew install exiftool      # optional — faster metadata stripping
```

## Setup

```bash
chmod +x forge.sh
# Optionally symlink to use globally:
mkdir -p ~/.local/bin
ln -s "$(pwd)/forge.sh" ~/.local/bin/forge
# Make sure ~/.local/bin is on your PATH (add to ~/.zshrc if needed):
# export PATH="$HOME/.local/bin:$PATH"
```

---

## Commands

### `optimize` — Compress images

Compresses raster images to the best available modern format (AVIF → WebP → original). One output per input file.

```bash
forge optimize <src_dir> <dest_dir> [quality]
```

| Arg | Default | Description |
|-----|---------|-------------|
| `quality` | `95` | 1–100, applies to all formats. Also settable via `QUALITY=` env var |

```bash
forge optimize ./images ./public/img
forge optimize ./images ./public/img 80
QUALITY=75 forge optimize ./images ./dist/img
```

---

### `favicon` — Web favicon set

Generates a complete favicon set and `site.webmanifest` for web projects.

```bash
forge favicon <logo> [output_dir]
```

Outputs: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`

```bash
forge favicon logo.png ./public
```

Add to your `<head>`:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

---

### `og-image` — Open Graph image

Resizes and center-crops any image to the Open Graph spec (1200×630).

```bash
forge og-image <image> [output.png] [gravity]
```

| Arg | Default | Description |
|-----|---------|-------------|
| `gravity` | `Center` | Crop anchor: `Center`, `North`, `South`, `NorthWest`, etc. |

```bash
forge og-image hero.jpg og-image.png
forge og-image photo.jpg og-image.png North
```

---

### `appiconset` — macOS Xcode app icons

Generates `AppIcon.appiconset` for macOS Xcode projects. Applies the macOS squircle shape with 10% padding on each side.

```bash
forge appiconset <logo> [output_dir]
```

Outputs all required sizes (16px–1024px) + `Contents.json`. Drop the folder directly into your `.xcassets`.

```bash
forge appiconset logo.png
forge appiconset logo.png MyApp.appiconset
```

---

### `ios-icons` — iOS Xcode app icons

Generates `AppIcon.appiconset` for iOS Xcode projects. No squircle applied — iOS clips automatically.

```bash
forge ios-icons <logo> [output_dir]
```

Covers all iOS/iPadOS sizes (20px–1024px) + `Contents.json`.

```bash
forge ios-icons logo.png
```

---

### `android-icons` — Android mipmap icons

Generates the full `res/mipmap-*` folder structure for Android projects, including round variants and a Play Store icon.

```bash
forge android-icons <logo> [output_dir]
```

Outputs `ic_launcher.png` + `ic_launcher_round.png` at all densities (mdpi → xxxhdpi) and a `ic_launcher-playstore.png` (512×512).

```bash
forge android-icons logo.png
forge android-icons logo.png app/src/main/res
```

---

### `sprites` — Sprite sheet

Combines all images in a directory into a single horizontal sprite sheet with accompanying CSS.

```bash
forge sprites <images_dir> [output_name] [css_prefix]
```

| Arg | Default | Description |
|-----|---------|-------------|
| `output_name` | `sprite` | Base name for `.png` and `.css` output files |
| `css_prefix` | `.sprite` | CSS class prefix for generated selectors |

```bash
forge sprites ./icons sprite .icon
```

Generated CSS usage:
```html
<span class="sprite sprite-arrow-left"></span>
```

---

### `placeholder` — LQIP placeholder

Generates a tiny (20px wide) blurred image for lazy-loading placeholders. Prints a base64 data URI to stdout.

```bash
forge placeholder <image> [output.png]
```

```bash
# Print data URI
forge placeholder hero.jpg

# Save PNG + print data URI
forge placeholder hero.jpg hero-placeholder.png

# Capture into a variable
DATA_URI=$(forge placeholder hero.jpg)
```

Use the data URI as an `src` or CSS `background-image` to show while the full image loads.

---

### `strip-meta` — Strip EXIF metadata

Removes all EXIF/metadata from images in-place. Uses `exiftool` if available, falls back to ImageMagick.

```bash
forge strip-meta <file_or_dir>
```

```bash
forge strip-meta photo.jpg
forge strip-meta ./uploads
```

---

### `thumbnail` — Batch thumbnails

Batch generates center-cropped thumbnails from a directory, preserving folder structure.

```bash
forge thumbnail <src_dir> <dest_dir> [size] [gravity]
```

| Arg | Default | Description |
|-----|---------|-------------|
| `size` | `400x400` | Output dimensions as `WxH` |
| `gravity` | `Center` | Crop anchor: `Center`, `North`, `South`, etc. |

```bash
forge thumbnail ./photos ./thumbs
forge thumbnail ./photos ./thumbs 800x600
forge thumbnail ./photos ./thumbs 400x400 North
```

---

### `promo` — Marketing promo images

Generates a full set of marketing assets from a background image, logo, headline, and subtitle. Ideal for app launches, social campaigns, and store listings.

```bash
forge promo -b <background> -l <logo> -t <headline> [-s <subtitle>] [-c <overlay>] [-f <text_color>] [-o <output_dir>]
```

| Flag | Default | Description |
|------|---------|-------------|
| `-b` | required | Background image |
| `-l` | required | Logo image |
| `-t` | required | Headline text |
| `-s` | — | Subtitle text |
| `-c` | `rgba(0,0,0,0.45)` | Overlay color/opacity for readability |
| `-f` | `white` | Text color |
| `-o` | `./promo` | Output directory |

```bash
forge promo -b background.jpg -l logo.png -t "Your App Name" -s "The tagline that sells it"
forge promo -b bg.jpg -l logo.png -t "Launch Sale" -s "50% off today only" -c "rgba(0,0,80,0.6)" -o ./marketing
```

Outputs:

| File | Size | Use |
|------|------|-----|
| `promo-appstore-iphone.png` | 1290×2796 | App Store (iPhone 15 Pro Max) |
| `promo-appstore-ipad.png` | 2048×1536 | App Store (iPad landscape) |
| `promo-social-square.png` | 1080×1080 | Instagram / Facebook post |
| `promo-social-story.png` | 1080×1920 | Stories / Reels / TikTok |
| `promo-twitter-banner.png` | 1500×500 | Twitter/X profile banner |
| `promo-og.png` | 1200×630 | Open Graph / LinkedIn share |

> Tip: set `FONT` and `FONT_BODY` env vars to use custom fonts.
> List available fonts with: `convert -list font`

```bash
FONT="Futura-Bold" FONT_BODY="Futura" forge promo -b bg.jpg -l logo.png -t "Hello World"
```

---

### `audit` — Audit image directory

Scans a directory and reports potential issues.

```bash
forge audit <dir> [size_threshold_kb]
```

Checks for:
- Files over the size threshold (default: 200KB)
- PNG/JPG files that could be converted to WebP/AVIF
- Animated GIFs that should be video or WebP
- Missing `@2x` retina variants
- Suspiciously small images (<10px)

```bash
forge audit ./public/images
forge audit ./public/images 100
```
