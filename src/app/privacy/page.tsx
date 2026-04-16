import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Codevertex SSO',
  description:
    'How Codevertex IT Solutions collects, uses, and protects personal data in the Codevertex SSO / accounts service.',
};

// Effective date is fixed so the published policy does not silently shift on
// every build — update explicitly when the policy changes.
const EFFECTIVE_DATE = 'April 16, 2026';

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Privacy Policy
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            Codevertex IT Solutions (&quot;Codevertex&quot;, &quot;we&quot;, &quot;us&quot;) operates the
            Codevertex SSO identity service at{' '}
            <Link href="/">accounts.codevertexitsolutions.com</Link> and related subdomains
            (together, the &quot;Service&quot;). This policy explains what personal information we
            collect when you sign in, what we do with it, and the rights you have over it.
          </p>

          <h2>1. Information we collect</h2>
          <p>We collect only what we need to authenticate you and issue access tokens:</p>
          <ul>
            <li>
              <strong>Account identifiers</strong> — email address, name, profile picture URL,
              and the unique subject identifier returned by your chosen identity provider
              (Google, Microsoft, or GitHub).
            </li>
            <li>
              <strong>Authentication metadata</strong> — hashed passwords (for email/password
              accounts), multi-factor authentication settings, session identifiers, sign-in
              timestamps, IP addresses, and user-agent strings. Used for security monitoring
              and abuse prevention.
            </li>
            <li>
              <strong>OAuth provider tokens</strong> — access and refresh tokens returned by
              Google / Microsoft / GitHub. Stored encrypted at rest (AES-256-GCM) and used
              solely to verify your identity and, where you consent, fetch basic profile
              details (email, name, picture).
            </li>
            <li>
              <strong>Tenant &amp; membership data</strong> — the organisations you belong to,
              your roles, and your permissions within the Codevertex ecosystem.
            </li>
          </ul>

          <h2>2. How we use your information</h2>
          <ul>
            <li>Authenticate you and issue short-lived JSON Web Tokens (JWTs) for access to Codevertex services.</li>
            <li>Enforce multi-factor authentication and detect anomalous sign-in activity.</li>
            <li>Provision and maintain your organisation membership across the Codevertex microservice ecosystem.</li>
            <li>Respond to support requests and meet legal obligations.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell your personal data, and we do not use it for
            advertising or profiling outside the Service.
          </p>

          <h2>3. Google user data</h2>
          <p>
            When you choose &quot;Sign in with Google&quot;, we request the <code>openid</code>,{' '}
            <code>email</code>, and <code>profile</code> scopes only. We use these values to
            create or locate your Codevertex account. We do not request, access, store, or
            share any other Google user data (Gmail, Drive, Calendar, Contacts, etc.). Our use
            and transfer of information received from Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              rel="noreferrer"
              target="_blank"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>

          <h2>4. Sharing &amp; disclosure</h2>
          <p>
            We share data only with (a) other Codevertex microservices that you have
            explicitly granted access to via sign-in, (b) infrastructure providers required to
            run the Service (cloud hosting, transactional email), and (c) authorities when
            compelled by law. We do not share OAuth tokens with any third party.
          </p>

          <h2>5. Data retention</h2>
          <p>
            Account records are retained while your account is active. If you delete your
            account, we erase personal identifiers within 30 days and retain only anonymised
            audit logs as required for security and compliance.
          </p>

          <h2>6. Security</h2>
          <p>
            Secrets are encrypted at rest (AES-256-GCM). Passwords are hashed with Argon2id.
            Access tokens are short-lived (15 minutes) and refresh tokens rotate on use. All
            traffic is served over TLS 1.3.
          </p>

          <h2>7. Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data by
            contacting <a href="mailto:privacy@codevertexitsolutions.com">privacy@codevertexitsolutions.com</a>.
            You can also revoke Codevertex&apos;s access to your Google account at{' '}
            <a
              href="https://myaccount.google.com/permissions"
              rel="noreferrer"
              target="_blank"
            >
              myaccount.google.com/permissions
            </a>
            .
          </p>

          <h2>8. Contact</h2>
          <p>
            Codevertex IT Solutions
            <br />
            Email: <a href="mailto:privacy@codevertexitsolutions.com">privacy@codevertexitsolutions.com</a>
          </p>

          <h2>9. Changes to this policy</h2>
          <p>
            We will post any updates on this page and adjust the effective date above.
            Material changes will also be notified by email to active account holders.
          </p>
        </article>

        <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <Link href="/" className="hover:text-primary">← Back to home</Link>
          <span className="mx-3">·</span>
          <Link href="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
        </div>
      </section>
    </main>
  );
}
