import { FOOTER_COMPANY, FOOTER_LEGAL, FOOTER_MENU } from '../data/landing.js'

export default function Footer() {
  return (
    <footer
      className="px-[6vw] py-14 text-white"
      style={{
        // same navy gradient as the landing hero
        background:
          'radial-gradient(70% 60% at 50% 110%, rgba(61,125,216,.4) 0%, transparent 70%), radial-gradient(45% 50% at 12% 0%, rgba(61,125,216,.25) 0%, transparent 70%), linear-gradient(160deg, #070A14 0%, #0C1D3D 55%, #12305E 100%)',
      }}
    >
      <div className="mx-auto grid max-w-[1160px] gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          {/* the logo's light-blue lettering needs a light backing on the dark footer */}
          <span className="mb-4 inline-block rounded-xl bg-white px-3 py-2">
            <img src="/logo.png" alt="EduArabic for All" className="h-7 w-auto" />
          </span>
          <p className="max-w-[220px] text-[13px] leading-relaxed text-white/60">
            Physical Arabic modules with digital audio &amp; AI Ustaz.
          </p>
        </div>

        <div>
          <div className="mb-3.5 text-[11px] font-bold tracking-wide text-white/45">MENU</div>
          <div className="flex flex-col gap-2.5">
            {FOOTER_MENU.map((link) => (
              <a
                key={link.label}
                href={`/${link.href}`}
                className="text-[13.5px] text-white/75 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[11px] font-bold tracking-wide text-white/45">COMPANY</div>
          <div className="flex flex-col gap-2.5">
            {FOOTER_COMPANY.map((link) => (
              <a key={link.label} href={link.href} className="text-[13.5px] text-white/75 hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[11px] font-bold tracking-wide text-white/45">LEGAL</div>
          <div className="flex flex-col gap-2.5">
            {FOOTER_LEGAL.map((link) => (
              <a key={link.label} href={link.href} className="text-[13.5px] text-white/75 hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1160px] flex-col gap-2 border-t border-white/10 pt-6 text-[12.5px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} EduArabic for All. All rights reserved.</div>
        <div>Made in Malaysia · Payments secured by BayarCash</div>
      </div>
    </footer>
  )
}
