import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import { existsSync } from 'fs'

// ffmpeg-static may return a non-null path even when the binary was never
// downloaded (e.g. Homebrew blocks postinstall network scripts).
// Verify the file exists before using it; otherwise fluent-ffmpeg falls back
// to whatever `ffmpeg` is available on the system PATH.
if (ffmpegPath && existsSync(ffmpegPath)) {
  ffmpeg.setFfmpegPath(ffmpegPath)
}

export default ffmpeg
