import sharp from 'sharp'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineCommand({
  meta: {
    name: 'device-frame',
    description: 'Wrap screenshot in a device frame',
  },
  args: {
    input:  { type: 'positional', description: 'Screenshot image', required: true },
    output: { type: 'positional', description: 'Output image',     required: false },
    device: { type: 'positional', description: 'iphone|android|browser', default: 'iphone' },
  },
  async run({ args }) {
    await deviceFrame(args.input, args.output, args.device)
  }
})

export async function deviceFrame(input: string, output?: string | any, device: string = 'iphone') {
  const finalPath = resolveOutput({ input, output, extension: '.png' })
  
  // Locate frame assets in the dist/assets folder of the package
  const framePath = join(__dirname, `../assets/frames/${device}.png`)
  
  if (!existsSync(framePath)) {
    console.error(`Error: Device frame for ${device} not found at ${framePath}`)
    process.exit(1)
  }

  const frame = await sharp(framePath).metadata()
  const content = await sharp(input).metadata()
  
  // High-level placement logic
  // Each device has a "screen zone". For now, we'll assume the frame 
  // is a transparent window.
  
  await sharp(framePath)
    .composite([{
      input: await sharp(input).resize(frame.width, frame.height, { fit: 'inside' }).toBuffer(),
      gravity: 'center',
      blend: 'dest-over' // content behind the frame
    }])
    .toFile(finalPath)
    
  console.log(`Saved framed screenshot to ${finalPath}`)
  return { files: [finalPath] }
}
