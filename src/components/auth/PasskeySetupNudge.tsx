'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useBiometric } from '@/hooks/use-biometric';
import { Fingerprint, KeyRound, Loader2 } from 'lucide-react';
import { useCallback } from 'react';

const DISMISS_KEY = 'passkey-nudge-dismissed';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function wasDismissedRecently(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = parseInt(raw, 10);
  return !Number.isNaN(ts) && Date.now() - ts < DISMISS_TTL_MS;
}

interface PasskeySetupNudgeProps {
  open: boolean;
  accessToken: string;
  onClose: () => void;
}

export function PasskeySetupNudge({ open, accessToken, onClose }: PasskeySetupNudgeProps) {
  const { toast } = useToast();
  const { register, isLoading } = useBiometric({
    onError: (err) => {
      toast({ title: 'Setup failed', description: err, variant: 'destructive' });
    },
  });

  const handleSetup = useCallback(async () => {
    const deviceName =
      /iPhone|iPad/.test(navigator.userAgent)
        ? 'iPhone'
        : /Android/.test(navigator.userAgent)
        ? 'Android'
        : navigator.platform || 'This device';

    const ok = await register(accessToken, deviceName);
    if (ok) {
      toast({ title: 'Passkey registered', description: 'You can now sign in instantly next time.' });
      onClose();
    }
  }, [accessToken, register, toast, onClose]);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader className="items-center text-center gap-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="md:hidden"><Fingerprint className="h-7 w-7 text-primary" /></span>
            <span className="hidden md:inline"><KeyRound className="h-7 w-7 text-primary" /></span>
          </div>
          <DialogTitle className="text-xl font-black tracking-tight">
            <span className="md:hidden">Set up fingerprint login</span>
            <span className="hidden md:inline">Set up passkey</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Sign in instantly next time — no password needed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handleSetup}
            disabled={isLoading}
            className="h-12 rounded-xl font-bold"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Setting up…</>
            ) : (
              <>
                <span className="md:hidden"><Fingerprint className="h-4 w-4 mr-2" /></span>
                <span className="hidden md:inline"><KeyRound className="h-4 w-4 mr-2" /></span>
                Set up now
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={handleDismiss} disabled={isLoading} className="h-10 rounded-xl text-slate-500">
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { wasDismissedRecently };
