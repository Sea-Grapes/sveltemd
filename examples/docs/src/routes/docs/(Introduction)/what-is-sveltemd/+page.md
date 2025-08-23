---
title: what is sveltemd?
index: 0
---

Sveltemd is primarily a Markdown Preprocessor for [Svelte](https://svelte.dev/) that allows you to seamlessly mix markdown and svelte content. However, it also aims to be a comprehensive solution for authoring content in your projects. This can include anything from blog posts to full-blown documentation sites, with limitless customization out of the box.

You can mix markdown and svelte very tightly. Here is an example:

```svelte
<script>
  import Comp from './Comp.svelte'
  let count = $state(0)
</script>

# Example page This is a test sveltemd page.

<button>**Clicked** {count} _times_</button>
<Comp />
```

> ```js
> console.log('test')
> ```
