'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, FileText, RefreshCw, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  LEGAL_DOC_LABELS,
  LEGAL_PUBLIC_PATHS,
  getLegalOverview,
  type LegalDocKind,
  type LegalOverviewEntry,
} from '@/lib/legal-admin';
import { formatLegalDate } from '@/lib/legal-documents';
import { LegalEditor } from './legal-editor';

const KIND_LABEL: Record<LegalDocKind, string> = {
  user_consent: 'Users accept',
  notice: 'Notice',
  product_terms: 'Tenants accept',
  agreement: 'Agreement',
};

/**
 * Legal documents (owner 2026-11-15, modelled on Hadia's legal console): every platform policy and
 * agreement with its version in force, the upcoming one, the open draft and the history. The
 * editor saves drafts and publishes them; auth-api keeps every published version unchanged.
 */
export default function LegalDocumentsPage() {
  const { isPlatformOwner, isLoading: authLoading } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['platform-legal-overview'],
    queryFn: getLegalOverview,
    enabled: isPlatformOwner,
    staleTime: 30_000,
  });

  if (authLoading) return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  if (!isPlatformOwner) {
    return <p className="p-6 text-sm text-muted-foreground">Only platform admins can manage legal documents.</p>;
  }

  const entry = data?.find((d) => d.doc_type === selected) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Scale className="h-6 w-6 text-primary" aria-hidden /> Legal documents
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Edit a draft, preview it and publish it with its effective date. Published versions never change; a change is a
            new version. A material change to the Terms of Service or the Privacy Policy asks every user to accept it again.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden /> Refresh
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading documents...</p>}
      {isError && (
        <p role="alert" className="text-sm text-red-600">
          The documents could not be loaded. Try again in a moment.
        </p>
      )}

      {entry ? (
        <LegalEditor
          key={entry.doc_type}
          entry={entry}
          onBack={() => setSelected(null)}
          onChanged={() => refetch()}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {(data ?? []).map((d) => (
            <li key={d.doc_type}>
              <DocumentCard entry={d} onOpen={() => setSelected(d.doc_type)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DocumentCard({ entry, onOpen }: { entry: LegalOverviewEntry; onOpen: () => void }) {
  const label = LEGAL_DOC_LABELS[entry.doc_type] ?? entry.doc_type;
  const publicPath = LEGAL_PUBLIC_PATHS[entry.doc_type];
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <FileText className="h-4 w-4 text-primary" aria-hidden /> {label}
        </h2>
        <Badge variant="soft">{KIND_LABEL[entry.kind]}</Badge>
      </div>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-muted-foreground">In force</dt>
          <dd>
            {entry.current
              ? `Version ${entry.current.version}, since ${formatLegalDate(entry.current.effective_at)}`
              : publicPath && entry.effective_dated
                ? 'Built-in page text'
                : 'None'}
          </dd>
        </div>
        {entry.upcoming && (
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-muted-foreground">Upcoming</dt>
            <dd>
              Version {entry.upcoming.version} from {formatLegalDate(entry.upcoming.effective_at)}
              {entry.upcoming.material ? ' (users accept again)' : ''}
            </dd>
          </div>
        )}
        {entry.draft && (
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-muted-foreground">Draft</dt>
            <dd>
              Version {entry.draft.version}
              {entry.draft.updated_by ? `, last edited by ${entry.draft.updated_by}` : ''}
            </dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 text-muted-foreground">Versions</dt>
          <dd>{entry.versions.filter((v) => v.status === 'published').length} published</dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Button size="sm" onClick={onOpen}>
          {entry.draft ? 'Edit draft' : 'Manage'}
        </Button>
        {publicPath && (
          <Button size="sm" variant="ghost" asChild>
            <Link href={publicPath} target="_blank" rel="noopener noreferrer">
              Public page <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
