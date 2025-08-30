import { PluggableList } from 'unified'
import { parse } from './parse'

export interface PluginConfig {
  remarkPlugins?: PluggableList
  rehypePlugins?: PluggableList

  extensions?: string[]
  frontmatter?: Function
}

export function markdown(config: PluginConfig) {
  return {
    name: 'markdown',
    markup({ content, filename }: { content: string; filename: string }) {
      if (filename.endsWith('.md')) {
        return parse(content, { filename, config })
      }
    },
  }
}
