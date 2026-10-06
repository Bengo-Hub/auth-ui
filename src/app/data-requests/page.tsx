import { Download, Eye, FileX, Mail, MessageSquareOff, PencilLine, ShieldAlert, UserCog } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell, LEGAL_CONTACT, type LegalSection } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Your Data and Your Rights | Codevertex Africa Limited',
  description: 'How to see, correct, download or delete your personal data, and how to stop marketing messages.',
};

const UPDATED = '6 October 2026';

const RIGHTS = [
  { icon: Eye, title: 'See your data', text: 'Ask what personal data we hold about you and how we use it.' },
  { icon: PencilLine, title: 'Correct it', text: 'Fix anything that is wrong or out of date. Most details can be edited on your Profile.' },
  { icon: Download, title: 'Get a copy', text: 'Receive your data in a common, machine-readable format to keep or move elsewhere.' },
  { icon: FileX, title: 'Delete it', text: 'Ask us to delete your account and personal data, except records the law says we must keep.' },
  { icon: MessageSquareOff, title: 'Stop marketing', text: 'Opt out of marketing at any time, free of charge, and withdraw any consent you gave.' },
  { icon: ShieldAlert, title: 'Object or complain', text: 'Object to a use of your data, and complain to the Office of the Data Protection Commissioner.' },
];

const sections: LegalSection[] = [
  {
    id: 'rights',
    title: 'Your rights',
    icon: UserCog,
    body: (
      <>
        <p>Under the Kenya Data Protection Act 2019 (and the GDPR where it applies to you) you can:</p>
        <ul className="not-prose grid gap-3 sm:grid-cols-2">
          {RIGHTS.map((r) => (
            <li key={r.title} className="flex gap-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
              <r.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block font-semibold text-slate-900 dark:text-white">{r.title}</span>
                <span className="block text-sm text-slate-600 dark:text-slate-400">{r.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'how',
    title: 'How to make a request',
    icon: Mail,
    body: (
      <>
        <p>
          Email <a href={`mailto:${LEGAL_CONTACT.email}?subject=Data%20request`}>{LEGAL_CONTACT.email}</a> from the
          address on your account, and say which right you are using (for example &quot;send me a copy of my
          data&quot; or &quot;delete my account&quot;). To protect you, we may ask you to confirm your identity
          before acting.
        </p>
        <p>We do not charge for requests and reply as soon as we can, within the time the law sets.</p>
      </>
    ),
  },
  {
    id: 'deletion',
    title: 'What deletion means',
    icon: FileX,
    body: (
      <>
        <p>
          Deleting your account removes your sign-in and personal details from every Codevertex app. Some records
          have to be kept for a set time by law, for example tax invoices and accounting records, and weighbridge
          enforcement records. Those are kept only as long as required.
        </p>
        <p>
          If you run a business on Codevertex, the records of your own customers belong to your business. Ask the
          business directly about their data, or contact us if you cannot reach them.
        </p>
      </>
    ),
  },
  {
    id: 'marketing',
    title: 'Stopping marketing messages',
    icon: MessageSquareOff,
    body: (
      <p>
        You can stop marketing at any time, free of charge: use the unsubscribe link or reply <strong>STOP</strong>{' '}
        where a message offers it, or email{' '}
        <a href={`mailto:${LEGAL_CONTACT.email}?subject=Stop%20marketing`}>{LEGAL_CONTACT.email}</a>. Service
        messages you need, such as invoices, receipts and security codes, are not marketing and continue.
      </p>
    ),
  },
  {
    id: 'complaints',
    title: 'Complaints',
    icon: ShieldAlert,
    body: (
      <p>
        If you are not satisfied with how we handled your data, you can complain to the Office of the Data
        Protection Commissioner (ODPC) of Kenya at{' '}
        <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer">
          odpc.go.ke
        </a>
        . See our{' '}
        <Link href="/privacy" className="text-primary underline">
          Privacy Policy
        </Link>{' '}
        for what we collect and why.
      </p>
    ),
  },
];

export default function DataRequestsPage() {
  return (
    <LegalPageShell
      badge="Your data"
      badgeIcon={UserCog}
      title="Your data and your rights"
      updated={UPDATED}
      current="/data-requests"
      intro={<p>How to see, correct, download or delete the personal data {LEGAL_CONTACT.company} holds about you.</p>}
      sections={sections}
    />
  );
}
