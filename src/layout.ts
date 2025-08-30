import path from 'path'
import slash from 'slash'
import { globSync } from 'tinyglobby'

// Todo: add vite plugin watching
export function get_layout_paths(filename: string): string[] {
  const layout_paths = globSync('./src/routes/**/md.svelte')

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
