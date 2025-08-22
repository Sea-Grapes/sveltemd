import matter from 'gray-matter'
import { fromHtml } from 'hast-util-from-html'
import { toHtml } from 'hast-util-to-html'
import { Code, InlineCode, Node, Root } from 'mdast'
import path from 'path'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { codeToHtml } from 'shiki'
import slash from 'slash'
import { parse } from 'svelte/compiler'
import { globSync } from 'tinyglobby'
import { Processor, unified } from 'unified'
import { visit } from 'unist-util-visit'
import { stringifyEntities } from 'stringify-entities'
import { walk } from 'estree-walker'
import rehypeStringify from 'rehype-stringify'
import MagicString from 'magic-string'
import { encode } from 'html-entities'
import { fromMarkdown } from 'mdast-util-from-markdown'

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
  '{': '&lbrace;',
  '}': '&rbrace;',
  // '<': '&lt;',
  // '>': '&gt;',
})

function escape_code(string: string) {
  for (const [key, value] of svelte_err) {
    string = string.replaceAll(key, value)
  }
  return string
}

function remark_code() {
  async function escape(node: Code | InlineCode) {
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
    node.value = escape_code(node.value)
  }

  return async function (tree: Root) {
    let nodes: Node[] = []

    visit(tree, 'code', (node) => nodes.push(node))
    visit(tree, 'inlineCode', (node) => nodes.push(node))

    // @ts-ignore
    await Promise.all(nodes.map((node) => escape(node)))
  }
}

function remark_escape_code() {
  function escape(node: Code | InlineCode) {
    node.value = encode(node.value)
  }

  return function (tree: Root) {
    let nodes: Node[] = []

    visit(tree, 'code', (node) => nodes.push(node))
    visit(tree, 'inlineCode', (node) => nodes.push(node))

    //@ts-ignore
    nodes.forEach((node) => escape(node))
  }
}

// // allowDangerousHtml = allow script tag
const md_parser = unified()
  .use(remarkParse)
  // .use(remark_code)
  .use(remark_escape_code)
  .use(remarkRehype)
  .use(rehypeStringify, {
    characterReferences: {
      useNamedReferences: true,
    },
  })

function md_to_html_str(string: string) {
  let res = md_parser.processSync(string)
  return String(res)
}

// escapes raw svelte + markdown input.
// only escapes characters that will break svelte parse.
async function escape_svm(string: string) {
  let s = new MagicString(string)
  let mdast = fromMarkdown(string)

  // escape svelte breakers in code

  // visit(mdast, 'inlineCode', (node) => {
  //   if (!node.position?.start.offset || !node.position?.end.offset) return

  //   node.value = node.value.replaceAll('<', '+SVMD_0+')
  //   node.value = node.value.replaceAll('{', '+SVMD_1+')
  // })

  let code: Code[] = []
  visit(mdast, 'code', (node) => code.push(node))

  async function processCode(node: Code) {
    if (!node.position?.start.offset || !node.position?.end.offset) return

    node.value = await codeToHtml(node.value, {
      theme: 'dark-plus',
      ...(plugin.code?.shiki_options || {}),
      lang: node.lang || 'text',
    })

    // console.log('Val before')
    // console.log(node.value)
    node.value = escape_code(node.value)

    console.log('Val after')
    console.log(node.value)

    s.update(node.position.start.offset, node.position.end.offset, node.value)
  }

  await Promise.all(code.map((c) => processCode(c)))

  string = s.toString()
  s = new MagicString(string)
  let hast = fromHtml(string, { fragment: true })

  // escape any < not in html
  visit(hast, 'text', (node) => {
    if (!node.position?.start.offset || !node.position?.end.offset) return

    node.value = node.value.replaceAll('<', '+SVMD_0+')
    // don't replace { because svelte uses it
    // if we wanted to allow the user an easy way to type { perhaps we could escape \{

    s.update(node.position.start.offset, node.position.end.offset, node.value)
  })

  return s.toString()
}

async function parse_svm(md_file: string, filename: string) {
  console.log('Processing file:', filename)
  let { data, content } = matter(md_file)
  let has_data = Object.keys(data).length > 0
  // content = content.trim()

  content = await escape_svm(content)
  // console.log(content)

  let res = ''

  const svast = parse(content, { modern: true })
  // console.log('Whole ast')
  // console.log(JSON.stringify(svast.fragment, null, 2))

  // perhaps this should be extracted to a js file
  // since estree-walker types are all wrong
  console.log
  console.log('Walk')

  const s = new MagicString(content)

  // @ts-ignore
  walk(svast, {
    enter(node, parent, key, index) {
      // @ts-ignore
      if (node.type === 'Text' && parent.type === 'Fragment') {
        // console.log('node')
        // console.log(parent)

        // @ts-ignore
        let raw = node.raw
        console.log('node raw:')
        console.log(`"${raw}"`)

        raw = raw.replaceAll('+SVMD_0+', '<')
        raw = raw.replaceAll('+SVMD_1+', '{')

        let inline = !raw.includes('\n\n')
        // @ts-ignore
        // let res = md_to_html_str(raw)
        let res = ''
        if (inline) {
          let start_len = raw.length - raw.trimStart().length
          let end_len = raw.length - raw.trimEnd().length

          let start_ws = raw.slice(0, start_len)
          let middle = raw.slice(start_len, raw.length - end_len)
          let end_ws = raw.slice(raw.length - end_len)

          let tmp = md_to_html_str(middle)

          if (tmp.startsWith('<p>')) tmp = tmp.slice(3)
          if (tmp.endsWith('</p>')) tmp = tmp.slice(0, -4)

          res = start_ws + tmp + end_ws

          console.log('inline res:')
          console.log(`"${res}"`)
        } else {
          res = md_to_html_str(raw)
        }
        // @ts-ignore
        s.update(node.start, node.end, res)
        // console.log('s tostring')
        // console.log(s.toString())
      }
      // if(node.type === '')
    },
  })

  // content = s.toString()

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
