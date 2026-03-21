import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

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

/** Returns the resolved output directory.
 *  Priority: FORGE_OUT env var > config file > current working directory */
export function getOutDir(): string {
  return process.env.FORGE_OUT || getConfig().outDir || process.cwd()
}
