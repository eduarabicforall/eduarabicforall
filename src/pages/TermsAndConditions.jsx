import LegalLayout, { Section } from '../components/LegalLayout.jsx'

export default function TermsAndConditions() {
  return (
    <LegalLayout title="Terms & Conditions" updated="6 September 2026">
      <p>
        These Terms & Conditions ("Terms") govern your access to and use of the EduArabic for All website, mobile
        experience, physical learning modules and related services (collectively, the "Service"), operated by{' '}
        <strong className="text-light-ink">EduArabic for All</strong> ("we", "us"). By
        creating an account, purchasing a module, or otherwise using the Service, you agree to these Terms. If you do
        not agree, please do not use the Service.
      </p>

      <Section title="1. The Service">
        <p>
          EduArabic for All sells physical Arabic-language learning modules ("Modules"). Each Module includes a
          unique activation code that, once entered in the app, unlocks the corresponding digital content for that
          Module — including its Audio Library and AI Ustaz chat assistant. The Grammar module and its practice
          quizzes are provided free of charge to every registered account, independent of any Module purchase.
        </p>
      </Section>

      <Section title="2. Accounts">
        <p>
          You must provide accurate information when creating an account and are responsible for keeping your
          login credentials confidential. You are responsible for all activity that occurs under your account. If a
          Module is intended for use by a child (for example, the "Anakku Berbahasa Arab" module), the account must
          be registered and supervised by a parent or legal guardian.
        </p>
      </Section>

      <Section title="3. Purchases, Activation Codes & Resellers">
        <ul className="list-disc pl-5">
          <li>Modules may be purchased directly through the Service or from authorised resellers and bookstores.</li>
          <li>
            Each activation code is tied to a single Module and may be redeemed on your account regardless of where
            the physical Module was purchased.
          </li>
          <li>
            Activation codes are provided "as is" inside the physical Module. We are not responsible for codes lost,
            damaged, or rendered unreadable after the Module leaves our custody (for example, due to reseller
            mishandling), though we will assist in good faith where reasonably possible.
          </li>
          <li>Prices are shown in Malaysian Ringgit (RM) and may change at any time without prior notice.</li>
        </ul>
      </Section>

      <Section title="4. Shipping">
        <p>
          Physical Modules ordered through the Service are shipped within Malaysia. Estimated delivery timelines are
          shown at checkout and are not guaranteed. Risk of loss for a shipped Module passes to you once it is
          handed to our courier partner, though we will work with you to resolve delivery issues in good faith.
        </p>
      </Section>

      <Section title="5. AI Ustaz — Acceptable Use">
        <p>
          AI Ustaz is an AI-assisted study companion scoped to the content of the Module you have activated. It is a
          learning aid, not a substitute for a qualified human teacher, scholar, or religious authority — answers may
          be incomplete or contain errors, and should not be relied upon for religious rulings (fatwa) or matters
          requiring formal scholarly verification. Each account has a daily usage quota per Module, shown in the app.
          You agree not to use AI Ustaz to submit unlawful, abusive, or harmful content.
        </p>
      </Section>

      <Section title="6. Intellectual Property">
        <p>
          All content in the Service — including audio recordings, video lessons, quiz content, software, and the
          EduArabic for All name and logo — is owned by us or our licensors and protected by copyright and other
          intellectual property laws. Your Module purchase and account grant you a personal, non-transferable licence
          to use the corresponding digital content for your own learning. You may not copy, redistribute, reverse
          engineer, or resell the digital content.
        </p>
      </Section>

      <Section title="7. Termination">
        <p>
          We may suspend or terminate your account if you breach these Terms, including misuse of activation codes
          or AI Ustaz. You may stop using the Service and request account deletion at any time by contacting us (see
          Section 9).
        </p>
      </Section>

      <Section title="8. Disclaimer & Limitation of Liability">
        <p>
          The Service is provided "as is" without warranties of any kind, to the fullest extent permitted by law. To
          the fullest extent permitted by applicable law, we are not liable for indirect, incidental, or
          consequential damages arising from your use of the Service. Nothing in these Terms limits liability that
          cannot be limited under Malaysian law.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          Questions about these Terms can be sent to <strong className="text-light-ink">eduarabicforall@gmail.com</strong>.
        </p>
      </Section>

      <Section title="10. Changes to these Terms">
        <p>
          We may update these Terms from time to time. Continued use of the Service after changes take effect
          constitutes acceptance of the revised Terms. Material changes will be reflected by updating the "Last
          updated" date above.
        </p>
      </Section>
    </LegalLayout>
  )
}
