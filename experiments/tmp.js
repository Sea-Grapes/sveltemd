import { page } from '$app/state'

export const frontmatter = $state()

$effect(() => {
  let url = page.url
  // somehow get frontmatter from page
  // I can put frontmatter in the page's module script
  // but is this the best way to export frontmatter?

  // perhaps using import(url) to preprocess + get frontmatter!?
  // then set frontmatter = 
})


