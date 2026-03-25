import { defineCommand } from 'citty'
import { writeFileSync } from 'fs'
import { composeMarketingAsset } from '../lib/canvas'
import { resolveOutput } from '../lib/output'

export default defineCommand({
  meta: {
    name: 'github-social',
    description: 'GitHub repository social preview (1280x640)',
  },
  args: {
    background: { type: 'string',     alias: 'b', description: 'Background image', required: true },
    title:      { type: 'string',     alias: 't', description: 'Headline text',    required: true },
    logo:       { type: 'string',     alias: 'l', description: 'Logo image' },
    subtitle:   { type: 'string',     alias: 's', description: 'Subtitle text' },
    output:     { type: 'string',     alias: 'o', description: 'Output PNG' },
    theme:      { type: 'string',     alias: 'm', description: 'light|dark', default: 'dark' },
  },
  async run({ args }) {
    await githubSocial(args)
  }
})

export async function githubSocial(args: any) {
    const finalPath = resolveOutput({ 
       input: args.background, 
       output: args.output, 
       extension: '.png', 
       suffix: '-github' 
    })

    const buf = await composeMarketingAsset({
      width: 1280, height: 640,
      background: args.background,
      logo: args.logo,
      headline: args.title,
      subtitle: args.subtitle,
      theme: args.theme as any,
      overlayColor: args.theme === 'dark' ? 'rgba(0,0,0,0.45)' : undefined,
      logoPx: 160, logoY: 90,
      headlinePt: 80, subtitlePt: 40
    })

    writeFileSync(finalPath, buf)
    console.log(`GitHub Social Preview generated → ${finalPath}`)
    return { files: [finalPath] }
}
