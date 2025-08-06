import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { parse } from 'svelte/compiler'
import { globSync } from 'tinyglobby'
import { unified } from 'unified'

async function parse_md(string: string) {
  let res = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(string)

  // toString is actually unnecessary (my guess
  // is replace calls toString), but it helps with clarity
  return res.toString()
}

async function parse_svm(content: string) {
  const svast = parse(content)
  const { start, end } = svast.html
  const string = content.slice(start, end)
  const html = await parse_md(string)

  return {
    // @ts-ignore
    code: content.replace(string, html),
  }
  return content
}

function markdown() {
  const layout_data = {}
  const layout_paths = globSync('./**/layout.md.svelte')
  console.log(layout_paths)

  // const watcher = chokidar.watch('.', {
  //   ignored: (path: string, stats?: Stats) =>
  //     (stats?.isFile() && !path.endsWith('.svelte')) || false,
  //   persistent: true,
  // })

  // watcher.on('change', (path: string) => {})

  return {
    name: 'markdown',
    markup({ content, filename }: { content: string; filename: string }) {
      // console.log(filename)

      if (filename.endsWith('.md')) {
        return parse_svm(content)
      }
    },
  }
}

export default markdown
