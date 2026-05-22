'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import { CheckCircle, Fingerprint, Loader2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const SSO_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sso.codevertexitsolutions.com';

interface Credential {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
}

function base64URLToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buffer;
}

function bufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function credentialToJSON(credential: PublicKeyCredential): Record<string, unknown> {
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64URL(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64URL(response.clientDataJSON),
      attestationObject: bufferToBase64URL(response.attestationObject),
    },
  };
}

function timeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(past);
}

export function PasskeysSection() {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isSupported =
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    typeof navigator.credentials?.create === 'function';

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/auth/webauthn/credentials');
      setCredentials((res as any).data?.credentials ?? []);
    } catch {
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

  const handleRegister = async () => {
    if (!isSupported) {
      toast({ title: 'Not supported', description: 'This device does not support passkeys.', variant: 'destructive' });
      return;
    }
    setRegistering(true);
    try {
      const beginRes = await fetch(`${SSO_BASE_URL}/api/v1/auth/webauthn/register/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!beginRes.ok) throw new Error('Failed to start passkey registration');
      const sessionKey = beginRes.headers.get('X-WebAuthn-Session') ?? '';
      const options = await beginRes.json();
      options.publicKey.challenge = base64URLToBuffer(options.publicKey.challenge);
      options.publicKey.user.id = base64URLToBuffer(options.publicKey.user.id);
      if (options.publicKey.excludeCredentials) {
        options.publicKey.excludeCredentials = options.publicKey.excludeCredentials.map(
          (c: { id: string; type: string }) => ({ ...c, id: base64URLToBuffer(c.id) })
        );
      }
      const credential = await navigator.credentials.create(options) as PublicKeyCredential;
      if (!credential) throw new Error('Passkey creation cancelled');

      const finishRes = await fetch(`${SSO_BASE_URL}/api/v1/auth/webauthn/register/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WebAuthn-Session': sessionKey },
        credentials: 'include',
        body: JSON.stringify(credentialToJSON(credential)),
      });
      if (!finishRes.ok) throw new Error('Failed to complete passkey registration');

      localStorage.setItem('pwa_biometric_registered', 'true');
      toast({ title: 'Passkey registered', description: 'You can now sign in with your fingerprint or face.' });
      fetchCredentials();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast({ title: 'Registration failed', description: msg, variant: 'destructive' });
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await apiClient.delete(`/api/v1/auth/webauthn/credentials/${id}`);
      const remaining = credentials.filter((c) => c.id !== id);
      setCredentials(remaining);
      if (remaining.length === 0) localStorage.removeItem('pwa_biometric_registered');
      toast({ title: 'Passkey removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to remove passkey.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Passkeys &amp; Biometrics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Sign in instantly with your fingerprint, face, or device PIN.
          </p>
        </div>
        {isSupported && (
          <Button
            onClick={handleRegister}
            disabled={registering}
            className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shrink-0"
          >
            {registering ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Registering…</>
            ) : (
              <><Fingerprint className="h-4 w-4 mr-2" />Add Passkey</>
            )}
          </Button>
        )}
      </div>

      {!isSupported && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
          Passkeys are not supported on this device or browser.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : credentials.length === 0 ? (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/30 text-sm text-amber-700 dark:text-amber-400">
          No passkeys registered. Add one above to enable biometric sign-in.
        </div>
      ) : (
        <div className="space-y-2">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {cred.name || 'Passkey'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Added {timeAgo(cred.created_at)}
                    {cred.last_used_at && ` · Last used ${timeAgo(cred.last_used_at)}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={deletingId === cred.id}
                onClick={() => handleDelete(cred.id)}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl font-bold"
              >
                {deletingId === cred.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
