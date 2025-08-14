import matter from 'gray-matter'
import path from 'path'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import slash from 'slash'
import { globSync } from 'tinyglobby'
import { unified } from 'unified'
import { parseEntities } from 'parse-entities'

import { Root } from 'mdast'
import { visit } from 'unist-util-visit'

type Extension = '.md' | '.svelte' | '.svx' | (string & {})

interface PluginConfig {
  extension?: Extension
  extensions?: Extension[]
  layout_file_name?: string
  internal?: {
    indent: string
  }
}

let plugin: PluginConfig = {
  extensions: ['.md', '.svx'],
  layout_file_name: 'md.svelte',
  internal: {
    indent: ' ',
  },
}

// this is "fine" to fetch every time a markdown page is loaded
// the alternative is file-watching, which may work poorly
function get_layout_paths(filename: string): string[] {
  const layout_paths = globSync('./**/md.svelte')

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

function remarkPreserveSvelte() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      console.log(node)

      // If there's no parent or index, bail (root node, etc.)
      if (!parent || index === undefined) return

      // Don't touch fenced or inline code blocks
      if (node.type === 'code' || node.type === 'inlineCode') {
        return
      }

      // Only process text nodes that contain curly braces
      if (node.type === 'text' && /\{[^}]+\}/.test(node.value)) {
        // Replace the text node with an HTML node so Svelte sees it as raw
        parent.children[index] = {
          type: 'html',
          value: node.value,
        }
      }
    })
  }
}

function rawHtml() {
  return (tree: Root) => {
    visit(tree, 'html', (node) => {
      console.log(node.type)
      // Turn the HTML into a "raw" HTML node so it's passed through
      // @ts-ignore
      node.type = 'raw'
    })
  }
}

function test() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      // Check if paragraph starts with {
      const firstChild = node.children[0]
      if (
        parent &&
        index &&
        firstChild?.type === 'text' &&
        firstChild.value.trim().startsWith('{')
      ) {
        // Convert to raw HTML - this preserves any markdown inside
        const content = node.children
          .map((child) => (child.type === 'text' ? child.value : ''))
          .join('')

        parent.children[index] = {
          type: 'html',
          value: content,
        }
      }
    })
  }
}

const md_parser = unified()
  .use(remarkParse)
  .use(test)
  // .use(rawHtml)
  // .use(remarkHtml, { sanitize: false })
  .use(remarkRehype, {
    allowDangerousHtml: true,
  })
  // .use(rehypeRaw)
  .use(rehypeStringify, {
    allowDangerousHtml: true,
  })

function md_to_html_str(string: string) {
  return String(md_parser.processSync(string))
}

async function parse_svm(md_file: string, filename: string) {
  const { data, content } = matter(md_file)
  let has_data = Object.keys(data).length > 0
  // content = content.trim()
  // const svast = parse(content, { modern: true })

  const extract = (section: any): string => {
    if (!section || section.start == section.end) return ''
    return content.slice(section.start, section.end)
  }

  let res = content

  let save: string[] = []

  // console.log('starting file')
  // console.log(content)

  // console.log('Matches:')
  // console.log(res.match(/\{[#/:@][^}]*\}/g))

  // res = res.replace(/\{[#/:@][^}]*\}/g, (match) => {
  //   const id = `%%SVELTEMD_${save.length}%%`
  //   save.push(match)
  //   return id
  // })

  res = parseEntities(md_to_html_str(res))

  // res = res.replace(/<p>\s*(%%SVELTEMD_\d+%%)\s*<\/p>/g, '$1')

  // save.forEach((text, i) => {
  //   res = res.replace(`%%SVELTEMD_${i}%%`, text)
  // })

  console.log(res)

  return {
    code: res,
  }
}

export default function markdown(config: PluginConfig) {
  console.log('plugin generated')

  plugin = {
    ...plugin,
    ...config,
  }

  return {
    name: 'markdown',
    markup({ content, filename }: { content: string; filename: string }) {
      if (filename.endsWith('.md')) {
        return parse_svm(content, filename)
      }
    },
  }
}
