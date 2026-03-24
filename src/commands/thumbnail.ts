import sharp from 'sharp'
import { join, extname } from 'path'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'thumbnail',
    description: 'Generate center-cropped thumbnails',
  },
  args: {
    src:     { type: 'positional', description: 'Source file or directory',      required: true },
    dest:    { type: 'positional', description: 'Destination file or directory', required: false },
    size:    { type: 'positional', description: 'Dimensions WxH',                default: '400x400' },
    gravity: { type: 'positional', description: 'Crop anchor: NorthWest, North, NorthEast, West, Center, East, SouthWest, South, SouthEast', default: 'Center' },
  },
  async run({ args }) {
    await thumbnail(args.src, args.dest, args.size, args.gravity)
  }
})

export async function thumbnail(src: string, dest?: string | any, size?: string | any, gravity: string = 'center') {
  // Support overloaded options
  if (typeof size === 'object' && !Array.isArray(size)) {
    size = size
  }

  const [w, h] = typeof size === 'string' ? size.split('x').map(Number) : [400, 400]
  const files = globFiles(src, IMAGE_EXTENSIONS)
  const results: string[] = []

  for (const file of files) {
    const finalPath = resolveOutput({
      input: file,
      output: typeof dest === 'string' ? dest : undefined,
    })

    await sharp(file)
      .resize(w, h, { fit: 'cover', position: gravity.toLowerCase() })
      .toFile(finalPath)
    
    results.push(finalPath)
    console.log(`  ${finalPath} (${w}x${h})`)
  }

  console.log('Done.')
  return { files: results }
}
