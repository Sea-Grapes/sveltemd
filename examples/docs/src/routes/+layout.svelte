<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/favicon.svg'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<nav class="py-4 px-1-5 flex justify-between">
  <a href="/" class="font-medium">Sveltemd</a>
</nav>
{@render children?.()}
