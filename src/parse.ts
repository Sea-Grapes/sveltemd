import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { PluginConfig } from '.'

interface CompileOptions {
  filename: string
  config: PluginConfig
}

export async function parse(
  content: string,
  { filename, config }: CompileOptions
) {
  console.log('Processing file:', filename)

  const md_parser = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })

  async function md_to_html_str(string: string) {
    let res = String(await md_parser.process(string))
    res = res.replaceAll('{', '&#123;')
    return res
  }

  // const svast = parse(content, { modern: true })

  // let res = ''

  // const extract = (section: any): string => {
  //   if (!section || section.start == section.end) return ''
  //   return content.slice(section.start, section.end)
  // }

  // if (data && plugin.frontmatter) data = plugin.frontmatter(data)

  // if (svast.module) {
  //   let module = extract(svast.module)
  //   let content = extract(svast.module.content)

  //   let meta = data
  //     ? `\n  export const metadata = ${JSON.stringify(data)};\n`
  //     : ''
  //   let content_2 = meta + content

  //   res += module.replace(content, content_2)
  // } else if (data) {
  //   let meta = `\n  export const metadata = ${JSON.stringify(data)};\n`
  //   res += `<script module>${meta}</script>\n`
  // }

  // let layouts = get_layout_paths(filename)

  // if (svast.instance) {
  //   let instance = extract(svast.instance)
  //   let content = extract(svast.instance?.content)

  //   if (layouts.length) {
  //     let imports =
  //       '\n' +
  //       layouts
  //         .map((path, i) => `  import SVELTEMD_LAYOUT_${i} from '${path}'`)
  //         .join('\n') +
  //       '\n'

  //     instance = instance.replace(content, imports + content)
  //   }

  //   res += instance
  // } else if (layouts.length) {
  //   let imports =
  //     '\n<script>\n' +
  //     layouts
  //       .map((path, i) => `  import SVELTEMD_LAYOUT_${i} from '${path}'`)
  //       .join('\n') +
  //     '\n</script>\n'
  //   res += imports
  // }

  // if (svast.fragment) {
  //   let save: string[] = []

  //   let html = svast.fragment.nodes
  //     .map((node) => {
  //       let text = content.slice(node.start, node.end)
  //       return text
  //     })
  //     .join('')

  //   if (layouts.length) {
  //     html = layouts.reduce((content, layout, i) => {
  //       return `<SVELTEMD_LAYOUT_${i} ${
  //         has_data ? '{...metadata}' : ''
  //       }>\n${content}\n</SVELTEMD_LAYOUT_${i}>`
  //     }, html)
  //   }

  //   res += '\n' + html + '\n'
  // }

  // if (svast.css) {
  //   res += extract(svast.css)
  // }

  return {
    code: '',
  }
}
