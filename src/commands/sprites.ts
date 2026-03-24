import { createCanvas, loadImage } from '@napi-rs/canvas'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'
import { writeFileSync } from 'fs'
import { basename } from 'path'

export default defineCommand({
  meta: {
    name: 'sprites',
    description: 'Generate sprite sheet + CSS',
  },
  args: {
    dir:     { type: 'positional', description: 'Directory to pack',   required: true },
    output:  { type: 'positional', description: 'Base output name',    default: 'sprite' },
    prefix:  { type: 'positional', description: 'CSS class prefix',    default: '.icon-' },
  },
  async run({ args }) {
    await sprites(args.dir, args.output, { prefix: args.prefix })
  }
})

export async function sprites(dir: string, output: string = 'sprite', opts: any = {}) {
  const files = globFiles(dir, IMAGE_EXTENSIONS)
  if (files.length === 0) return { files: [], css: '' }

  const images = await Promise.all(files.map(async f => {
    const img = await loadImage(f)
    return { name: basename(f).split('.')[0], img, w: img.width, h: img.height }
  }))

  const spacing = 4
  const columns = Math.ceil(Math.sqrt(images.length))
  const rows = Math.ceil(images.length / columns)
  const tw = Math.max(...images.map(i => i.w))
  const th = Math.max(...images.map(i => i.h))
  
  const canvasW = (columns * tw) + ((columns - 1) * spacing)
  const canvasH = (rows * th) + ((rows - 1) * spacing)
  
  const canvas = createCanvas(canvasW, canvasH)
  const ctx = canvas.getContext('2d')
  
  let css = `.sprite { 
    display: inline-block; 
    background-image: url('${output}.png'); 
    background-repeat: no-repeat; 
  }\n`

  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    const col = i % columns
    const row = Math.floor(i / columns)
    const x = col * (tw + spacing)
    const y = row * (th + spacing)
    
    ctx.drawImage(img.img, x, y)
    
    css += `${opts.prefix}${img.name} {
      width: ${img.w}px;
      height: ${img.h}px;
      background-position: -${x}px -${y}px;
    }\n`
  }

  const finalPng = resolveOutput({ input: dir, output: `${output}.png`, extension: '.png' })
  const finalCss = resolveOutput({ input: dir, output: `${output}.css`, extension: '.css' })
  
  writeFileSync(finalPng, await canvas.toBuffer('image/png'))
  writeFileSync(finalCss, css)
  
  console.log(`Generated sprite sheet → ${finalPng}`)
  console.log(`Generated CSS → ${finalCss}`)
  
  return { files: [finalPng, finalCss], css }
}
