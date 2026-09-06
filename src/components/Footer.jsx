import { FOOTER_COMPANY, FOOTER_LEGAL, FOOTER_MENU } from '../data/landing.js'

export default function Footer() {
  return (
    <footer className="border-t border-light-ink/10 px-[6vw] py-14">
      <div className="mx-auto grid max-w-[1160px] gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <img src="/logo.png" alt="EduArabic for All" className="mb-3 h-8 w-auto" />
          <p className="max-w-[220px] text-[13px] leading-relaxed text-light-inkFaint">
            Physical Arabic modules with digital audio &amp; AI Ustaz.
          </p>
        </div>

        <div>
          <div className="mb-3.5 text-[11px] font-bold tracking-wide text-light-inkFaint">MENU</div>
          <div className="flex flex-col gap-2.5">
            {FOOTER_MENU.map((link) => (
              <a
                key={link.label}
                href={`/${link.href}`}
                className="text-[13.5px] text-light-inkSoft hover:text-light-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[11px] font-bold tracking-wide text-light-inkFaint">COMPANY</div>
          <div className="flex flex-col gap-2.5">
            {FOOTER_COMPANY.map((link) => (
              <a key={link.label} href={link.href} className="text-[13.5px] text-light-inkSoft hover:text-light-ink">
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[11px] font-bold tracking-wide text-light-inkFaint">LEGAL</div>
          <div className="flex flex-col gap-2.5">
            {FOOTER_LEGAL.map((link) => (
              <a key={link.label} href={link.href} className="text-[13.5px] text-light-inkSoft hover:text-light-ink">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1160px] flex-col gap-2 border-t border-light-ink/10 pt-6 text-[12.5px] text-light-inkFaint sm:flex-row sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} EduArabic for All. All rights reserved.</div>
        <div>Made in Malaysia · Payments secured by BayarCash</div>
      </div>
    </footer>
  )
}
