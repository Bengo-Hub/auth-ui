import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — Codevertex SSO',
  description:
    'Terms governing use of the Codevertex SSO / accounts identity service operated by Codevertex IT Solutions.',
};

const EFFECTIVE_DATE = 'April 16, 2026';

export default function TermsOfServicePage() {
  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Terms of Service
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the
            Codevertex SSO identity service at{' '}
            <Link href="/">accounts.codevertexitsolutions.com</Link> and related
            subdomains (collectively, the &quot;Service&quot;), operated by Codevertex IT
            Solutions (&quot;Codevertex&quot;, &quot;we&quot;). By signing in or creating an
            account you agree to these Terms.
          </p>

          <h2>1. Who may use the Service</h2>
          <p>
            You must be at least 18 years old, or the age of majority in your jurisdiction,
            and capable of entering a binding agreement. You are responsible for any account
            activity that occurs under your credentials.
          </p>

          <h2>2. Accounts &amp; authentication</h2>
          <ul>
            <li>
              You may sign in with email and password, or with a supported OAuth provider
              (Google, Microsoft, GitHub). Federated sign-in is subject to the provider&apos;s
              own terms.
            </li>
            <li>
              You are responsible for keeping your credentials and any multi-factor
              authentication devices secure, and for notifying us promptly of any
              unauthorised access.
            </li>
            <li>
              We may suspend or terminate accounts that violate these Terms, abuse the
              Service, or are required to be disabled by law.
            </li>
          </ul>

          <h2>3. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Attempt to reverse engineer, decompile, or interfere with the Service.</li>
            <li>Use the Service to transmit malware or phishing content.</li>
            <li>Probe for vulnerabilities without written authorisation.</li>
            <li>Impersonate another person or misrepresent your affiliation.</li>
            <li>Use automated scraping or credential-stuffing against the Service.</li>
          </ul>

          <h2>4. Privacy</h2>
          <p>
            Our handling of personal data is described in the{' '}
            <Link href="/privacy">Privacy Policy</Link>, which forms part of these Terms.
          </p>

          <h2>5. Intellectual property</h2>
          <p>
            Codevertex retains all rights in the Service, its source, and its branding.
            These Terms grant you a limited, non-exclusive, revocable right to use the
            Service for its intended purpose only.
          </p>

          <h2>6. Service availability &amp; changes</h2>
          <p>
            We aim for high availability but do not guarantee uninterrupted service. We may
            update, modify, or discontinue parts of the Service at any time. We will notify
            active account holders of material changes where feasible.
          </p>

          <h2>7. Disclaimer</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without
            warranties of any kind, express or implied, to the fullest extent permitted by
            law. We do not warrant that the Service will be error-free or uninterrupted.
          </p>

          <h2>8. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Codevertex shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages, or any
            loss of profits or revenues, whether incurred directly or indirectly, arising out
            of your use of the Service.
          </p>

          <h2>9. Governing law</h2>
          <p>
            These Terms are governed by the laws of the Republic of Kenya, without regard to
            its conflict-of-laws rules. Any dispute shall be resolved in the competent courts
            of Nairobi, Kenya.
          </p>

          <h2>10. Contact</h2>
          <p>
            Questions about these Terms should be sent to{' '}
            <a href="mailto:legal@codevertexitsolutions.com">legal@codevertexitsolutions.com</a>.
          </p>

          <h2>11. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. Material changes will be posted on
            this page with an updated effective date, and we will notify active account
            holders by email.
          </p>
        </article>

        <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <Link href="/" className="hover:text-primary">← Back to home</Link>
          <span className="mx-3">·</span>
          <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
        </div>
      </section>
    </main>
  );
}
