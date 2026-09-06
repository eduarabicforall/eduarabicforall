import LegalLayout, { Section } from '../components/LegalLayout.jsx'

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy" updated="6 September 2026">
      <p>
        This Refund Policy applies to physical Modules purchased directly through the EduArabic for All app or
        website. If you purchased a Module from a reseller or bookstore, please refer to that seller's own
        return/refund policy — this page covers purchases made directly with us.
      </p>

      <Section title="1. Before activation">
        <p>
          If a Module is unopened, unused, and its activation code has not been redeemed, you may request a refund
          or exchange within <strong className="text-light-ink">7 days</strong> of delivery. Contact us with your
          order number to start the process — we'll provide return instructions.
        </p>
      </Section>

      <Section title="2. After activation">
        <p>
          Once a Module's activation code has been redeemed on your account — unlocking its Audio Library and AI
          Ustaz — the digital content is considered delivered and the purchase is generally non-refundable, since the
          content cannot be "returned". This does not affect your rights in cases covered under Section 4 below.
        </p>
      </Section>

      <Section title="3. Damaged, defective, or incorrect items">
        <p>
          If your Module arrives damaged, defective, or is not what you ordered, contact us within{' '}
          <strong className="text-light-ink">7 days</strong> of delivery with your order number and photos of the
          issue. We will arrange a replacement or full refund at no extra cost to you.
        </p>
      </Section>

      <Section title="4. Activation code doesn't work">
        <p>
          If a genuine, unused activation code fails to activate after double-checking for typos, contact support
          with your Module and the code. If we confirm the code is faulty, we will issue a replacement code or a
          refund.
        </p>
      </Section>

      <Section title="5. How refunds are processed">
        <p>
          Approved refunds are returned to your original payment method via our payment gateway partner (e.g.
          BayarCash). Processing typically takes 5–14 business days depending on your bank, after we confirm the
          refund.
        </p>
      </Section>

      <Section title="6. Shipping costs">
        <p>
          Original shipping charges are non-refundable except where the return is due to our error (damaged,
          defective, or incorrect item under Section 3). Return shipping costs for a change-of-mind return under
          Section 1 are borne by the customer unless stated otherwise at the time.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          To request a refund or exchange, contact us at{' '}
          <strong className="text-light-ink">eduarabicforall@gmail.com</strong> with your order number.
        </p>
      </Section>
    </LegalLayout>
  )
}
