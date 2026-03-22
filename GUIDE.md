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

This runs `src/cli.ts` directly via Bun — no build step needed. Use this while iterating on a new command.

### Developing alongside the brew-installed version

Since you have the brew version installed globally (`/opt/homebrew/bin/forge`), use `bun run dev` during development so you never accidentally run the brew binary instead of your local changes.

When you want to test the actual compiled binary locally:

```bash
bun run build              # compiles to dist/asset-forge
./dist/asset-forge --help  # run it directly — does not affect the brew install
```

To temporarily swap the global `forge` command to your local build:

```bash
bun link                   # makes forge → your local build
# ... test your changes ...
bun unlink                 # restores forge → brew version
```

### Run the test suite

```bash
bun test                   # runs smoke + integration tests against dist/asset-forge
```

Tests always use `dist/asset-forge`, so build first if you want tests to reflect your latest changes:

```bash
bun run build && bun test
```

---

## Adding a New Command

### 1. Write the shell script

Add a new `.sh` file to `scripts/`. Source `_lib.sh` at the top for font resolution helpers, validate required args with `${1:?}`, and use ImageMagick or FFmpeg for the work.

```bash
#!/bin/bash
source "$(dirname "$0")/_lib.sh"
# Usage: ./my-command.sh <input> [output]

INPUT="${1:?'Usage: ./my-command.sh <input> [output]'}"
OUTPUT="${2:-output.png}"

magick "$INPUT" ... "$OUTPUT"
echo "Done → $OUTPUT"
```

Make it executable:

```bash
chmod +x scripts/my-command.sh
```

**Bash 3 compatibility (macOS default shell):** avoid these bash 4+ features:

| Avoid | Use instead |
| ----- | ----------- |
| `mapfile -t arr < <(...)` | `IFS=$'\n' read -r -d '' -a arr < <(... && printf '\0')` |
| `${VAR,,}` (lowercase) | `$(echo "$VAR" \| tr '[:upper:]' '[:lower:]')` |
| `declare -A` (associative arrays) | Use `case` statements or sequential if/elif |

### 2. Register it in `src/commands.ts`

Add an export using the `sh()` helper. The second argument is the script filename (without `.sh`), the third is the description, and the fourth defines the args:

```typescript
export const myCommand = sh('my-command', 'my-command', 'Short description', {
  input:  { type: 'positional', description: 'Source file', required: true },
  output: { type: 'positional', description: 'Output file', default: '' },
  flag:   { type: 'string', description: 'Some option', default: 'value' },
})
```

> Optional positional args must have `default: ''` — otherwise citty treats them as required.

### 3. Add it to the subcommands list in `src/cli.ts`

```typescript
subCommands: {
  // ... existing commands
  'my-command': commands.myCommand,
}
```

### 4. Add a smoke test entry

In `tests/smoke.test.ts`, add the command name to the `COMMANDS` array:

```typescript
const COMMANDS = [
  // ... existing
  'my-command',
]
```

This ensures `--help` exits 0 and shows the command name on every CI run.

### 5. Iterate and test

```bash
bun run dev -- my-command --help          # test help text without building
bun run dev -- my-command input.png       # test the command
bun run build && bun test                 # full test suite
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
brew tap Ricka7x/asset-forge         # adds the tap
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
  │  ├── ubuntu-latest → darwin-x64 binary      │
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
