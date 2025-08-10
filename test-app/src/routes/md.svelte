<script>
  let { children } = $props()
</script>

<prose>
  {@render children?.()}
</prose>

<style>
  prose {
    @apply space-y-8;
  }
</style>
