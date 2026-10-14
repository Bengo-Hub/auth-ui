import {
  ArrowUpRight,
  BellRing,
  Fingerprint,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { AppLauncher } from '@/components/landing/AppLauncher';
import { BooksScene, BrandPreview, OrderScene, PosScene, StockScene } from '@/components/landing/AppScenes';
import { HeroActions } from '@/components/landing/HeroActions';
import { ServiceDirectory } from '@/components/landing/ServiceDirectory';
import { Reveal } from '@/components/landing/reveal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const rise = (ms: number) => ({ '--rise-delay': `${ms}ms` }) as CSSProperties;

const SCENES = [
  { Scene: PosScene, title: 'Point of sale that keeps up', body: 'Tills, tabs and receipts for shops, cafes and restaurants. Payments by M-Pesa, cash or card land in the books as they happen.', span: 'lg:col-span-7' },
  { Scene: OrderScene, title: 'Your own ordering app', body: 'Customers order and track deliveries in an app that carries your name and colours, not ours.', span: 'lg:col-span-5' },
  { Scene: BooksScene, title: 'Books that reconcile themselves', body: 'Invoices, payments and accounts that match the till and the bank without anyone retyping a figure.', span: 'lg:col-span-5' },
  { Scene: StockScene, title: 'Stock you can trust', body: 'Counts, purchasing and reorder alerts across every outlet, tied to what the tills actually sold.', span: 'lg:col-span-7' },
];

const MORE = [
  { icon: Users, title: 'HR and payroll', body: 'People, leave and pay, with M-Pesa payouts.' },
  { icon: Truck, title: 'Logistics', body: 'Dispatch deliveries to riders who are online and nearby.' },
  { icon: BellRing, title: 'Messaging', body: 'Email, SMS and WhatsApp from one place, in your voice.' },
];

const PEOPLE = [
  { icon: Users, title: 'Business teams', body: 'Owners, managers and staff. Roles and outlets decide what each person sees in every app.' },
  { icon: ShoppingBag, title: 'Customers', body: 'They create an account under your name in your ordering app, and sign in to your branding.' },
  { icon: Truck, title: 'Riders', body: 'Apply from the rider app, get approved, then go online to take deliveries.' },
  { icon: GraduationCap, title: 'Students', body: 'Digitika learners get a login when their first payment clears: lessons, instalments and certificates.' },
  { icon: HeartHandshake, title: 'Parents', body: 'A guardian account follows each child’s payments and progress, read only.' },
];

const STEPS = [
  { n: '01', title: 'Create your organisation', body: 'Add your business name, colours and logo once. Every sign-in page and app carries them.' },
  { n: '02', title: 'Invite your team', body: 'Add people by email or phone and give each a role. They set their own password on first sign-in.' },
  { n: '03', title: 'Open any app', body: 'One account opens POS, stock, books and the rest, with no second login.' },
];

const SECURITY = [
  { icon: Fingerprint, title: 'Passkeys and authenticator codes', body: 'Sign in with a fingerprint or face, and add an authenticator code as a second step.' },
  { icon: KeyRound, title: 'Every session, in plain view', body: 'Your account lists where you are signed in so you can end anything you do not recognise.' },
  { icon: LogOut, title: 'Sign out once, everywhere', body: 'Signing out ends your session across every Codevertex app, not just the one you are using.' },
];

export default function LandingPage() {
  return (
    <div className="bg-paper">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-16">
        <div className="space-y-9">
          <div className="space-y-5">
            <p className="animate-rise text-sm font-medium tracking-wide text-gold" style={rise(0)}>One account for every Codevertex app</p>
            <h1 className="animate-rise font-serif-soft text-[2.7rem] leading-[1.04] text-foreground sm:text-6xl lg:text-[4.1rem]" style={rise(80)}>
              Sign in once. Run the whole business.
            </h1>
            <p className="animate-rise max-w-xl text-lg leading-relaxed text-muted-foreground" style={rise(160)}>
              Point of sale, stock, books, payroll and orders share one account, one team list and one set of permissions. Your customers sign in to your brand, not ours.
            </p>
          </div>
          <div className="animate-rise" style={rise(240)}><HeroActions /></div>
          <p className="animate-rise max-w-md text-sm leading-relaxed text-muted-foreground" style={rise(300)}>
            Built for shops, restaurants, schools, clinics and estates.
          </p>
        </div>

        <div className="relative animate-rise" style={rise(120)}>
          <div className="rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-lift sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-primary-foreground/70">Signed in</p>
                <p className="font-serif-soft text-2xl leading-tight">Your apps</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Passkey verified
              </span>
            </div>
            <AppLauncher />
          </div>
          <div className="absolute -bottom-7 -left-3 hidden w-60 rounded-3xl border-4 border-paper bg-card p-4 shadow-lift sm:block lg:-left-9">
            <p className="text-xs text-muted-foreground">Customer sign-in</p>
            <p className="font-serif-soft text-lg leading-snug">Urban Loft</p>
            <p className="text-xs text-muted-foreground">Their colours, their name, one account</p>
          </div>
        </div>
      </section>

      {/* Apps */}
      <section id="apps" className="scroll-mt-20 bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mb-12 max-w-2xl space-y-3">
            <h2 className="font-serif-soft text-4xl leading-tight sm:text-5xl">Everything a business runs on</h2>
            <p className="text-lg text-muted-foreground">Each app works on its own. They all share your people, your branches and your accounts.</p>
          </Reveal>
          <div className="grid gap-5 lg:grid-cols-12">
            {SCENES.map(({ Scene, title, body, span }, i) => (
              <Reveal key={title} delay={(i % 2) * 90} className={cn('group', span)}>
                <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-soft">
                  <div className="aspect-[16/10]"><Scene /></div>
                  <div className="p-6 sm:p-7">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-1.5 leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {MORE.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="flex h-full gap-4 rounded-[1.75rem] border border-border/60 bg-paper p-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-card text-primary shadow-soft"><f.icon className="h-5 w-5" aria-hidden /></span>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Every app, with its status */}
      <section id="directory" className="scroll-mt-20 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mb-10 max-w-2xl space-y-3">
            <h2 className="font-serif-soft text-4xl leading-tight sm:text-5xl">Open an app</h2>
            <p className="text-lg text-muted-foreground">Every Codevertex app on your account, with its live status. Pick one and you are signed in.</p>
          </Reveal>
          <ServiceDirectory />
        </div>
      </section>

      {/* Who signs in */}
      <section id="people" className="scroll-mt-20 bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-14 max-w-2xl space-y-3 text-center">
            <h2 className="font-serif-soft text-4xl leading-tight sm:text-5xl">The right door for everyone</h2>
            <p className="text-lg text-muted-foreground">Staff, customers, riders, students and parents each get their own kind of account, kept apart so nobody sees what is not theirs.</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {PEOPLE.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 90} className={i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'}>
                <div className="flex h-full gap-5 rounded-[1.5rem] border border-border/60 bg-card p-6 shadow-soft sm:p-7">
                  <span className="font-serif-soft text-3xl text-gold">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p.icon className="h-4 w-4 text-primary" aria-hidden />
                      <h3 className="text-lg font-semibold">{p.title}</h3>
                    </div>
                    <p className="mt-1.5 leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works + brand */}
      <section id="how" className="scroll-mt-20 py-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="space-y-10">
            <Reveal className="space-y-3">
              <h2 className="font-serif-soft text-4xl leading-tight sm:text-5xl">Set up in an afternoon</h2>
              <p className="text-lg text-muted-foreground">Your brand goes in once and shows up on every sign-in page and app.</p>
            </Reveal>
            <ol className="space-y-4">
              {STEPS.map((s, i) => (
                <Reveal as="li" key={s.n} delay={i * 90}>
                  <div className="flex gap-5 rounded-[1.5rem] border border-border/60 bg-paper p-5 sm:p-6">
                    <span className="font-serif-soft text-3xl text-gold">{s.n}</span>
                    <div>
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                      <p className="mt-1 leading-relaxed text-muted-foreground">{s.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
          <Reveal className="relative rounded-[2rem] bg-secondary/60 p-6 sm:p-9">
            <BrandPreview />
            <p className="mt-6 text-center text-sm text-muted-foreground">Two organisations, two sign-in pages, one platform.</p>
          </Reveal>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="scroll-mt-20 py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="rounded-[2rem] bg-primary p-8 text-primary-foreground sm:p-12">
              <h2 className="font-serif-soft max-w-xl text-3xl leading-tight sm:text-4xl">Keeping accounts safe is the job</h2>
              <div className="mt-9 grid gap-8 md:grid-cols-3">
                {SECURITY.map((f) => (
                  <div key={f.title} className="space-y-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15"><f.icon className="h-5 w-5" aria-hidden /></span>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="leading-relaxed text-primary-foreground/80">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Maskani */}
      <section className="pb-20 lg:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="grid overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-soft lg:grid-cols-2">
              <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
                <p className="text-sm font-medium tracking-wide text-gold">Also on your account</p>
                <h2 className="font-serif-soft text-3xl leading-tight sm:text-4xl">Running an estate?</h2>
                <p className="max-w-md leading-relaxed text-muted-foreground">
                  Maskani handles service charge, water, visitors and repairs, with a portal for every owner, using the same account you already have.
                </p>
                <a href="https://maskaniapp.codevertexafrica.com" className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
                  See Maskani <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
              <div className="photo-zoom relative min-h-64 lg:min-h-full">
                <Image src="/images/maskani/tower-green.webp" alt="A residential tower with planted balconies" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing */}
      <section className="pb-24">
        <Reveal className="mx-auto max-w-2xl space-y-6 px-4 text-center sm:px-6">
          <h2 className="font-serif-soft text-4xl leading-tight sm:text-5xl">Ready to open your account?</h2>
          <p className="text-lg text-muted-foreground">It takes a few minutes, and your team can start using it the same day.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base font-semibold"><Link href="/signup">Create an organisation</Link></Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 text-base font-semibold"><Link href="/login">Sign in</Link></Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
