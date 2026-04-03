import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { spawnSync } from 'child_process'

if (existsSync('./dist')) {
  rmSync('./dist', { recursive: true, force: true })
}

const result = spawnSync('bun', ['x', 'tsc', '-p', 'tsconfig.build.json'], {
  stdio: 'inherit',
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

const cliPath = './dist/cli.js'
const content = readFileSync(cliPath, 'utf8')
if (!content.startsWith('#!')) {
  writeFileSync(cliPath, `#!/usr/bin/env node\n${content}`)
}

const strayExecutable = './dist/asset-forge'
if (existsSync(strayExecutable)) {
  rmSync(strayExecutable, { force: true })
}

console.log('Build successful')
