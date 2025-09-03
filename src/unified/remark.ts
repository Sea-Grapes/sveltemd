import { Code, InlineCode, Root } from 'mdast'
import { codeToHtml, type CodeToHastOptions } from 'shiki'
import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { svmdExtension, svmdFromMarkdown } from './micromark.js'

// https://github.com/mdx-js/mdx/blob/main/packages/remark-mdx/lib/index.js

export const remarkSvelte: Plugin = function () {
  const data = this.data()

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = [])

  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = [])

  micromarkExtensions.push(svmdExtension())
  fromMarkdownExtensions.push(svmdFromMarkdown)
}

// Since svelte logic can be parsed anywhere (in svelte's parser), they are "inline" for micromark
// However this will make it be wrapped in paragraph which we don't want.
// We can either unwrap it here or in micromark, testing
export const remarkUnwrapSvelte: Plugin = function() {
  
}


export function remarkShiki(shikiOptions: Omit<CodeToHastOptions, 'lang'>) {
  async function process(node: Code | InlineCode) {
    if (node.type === 'code') {
      const lang = node.lang || 'text'
      const options: CodeToHastOptions = {
        theme: 'dark-plus',
        ...(shikiOptions || {}),
        lang,
      }

      node.value = await codeToHtml(node.value, {
        theme: 'dark-plus',
        ...(shikiOptions || {}),
        lang,
      })
      // @ts-ignore
      node.type = 'html'
      node.value = node.value.replaceAll('{', '&#123;')
    }
  }

  return async function (tree: Root) {
    let nodes: any[] = []

    visit(tree, 'code', (node) => nodes.push(node))
    visit(tree, 'inlineCode', (node) => nodes.push(node))

    await Promise.all(nodes.map((node) => process(node)))
  }
}
