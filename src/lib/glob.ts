import { readdirSync, statSync } from 'fs'
import { join, isAbsolute, resolve } from 'path'

/**
 * Finds files recursively matching an extension.
 * If input is a file, returns [file]. If it's a directory, scans it.
 */
export function globFiles(input: string, extensions: string[] = []): string[] {
  const absPath = isAbsolute(input) ? input : resolve(process.cwd(), input)
  
  if (!statSync(absPath).isDirectory()) {
    return [absPath]
  }

  const results: string[] = []
  const files = readdirSync(absPath)

  for (const file of files) {
    const fullPath = join(absPath, file)
    if (statSync(fullPath).isDirectory()) {
      results.push(...globFiles(fullPath, extensions))
    } else {
      if (extensions.length === 0 || extensions.some(ext => file.toLowerCase().endsWith(ext.toLowerCase()))) {
        results.push(fullPath)
      }
    }
  }

  return results
}

export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg']
export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.gif']
