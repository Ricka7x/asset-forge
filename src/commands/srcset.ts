import sharp from 'sharp'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'srcset',
    description: 'Generate @1x/@2x/@3x retina variants',
  },
  args: {
    image:  { type: 'positional', description: 'Source image',            required: true },
    output: { type: 'positional', description: 'Output directory', required: false },
    scales: { type: 'positional', description: 'Comma-separated scales',  default: '1,2,3' },
  },
  async run({ args }) {
    await srcset(args.image, args.output, { scales: args.scales.split(',').map(Number) })
  }
})

export async function srcset(image: string, dest?: string | any, opts: any = {}) {
  // Support overloaded args
  if (typeof dest === 'object' && !Array.isArray(dest)) {
    opts = dest
    dest = undefined
  }

  const scales = opts.scales || [1, 2, 3]
  const files = globFiles(image, IMAGE_EXTENSIONS)
  const results: string[] = []

  for (const file of files) {
    const meta = await sharp(file).metadata()
    const baseW = meta.width! / Math.max(...scales)
    
    for (const scale of scales) {
      const suffix = scale === 1 ? '' : `@${scale}x`
      const finalPath = resolveOutput({ input: file, output: dest, suffix })
      
      await sharp(file)
        .resize(Math.round(baseW * scale))
        .toFile(finalPath)
        
      results.push(finalPath)
    }
  }

  console.log(`Generated srcset for ${files.length} images.`)
  return { files: results, html: '' } // Add HTML snippet generation if needed
}
