import sharp from 'sharp'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'resize',
    description: 'Resize images',
  },
  args: {
    input:  { type: 'positional', description: 'File or directory',                       required: true },
    spec:   { type: 'positional', description: 'Size spec: 800, 800x600, 50%, 800x600^', required: true },
    output: { type: 'positional', description: 'Output directory', required: false },
  },
  async run({ args }) {
    await resize(args.input, args.spec, args.output)
  }
})

export async function resize(input: string, spec: string | number | any, output?: string | any) {
  // Support overloaded args
  if (typeof spec === 'object' && !Array.isArray(spec)) {
    output = spec
    spec = undefined
  }

  const files = globFiles(input, IMAGE_EXTENSIONS)
  const results: string[] = []

  for (const file of files) {
    const finalPath = resolveOutput({
      input: file,
      output: typeof output === 'string' ? output : undefined,
    })

    const transformed = await applyResize(file, spec)
    await transformed.toFile(finalPath)
    results.push(finalPath)
    console.log(`  ${finalPath}`)
  }

  console.log('Done.')
  return { files: results }
}

async function applyResize(file: string, spec: string | number) {
  const meta = await sharp(file).metadata()
  let width, height, fit: keyof sharp.FitEnum = 'inside'

  if (typeof spec === 'number') {
    width = spec
  } else if (spec.endsWith('%')) {
    const ratio = parseFloat(spec) / 100
    width = Math.round(meta.width! * ratio)
    height = Math.round(meta.height! * ratio)
  } else if (spec.includes('x')) {
    const [w, rest] = spec.split('x')
    width = w ? parseInt(w) : undefined
    
    // Check for exact spec (e.g., 800x600!) or fill-and-crop (e.g., 800x600^)
    if (rest.endsWith('!')) {
      height = parseInt(rest.slice(0, -1))
      fit = 'fill'
    } else if (rest.endsWith('^')) {
      height = parseInt(rest.slice(0, -1))
      fit = 'cover'
    } else {
      height = parseInt(rest)
      fit = 'inside'
    }
  } else {
    width = parseInt(spec)
  }

  return sharp(file).resize(width, height, { fit })
}
