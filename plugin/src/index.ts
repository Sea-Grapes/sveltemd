import matter from 'gray-matter'
import path from 'path'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import slash from 'slash'
import { parse } from 'svelte/compiler'
import { globSync } from 'tinyglobby'
import { unified } from 'unified'

import type { AST } from 'svelte/compiler'

type Extension = '.md' | '.svelte' | '.svx' | (string & {})

interface PluginConfig {
  extension?: Extension
  extensions?: Extension[]
  layout_file_name?: string
}

let plugin: PluginConfig = {
  extensions: ['.md', '.svx'],
  layout_file_name: 'md.svelte',
}

// this is "fine" to fetch every time a markdown page is loaded
// the alternative is file-watching, which may work poorly
function get_layout_paths(filename: string): string[] {
  // glob is relative to svelte.config.js, so /root dir
  const layout_paths = globSync('./**/md.*').map((str) =>
    str.split('/').slice(0, -1).join('/')
  )

  const file_path = slash(path.relative(process.cwd(), filename))
    .split('/')
    .slice(0, -1)
    .join('/')

  return layout_paths.filter((path) => file_path.startsWith(path))
}
const md_parser = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })

function md_to_html_str(string: string) {
  return md_parser.processSync(string).toString()
}

async function parse_svm(md_file: string, filename: string) {
  const { data, content } = matter(md_file)
  // content = content.trim()
  const svast = parse(content, { modern: true })

  console.log(svast)
  console.log(svast.fragment.nodes)

  let res = ''

  const extract = (section: any): string => {
    if (!section || section.start == section.end) return ''
    return content.slice(section.start, section.end)
  }

  // if frontmatter, inject into module script
  if (data) {
    if (svast.module) {
      let module = extract(svast.module)
      let content = extract(svast.module.content)

      let meta = data
        ? `\n  export const metadata = ${JSON.stringify(data)};\n`
        : ''
      let content_2 = meta + content
      res += module.replace(content, content_2)
    } else {
      let meta = `\n  export const metadata = ${JSON.stringify(data)};\n`
      res += `<script module>${meta}</script>\n`
    }
  }

  let layouts = get_layout_paths(filename)

  if (layouts.length) {
    if (svast.instance) {
    }
  }

  if (svast.fragment) {
    let html = svast.fragment.nodes
      .map((node) => {
        let text = content.slice(node.start, node.end)
        if (node.type === 'Text') text = md_to_html_str(text)
        return text
      })
      .join('')
    // console.log(html)

    res += html
  }

  // if (svast.fragment) {
  //   let html = svast.fragment.nodes.filter(node => )
  //   })
  // }

  // if (svast.html) {
  //   let html = svast.html.children.map((child: any) => child.raw).join('')

  //   let output = await md_to_html_str(html)
  //   res += output
  // }

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
