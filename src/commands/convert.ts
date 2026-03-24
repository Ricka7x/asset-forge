import sharp from 'sharp'
import { extname } from 'path'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'convert',
    description: 'Convert image to a different format',
  },
  args: {
    input:   { type: 'positional', description: 'Source image',                  required: true },
    output:  { type: 'positional', description: 'Output file with target extension', required: true },
    quality: { type: 'positional', description: 'Quality 1-100',                 default: '90' },
  },
  async run({ args }) {
    await convert(args.input, args.output, { quality: parseInt(args.quality) })
  }
})

export async function convert(input: string, output: string, opts: any = {}) {
  const quality = opts.quality || 90
  const format = extname(output).slice(1).toLowerCase() as any
  
  const finalPath = resolveOutput({ input, output })
  
  await sharp(input)
    .toFormat(format, { quality })
    .toFile(finalPath)
    
  console.log(`Done → ${finalPath}`)
  return { files: [finalPath] }
}
