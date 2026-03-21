# Developer Guide

Everything you need to develop, test, and ship asset-forge.

---

## Prerequisites

- [Bun](https://bun.sh) — runtime and build tool
- [ImageMagick](https://imagemagick.org) — required by image commands
- [FFmpeg](https://ffmpeg.org) — required by video commands

```bash
brew install bun imagemagick ffmpeg
```

---

## Project Structure

```
asset-forge/
├── src/
│   ├── cli.ts          # Entry point — registers all subcommands
│   ├── banner.ts       # ASCII art banner + version
│   └── commands.ts     # All command definitions (args + shell delegation)
├── scripts/            # Shell scripts — the actual processing logic
│   ├── make-og-image.sh
│   ├── optimize-images.sh
│   └── ...
├── Formula/
│   └── asset-forge.rb  # Homebrew formula (auto-updated by CI)
├── .github/
│   └── workflows/
│       └── release.yml # Build + release + formula update pipeline
├── release.sh          # Local release helper script
└── package.json
```

**How commands work:** Each command in `commands.ts` is a thin wrapper that passes your raw CLI arguments to the corresponding shell script in `scripts/`. The TypeScript layer handles help text, arg definitions, and the banner — the shell scripts do the actual work.

---

## Local Development

### Install dependencies

```bash
bun install
```

### Run without building

```bash
bun run dev                              # shows banner + help
bun run dev -- og-image --help          # per-command help
bun run dev -- og-image -b photo.jpg    # run a command
```

### Build the binary

```bash
bun run build
```

This compiles `src/cli.ts` to `dist/asset-forge` and re-links it globally via `bun link`. After building, `asset-forge` in your shell points to the new binary.

### Test the binary

```bash
asset-forge --help
asset-forge og-image --help
asset-forge favicon logo.png ./out
```

---

## Adding a New Command

### 1. Write the shell script

Add a new `.sh` file to `scripts/`. Follow the existing pattern — print a `Usage:` line at the top, validate required args, and use ImageMagick or FFmpeg to do the work.

```bash
# scripts/my-command.sh
#!/bin/bash
# Usage: ./my-command.sh <input> [output]

INPUT="${1:?'Usage: ./my-command.sh <input> [output]'}"
OUTPUT="${2:-output.png}"

# ... your ImageMagick / FFmpeg logic
```

Make it executable:

```bash
chmod +x scripts/my-command.sh
```

### 2. Register it in `src/commands.ts`

Add an export using the `sh()` helper. Define each arg so it shows up in `--help`:

```typescript
export const myCommand = sh('my-command', 'Short description of what it does', {
  input:  { type: 'positional', description: 'Source file', required: true },
  output: { type: 'positional', description: 'Output file', default: 'output.png' },
})
```

### 3. Add it to the subcommands list in `src/cli.ts`

```typescript
subCommands: {
  // ... existing commands
  'my-command': commands.myCommand,
}
```

### 4. Build and test

```bash
bun run build
asset-forge my-command --help
asset-forge my-command input.png
```

---

## Bumping the Version

Version lives in two places — keep them in sync:

| File | Location |
|------|----------|
| `package.json` | `"version": "x.y.z"` |
| `src/banner.ts` | `const VERSION = 'x.y.z'` |

The `release.sh` script updates both automatically.

---

## Releasing

### One-time setup

Before your first release you need a GitHub Personal Access Token so CI can push the updated Homebrew formula to your tap repo.

1. Go to **github.com/settings/tokens → Generate new token (classic)**
2. Name: `homebrew-tap` — scope: `repo`
3. Copy the token
4. Go to your `asset-forge` repo → **Settings → Secrets and variables → Actions → New repository secret**
5. Name: `HOMEBREW_TAP_TOKEN`, value: the token

Also make sure your `homebrew-asset-forge` repo exists on GitHub before the first release.

### Releasing a new version

```bash
bun run release 1.0.0
```

That's it. The script will:

1. Validate the version is valid semver
2. Bump `package.json` and `src/banner.ts`
3. Build the binary to confirm it compiles
4. `git commit`, `git tag`, `git push`

GitHub Actions then takes over:

| Step | What happens |
|------|-------------|
| **build** | Compiles binaries for macOS arm64, macOS x64, Linux x64 in parallel |
| **release** | Creates a GitHub Release, uploads binaries + SHA256 files |
| **update-formula** | Checks out `homebrew-asset-forge`, rewrites the formula with new version + SHA256s, pushes |

Users with the tap already installed get the update on their next `brew upgrade`.

### Verifying the release

After CI finishes:

```bash
brew update
brew upgrade asset-forge
asset-forge --help   # should show the new version
```

---

## Homebrew Tap Structure

Homebrew requires a separate repo named `homebrew-<tap-name>`. Users install via:

```bash
brew tap YOUR_USERNAME/asset-forge         # adds the tap
brew install asset-forge                   # installs the formula
```

The formula (`asset-forge.rb`) is auto-managed by CI — you should never need to edit it manually after the first release.

---

## CI Pipeline

The pipeline in `.github/workflows/release.yml` triggers on any `v*` tag push.

```
git tag v1.0.0
       │
       ▼
  ┌─────────────────────────────────────────────┐
  │  build (parallel matrix)                    │
  │  ├── macos-latest  → darwin-arm64 binary    │
  │  ├── macos-13      → darwin-x64 binary      │
  │  └── ubuntu-latest → linux-x64 binary       │
  └──────────────────┬──────────────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────┐
  │  release                                     │
  │  ├── compute SHA256 for each binary          │
  │  └── create GitHub Release + upload assets  │
  └──────────────────┬───────────────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────┐
  │  update-formula                              │
  │  ├── checkout homebrew-asset-forge repo      │
  │  ├── rewrite asset-forge.rb with new         │
  │  │   version + SHA256 values                 │
  │  └── commit + push                           │
  └──────────────────────────────────────────────┘
```
