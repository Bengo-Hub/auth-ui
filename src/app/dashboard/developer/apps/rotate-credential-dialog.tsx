'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DEFAULT_GRACE_HOURS } from '@/lib/credential-rotation';
import type { App } from './apps-columns';

export type RotationKind = 'secret' | 'key';

export interface RotationTarget {
  app: App;
  kind: RotationKind;
}

interface Props {
  target: RotationTarget | null;
  busy: boolean;
  onConfirm: (target: RotationTarget, keepOld: boolean) => void;
  onCancel: () => void;
}

/**
 * Asks how a credential is replaced: keep the old one working for 24 hours while the new one
 * is rolled out (the default), or stop it now, for example after a leak.
 */
export function RotateCredentialDialog({ target, busy, onConfirm, onCancel }: Props) {
  const [keepOld, setKeepOld] = useState(true);
  useEffect(() => { if (target) setKeepOld(true); }, [target]);

  const noun = target?.kind === 'secret' ? 'consumer secret' : 'API key';
  return (
    <Dialog open={target !== null} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New {noun} for {target?.app.name}</DialogTitle>
          <DialogDescription>
            The new {noun} is shown once. Choose what happens to the current one.
          </DialogDescription>
        </DialogHeader>
        <fieldset className="space-y-3">
          <legend className="sr-only">What happens to the current {noun}</legend>
          <label className={`flex gap-3 p-4 rounded-2xl border cursor-pointer ${keepOld ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}>
            <input type="radio" name="rotation" className="mt-1" checked={keepOld} onChange={() => setKeepOld(true)} />
            <span>
              <span className="block font-bold">Keep the old {noun} working for {DEFAULT_GRACE_HOURS} hours</span>
              <span className="block text-sm text-muted-foreground">
                Time to put the new one in place without downtime. After {DEFAULT_GRACE_HOURS} hours the old one stops working.
                {target?.kind === 'secret' && ' Access tokens already issued run out on their own within 15 minutes.'}
              </span>
            </span>
          </label>
          <label className={`flex gap-3 p-4 rounded-2xl border cursor-pointer ${!keepOld ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
            <input type="radio" name="rotation" className="mt-1" checked={!keepOld} onChange={() => setKeepOld(false)} />
            <span>
              <span className="block font-bold">Stop it now</span>
              <span className="block text-sm text-muted-foreground">
                Use this if the {noun} may have leaked. Anything still using it fails straight away
                {target?.kind === 'secret' ? ', and so do access tokens already issued with it.' : '.'}
              </span>
            </span>
          </label>
        </fieldset>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button
            variant={keepOld ? 'default' : 'destructive'}
            disabled={busy || target === null}
            onClick={() => target && onConfirm(target, keepOld)}
          >
            {busy ? 'Working…' : `Issue new ${noun}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
