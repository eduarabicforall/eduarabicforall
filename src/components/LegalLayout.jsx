import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function LegalLayout({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-light-bg text-light-ink">
      <Navbar />
      <main className="mx-auto max-w-[760px] px-[6vw] py-16">
        <h1 className="mb-2 font-sora text-[32px] font-extrabold">{title}</h1>
        <p className="mb-10 text-[13px] text-light-inkFaint">Last updated: {updated}</p>
        <div className="flex flex-col gap-7 text-[14.5px] leading-relaxed text-light-inkSoft">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

export function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-2.5 font-sora text-lg font-bold text-light-ink">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}
