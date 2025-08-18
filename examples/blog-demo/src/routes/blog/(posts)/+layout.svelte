<script>
  import { meta } from 'sveltemd/data'
  import { page } from '$app/state'
  let { children } = $props()

  let data = meta()

  $inspect(data)

  $inspect(page.route.id)
  // $inspect(data)
</script>

<h1>{data.title}</h1>

{@render children?.()}

<a href="/blog">Back to all posts</a>
