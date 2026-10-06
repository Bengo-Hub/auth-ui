import { Ban, Coins, CreditCard, Gift, Layers, Mail, ReceiptText, RotateCcw, Scale, Smartphone, Wrench } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell, LEGAL_CONTACT, type LegalSection } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Refund Policy | Codevertex Africa Limited',
  description: 'When Codevertex payments can be refunded, for each kind of charge, and how to ask for a refund.',
};

const UPDATED = '6 October 2026';
const SUPPORT = 'support@codevertexafrica.com';

const sections: LegalSection[] = [
  {
    id: 'currency',
    title: 'Prices, tax and currency',
    icon: Coins,
    body: (
      <>
        <p>
          Our prices are in Kenya Shillings (KES). Value added tax (VAT) at 16% is added to each invoice and shown
          before you pay. Any credit in your wallet is taken off the total.
        </p>
        <p>
          If you pay in another currency, for example Uganda Shillings by MTN or Airtel Money, the amount is converted
          from KES at that day&apos;s exchange rate. Refunds are worked out in KES, the currency of your invoice, so
          the amount that reaches you in another currency can differ slightly because of the exchange rate.
        </p>
      </>
    ),
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    icon: ReceiptText,
    body: (
      <>
        <p>
          A subscription is paid in advance for the period you choose: one month, six months or twelve months.
          Payments for a period that has started are not refundable, including the unused part of a six or twelve
          month period.
        </p>
        <p>
          You can cancel at any time from the Billing page of the Subscriptions app. Your plan keeps working to the end
          of the period you paid for, and nothing more is charged after that.
        </p>
      </>
    ),
  },
  {
    id: 'setup',
    title: 'Setup fees and one-time licences',
    icon: Wrench,
    body: (
      <ul>
        <li>
          <strong>Setup fee.</strong> Charged once, on your first invoice, and waived when you pay for six months or
          more. It covers setting up your account and is not refundable once the setup has been done.
        </li>
        <li>
          <strong>One-time licence.</strong> A single payment for software you keep. It is not refundable once the
          licence has been activated.
        </li>
      </ul>
    ),
  },
  {
    id: 'extras',
    title: 'Add-ons, extra usage and support',
    icon: Layers,
    body: (
      <ul>
        <li>
          <strong>Add-ons</strong> are charged when you buy them. You can remove an add-on at any time, which stops
          future charges. Payments already made for it are not refunded.
        </li>
        <li>
          <strong>Extra usage</strong> (usage above your plan&apos;s limits, when you have switched it on) and{' '}
          <strong>ISP Billing usage charges</strong> are billed for usage that has already happened, so they are not
          refundable unless they were billed in error.
        </li>
        <li>
          <strong>Support and hosting agreements</strong> are billed for each agreement period. Periods that have
          started are not refundable. Ending the agreement stops future charges.
        </li>
        <li>
          <strong>eTIMS API tokens</strong> are prepaid and never expire. Tokens used on a request that fails are put
          back in your wallet automatically. Unused tokens stay in your wallet and are not exchanged for money.
        </li>
      </ul>
    ),
  },
  {
    id: 'automatic',
    title: 'Automatic payments',
    icon: Smartphone,
    body: (
      <>
        <p>
          <strong>Payment method check.</strong> Saving a card or M-Pesa number for automatic renewal makes a KES 5
          check charge, which is refunded automatically. You never need a saved payment method to pay an invoice.
        </p>
        <p>
          <strong>M-Pesa standing order.</strong> If you cancel a standing order with us but a debit still arrives
          because it is still active in M-Pesa, the payment counts towards your next bill. Tell us if you would rather
          have it back and we will refund it.
        </p>
      </>
    ),
  },
  {
    id: 'credit',
    title: 'Credit, coupons and referral rewards',
    icon: Gift,
    body: (
      <p>
        Credit from coupons, referral rewards or goodwill gifts is taken off your future bills. It has no cash value,
        so it cannot be refunded or paid out.
      </p>
    ),
  },
  {
    id: 'when',
    title: 'When we do refund',
    icon: Scale,
    body: (
      <ul>
        <li>When you were charged in error, for example twice for the same invoice. We refund the extra payment, or keep it as credit if you prefer.</li>
        <li>When we have materially failed to deliver the service you paid for.</li>
        <li>When Kenyan consumer protection law requires a refund.</li>
      </ul>
    ),
  },
  {
    id: 'request',
    title: 'How to ask for a refund',
    icon: Mail,
    body: (
      <p>
        Email <a href={`mailto:${SUPPORT}?subject=Refund%20request`}>{SUPPORT}</a> with your organisation name, the
        invoice or payment reference and the reason. We will reply with our decision and, if a refund is approved, how
        and when it will be paid.
      </p>
    ),
  },
  {
    id: 'disputes',
    title: 'If you disagree',
    icon: RotateCcw,
    body: (
      <p>
        Write to {LEGAL_CONTACT.email} if you are not happy with our answer. This policy forms part of our{' '}
        <Link href="/terms-of-service" className="text-primary underline">
          Terms of Service
        </Link>
        , and nothing in it limits rights you have under Kenyan law.
      </p>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPageShell
      badge="Refund Policy"
      badgeIcon={CreditCard}
      title="Refund Policy"
      updated={UPDATED}
      current="/refund-policy"
      intro={<p>How refunds work for each kind of Codevertex charge: subscriptions, setup fees, licences, add-ons, usage, support and API tokens.</p>}
      sections={sections}
    />
  );
}
