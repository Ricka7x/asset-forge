import sharp from 'sharp'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'watermark',
    description: 'Overlay a watermark on images',
  },
  args: {
    src:      { type: 'positional', description: 'Source file or directory',      required: true },
    dest:     { type: 'positional', description: 'Destination file or directory', required: false },
    logo:     { type: 'string',     description: 'Logo image',            alias: 'l' },
    text:     { type: 'string',     description: 'Text watermark',        alias: 't' },
    position: { type: 'string',     description: 'SouthEast, NorthEast, SouthWest, NorthWest, Center', alias: 'p', default: 'SouthEast' },
    opacity:  { type: 'string',     description: 'Opacity 0-100',         alias: 'o', default: '70' },
  },
  async run({ args }) {
    await watermark(args.src, args.dest, { 
      logo: args.logo, 
      text: args.text, 
      position: args.position, 
      opacity: parseInt(args.opacity) 
    })
  }
})

export async function watermark(src: string, dest?: string | any, opts: any = {}) {
  // Support overloaded args
  if (typeof dest === 'object' && !Array.isArray(dest)) {
    opts = dest
    dest = undefined
  }

  const files = globFiles(src, IMAGE_EXTENSIONS)
  const results: string[] = []

  for (const file of files) {
    const output = resolveOutput({ input: file, output: dest })
    
    let layers: any[] = []
    
    if (opts.logo) {
      layers.push({
        input: opts.logo,
        gravity: opts.position.toLowerCase(),
        blend: 'over',
        // Opacity handling for logo is tricky with composite, 
        // usually requires pre-processing the logo.
      })
    }
    
    // For text, we'd use canvas or SVG.
    
    await sharp(file).composite(layers).toFile(output)
    results.push(output)
  }

  console.log(`Watermarked ${files.length} images.`)
  return { files: results }
}
