<script>
  let { children } = $props()
</script>

<prose>
  {@render children?.()}
</prose>

<style>
  @reference 'tailwindcss';

  prose {
    @apply space-y-8;
  }
</style>
