'use client';

import { Image as ImageIcon } from 'lucide-react';

export function LivePreview({
  orgName,
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
}: {
  orgName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}) {
  return (
    <div className="sticky top-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2">
          Live Preview
        </span>
      </div>
      <div className="flex h-52">
        <div
          className="w-44 flex flex-col items-center py-5 px-3 gap-3 shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo"
              className="h-8 w-auto object-contain rounded"
            />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-white/70" />
            </div>
          )}
          <span className="text-white/90 text-xs font-bold truncate max-w-full">
            {orgName}
          </span>
          <div className="w-full space-y-1.5 mt-1">
            <div className="h-7 rounded-lg bg-white/15 px-2 flex items-center">
              <span className="text-white/80 text-[10px] font-medium">
                Dashboard
              </span>
            </div>
            <div
              className="h-7 rounded-lg px-2 flex items-center"
              style={{ backgroundColor: accentColor + '44' }}
            >
              <span className="text-white text-[10px] font-bold">Orders</span>
            </div>
            <div className="h-7 rounded-lg bg-white/10 px-2 flex items-center">
              <span className="text-white/60 text-[10px] font-medium">
                Settings
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-6 w-16 rounded-md"
              style={{ backgroundColor: primaryColor }}
            />
            <div
              className="h-6 w-12 rounded-md opacity-40"
              style={{ backgroundColor: secondaryColor }}
            />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-2.5 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="mt-3 flex gap-2">
            <div
              className="h-7 px-3 rounded-lg text-white text-[10px] font-bold flex items-center"
              style={{ backgroundColor: accentColor }}
            >
              Action
            </div>
            <div
              className="h-7 px-3 rounded-lg border text-[10px] font-bold flex items-center"
              style={{ borderColor: secondaryColor, color: secondaryColor }}
            >
              Secondary
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
