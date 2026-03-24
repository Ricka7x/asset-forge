import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    index: 'src/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'node22',
  outDir: 'dist',
  minify: false,
  sourcemap: true,
  noExternal: ['file-type', 'image-hash'], // In-line these to avoid resolution issues
  banner: {
    js: '#!/usr/bin/env node'
  }
})
