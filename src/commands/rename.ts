import { renameSync, statSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { defineCommand } from 'citty'
import chalk from 'chalk'

export default defineCommand({
  meta: {
    name: 'rename',
    description: 'Batch rename image files',
  },
  args: {
    dir:      { type: 'positional', description: 'Directory to rename', required: true },
    prefix:   { type: 'string',     description: 'Add prefix to filenames' },
    suffix:   { type: 'string',     description: 'Add suffix to filenames' },
    slugify:  { type: 'boolean',    description: 'Convert names to slug-case' },
    sequence: { type: 'string',     description: 'Rename to sequential numbers, starting from N' },
    dryRun:   { type: 'boolean',    description: 'Preview changes without renaming', alias: 'n' },
  },
  async run({ args }) {
    await rename(args.dir, args)
  }
})

export async function rename(dir: string, opts: any = {}) {
  const files = globFiles(dir, IMAGE_EXTENSIONS)
  const results: string[] = []
  
  let i = opts.sequence ? parseInt(opts.sequence) : 0
  const isSeq = opts.sequence !== undefined

  for (const file of files) {
    const dirName = dirname(file)
    const ext = extname(file)
    let base = basename(file, ext)
    
    if (opts.slugify) {
      base = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    
    if (opts.prefix) base = opts.prefix + base
    if (opts.suffix) base = base + opts.suffix
    if (isSeq) base = (i++).toString()

    const newPath = join(dirName, base + ext)
    
    if (file !== newPath) {
      if (opts.dryRun) {
        console.log(`${chalk.dim(basename(file))} → ${chalk.cyan(basename(newPath))}`)
      } else {
        renameSync(file, newPath)
        results.push(newPath)
      }
    }
  }

  if (opts.dryRun) {
    console.log(chalk.yellow('\nDry run complete. No files renamed.'))
  } else {
    console.log(`Renamed ${results.length} files.`)
  }

  return { files: results }
}
