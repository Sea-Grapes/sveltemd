# Sveltemd

A modern markdown preprocessor for Svelte (WIP). Focused on providing extremely easy markdown usage with minimal config needed.

## Installing

_Note: package not published yet._

```bash
pnpm i -D sveltemd
```

Add it to your `svelte.config.js`:

```js
import { markdown } from 'sveltemd'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [vitePreprocess(), markdown()],
}
```

## Planned Features

General

- [x] preprocess markdown files as svelte + markdown
- [x] flexible layout system (Complete!)
- [x] get frontmatter from children files
- [ ] easy content processing (image, video, audio, etc)
  - Ex. support for enhanced-img or other processors
  - relative content urls?

Code blocks

- [ ] custom syntax highlighter
