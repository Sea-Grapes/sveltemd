<script>
  let { children, title } = $props()
</script>

<header>
  <h1>{title || 'Unknown'}</h1>
</header>

{@render children?.()}
