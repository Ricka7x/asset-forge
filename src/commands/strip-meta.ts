import sharp from 'sharp'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'strip-meta',
    description: 'Remove EXIF metadata from images',
  },
  args: {
    input: { type: 'positional', description: 'File or directory', required: true },
  },
  async run({ args }) {
    await stripMeta(args.input)
  }
})

export async function stripMeta(input: string) {
  const files = globFiles(input, IMAGE_EXTENSIONS)
  const results: string[] = []

  for (const file of files) {
    const output = resolveOutput({ input: file })
    await sharp(file).toFile(output)
    results.push(output)
  }

  console.log(`Stripped metadata from ${files.length} images.`)
  return { files: results }
}
