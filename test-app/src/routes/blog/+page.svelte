<script>
  import { frontmatter } from "sveltemd/frontmatter"

  let posts = frontmatter()

  console.log(posts)
</script>

<h1 class="text-3xl font-bold">Blog Posts</h1>

<div class="grid grid-auto gap-8">
  {#each posts as post}
    <a href={post.url} class='p-4 bg-slate-100 block'>
      <h1>{post.title || 'unknown post'}</h1>
    </a>
  {/each}
</div>

<style>
  .grid-auto {
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  }
</style>