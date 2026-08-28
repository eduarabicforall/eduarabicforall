import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ── useScrollReveal: fade + slide up on scroll ── */
export function useScrollReveal(opts = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const { y = 40, opacity = 0, duration = 0.8, ease = 'power3.out', delay = 0 } = opts
    gsap.set(el, { y, opacity })
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration, ease, delay }),
    })
    return () => st.kill()
  }, [])
  return ref
}

/* ── useStaggerReveal: children animate one by one ── */
export function useStaggerReveal(opts = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const children = el.children
    if (!children.length) return
    const { y = 50, opacity = 0, duration = 0.7, stagger = 0.12, ease = 'power3.out' } = opts
    gsap.set(children, { y, opacity })
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(children, { y: 0, opacity: 1, duration, stagger, ease }),
    })
    return () => st.kill()
  }, [])
  return ref
}

/* ── useTextReveal: split text chars/words and animate ── */
export function useTextReveal(opts = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const { y = 30, opacity = 0, duration = 0.6, ease = 'power3.out', delay = 0 } = opts
    gsap.set(el, { y, opacity })
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration, ease, delay }),
    })
    return () => st.kill()
  }, [])
  return ref
}

/* ── useCountUp: animated number counter ── */
export function useCountUp(target, opts = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const { duration = 2, prefix = '', suffix = '' } = opts
    const obj = { val: 0 }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`
          },
        })
      },
    })
    return () => st.kill()
  }, [target])
  return ref
}

export { gsap, ScrollTrigger }
