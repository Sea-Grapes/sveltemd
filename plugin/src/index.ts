import matter from 'gray-matter'
import path from 'path'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import slash from 'slash'
import { globSync } from 'tinyglobby'
import { unified } from 'unified'
import { parseEntities } from 'parse-entities'

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

/*
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

function splitSvelteBlocks() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === undefined) return

      // Check if paragraph has Svelte blocks
      const hasSvelteBlocks = node.children.some(
        (child) => child.type === 'text' && /\{[^}]+\}/.test(child.value)
      )

      if (!hasSvelteBlocks) return

      // For now, just convert the whole paragraph to HTML
      // (We can get fancier later if needed)
      parent.children[index] = {
        type: 'html',
        value: node.children.map((child) => child?.value || '').join(''),
      }
    })
  }
}*/

// function svelteLogic() {
//   return(tree: Root) => {
//     visit(tree, 'paragraph', (node, index, parent) => {
//       if(!parent || !index) return;

//     })
//   }
// }

// function rehypeSvelteLogic() {
//   return(tree: Root) => {

//   }
// }

const md_parser = unified()
  .use(remarkParse)
  .use(remarkRehype, {
    allowDangerousHtml: true,
  })
  .use(rehypeStringify, {
    allowDangerousHtml: true,
  })

function md_to_html_str(string: string) {
  return String(md_parser.processSync(string))
}

async function parse_svm(md_file: string, filename: string) {
  const { data, content } = matter(md_file)
  let has_data = Object.keys(data).length > 0

  console.log('Processing file:', filename)
  // content = content.trim()
  // const svast = parse(content, { modern: true })

  const extract = (section: any): string => {
    if (!section || section.start == section.end) return ''
    return content.slice(section.start, section.end)
  }

  let res = content

  let save: string[] = []

  console.log('starting file')
  console.log(content)

  // res = res.replace(/\{[#/:@][^}]*\}/g, (match) => {
  //   const id = `\n\n%%SVELTEMD_${save.length}%%\n\n`
  //   save.push(match)
  //   return id
  // })

  res = res.replace(/\{[#/:@][^}]*\}/g, (match) => {
    const id = `<div data-svelte-block="${save.length}"></div>`
    save.push(match)
    return id
  })

  res = parseEntities(md_to_html_str(res))

  save.forEach((text, i) => {
    res = res.replace(`<div data-svelte-block="${i}"></div>`, text)
  })

  // res = res.replace(/<p>\s*(%%SVELTEMD_\d+%%)\s*<\/p>/g, '$1')

  // save.forEach((text, i) => {
  //   res = res.replace(`%%SVELTEMD_${i}%%`, text)
  // })

  console.log('final output:')
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
