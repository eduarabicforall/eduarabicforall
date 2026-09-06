import LegalLayout, { Section } from '../components/LegalLayout.jsx'

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="6 September 2026">
      <p>
        This Privacy Policy explains how <strong className="text-light-ink">EduArabic for All</strong> ("we", "us")
        collects, uses, and protects your personal data when you use our website, app, and
        physical Modules (together, the "Service"), in line with Malaysia's Personal Data Protection Act 2010
        (PDPA).
      </p>

      <Section title="1. Information we collect">
        <ul className="list-disc pl-5">
          <li>
            <strong className="text-light-ink">Account information</strong> — full name, email address, and password
            (stored securely, hashed) when you register.
          </li>
          <li>
            <strong className="text-light-ink">Purchase & shipping information</strong> — order details, shipping
            address, and phone number when you buy a physical Module. Payment card or bank details are collected and
            processed directly by our payment gateway partners (such as BayarCash) — we do not store your full card
            or bank account numbers.
          </li>
          <li>
            <strong className="text-light-ink">Learning activity</strong> — which Modules are activated on your
            account, Grammar quiz attempts and scores, and messages you send to AI Ustaz (used to enforce daily usage
            quotas and improve the Service).
          </li>
          <li>
            <strong className="text-light-ink">Device & preference data</strong> — stored locally on your device,
            such as your light/dark theme preference.
          </li>
        </ul>
      </Section>

      <Section title="2. How we use your information">
        <ul className="list-disc pl-5">
          <li>To create and manage your account and deliver the digital content you've activated.</li>
          <li>To process and ship physical Module orders.</li>
          <li>To operate AI Ustaz and enforce per-Module usage quotas.</li>
          <li>To provide customer support and respond to enquiries.</li>
          <li>To maintain the security and integrity of the Service.</li>
        </ul>
      </Section>

      <Section title="3. Children's data">
        <p>
          The "Anakku Berbahasa Arab" module is designed for children, but accounts on the Service must be created
          and controlled by a parent or legal guardian. We do not knowingly collect account information directly
          from children; any activity by a child on the Service is expected to occur under a parent or guardian's
          supervision and account.
        </p>
      </Section>

      <Section title="4. Who we share information with">
        <ul className="list-disc pl-5">
          <li>
            <strong className="text-light-ink">Payment gateway providers</strong> (e.g. BayarCash) to process
            payments.
          </li>
          <li>
            <strong className="text-light-ink">Courier partners</strong> to deliver physical Modules.
          </li>
          <li>
            <strong className="text-light-ink">Infrastructure providers</strong> (such as our database, hosting, and
            AI service providers) strictly to operate the Service.
          </li>
        </ul>
        <p>We do not sell your personal data to third parties.</p>
      </Section>

      <Section title="5. Data retention">
        <p>
          We retain your account and order data for as long as your account is active, or as needed to comply with
          legal, accounting, or tax obligations. You may request deletion of your account and associated data at any
          time (see Section 8), subject to records we are legally required to keep.
        </p>
      </Section>

      <Section title="6. Data security">
        <p>
          We use industry-standard safeguards — including encrypted connections, hashed passwords, and access
          controls — to protect your personal data. No system is completely secure, and we cannot guarantee absolute
          security.
        </p>
      </Section>

      <Section title="7. Your rights">
        <p>
          Under the PDPA, you have the right to access, correct, and (subject to legal exceptions) request deletion
          of your personal data, and to withdraw consent to certain processing. To exercise these rights, contact us
          using the details in Section 8.
        </p>
      </Section>

      <Section title="8. Contact">
        <p>
          For privacy questions or requests, contact us at{' '}
          <strong className="text-light-ink">eduarabicforall@gmail.com</strong>.
        </p>
      </Section>

      <Section title="9. Changes to this Policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected by updating the
          "Last updated" date above.
        </p>
      </Section>
    </LegalLayout>
  )
}
