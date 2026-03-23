import chalk from 'chalk'
import { version as VERSION } from '../package.json'

const ART = `
  ▄▀█ █▀ █▀ █▀▀ ▀█▀   █▀▀ █▀█ █▀█ █▀▀ █▀▀
  █▀█ ▄█ ▄█ ██▄  █    █▀  █▄█ █▀▄ █▄█ ██▄
`

export function printBanner() {
  console.log(chalk.cyan(ART))
  console.log(
    chalk.dim('  the complete asset toolkit') +
    chalk.dim.italic(`  v${VERSION}`)
  )
  console.log()
}
