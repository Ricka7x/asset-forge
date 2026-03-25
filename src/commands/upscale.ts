import sharp from 'sharp'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'upscale',
    description: 'Upscale images 2x/3x/4x with Lanczos resampling',
  },
  args: {
    input:  { type: 'positional', description: 'File or directory',           required: true },
    scale:  { type: 'positional', description: 'Scale factor: 2, 3, or 4',   required: false, default: '2' },
    output: { type: 'positional', description: 'Output directory',            required: false },
  },
  async run({ args }) {
    await upscale(args.input, args.scale, args.output)
  }
})

export async function upscale(input: string, scale?: string | number | any, output?: string | any) {
  // Support overloaded args
  if (typeof scale === 'object' && !Array.isArray(scale)) {
    output = scale
    scale = undefined
  }

  const factor = parseScale(scale ?? '2')
  if (!factor) {
    console.error(`  Invalid scale "${scale}". Use 2, 3, or 4 (e.g. 2x, 3, 4x).`)
    process.exit(1)
  }

  const files = globFiles(input, IMAGE_EXTENSIONS)
  const results: string[] = []

  for (const file of files) {
    const meta = await sharp(file).metadata()
    const newWidth  = Math.round((meta.width  ?? 0) * factor)
    const newHeight = Math.round((meta.height ?? 0) * factor)

    const finalPath = resolveOutput({
      input: file,
      output: typeof output === 'string' ? output : undefined,
      suffix: `@${factor}x`,
    })

    await sharp(file)
      .resize(newWidth, newHeight, { kernel: 'lanczos3' })
      .sharpen({ sigma: 0.5 + (factor - 2) * 0.3 })
      .toFile(finalPath)

    results.push(finalPath)
    console.log(`  ${finalPath}  (${meta.width}x${meta.height} → ${newWidth}x${newHeight})`)
  }

  console.log('Done.')
  return { files: results }
}

function parseScale(value: string | number): number | null {
  const str = String(value).replace(/x$/i, '')
  const n = parseFloat(str)
  if (isNaN(n) || n < 1.1 || n > 8) return null
  return n
}
