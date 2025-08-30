import matter from 'gray-matter'
import path from 'path'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import slash from 'slash'
import { parse } from 'svelte/compiler'
import { globSync } from 'tinyglobby'
import { unified } from 'unified'
// import { walk } from 'zimmerframe'

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
  .use(remarkShiki)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })

async function md_to_html_str(string: string) {
  let res = String(await md_parser.process(string))
  res = res.replaceAll('{', '&#123;')
  return res
}



export function markdown(config: Object) {
  return {
    name: 'markdown',
    // @ts-ignore
    markup({ content, filename }: { content: string; filename: string }) {
      if (filename.endsWith('.md')) {
        // @ts-ignore
        return compile(content, { filename, config })
      }
    },
  }
}
