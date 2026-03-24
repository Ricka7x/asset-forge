# Developer Guide

Everything you need to develop, test, and ship asset-forge.

---

## Prerequisites

- [Node.js](https://nodejs.org) (v22+)
- [Bun](https://bun.sh) — runtime and build tool (optional but recommended for development)

```bash
# macOS
brew install bun
```

---

## Project Structure

```
asset-forge/
├── src/
│   ├── cli.ts          # CLI Entry point — registers all subcommands
│   ├── index.ts        # Programmatic API Entry point
│   ├── commands/       # TypeScript command implementations
│   │   ├── optimize.ts
│   │   ├── resize.ts
│   │   └── ...
│   ├── lib/            # Shared libraries (Sharp, Canvas, FFmpeg helpers)
│   │   ├── glob.ts
│   │   ├── output.ts
│   │   └── canvas.ts
│   └── commands.ts     # Command registry for the CLI
├── dist/               # Compiled JS and type definitions
├── tests/              # Smoke and integration tests
├── build.ts            # Custom Bun build script
└── package.json
```

**How commands work:** Each command is an isolated TypeScript module using `citty`'s `defineCommand`. They use native Node libraries (`sharp`, `@napi-rs/canvas`, `fluent-ffmpeg` with `ffmpeg-static`) for processing.

---

## Local Development

### Install dependencies

```bash
bun install
```

### Run without building (Dev Mode)

```bash
bun run dev                              # shows banner + help
bun run dev -- og-image --help          # per-command help
bun run dev -- og-image -t "Hello"      # run a command
```

### Building the project

We use a custom `build.ts` script to compile the project for Node.js distribution.

```bash
bun run build              # compiles to dist/cli.js and dist/index.js
```

### Running Tests

```bash
bun test                   # runs all tests
```

---

## Adding a New Command

### 1. Create the implementation

Add a new file to `src/commands/`. Use `defineCommand` for the CLI part and export a named function for the programmatic API.

```typescript
import { defineCommand } from 'citty'
import sharp from 'sharp'
import { resolveOutput } from '../lib/output'

export default defineCommand({
  meta: { name: 'my-command', description: 'Brief description' },
  args: {
    input: { type: 'positional', required: true },
    output: { type: 'positional', required: false },
  },
  async run({ args }) {
    await myCommand(args.input, args.output)
  }
})

export async function myCommand(input: string, output?: string) {
  const finalPath = resolveOutput({ input, output })
  await sharp(input).grayscale().toFile(finalPath)
  console.log(`Done → ${finalPath}`)
  return { files: [finalPath] }
}
```

### 2. Register it

1.  Add it to `src/commands.ts` (re-export it).
2.  Add it to `src/cli.ts` (register in `GROUPS` and `SUB_COMMANDS`).
3.  (Optional) Add it to `src/index.ts` for the public API.

---

## Releasing to NPM

### 1. Version Bump

```bash
npm version patch # or minor/major
```

### 2. Build and Publish

The `prepublishOnly` script in `package.json` ensures a fresh build before publishing.

```bash
npm publish
```

---

## Homebrew Wrapper

We still maintain a Homebrew formula as a convenience wrapper around the npm package.

1. Update `Formula/asset-forge.rb` with the new version.
2. The formula now simply runs `npm install -g asset-forge`.

---

License: MIT
