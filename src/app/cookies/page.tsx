import { Cookie, HardDrive, Settings2, ShieldCheck, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell, LEGAL_CONTACT, type LegalSection } from '@/components/legal/LegalPageShell';
import { CookieSettingsButton } from '@/components/legal/CookieSettingsButton';

export const metadata: Metadata = {
  title: 'Cookie Policy | Codevertex Africa Limited',
  description: 'Which cookies and browser storage Codevertex apps use, why, and how to change your choice.',
};

const UPDATED = '6 October 2026';

const sections: LegalSection[] = [
  {
    id: 'what',
    title: 'What cookies are',
    icon: Cookie,
    body: (
      <p>
        Cookies are small files a website stores in your browser. Apps can also keep data in your browser&apos;s
        storage. This policy covers both, for every Codevertex app on <strong>codevertexafrica.com</strong>.
      </p>
    ),
  },
  {
    id: 'necessary',
    title: 'Strictly necessary (always on)',
    icon: ShieldCheck,
    body: (
      <>
        <p>These keep you signed in and the apps secure. They cannot be switched off, because the apps do not work without them.</p>
        <div className="not-prose overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold">Purpose</th>
                <th className="py-2 font-semibold">Kept for</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-300">
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 pr-4 font-mono text-xs">bb_session</td>
                <td className="py-2 pr-4">Your signed-in session across Codevertex apps (secure, not readable by scripts).</td>
                <td className="py-2">24 hours</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 pr-4 font-mono text-xs">cv_cookie_consent</td>
                <td className="py-2 pr-4">Remembers the cookie choice you made, so we do not ask again.</td>
                <td className="py-2">1 year</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: 'storage',
    title: 'Browser storage',
    icon: HardDrive,
    body: (
      <p>
        The apps keep your sign-in tokens, the organisation and branch you selected, your light or dark theme, and
        data cached for offline use in your browser&apos;s storage. This stays on your device, is needed for the app
        to work, and is removed when you sign out or clear your browser data.
      </p>
    ),
  },
  {
    id: 'optional',
    title: 'Optional cookies',
    icon: Settings2,
    body: (
      <>
        <p>
          Two optional groups exist, and both are <strong>off unless you turn them on</strong>:
        </p>
        <ul>
          <li>
            <strong>Functional:</strong> chat and help widgets that remember you between visits.
          </li>
          <li>
            <strong>Analytics:</strong> anonymous usage statistics. We do not run any analytics or advertising
            tracking today; if we add it, it stays off until you allow it.
          </li>
        </ul>
        <p>Your choice applies to every Codevertex app. You can change it at any time:</p>
        <CookieSettingsButton />
      </>
    ),
  },
  {
    id: 'third-party',
    title: 'Payment and other providers',
    icon: Users,
    body: (
      <>
        <p>
          When you pay, the payment page of the provider you choose (for example Paystack for cards, or M-Pesa) may
          set its own cookies under that provider&apos;s policy. See our{' '}
          <Link href="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>{' '}
          for the providers we use.
        </p>
        <p>
          Questions: <a href={`mailto:${LEGAL_CONTACT.email}`}>{LEGAL_CONTACT.email}</a>.
        </p>
      </>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPageShell
      badge="Cookie Policy"
      badgeIcon={Cookie}
      title="Cookie Policy"
      updated={UPDATED}
      current="/cookies"
      intro={
        <p>
          {LEGAL_CONTACT.company} uses only the cookies needed to sign you in and keep the apps secure. Anything
          optional stays off unless you choose to allow it.
        </p>
      }
      sections={sections}
    />
  );
}
