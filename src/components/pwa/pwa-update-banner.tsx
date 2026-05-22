'use client';

import { usePWAUpdate } from '@/hooks/use-pwa-update';
import { X } from 'lucide-react';
import { useState } from 'react';

export function PWAUpdateBanner() {
  const { updateAvailable, applyUpdate } = usePWAUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-pink-600 px-4 py-3 text-white shadow-lg">
      <p className="text-sm font-medium">A new version is available.</p>
      <div className="flex items-center gap-2">
        <button
          onClick={applyUpdate}
          className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-pink-700 hover:bg-pink-50"
        >
          Update now
        </button>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
