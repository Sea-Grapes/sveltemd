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

const md_parser = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })

function md_to_html_str(string: string) {
  return md_parser.processSync(string).toString()
}

async function parse_svm(md_file: string, filename: string) {
  const { data, content } = matter(md_file)
  let has_data = Object.keys(data).length > 0
  // content = content.trim()
  const svast = parse(content, { modern: true })

  console.log(svast)
  console.log(svast.fragment.nodes)

  let res = ''

  const extract = (section: any): string => {
    if (!section || section.start == section.end) return ''
    return content.slice(section.start, section.end)
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

      // console.log(imports)

      instance = instance.replace(content, imports + content)
    }

    res += instance
  } else if (layouts.length) {
    let imports =
      '<script>\n' +
      layouts
        .map((path, i) => `  import SVELTEMD_LAYOUT_${i} from '${path}'`)
        .join('\n') +
      '\n</script>\n'
    res += imports
  }

  if (svast.fragment) {
    let html = svast.fragment.nodes
      .map((node) => {
        let text = content.slice(node.start, node.end)
        if (node.type === 'Text') text = md_to_html_str(text)
        return text
      })
      .join('')

    if (layouts.length) {
      html = layouts.reduceRight((content, layout, i) => {
        return `<SVELTEMD_LAYOUT_${i} ${
          has_data ? '{...metadata}' : ''
        }>\n${content}\n</SVELTEMD_LAYOUT_${i}>`
      }, html)
    }
    // console.log(html)

    res += '\n' + html + '\n'
  }

  // res = md_to_html_str(res)

  // console.log(res)
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
