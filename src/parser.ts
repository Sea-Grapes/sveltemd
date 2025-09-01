import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { PluginConfig } from '.'
import { remarkSvelte } from './unified/remark'

export class SvmdParser {
  config: PluginConfig

  constructor(config?: PluginConfig) {
    // Todo: default config + merging
    this.config = config ?? {}
  }

  async parse(content: string, filename?: string) {
    const md_parser = unified()
      .use(remarkParse)
      .use(remarkSvelte)
      .use(remarkRehype, { allowDangerousHtml: true })
      // .use(rehypeStringify, { allowDangerousHtml: true })

      const mdast = await md_parser.parse(content)
      const hast = await md_parser.run(mdast)

      console.log(JSON.stringify(hast, null, 2))
    // const ast = await md_parser.process(content)
    // console.log(ast.value)

    // async function md_to_html_str(string: string) {
    //   let res = String(await md_parser.process(string))
    //   res = res.replaceAll('{', '&#123;')
    //   return res
    // }

    // let tmp = await md_to_html_str(content)

    return {
      code: '',
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
