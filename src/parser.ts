import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { PluginConfig } from '.'
import { remarkSvelte } from './remark'
import { micromarkSvelteExtension } from './micromark'

export class SvmdParser {
  config: PluginConfig

  constructor(config: PluginConfig) {
    this.config = config
  }

  async parse(content: string, filename: string) {
    const md_parser = unified()
      .use(remarkParse, { extensions: [micromarkSvelteExtension()] })
      // .use(remarkSvelte)
      // .use(remarkRehype, { allowDangerousHtml: true })
      // .use(rehypeStringify, { allowDangerousHtml: true })

    const ast = md_parser.parse(content)
    console.log(ast)

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
  { config, filename }: { config: PluginConfig; filename: string }
) {
  const parser = new SvmdParser(config)
  return parser.parse(content, filename)
}
