import { ShieldCheck } from 'lucide-react';

import { LAUNCHER_APPS } from '@/config/launcher-apps';

/**
 * A mind map of the platform: one account at the centre, every app branching off it. Drawn with SVG
 * lines under HTML nodes so it stays crisp, themes with the page and needs no image download.
 */
const NODES = LAUNCHER_APPS.slice(0, 8);

export function AccountMap() {
  const points = NODES.map((_, i) => {
    const angle = (Math.PI * 2 * i) / NODES.length - Math.PI / 2;
    return { x: 50 + Math.cos(angle) * 40, y: 50 + Math.sin(angle) * 38 };
  });
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]" role="img" aria-label="One Codevertex account opens every app">
      <div className="absolute inset-[6%] rounded-full border border-dashed border-primary/25" aria-hidden />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-primary/35" aria-hidden>
        {points.map((p, i) => (
          <line key={i} x1="50" y1="50" x2={p.x} y2={p.y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.6 1.6" />
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/2 grid h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-center text-primary-foreground shadow-lift">
        <div>
          <ShieldCheck className="mx-auto h-6 w-6" aria-hidden />
          <p className="mt-1 font-serif-soft text-sm leading-tight sm:text-base">One account</p>
        </div>
      </div>
      {NODES.map((app, i) => (
        <a
          key={app.id}
          href={`/login?return_to=${encodeURIComponent(app.url)}`}
          style={{ left: `${points[i].x}%`, top: `${points[i].y}%` }}
          className="absolute flex w-[22%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border border-border/60 bg-card p-2 text-center shadow-soft transition-transform hover:-translate-y-[55%]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-primary"><app.icon className="h-4 w-4" aria-hidden /></span>
          <span className="text-[0.65rem] font-semibold leading-tight sm:text-xs">{app.name}</span>
        </a>
      ))}
    </div>
  );
}
