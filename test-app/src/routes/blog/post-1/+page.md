---
title: test post 1
---

<script module>
  export const test = {
    test: 'test'
  }
</script>

<script>
  let test = $state(true)
  console.log(test)
</script>

{#if test}

  <p>test is true {test}</p>
{/if}

# post

this is a test post example

<style>
  h1 {
    font-size: 2rem;
  }
</style>
