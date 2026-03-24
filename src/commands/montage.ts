import { createCanvas, loadImage } from '@napi-rs/canvas'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'
import { writeFileSync } from 'fs'

export default defineCommand({
  meta: {
    name: 'montage',
    description: 'Create image grid collage',
  },
  args: {
    dir:     { type: 'positional', description: 'Directory or images', required: true },
    output:  { type: 'positional', description: 'Output PNG',            required: false },
    columns: { type: 'positional', description: 'Grid columns',          default: '3' },
    size:    { type: 'positional', description: 'Tile size (e.g., 400x400)', default: '400x400' },
    gap:     { type: 'positional', description: 'Gap between tiles',      default: '10' },
  },
  async run({ args }) {
    await montage(args.dir, args.output, { 
      columns: parseInt(args.columns), 
      size: args.size, 
      gap: parseInt(args.gap) 
    })
  }
})

export async function montage(dir: string, output?: string | any, opts: any = {}) {
  const files = globFiles(dir, IMAGE_EXTENSIONS)
  const columns = opts.columns || 3
  const [tw, th] = (opts.size || '400x400').split('x').map(Number)
  const gap = opts.gap || 10
  const rows = Math.ceil(files.length / columns)
  const finalPath = resolveOutput({ input: dir, output, extension: '.png' })

  const canvasW = (columns * tw) + ((columns - 1) * gap)
  const canvasH = (rows * th) + ((rows - 1) * gap)
  
  const canvas = createCanvas(canvasW, canvasH)
  const ctx = canvas.getContext('2d')
  
  for (let i = 0; i < files.length; i++) {
    const col = i % columns
    const row = Math.floor(i / columns)
    const x = col * (tw + gap)
    const y = row * (th + gap)
    
    // Draw each image (resize using a buffer pre-load if needed, 
    // but here we'll just draw onto the canvas).
    // Actually, loadImage is better for canvas performance.
    const img = await loadImage(files[i])
    ctx.drawImage(img, x, y, tw, th)
  }

  writeFileSync(finalPath, await canvas.toBuffer('image/png'))
  console.log(`Saved montage to ${finalPath}`)
  
  return { files: [finalPath] }
}
