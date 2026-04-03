import sharp from 'sharp'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

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

type DeviceKind = 'iphone' | 'android' | 'browser'

type FrameSpec = {
  padX: number
  padTop: number
  padBottom: number
  outerRadius: number
  screenRadius: number
  frameFill: string
  frameStroke: string
}

const FRAME_SPECS: Record<DeviceKind, FrameSpec> = {
  iphone: {
    padX: 44,
    padTop: 78,
    padBottom: 86,
    outerRadius: 56,
    screenRadius: 30,
    frameFill: '#0b0b0c',
    frameStroke: '#232328',
  },
  android: {
    padX: 34,
    padTop: 54,
    padBottom: 60,
    outerRadius: 36,
    screenRadius: 24,
    frameFill: '#1f2937',
    frameStroke: '#4b5563',
  },
  browser: {
    padX: 28,
    padTop: 62,
    padBottom: 28,
    outerRadius: 22,
    screenRadius: 16,
    frameFill: '#e5e7eb',
    frameStroke: '#cbd5e1',
  },
}

function createRoundedMask(width: number, height: number, radius: number) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#ffffff"/>
    </svg>
  `)
}

function createFrameBody(width: number, height: number, spec: FrameSpec) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="${spec.outerRadius}" ry="${spec.outerRadius}" fill="${spec.frameFill}" stroke="${spec.frameStroke}" stroke-width="3"/>
    </svg>
  `)
}

function createFrameDecorations(device: DeviceKind, width: number, height: number) {
  if (device === 'browser') {
    return Buffer.from(`
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="16" width="${width - 32}" height="32" rx="16" fill="#f8fafc" opacity="0.92"/>
        <circle cx="34" cy="32" r="5" fill="#fb7185"/>
        <circle cx="52" cy="32" r="5" fill="#fbbf24"/>
        <circle cx="70" cy="32" r="5" fill="#34d399"/>
        <rect x="100" y="22" width="${Math.max(120, width - 140)}" height="20" rx="10" fill="#e2e8f0"/>
      </svg>
    `)
  }

  if (device === 'iphone') {
    const notchWidth = Math.min(210, Math.floor(width * 0.34))
    return Buffer.from(`
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect x="${Math.floor((width - notchWidth) / 2)}" y="18" width="${notchWidth}" height="34" rx="17" fill="#020617"/>
        <circle cx="${Math.floor(width / 2) - 40}" cy="35" r="5" fill="#111827"/>
        <circle cx="${Math.floor(width / 2) + 32}" cy="35" r="4" fill="#1f2937"/>
        <rect x="${Math.floor((width - 120) / 2)}" y="${height - 24}" width="120" height="6" rx="3" fill="#f8fafc" opacity="0.75"/>
      </svg>
    `)
  }

  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${Math.floor(width / 2) - 36}" y="12" width="72" height="10" rx="5" fill="#111827" opacity="0.8"/>
      <circle cx="${width - 34}" cy="26" r="7" fill="#0f172a" opacity="0.7"/>
    </svg>
  `)
}

export async function deviceFrame(input: string, output?: string | any, device: string = 'iphone') {
  const finalPath = resolveOutput({ input, output, extension: '.png' })

  if (!(device in FRAME_SPECS)) {
    throw new Error(`Unknown device '${device}'. Use iphone, android, or browser.`)
  }

  const kind = device as DeviceKind
  const spec = FRAME_SPECS[kind]
  const content = await sharp(input).metadata()

  if (!content.width || !content.height) {
    throw new Error(`Could not read screenshot dimensions from ${input}`)
  }

  const frameWidth = content.width + spec.padX * 2
  const frameHeight = content.height + spec.padTop + spec.padBottom
  const maskedScreen = await sharp(input)
    .composite([{ input: createRoundedMask(content.width, content.height, spec.screenRadius), blend: 'dest-in' }])
    .toBuffer()

  await sharp({
    create: {
      width: frameWidth,
      height: frameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: createFrameBody(frameWidth, frameHeight, spec) },
      { input: maskedScreen, left: spec.padX, top: spec.padTop },
      { input: createFrameDecorations(kind, frameWidth, frameHeight) },
    ])
    .toFile(finalPath)

  console.log(`Saved framed screenshot to ${finalPath}`)
  return { files: [finalPath] }
}
