# Mixing svelte & markdown

current issue: markdown may wrap svelte logic blocks in paragraph, depending on how the text is broken up. Either:
- change stringify to only wrap specific body content in p
- search logic blocks after stringify and remove broken html structure