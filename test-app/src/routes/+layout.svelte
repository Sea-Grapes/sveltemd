<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/favicon.svg'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Test App</title>
</svelte:head>

<div>
  <nav>
    <a href="/">home</a>
    <a href="/blog">blog</a>
  </nav>
  <main>
    {@render children?.()}
  </main>
</div>

<style>
  div {
    display: block;
    min-height: 100vh;
  }

  nav {
    display: flex;
    gap: 2rem;
    max-width: var(--screen-xl);
    padding: 1.5rem;
    margin: 0 auto;
  }

  :global(main a) {
    text-decoration: var(--main) underline;
  }
</style>
