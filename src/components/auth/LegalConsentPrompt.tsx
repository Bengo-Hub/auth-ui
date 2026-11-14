'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { formatLegalDate, LEGAL_POLICIES, type LegalDocumentVersion } from '@/lib/legal-documents';

interface PendingConsents {
  required: LegalDocumentVersion[];
  upcoming: LegalDocumentVersion[];
}

function policyFor(docType: string) {
  return LEGAL_POLICIES.find((p) => p.docType === docType);
}

/**
 * Asks the signed-in user to accept a material change to the Terms of Service or the Privacy
 * Policy (owner 2026-11-15). auth-api decides what is owed (/auth/legal/pending): a material
 * version in force they have not accepted is required; one announced for later is shown as a
 * heads-up. Accepting records a per-user acceptance of that version.
 */
export function LegalConsentPrompt() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { data } = useQuery({
    queryKey: ['legal-pending-consents'],
    queryFn: async () => (await apiClient.get<PendingConsents>('/api/v1/auth/legal/pending')).data,
    staleTime: 10 * 60_000,
    retry: false,
  });

  const required = data?.required ?? [];
  const upcoming = data?.upcoming ?? [];
  if (required.length === 0 && upcoming.length === 0) return null;

  async function acceptAll(docs: LegalDocumentVersion[]) {
    setBusy(true);
    setError('');
    try {
      for (const d of docs) {
        await apiClient.post('/api/v1/auth/legal/accept', { doc_type: d.doc_type, doc_version: d.version });
      }
      await queryClient.invalidateQueries({ queryKey: ['legal-pending-consents'] });
    } catch {
      setError('That did not go through. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const docs = required.length > 0 ? required : upcoming;
  const isRequired = required.length > 0;

  return (
    <div
      role="region"
      aria-label="Updated terms"
      className={`mx-4 mt-4 rounded-2xl border p-4 text-sm ${
        isRequired ? 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10' : 'border-primary/30 bg-primary/5'
      }`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {isRequired ? 'We have updated our terms. Please review and accept them.' : 'Our terms are changing.'}
          </p>
          <ul className="mt-1 space-y-1">
            {docs.map((d) => {
              const p = policyFor(d.doc_type);
              return (
                <li key={`${d.doc_type}-${d.version}`}>
                  <Link
                    href={p ? `${p.path}/${encodeURIComponent(d.version)}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {d.title || p?.title || d.doc_type}, version {d.version}
                  </Link>{' '}
                  {d.in_force === false ? `applies from ${formatLegalDate(d.effective_at)}` : ''}
                  {d.summary ? <span className="text-muted-foreground">. {d.summary}</span> : null}
                </li>
              );
            })}
          </ul>
          {error && (
            <p role="alert" className="mt-1 text-red-600">
              {error}
            </p>
          )}
        </div>
        <Button size="sm" onClick={() => acceptAll(docs)} disabled={busy}>
          {busy ? 'Saving...' : isRequired ? 'I accept' : 'Accept now'}
        </Button>
      </div>
    </div>
  );
}
