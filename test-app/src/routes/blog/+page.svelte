<script>
  import { frontmatter } from "sveltemd/frontmatter"

  let posts = frontmatter()

  console.log(posts)
</script>

{#each posts as post}
  <a href={post.url}>
    <h1>{post.title || 'unknown post'}</h1>
  </a>
{/each}