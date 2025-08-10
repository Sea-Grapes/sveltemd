import matter from 'gray-matter'
import path from 'path'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import slash from 'slash'
import { parse } from 'svelte/compiler'
import { globSync } from 'tinyglobby'
import { unified } from 'unified'

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
  const layout_paths = globSync('./**/md.*')

  console.log(filename, layout_paths)

  console.log(slash(path.relative(process.cwd(), filename)))
  // console.log(layout_paths)
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
  let code = content
  const svast = parse(content)
  // console.log(svast)

  const extractSection = (section: any) => {
    if (!section) return
    if (section.start == section.end) return
    return content.slice(section.start, section.end)
  }

  let input = {
    html: extractSection(svast.html),
    module: extractSection(svast.module),
    module_inner: svast.module && extractSection(svast.module.content),
    instance: extractSection(svast.instance),
    instance_inner: svast.instance && extractSection(svast.instance.content),
  }

  if (input.html) {
    let output = await md_to_html_str(input.html)
    code = code.replace(input.html, output)
  }

  // if frontmatter, inject into module script
  if (data) {
    if (input.module) {
      let meta_inject =
        `\n  export const metadata = ${JSON.stringify(data)};\n` +
        input.module_inner

      let output = input.module.replace(input.module_inner, meta_inject)
      code = code.replace(input.module, output)
    } else {
      let meta_inject = `\n  export const metadata = ${JSON.stringify(data)};\n`
      code = `<script module>${meta_inject}</script>\n` + code
    }
  }

  let layouts = get_layout_paths(filename)
  if (layouts.length) {
    if (input.instance) {
    }
  }

  return {
    code,
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
