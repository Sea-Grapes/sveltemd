---
title: Getting Started
---

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
