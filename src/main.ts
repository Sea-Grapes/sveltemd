import matter from 'gray-matter'
import { Code, InlineCode, Root } from 'mdast'
import path from 'path'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { codeToHtml } from 'shiki'
import slash from 'slash'
import { parse } from 'svelte/compiler'
import { globSync } from 'tinyglobby'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
// import { walk } from 'zimmerframe'

type Extension = '.md' | '.svelte' | '.svx' | (string & {})

type ShikiOptions = Omit<Parameters<typeof codeToHtml>[1], 'lang'>

interface PluginConfig {
  extension?: Extension
  extensions?: Extension[]
  layout_file_name?: string
  internal?: {
    indent?: string
    preserve_user_entities?: boolean
  }
  code?: {
    shiki_options: ShikiOptions
  }
  frontmatter?: Function
}

let plugin: PluginConfig = {
  extensions: ['.md', '.svx'],
  layout_file_name: 'md.svelte',
  internal: {
    indent: ' ',
    preserve_user_entities: true,
  },
}

// this is "fine" to fetch every time a markdown page is loaded
// the alternative is file-watching, which may work poorly
function get_layout_paths(filename: string): string[] {
  const layout_paths = globSync('./src/routes/**/md.svelte')

  // console.log(layout_paths)

  const file_path = slash(path.relative(process.cwd(), filename))
    .split('/')
    .slice(0, -1)
    .join('/')

  return layout_paths
    .filter((layout_file) => {
      const layout_dir = path.dirname(layout_file)
      return file_path.startsWith(layout_dir)
    })
    .map((str) => '/' + str)
}

const svelte_err = Object.entries({
  '{': '&#123;',
  '<': '&lt;',
  // '}': '&#125;',
  // '>': '&gt;',
})

function escapeSvelte(string: string) {
  for (const [key, value] of svelte_err) {
    string = string.replaceAll(key, value)
  }
  return string
}

function remarkShiki() {
  async function process(node: Code | InlineCode) {
    if (node.type === 'code') {
      const lang = node.lang || 'text'
      node.value = await codeToHtml(node.value, {
        theme: 'dark-plus',
        ...(plugin.code?.shiki_options || {}),
        lang,
      })
      // @ts-ignore
      node.type = 'html'
      node.value = node.value.replaceAll('{', '&#123;')
    }
  }

  return async function (tree: Root) {
    let nodes: any[] = []

    visit(tree, 'code', (node) => nodes.push(node))
    visit(tree, 'inlineCode', (node) => nodes.push(node))

    // @ts-ignore
    await Promise.all(nodes.map((node) => process(node)))
  }
}

const md_parser = unified()
  .use(remarkParse)
  .use(remarkShiki)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })

async function md_to_html_str(string: string) {
  let res = String(await md_parser.process(string))
  res = res.replaceAll('{', '&#123;')
  return res
}


async function parse_svm(md_file: string, filename: string) {
  console.log('Processing file:', filename)

  let { data, content } = matter(md_file)
  let has_data = Object.keys(data).length > 0
  // content = content.trim()

  const svast = parse(content, { modern: true })

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
    code: content,
  }
}

export function markdown(config: PluginConfig): Function {
  plugin = {
    ...plugin,
    ...config,
  }

  return {
    name: 'markdown',
    // @ts-ignore
    markup({ content, filename }: { content: string; filename: string }) {
      if (filename.endsWith('.md')) {
        // @ts-ignore
        return parse_svm(content, filename)
      }
    },
  }
}
