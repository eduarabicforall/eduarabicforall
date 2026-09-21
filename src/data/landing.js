// Innovation competition results — update `status` as results come in
// ('gold' | 'silver' | 'bronze' | 'judging').
export const AWARDS = [
  { img: '/awards/sused2026.png', name: 'SUSED 2026', status: 'gold' },
  { img: '/awards/itelic2026.png', name: 'ITelic 2026', status: 'silver' },
  { img: '/awards/unicel2026.png', name: 'UNICEL 2026', status: 'gold' },
  { img: '/awards/iicfe2026.png', name: 'IICFE 2026', status: 'judging' },
]

export const NAV_LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#modules', label: 'Modules' },
  { href: '#ai', label: 'AI Ustaz' },
  { href: '#reviews', label: 'Reviews' },
]

export const HOW_IT_WORKS = [
  {
    icon: 'shopping-cart-01',
    title: '1. Get a module',
    body: 'Buy in-app or from any reseller/bookstore.',
  },
  {
    icon: 'qr-code',
    title: '2. Scan the QR',
    body: 'Printed inside every module — opens the app.',
  },
  {
    icon: 'key-01',
    title: '3. Enter your code',
    body: 'A unique activation code unlocks the module.',
  },
  {
    icon: 'graduation-scroll',
    title: '4. Learn',
    body: 'Audio lessons + a dedicated AI Ustaz, ready.',
  },
]

export const REVIEWS = [
  {
    quote:
      'Scanning the QR straight into my activated module felt instant. The AI Ustaz answers grammar questions my tutor doesn’t have time for.',
    author: '— Nur Aisyah, Al Quran module',
  },
  {
    quote:
      'I bought the card set from a reseller and just typed the code in. No waiting for anything digital to unlock.',
    author: '— Danial, Bahasa Arab Pemula',
  },
  {
    quote: 'Started with the free Grammar module before committing to a physical set. Exactly the trial I needed.',
    author: '— Farah, Grammar module',
  },
]

export const FAQS = [
  {
    q: 'How does module activation work?',
    a: 'Every physical module has a unique code inside it. Scan the QR code or type the code into the app to instantly unlock its Audio Library and AI Ustaz.',
  },
  {
    q: 'Can I buy modules outside the app?',
    a: 'Yes — modules are sold in-app or through resellers and bookstores. Either way, you activate the same way once you have the code.',
  },
  {
    q: 'Is the Grammar module really free?',
    a: 'Yes, permanently free for every registered account. No activation code is needed.',
  },
  {
    q: 'What is AI Ustaz and how is it different per module?',
    a: 'AI Ustaz is a chat assistant trained on the content of the module you activated, with its own persona and knowledge — so answers stay relevant to what you’re studying.',
  },
  {
    q: 'Can I use one code on multiple devices?',
    a: 'Yes, an activation code can be used on more than one account or device.',
  },
  {
    q: 'Do I need internet access to listen to audio lessons?',
    a: 'Yes, audio streams from the Audio Library, so an internet connection is required to play lessons.',
  },
  {
    q: 'What happens if my activation code doesn’t work?',
    a: 'Double-check for typos first. If it still fails, contact support with your module and code so we can help.',
  },
]

export const FOOTER_MENU = [
  { href: '#how', label: 'How it Works' },
  { href: '#modules', label: 'Modules' },
  { href: '#ai', label: 'AI Ustaz' },
  { href: '#faq', label: 'FAQ' },
  { href: '#reviews', label: 'Feedbacks' },
]

export const FOOTER_COMPANY = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
]

export const FOOTER_LEGAL = [
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/refund', label: 'Refund Policy' },
]
