import { dirname, join, isAbsolute, resolve, basename, extname } from 'path'
import { mkdirSync } from 'fs'
import { getOutDir as getGlobalOutDir } from '../config'

interface ResolveOptions {
  input: string
  output?: string
  extension?: string
  suffix?: string
}

/**
 * Resolves where an output file should go.
 * 1. If explicit output path is provided, use it.
 * 2. If it's a directory, place file inside it with original name (and optional suffix/extension).
 * 3. Fallback to global outDir or CWD.
 */
export function resolveOutput(opts: ResolveOptions): string {
  const { input, output, extension, suffix } = opts
  const globalOutDir = getGlobalOutDir()
  
  let targetDir = output ? (output.endsWith('/') || !extname(output) ? output : dirname(output)) : globalOutDir
  let fileName = basename(input, extname(input))
  
  if (suffix) fileName += suffix
  const finalExt = extension || extname(input)
  const finalFileName = `${fileName}${finalExt}`

  let finalPath: string
  
  if (output && extname(output)) {
    // Explicit file path
    finalPath = isAbsolute(output) ? output : resolve(process.cwd(), output)
  } else {
    // Directory target
    const absDir = isAbsolute(targetDir) ? targetDir : resolve(process.cwd(), targetDir)
    finalPath = join(absDir, finalFileName)
  }

  mkdirSync(dirname(finalPath), { recursive: true })
  return finalPath
}
