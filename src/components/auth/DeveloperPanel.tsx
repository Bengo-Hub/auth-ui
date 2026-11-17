'use client';

import { BellRing, BookOpen, Check, Copy, KeyRound, Receipt, ShieldCheck } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';

import { API_DOCS_URL } from '@/lib/enquiry';
import { cn } from '@/lib/utils';

const TOKEN_URL = 'https://sso.codevertexafrica.com/api/v1/token';

const TOKEN_CALL = `curl -X POST ${TOKEN_URL} \\
  -u "$CONSUMER_KEY:$CONSUMER_SECRET" \\
  -d grant_type=client_credentials`;

const BUILD = [
  { icon: Receipt, title: 'KRA eTIMS and payments', body: 'Send invoices to KRA and take M-Pesa and card payments.' },
  { icon: BellRing, title: 'Notifications', body: 'SMS, WhatsApp, email and push from one API.' },
  { icon: KeyRound, title: 'Sign in with Codevertex', body: 'People use their Codevertex account in your app.' },
];

const ACCESS = [
  'Request access. Your sandbox is free.',
  'Your consumer key arrives by email. Generate the secret in the console; it is shown once.',
  'Trade the key and secret for a token that lasts 15 minutes.',
  'Request go-live when your sandbox tests pass. We review it and switch you to production.',
];

const cmd = 'text-[hsl(289_85%_80%)]';
const str = 'text-[hsl(36_92%_70%)]';
const flag = 'text-console-muted';

/** The token call, coloured by hand: three lines do not need a highlighter. */
const LINES: ReactNode[] = [
  <><span className={cmd}>curl</span> <span className={flag}>-X</span> POST <span className={str}>{TOKEN_URL}</span> <span className={flag}>\</span></>,
  <>{'  '}<span className={flag}>-u</span> <span className={str}>&quot;$CONSUMER_KEY:$CONSUMER_SECRET&quot;</span> <span className={flag}>\</span></>,
  <>{'  '}<span className={flag}>-d</span> grant_type=client_credentials</>,
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-console-muted transition-colors hover:bg-white/10 hover:text-console-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

/**
 * The panel beside the developer sign-in and access request forms: what can be built, how access
 * works, and the token call itself. Business tiles and copy stay on the business sign-in pages.
 */
export function DeveloperPanel({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Codevertex APIs for developers"
      className={cn(
        'relative flex h-full flex-col gap-9 overflow-hidden rounded-[2rem] bg-console p-7 text-console-foreground sm:p-10 xl:p-12',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/35 blur-3xl" aria-hidden />

      <div className="relative max-w-xl space-y-4">
        <h2 className="font-serif-soft text-3xl leading-[1.1] xl:text-[2.6rem]">
          Connect your system to KRA eTIMS, payments and messaging.
        </h2>
        <p className="text-[0.95rem] leading-relaxed text-console-muted">
          Each app gets its own consumer key and secret. Build against a free sandbox, then go live once we have reviewed your integration.
        </p>
      </div>

      <figure className="relative overflow-hidden rounded-2xl bg-console-raised ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 py-1.5 pl-4 pr-1.5">
          <span className="font-mono text-xs text-console-muted">Get an access token</span>
          <CopyButton text={TOKEN_CALL} />
        </div>
        <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.8rem] leading-6" aria-label="Example request for an access token">
          <code>
            {LINES.map((line, i) => (
              <span key={i} className="block animate-tile-in" style={{ '--tile-delay': `${200 + i * 140}ms` } as CSSProperties}>
                {line}
              </span>
            ))}
          </code>
        </pre>
        <figcaption className="border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-console-muted">
          You get a Bearer token that lasts 15 minutes. Send it as <code className="font-mono text-console-foreground">Authorization: Bearer</code> on each call.
        </figcaption>
      </figure>

      <div className="relative grid gap-9 xl:grid-cols-2">
        <section aria-labelledby="dev-build">
          <h3 id="dev-build" className="text-sm font-semibold">What you can build</h3>
          <ul className="mt-4 space-y-4">
            {BUILD.map((b) => (
              <li key={b.title} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">
                  <b.icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">{b.title}</p>
                  <p className="mt-0.5 text-sm leading-snug text-console-muted">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="dev-access">
          <h3 id="dev-access" className="text-sm font-semibold">How access works</h3>
          <ol className="mt-4 space-y-3.5">
            {ACCESS.map((line, i) => (
              <li key={line} className="flex gap-3 text-sm leading-snug">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/25 text-xs font-semibold tabular-nums" aria-hidden>
                  {i + 1}
                </span>
                <span className="text-console-muted">{line}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="relative mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-sm">
        <a
          href={API_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-medium transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <BookOpen className="h-4 w-4" aria-hidden /> Read the eTIMS API guide
        </a>
        <p className="inline-flex items-center gap-1.5 text-xs text-console-muted">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Developer accounts sign in with an authenticator app
        </p>
      </div>
    </aside>
  );
}
