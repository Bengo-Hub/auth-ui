'use client';

import { Check, Copy, Lock } from 'lucide-react';
import { useState } from 'react';

// Shared visual primitives for every per-service docs page (Phase 12) —
// extracted from the original single auth-api-only docs/page.tsx so
// treasury-api (and future services) reuse the exact same components
// instead of a second copy.

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function CodeBlock({ code, language = 'bash', title }: { code: string; language?: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 p-4 sm:p-6 overflow-x-auto text-sm font-mono leading-relaxed">
          <code className="block whitespace-pre">{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary transition-all shadow-sm border border-slate-200 dark:border-slate-600"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export function EndpointCard({
  method,
  path,
  description,
  auth = true,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth?: boolean;
}) {
  const methodColors = {
    GET: 'bg-emerald-500 dark:bg-emerald-600',
    POST: 'bg-sky-500 dark:bg-sky-600',
    PUT: 'bg-amber-500 dark:bg-amber-600',
    DELETE: 'bg-rose-500 dark:bg-rose-600',
    PATCH: 'bg-violet-500 dark:bg-violet-600',
  };

  return (
    <div className="group p-4 sm:p-5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
        <span className={`${methodColors[method]} text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm`}>{method}</span>
        <code className="text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 break-all">{path}</code>
        {auth && (
          <span className="ml-auto flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline">Auth</span>
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

export function SectionHeader({ icon: Icon, title, badge }: { icon: React.ElementType; title: string; badge?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      {badge && (
        <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">{badge}</span>
      )}
    </div>
  );
}
