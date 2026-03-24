import { defineCommand } from 'citty'
import { writeFileSync } from 'fs'
import { composeMarketingAsset } from '../lib/canvas'
import { resolveOutput } from '../lib/output'

export default defineCommand({
  meta: {
    name: 'email-banner',
    description: 'Email header banner (600x200)',
  },
  args: {
    background: { type: 'string',     alias: 'b', description: 'Background image', required: true },
    title:      { type: 'string',     alias: 't', description: 'Headline text',    required: false },
    logo:       { type: 'string',     alias: 'l', description: 'Logo image' },
    subtitle:   { type: 'string',     alias: 's', description: 'Subtitle text' },
    output:     { type: 'string',     alias: 'o', description: 'Output PNG' },
    theme:      { type: 'string',     alias: 'm', description: 'light|dark', default: 'dark' },
  },
  async run({ args }) {
    await emailBanner(args)
  }
})

export async function emailBanner(args: any) {
    const finalPath = resolveOutput({ 
       input: args.background, 
       output: args.output, 
       extension: '.png', 
       suffix: '-banner' 
    })

    const buf = await composeMarketingAsset({
      width: 600, height: 200,
      background: args.background,
      logo: args.logo,
      headline: args.title || '',
      subtitle: args.subtitle,
      theme: args.theme as any,
      overlayColor: args.theme === 'dark' ? 'rgba(0,0,0,0.35)' : undefined,
      logoPx: 70,  logoY: 20,
      headlineY: 90, subtitleY: 130,
      headlinePt: 36,  subtitlePt: 18
    })

    writeFileSync(finalPath, buf)
    console.log(`Email Banner generated → ${finalPath}`)
    return { files: [finalPath] }
}
