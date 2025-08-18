<script>
  import { page } from 'sveltemd/data'
  let { children } = $props()

  let data = page()

  $inspect(data.page)
</script>

<h1>{data.page.url}</h1>

{@render children?.()}

<a href="/blog">Back to all posts</a>
