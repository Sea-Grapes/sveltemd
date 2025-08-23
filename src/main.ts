import { asyncWalk, walk } from 'estree-walker'
import matter from 'gray-matter'
import { fromHtml } from 'hast-util-from-html'
import MagicString from 'magic-string'
import { Code, InlineCode, Root } from 'mdast'
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
    }
    node.value = node.value.replaceAll('{', '&#123;')
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

function preprocess(string: string) {
  let result = ''
  let placeholders: string[] = []

  let mdast = fromMarkdown(string)
  let mdast_str = new MagicString(string)

  visit(mdast, ['code', 'inlineCode'], (node) => {
    if (!node.position?.start.offset || !node.position?.end.offset) return
    let code = string.slice(
      node.position.start.offset,
      node.position.end.offset
    )
    let id = `+#SVMD${placeholders.length};`
    placeholders.push(code)
    mdast_str.update(node.position.start.offset, node.position.end.offset, id)
  })

  string = mdast_str.toString()

  let hast = fromHtml(string, { fragment: true })
  let hast_str = new MagicString(string)
  let skip_nodes = ['script', 'style']

  visit(hast, 'text', (node, index, parent) => {
    if (
      parent &&
      parent.type === 'element' &&
      skip_nodes.includes(parent.tagName)
    )
      return
    if (!node.position?.start.offset || !node.position?.end.offset) return
    if (node.value.length <= 2) return

    let value = node.value
    value = value.replaceAll('<', '&lt;')
    value = value.replaceAll('\\{', '&#123;')

    // let mdast = fromMarkdown(value)
    // let mdast_str = new MagicString(value)

    // visit(mdast, ['code', 'inlineCode'], (node) => {
    //   if (!node.position?.start.offset || !node.position?.end.offset) return
    //   let code = value.slice(
    //     node.position.start.offset,
    //     node.position.end.offset
    //   )
    //   let id = `+#SVMD${placeholders.length};`
    //   placeholders.push(code)
    //   mdast_str.update(node.position.start.offset, node.position.end.offset, id)
    // })

    // hast_str.update(
    //   node.position.start.offset,
    //   node.position.end.offset,
    //   mdast_str.toString()
    // )
  })

  result = hast_str.toString()

  return { result, placeholders }
}

async function parse_svm(md_file: string, filename: string) {
  console.log('Processing file:', filename)

  let { data, content } = matter(md_file)
  let has_data = Object.keys(data).length > 0
  // content = content.trim()

  let { result, placeholders } = preprocess(content)
  content = result

  let res = ''

  const svast = parse(content, { modern: true })

  let s = new MagicString(content)

  // @ts-ignore
  await asyncWalk(svast, {
    async enter(node, parent, key, index) {
      // @ts-ignore
      if (node.type === 'Text' && parent.type === 'Fragment') {
        // @ts-ignore
        let raw = node.data

        // todo create regex from string to allow custom entity
        raw = raw.replaceAll(/\+#SVMD(\d+);/g, (_: string, id: string) => {
          return placeholders[Number(id)] ?? ''
        })

        let inline_test = raw.replaceAll('\r\n', '\n').replaceAll('\r', '\n')
        let inline = !inline_test.includes('\n\n')

        let res = ''
        if (inline) {
          let start_len = raw.length - raw.trimStart().length
          let end_len = raw.length - raw.trimEnd().length

          let start_ws = raw.slice(0, start_len)
          let middle = raw.slice(start_len, raw.length - end_len)
          let end_ws = raw.slice(raw.length - end_len)

          let tmp = await md_to_html_str(middle)

          // if (tmp.startsWith('<p>')) tmp = tmp.slice(3)
          // if (tmp.endsWith('</p>')) tmp = tmp.slice(0, -4)
          if (tmp.startsWith('<p>') && tmp.endsWith('</p>')) {
            tmp = tmp.slice(3, -4)
          }

          res = start_ws + tmp + end_ws
        } else {
          res = await md_to_html_str(raw)
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

  if (data && plugin.frontmatter) data = plugin.frontmatter(data)

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
