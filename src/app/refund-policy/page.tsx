import { Ban, CreditCard, Mail, ReceiptText, RotateCcw, Scale } from 'lucide-react';
import type { Metadata } from 'next';
import { LegalPageShell, LEGAL_CONTACT, type LegalSection } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Refund Policy | Codevertex Africa Limited',
  description: 'When Codevertex subscription payments can be refunded and how to ask for a refund.',
};

const UPDATED = '6 October 2026';
const SUPPORT = 'support@codevertexafrica.com';

const sections: LegalSection[] = [
  {
    id: 'subscriptions',
    title: 'Subscription payments',
    icon: ReceiptText,
    body: (
      <p>
        Subscriptions are paid in advance for the billing period you choose (one month, six months or twelve
        months). Payments for a period that has already been delivered are generally not refundable.
      </p>
    ),
  },
  {
    id: 'cancelling',
    title: 'Cancelling',
    icon: Ban,
    body: (
      <p>
        You can cancel at any time from the Billing page of the Subscriptions app. Your plan keeps working until the
        end of the period you paid for, and nothing more is charged after that. No refund is issued for the unused
        part of the current period.
      </p>
    ),
  },
  {
    id: 'exceptions',
    title: 'When we do refund',
    icon: Scale,
    body: (
      <ul>
        <li>Where Kenyan consumer protection law requires a refund.</li>
        <li>Where we have materially failed to deliver the service you paid for.</li>
        <li>Where you were charged in error, for example charged twice for the same invoice.</li>
      </ul>
    ),
  },
  {
    id: 'card-check',
    title: 'Card and payment method checks',
    icon: CreditCard,
    body: (
      <p>
        Saving a card or M-Pesa number for automatic renewal makes a KES 5 check charge, which is refunded
        automatically. Paying an invoice never requires saving a payment method.
      </p>
    ),
  },
  {
    id: 'request',
    title: 'How to ask for a refund',
    icon: Mail,
    body: (
      <p>
        Email <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a> with your organisation name, the invoice number and the
        reason.
      </p>
    ),
  },
  {
    id: 'disputes',
    title: 'Disagreements',
    icon: RotateCcw,
    body: (
      <p>
        If you are not happy with our answer, write to {LEGAL_CONTACT.email}. This policy forms part of our Terms of
        Service, and nothing in it limits rights you have under Kenyan law.
      </p>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPageShell
      badge="Refund Policy"
      badgeIcon={RotateCcw}
      title="Refund Policy"
      updated={UPDATED}
      current="/refund-policy"
      intro={<p>How refunds work for Codevertex subscriptions, licences and add-ons.</p>}
      sections={sections}
    />
  );
}
