import sharp from 'sharp'
import { mkdirSync, copyFileSync } from 'fs'
import { dirname, extname } from 'path'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export interface OptimizeOptions {
  quality?: number
}

export default defineCommand({
  meta: {
    name: 'optimize',
    description: 'Compress images to AVIF/WebP',
  },
  args: {
    src:     { type: 'positional', description: 'Source file or directory',      required: true },
    dest:    { type: 'positional', description: 'Destination file or directory', required: false },
    quality: { type: 'positional', description: 'Quality 1-100',                 default: '95' },
  },
  async run({ args }) {
    await optimize(args.src, args.dest, { quality: parseInt(args.quality) })
  }
})

export async function optimize(src: string, dest?: string | OptimizeOptions, opts: OptimizeOptions = {}) {
  // Support overloaded arguments
  if (typeof dest === 'object' && !Array.isArray(dest)) {
    opts = dest
    dest = undefined
  }

  const quality = opts.quality || 95
  const files = globFiles(src, IMAGE_EXTENSIONS)
  const results: string[] = []

  for (const file of files) {
    const isSvg = file.toLowerCase().endsWith('.svg')
    const output = resolveOutput({ input: file, output: dest as string })

    if (isSvg) {
      copyFileSync(file, output)
      results.push(output)
      continue
    }

    const outBase = output.replace(extname(output), '')
    const avifOut = `${outBase}.avif`
    const webpOut = `${outBase}.webp`

    mkdirSync(dirname(output), { recursive: true })

    try {
      await sharp(file).avif({ quality }).toFile(avifOut)
      await sharp(file).webp({ quality }).toFile(webpOut)
      results.push(avifOut, webpOut)
    } catch (e) {
      console.error(`Error optimizing ${file}:`, e)
    }
  }

  console.log(`Optimized ${files.length} images.`)
  return { files: results }
}
