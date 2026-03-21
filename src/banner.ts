import chalk from 'chalk'

const VERSION = '0.1.0'

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
