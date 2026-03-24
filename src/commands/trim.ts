import sharp from 'sharp'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'trim',
    description: 'Auto-trim transparent/uniform borders',
  },
  args: {
    input:  { type: 'positional', description: 'File or directory',     required: true },
    output: { type: 'positional', description: 'Output directory or file', required: false },
    fuzz:   { type: 'positional', description: 'Color tolerance 0-100%', default: '5' },
  },
  async run({ args }) {
    await trim(args.input, args.output, { fuzz: parseInt(args.fuzz) })
  }
})

export async function trim(input: string, dest?: string | any, opts: any = {}) {
  // Support overloaded options
  if (typeof dest === 'object' && !Array.isArray(dest)) {
    opts = dest
    dest = undefined
  }

  const threshold = opts.fuzz || 5
  const files = globFiles(input, IMAGE_EXTENSIONS)
  const results: string[] = []

  for (const file of files) {
    const finalPath = resolveOutput({ input: file, output: dest })
    await sharp(file).trim({ threshold }).toFile(finalPath)
    results.push(finalPath)
  }

  console.log(`Trimmed ${files.length} images.`)
  return { files: results }
}
