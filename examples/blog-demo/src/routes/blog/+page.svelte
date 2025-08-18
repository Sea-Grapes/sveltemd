<script>
  import { metadata } from 'sveltemd/data'

  let posts = metadata()
</script>

<h1 class="text-3xl font-bold tracking-tight">Blog Posts</h1>

{#each posts as post}
  <a href={post.url}>
    <h1>{post.title || 'Unknown post'}</h1>
  </a>
{/each}
