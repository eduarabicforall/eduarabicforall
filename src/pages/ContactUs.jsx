import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import Icon from '../components/Icon.jsx'

const ADDRESS = 'Fakulti Bahasa Arab & Komunikasi, Universiti Sultan Zainal Abidin, 21300 Kuala Nerus, Terengganu'
const EMAIL = 'eduarabicforall@gmail.com'
const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-light-bg text-light-ink">
      <Navbar />
      <main className="mx-auto max-w-[900px] px-[6vw] py-16">
        <h1 className="mb-2 font-poppins text-[32px] font-extrabold">Contact Us</h1>
        <p className="mb-10 max-w-[520px] text-[14.5px] leading-relaxed text-light-inkSoft">
          Have a question about a module, an activation code, or anything else? Reach out — we're happy to help.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex gap-3.5 rounded-2xl border border-light-ink/[.08] bg-light-ink/[.03] p-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/[.15]">
                <Icon name="mail-01" size={20} className="text-primary" />
              </div>
              <div>
                <div className="mb-1 text-[13px] font-bold text-light-inkFaint">EMAIL</div>
                <a href={`mailto:${EMAIL}`} className="text-[15px] font-semibold text-light-ink hover:text-primary">
                  {EMAIL}
                </a>
              </div>
            </div>

            <div className="flex gap-3.5 rounded-2xl border border-light-ink/[.08] bg-light-ink/[.03] p-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold/[.15]">
                <Icon name="qr-code" size={20} className="text-gold" />
              </div>
              <div>
                <div className="mb-1 text-[13px] font-bold text-light-inkFaint">ADDRESS</div>
                <p className="mb-4 text-[14.5px] leading-relaxed text-light-ink">{ADDRESS}</p>
                <a
                  href={MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13.5px] font-bold text-white"
                >
                  <Icon name="arrow-right-01" size={16} />
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-light-ink/[.08]">
            <iframe
              title="EduArabic for All location"
              src={MAPS_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 320 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
