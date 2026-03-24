import { statSync, existsSync } from 'fs'
import { join, extname, basename, dirname } from 'path'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { defineCommand } from 'citty'
import chalk from 'chalk'

export default defineCommand({
  meta: {
    name: 'audit',
    description: 'Audit an image or folder for issues',
  },
  args: {
    dir:       { type: 'positional', description: 'File or directory to audit',   required: true },
    threshold: { type: 'positional', description: 'Size warning threshold in KB', default: '200' },
  },
  async run({ args }) {
    await audit(args.dir, parseInt(args.threshold))
  }
})

export async function audit(dir: string, thresholdKB: number = 200) {
  const files = globFiles(dir, IMAGE_EXTENSIONS).filter(f => !f.endsWith('.avif') && !f.endsWith('.webp'))
  const issues: any[] = []

  for (const file of files) {
    const stat = statSync(file)
    const sizeKB = stat.size / 1024

    if (sizeKB > thresholdKB) {
      issues.push({ 
        file, 
        type: 'oversized', 
        message: `Oversized image: ${Math.round(sizeKB)}KB (limit ${thresholdKB}KB)`,
        suggestion: `Run 'forge optimize ${file}'`
      })
    }

    const base = file.replace(extname(file), '')
    if (!existsSync(`${base}.avif`) || !existsSync(`${base}.webp`)) {
      issues.push({
        file,
        type: 'missing-optimizations',
        message: 'Missing AVIF/WebP versions.',
        suggestion: `Run 'forge optimize ${file}'`
      })
    }
  }

  if (issues.length === 0) {
    console.log(chalk.green('✓ No issues found.'))
  } else {
    for (const issue of issues) {
      console.log(chalk.yellow(`[${issue.type}]`) + ` ${chalk.bold(issue.file)}: ${issue.message}`)
      console.log(`  Suggestion: ${chalk.cyan(issue.suggestion)}`)
      console.log()
    }
  }

  return issues
}
