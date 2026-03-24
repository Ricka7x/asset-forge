import sharp from 'sharp'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export interface BorderOptions {
  output?: string
  size?: number
  color?: string
}

export default defineCommand({
  meta: {
    name: 'border',
    description: 'Add a border to images',
  },
  args: {
    input:  { type: 'positional', description: 'File or directory', required: true },
    output: { type: 'positional', description: 'Output directory', required: false },
    size:   { type: 'positional', description: 'Border size in px', default: '4' },
    color:  { type: 'positional', description: 'Border color',      default: 'black' },
  },
  async run({ args }) {
    await border(args.input, { output: args.output, size: parseInt(args.size), color: args.color })
  }
})

export async function border(input: string, opts: BorderOptions = {}) {
  const size = opts.size || 4
  const color = opts.color || 'black'
  const files = globFiles(input, IMAGE_EXTENSIONS)
  const results: string[] = []

  for (const file of files) {
    const finalPath = resolveOutput({ input: file, output: opts.output })
    await sharp(file)
      .extend({
        top: size, left: size, bottom: size, right: size,
        background: color
      })
      .toFile(finalPath)
    results.push(finalPath)
  }

  console.log(`Added borders to ${files.length} images.`)
  return { files: results }
}
