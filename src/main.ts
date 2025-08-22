import { walk } from 'estree-walker'
import matter from 'gray-matter'
import { fromHtml } from 'hast-util-from-html'
import { encode } from 'html-entities'
import MagicString from 'magic-string'
import { Code, InlineCode, Node, Root } from 'mdast'
import { fromMarkdown } from 'mdast-util-from-markdown'
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

const md_parser = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })

function md_to_html_str(string: string) {
  let res = String(md_parser.processSync(string))
  res = res.replaceAll('{', '&#123;')
  return res
}

async function preprocess(string: string) {
  let s = new MagicString(string)
  let mdast = fromMarkdown(string)

  visit(mdast, 'inlineCode', (node) => {
    if (!node.position?.start.offset || !node.position?.end.offset) return

    let res = escapeSvelte(node.value)
    s.update(node.position.start.offset, node.position.end.offset, res)
  })

  let code: Code[] = []
  visit(mdast, 'code', (node) => code.push(node))

  async function processCode(node: Code) {
    if (!node.position?.start.offset || !node.position?.end.offset) return

    let res = await codeToHtml(node.value, {
      theme: 'dark-plus',
      ...(plugin.code?.shiki_options || {}),
      lang: node.lang || 'text',
    })

    res = escapeSvelte(res)

    s.update(node.position.start.offset, node.position.end.offset, res)
  }

  await Promise.all(code.map((c) => processCode(c)))

  string = s.toString()
  s = new MagicString(string)
  let hast = fromHtml(string, { fragment: true })

  visit(hast, 'text', (node) => {
    if (!node.position?.start.offset || !node.position?.end.offset) return

    // Todo: can original string be used here instead of magic?
    let res = string.slice(node.position.start.offset, node.position.end.offset)

    // res = escapeSvelte(res)
    res = res.replaceAll('<', '&lt;')
    res = res.replaceAll('\\{', '&#123;')

    s.update(node.position.start.offset, node.position.end.offset, res)
  })

  let res = s.toString()
  return res
}

async function parse_svm(md_file: string, filename: string) {
  console.log('Processing file:', filename)

  let { data, content } = matter(md_file)
  let has_data = Object.keys(data).length > 0
  // content = content.trim()

  content = await preprocess(content)

  let res = ''

  const svast = parse(content, { modern: true })

  const s = new MagicString(content)

  // @ts-ignore
  walk(svast, {
    enter(node, parent, key, index) {
      // @ts-ignore
      if (node.type === 'Text' && parent.type === 'Fragment') {
        // @ts-ignore
        let raw = node.data

        raw = raw.replaceAll('\r\n', '\n').replaceAll('\r', '\n')

        let inline = !raw.includes('\n\n')
        // let inline = false
        let res = ''
        if (inline) {
          let start_len = raw.length - raw.trimStart().length
          let end_len = raw.length - raw.trimEnd().length

          let start_ws = raw.slice(0, start_len)
          let middle = raw.slice(start_len, raw.length - end_len)
          let end_ws = raw.slice(raw.length - end_len)

          let tmp = md_to_html_str(middle)

          // if (tmp.startsWith('<p>')) tmp = tmp.slice(3)
          // if (tmp.endsWith('</p>')) tmp = tmp.slice(0, -4)
          if (tmp.startsWith('<p>') && tmp.endsWith('</p>')) {
            tmp = tmp.slice(3, -4)
          }

          res = start_ws + tmp + end_ws
        } else {
          res = md_to_html_str(raw)
        }
        // @ts-ignore
        s.update(node.start, node.end, res)
      }
    },
  })

  const extract = (section: any): string => {
    if (!section || section.start == section.end) return ''
    return s.slice(section.start, section.end)
  }

  if (svast.module) {
    let module = extract(svast.module)
    let content = extract(svast.module.content)

    let meta = data
      ? `\n  export const metadata = ${JSON.stringify(data)};\n`
      : ''
    let content_2 = meta + content

    res += module.replace(content, content_2)
  } else if (data) {
    let meta = `\n  export const metadata = ${JSON.stringify(data)};\n`
    res += `<script module>${meta}</script>\n`
  }

  let layouts = get_layout_paths(filename)

  if (svast.instance) {
    let instance = extract(svast.instance)
    let content = extract(svast.instance?.content)

    if (layouts.length) {
      let imports =
        '\n' +
        layouts
          .map((path, i) => `  import SVELTEMD_LAYOUT_${i} from '${path}'`)
          .join('\n') +
        '\n'

      instance = instance.replace(content, imports + content)
    }

    res += instance
  } else if (layouts.length) {
    let imports =
      '\n<script>\n' +
      layouts
        .map((path, i) => `  import SVELTEMD_LAYOUT_${i} from '${path}'`)
        .join('\n') +
      '\n</script>\n'
    res += imports
  }

  if (svast.fragment) {
    let save: string[] = []

    let html = svast.fragment.nodes
      .map((node) => {
        let text = s.slice(node.start, node.end)
        return text
      })
      .join('')

    if (layouts.length) {
      html = layouts.reduce((content, layout, i) => {
        return `<SVELTEMD_LAYOUT_${i} ${
          has_data ? '{...metadata}' : ''
        }>\n${content}\n</SVELTEMD_LAYOUT_${i}>`
      }, html)
    }

    res += '\n' + html + '\n'
  }

  if (svast.css) {
    res += extract(svast.css)
  }

  return {
    code: res,
  }
}

export function markdown(config: PluginConfig): Function {
  // Todo: fix resolution (this is only shallow)
  plugin = {
    ...plugin,
    ...config,
  }

  // console.log(plugin)

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
