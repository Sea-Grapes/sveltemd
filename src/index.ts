import { PluggableList } from 'unified'
import { SvmdParser } from './parser'

export interface PluginConfig {
  remarkPlugins?: PluggableList
  rehypePlugins?: PluggableList

  extensions?: string[]
  frontmatter?: Function
}

export function markdown(config: PluginConfig) {
  let parser = new SvmdParser(config)

  return {
    name: 'markdown',
    markup({ content, filename }: { content: string; filename: string }) {
      if (filename.endsWith('.md')) {
        return parser.parse(content, filename)
      }
    },
  }
}
