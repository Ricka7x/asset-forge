import ffmpeg from '../lib/ffmpeg'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'extract-frames',
    description: 'Export frames from a video as images',
  },
  args: {
    input:  { type: 'positional', description: 'Source video',                      required: true },
    output: { type: 'positional', description: 'Output directory',                  required: false },
    mode:   { type: 'positional', description: 'fps rate or "all" for every frame', default: '1' },
    count:  { type: 'string',     description: 'Extract exactly N frames evenly distributed' },
    format: { type: 'string',     description: 'Output format: png (default), webp, jpg' },
    scroll: { type: 'boolean',    description: 'Output manifest.json + JS scroll animation snippet' },
  },
  async run({ args }) {
    await extractFrames(args.input, args.output, { mode: args.mode, count: args.count, format: args.format, scroll: args.scroll })
  }
})

export async function extractFrames(input: string, dest?: string | any, opts: any = {}) {
  // Support overloaded args
  if (typeof dest === 'object' && !Array.isArray(dest)) {
    opts = dest
    dest = undefined
  }

  const outDir = dest || (opts.scroll ? 'scroll-frames' : 'frames')
  mkdirSync(outDir, { recursive: true })

  const format = opts.format || (opts.scroll ? 'webp' : 'png')
  const count = opts.count ? parseInt(opts.count) : (opts.scroll ? 60 : undefined)
  const mode = opts.mode || '1'

  const results: string[] = []

  return new Promise((resolve, reject) => {
    let command = ffmpeg(input).output(join(outDir, 'frame-%04d.' + format))

    if (count) {
      // Need duration for even distribution
      ffmpeg.ffprobe(input, (err, metadata) => {
        if (err) return reject(err)
        const duration = metadata.format.duration || 0
        const fps = count / duration
        command.outputOptions(['-vf', `fps=${fps}`, '-vframes', count.toString()]).on('end', () => {
          finalize(outDir, count, format, opts.scroll, resolve)
        }).on('error', reject).run()
      })
    } else {
      if (mode !== 'all') {
        command.outputOptions(['-vf', `fps=${mode}`])
      }
      command.on('end', () => {
        finalize(outDir, 0, format, opts.scroll, resolve)
      }).on('error', reject).run()
    }
  })
}

function finalize(outDir: string, count: number, format: string, scroll: boolean, resolve: Function) {
  if (scroll) {
    const manifest = {
      total: count, // This should ideally be the actual number of files
      format: format,
      prefix: 'frame-',
      padding: 4
    }
    writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
    console.log('  manifest.json')
  }
  console.log(`Done → ${outDir}/`)
  resolve({ files: [] }) // Note: Actual file list could be huge, maybe leave empty for now or scan directory
}
