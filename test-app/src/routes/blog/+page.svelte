<script>
  import { frontmatter } from "sveltemd/frontmatter"

  let posts = frontmatter()

  console.log(posts)
</script>

<h1>Blog Posts</h1>

<div>
  {#each posts as post}
    <a href={post.url}>
      <h1>{post.title || 'unknown post'}</h1>
    </a>
  {/each}
</div>

<style>
  .grid-auto {
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  }
</style>