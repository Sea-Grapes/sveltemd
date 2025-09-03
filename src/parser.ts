import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { PluginConfig } from '.'
import { remarkSvelte } from './unified/remark'
import type { Handler } from 'mdast-util-to-hast'

export class SvmdParser {
  config: PluginConfig

  constructor(config?: PluginConfig) {
    // Todo: default config + merging
    this.config = config ?? {}
  }

  async parse(content: string, filename?: string) {
    const svelteBlock: Handler = (h, node) => {
      // console.log('HANDLING SVELTE BLOCK')
      return { type: 'raw', value: node.value }
    }

    const parser = unified()
      .use(remarkParse)
      .use(remarkSvelte)
      // @ts-ignore
      .use(remarkRehype, {
        allowDangerousHtml: true,
        // passThrough: ['svelteBlock'],
        // handlers: {
        //   svelteBlock,
        // },
      })
      // .use(rehypeStringify, { allowDangerousHtml: true })

    const mdast = await parser.parse(content)
    const hast = await parser.run(mdast)
    console.log(JSON.stringify(mdast, null, 2))
    let res = ''

    // let vfile = await parser.process(content)
    // let res = String(vfile)

    return {
      code: res,
    }
  }
}

export function parse(
  content: string,
  { config, filename }: { config?: PluginConfig; filename?: string } = {}
) {
  const parser = new SvmdParser(config)
  return parser.parse(content, filename)
}
