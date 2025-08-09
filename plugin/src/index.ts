import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { parse } from 'svelte/compiler'
import { globSync } from 'tinyglobby'
import { unified } from 'unified'
import fs from 'fs'
import matter from 'gray-matter'

// this is "fine" to fetch every time a markdown page is loaded
// the alternative is file-watching, which may work poorly
function get_layout_paths(): string[] {
  // glob is relative to svelte.config.js, so /root dir
  const layout_paths = globSync('./**/md.*')
  console.log(layout_paths)
  return layout_paths
}

async function md_to_html_str(string: string) {
  let res = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(string)

  // toString is actually unnecessary (my guess
  // is replace calls toString), but it helps with clarity
  return res.toString()
}

async function parse_svm(md_file: string, filename: string) {
  const { data, content } = matter(md_file)

  const svast = parse(content)

  let code = content

  // if frontmatter, inject into module script
  if (data) {
    // console.log(svast.module.content)
    if (svast.module) {
      let module = content.slice(svast.module.start, svast.module.end)

      let innertext = content.slice(
        svast.module.content.start,
        svast.module.content.end
      )

      let meta_inject =
        `\n  export const metadata = ${JSON.stringify(data)};\n` + innertext

      let module_2 = module.replace(innertext, meta_inject)

    }
  }

  if (svast.html?.start) {
    let html = content.slice(svast.html.start, svast.html.end)
    let replace = await md_to_html_str(html)
    code = code.replace(html, replace)
  }

  return {
    code,
  }
}

export default function markdown() {
  console.log('plugin generates')
  get_layout_paths()

  return {
    name: 'markdown',
    markup({ content, filename }: { content: string; filename: string }) {
      if (filename.endsWith('.md')) {
        return parse_svm(content, filename)
      }
    },
  }
}
