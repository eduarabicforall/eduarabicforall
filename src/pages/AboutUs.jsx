import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import Icon from '../components/Icon.jsx'
import { AWARDS } from '../data/landing.js'

const AWARD_LABEL = { gold: 'Gold Medal', silver: 'Silver Medal', bronze: 'Bronze Medal', judging: 'Under Judging' }

const VALUES = [
  {
    icon: 'book-02',
    title: 'Physical first, digital always',
    body: 'Every module starts as a real, printed book — the app is what makes it come alive with audio and an AI Ustaz, not a replacement for it.',
  },
  {
    icon: 'graduation-scroll',
    title: 'Built with Arabic specialists',
    body: 'Content is developed with input from Arabic language educators, not generated blind — grounded in how the language is actually taught.',
  },
  {
    icon: 'sparkles',
    title: 'AI that stays on-topic',
    body: 'AI Ustaz is scoped to the module a student activated, so answers stay relevant to what they are actually studying.',
  },
]

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-light-bg text-light-ink">
      <Navbar />
      <main className="mx-auto max-w-[900px] px-[6vw] py-16">
        <h1 className="mb-3 font-poppins text-[32px] font-extrabold">About EduArabic for All</h1>
        <p className="mb-10 max-w-[600px] text-[14.5px] leading-relaxed text-light-inkSoft">
          EduArabic for All pairs a physical Arabic-learning module with a companion app — audio lessons, a free
          Grammar module, and a dedicated AI Ustaz for every module you activate. Developed with the Faculty of
          Languages and Communication, Universiti Sultan Zainal Abidin (UniSZA).
        </p>

        <div className="mb-14 grid gap-4 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-light-ink/[.08] bg-light-ink/[.03] p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[.15]">
                <Icon name={v.icon} size={20} className="text-primary" />
              </div>
              <div className="mb-1.5 text-[14.5px] font-bold">{v.title}</div>
              <p className="text-[13px] leading-relaxed text-light-inkSoft">{v.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-2 font-poppins text-xl font-extrabold">Recognised at international innovation competitions</h2>
        <p className="mb-6 max-w-[560px] text-[13.5px] leading-relaxed text-light-inkSoft">
          EduArabic for All has been submitted to and recognised at several innovation and teaching-enhancement
          competitions in Malaysia.
        </p>
        <div className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {AWARDS.map((award) => (
            <div
              key={award.name}
              className="flex flex-col items-center rounded-2xl border border-light-ink/[.08] bg-light-ink/[.03] px-4 pb-4 pt-5"
            >
              <div className="mb-3 flex h-[44px] items-center justify-center">
                <img src={award.img} alt={award.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="text-center text-[11px] font-bold text-light-inkSoft">{AWARD_LABEL[award.status]}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-primary/[.18] bg-primary/[.06] p-6 text-center sm:p-8">
          <div className="mb-1.5 font-poppins text-lg font-extrabold">Have a question, or want to partner with us?</div>
          <p className="mb-5 text-[13.5px] text-light-inkSoft">
            We'd love to hear from resellers, educators, and institutions interested in EduArabic for All.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[14px] font-bold text-[#0B2A4A]"
          >
            <Icon name="mail-01" size={16} />
            Contact Us
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
