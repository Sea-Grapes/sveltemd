---
title: test post 1
---

<script>
  let count = $state(0)
</script>

Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eveniet voluptatibus hic fugiat, consequatur minus quod consequuntur accusantium id delectus corporis ab autem similique natus. Unde harum expedita et tempore, saepe quidem praesentium qui nihil laborum dicta totam corrupti sint illo sapiente delectus enim provident ratione? Ipsa neque distinctio autem excepturi!

<button onclick={() => count++}>Clicked {count} {count === 1 ? 'time' : 'times'}</button>

# Heading 1

<style>
  @reference 'tailwindcss';


  button {
    @apply bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-md text-white font-medium shadow-md shadow-blue-500/20 cursor-pointer outline-none;
  }
</style>
