import { build } from 'bun'

const results = await build({
  entrypoints: ['./src/cli.ts', './src/index.ts'],
  outdir: './dist',
  target: 'node',
  format: 'cjs',
  minify: false,
  sourcemap: 'external',
  external: ['file-type', 'image-hash', 'node-vibrant', 'sharp', '@napi-rs/canvas', 'fluent-ffmpeg'],
})

if (!results.success) {
  console.error('Build failed')
  for (const message of results.logs) {
    console.error(message)
  }
  process.exit(1)
}

// Add shebang
const cliPath = './dist/cli.js'
const content = await Bun.file(cliPath).text()
if (!content.startsWith('#!')) {
  await Bun.write(cliPath, `#!/usr/bin/env node\n${content}`)
}

console.log('Build successful')
