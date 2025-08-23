import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { markdown } from 'sveltemd'
import { titleCase } from 'title-case'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  extensions: ['.svelte', '.md'],
  preprocess: [
    vitePreprocess(),
    markdown({
      code: {
        shiki_options: {
          theme: 'vitesse-light'
        }
      },
      frontmatter: (data) => {
        console.log('PROCESS')
        console.log(data)
        if (data.title) data.title = titleCase(data.title)
        return data
      }
    })
  ],

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter()
  }
}

export default config
