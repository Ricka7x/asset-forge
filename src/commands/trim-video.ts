import ffmpeg from '../lib/ffmpeg'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'trim-video',
    description: 'Cut video segment',
  },
  args: {
    video: { type: 'positional', description: 'Source video', required: true },
    start: { type: 'positional', description: 'Start time (e.g. 30, MM:SS)', required: true },
    end:   { type: 'positional', description: 'End time',   required: true },
    output:{ type: 'positional', description: 'Output video', required: false },
  },
  async run({ args }) {
    await trimVideo(args.video, args.start, args.end, args.output)
  }
})

export async function trimVideo(video: string, start: string, end: string, output?: string | any) {
  const finalPath = resolveOutput({ input: video, output })
  
  console.log(`Trimming video from ${start} to ${end}...`)

  return new Promise((resolve, reject) => {
    ffmpeg(video)
      .setStartTime(start)
      .setDuration(end) // Note: Duration is often easier than "to" in fluent-ffmpeg
      .save(finalPath)
      .on('end', () => {
        console.log(`Done → ${finalPath}`)
        resolve({ files: [finalPath] })
      })
      .on('error', reject)
  })
}
