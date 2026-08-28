export function scrollToId(id) {
  return (e) => {
    if (e) e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    let c = el.parentElement
    while (c) {
      const s = getComputedStyle(c).overflowY
      if ((s === 'auto' || s === 'scroll' || s === 'overlay') && c.scrollHeight > c.clientHeight + 4) break
      c = c.parentElement
    }
    if (c) {
      const top = c.scrollTop + (el.getBoundingClientRect().top - c.getBoundingClientRect().top) - 84
      c.scrollTo({ top, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84, behavior: 'smooth' })
    }
  }
}
