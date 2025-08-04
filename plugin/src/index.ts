import { parse, type PreprocessorGroup } from 'svelte/compiler'
import { unified } from 'unified'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

async function parse_md(string: string) {
  let res = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(string)

  return res


}

async function html(content: string) {
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
  return {
    name: 'markdown',
    markup({ content, filename }: { content: string, filename: string }) {
      if (filename && filename.endsWith('.md')) {
        return html(content)
      }
    },
  }
}

export default markdown
