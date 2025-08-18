<script>
  import { page } from 'sveltemd/data'
  let { children } = $props()

  let data = page()

  $inspect(data)

  // $inspect(data)
</script>

<h1>{data.title}</h1>

{@render children?.()}

<a href="/blog">Back to all posts</a>
