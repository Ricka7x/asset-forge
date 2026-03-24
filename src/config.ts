import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import chalk from 'chalk'

const CONFIG_DIR  = join(process.env.HOME ?? process.env.USERPROFILE ?? '.', '.config', 'asset-forge')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')

type Config = { outDir?: string; fontBold?: string; fontRegular?: string }

export function getConfig(): Config {
  if (!existsSync(CONFIG_FILE)) return {}
  try { return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) }
  catch { return {} }
}

export function setConfig(key: keyof Config, value: string) {
  mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(CONFIG_FILE, JSON.stringify({ ...getConfig(), [key]: value }, null, 2))
}

let tipped = false

export function checkTip() {
  if (tipped) return
  const envOut = process.env.FORGE_OUT
  const confOut = getConfig().outDir
  
  if (!envOut && !confOut) {
    if (!process.env.FORGE_QUIET) {
      console.log(chalk.yellow('\n  Tip: Set a default output directory to avoid this message:'))
      console.log(chalk.dim('  forge config set outDir ~/Desktop/assets\n'))
      tipped = true
    }
  }
}

/** Returns the resolved output directory.
 *  Priority: FORGE_OUT env var > config file > current working directory */
export function getOutDir(): string {
  checkTip()
  return process.env.FORGE_OUT || getConfig().outDir || process.cwd()
}
