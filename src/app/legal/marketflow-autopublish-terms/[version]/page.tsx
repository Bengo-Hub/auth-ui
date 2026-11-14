import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import {
  MARKETFLOW_AUTOPUBLISH_TERMS,
  formatLegalDate,
  getLegalDocument,
  getLegalDocumentVersion,
  listLegalDocumentVersions,
} from '@/lib/legal-documents';

export const revalidate = 300;

const BASE = '/legal/marketflow-autopublish-terms';
const TITLE = 'MarketFlow Autopilot Terms';
// Version strings are short (auth-api allows up to 32 characters).
const VERSION_RE = /^[A-Za-z0-9._-]{1,32}$/;

type Params = { params: Promise<{ version: string }> };

function decodeVersion(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return '';
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const version = decodeVersion((await params).version);
  return {
    title: `MarketFlow Autopilot Terms, version ${VERSION_RE.test(version) ? version : ''} | Codevertex Africa Limited`,
    description: 'One published version of the MarketFlow Autopilot auto-publish terms.',
  };
}

/** One version, including an upcoming one during its notice period and superseded ones. */
export default async function MarketFlowAutopublishTermsVersionPage({ params }: Params) {
  const version = decodeVersion((await params).version);
  if (!VERSION_RE.test(version)) notFound();

  const [state, timeline, versions] = await Promise.all([
    getLegalDocumentVersion(MARKETFLOW_AUTOPUBLISH_TERMS, version),
    getLegalDocument(MARKETFLOW_AUTOPUBLISH_TERMS),
    listLegalDocumentVersions(MARKETFLOW_AUTOPUBLISH_TERMS),
  ]);
  if (state.kind === 'not_found') notFound();

  if (state.kind === 'unavailable') {
    return (
      <LegalDocumentView
        title={TITLE}
        badge="MarketFlow"
        basePath={BASE}
        doc={null}
        versions={[]}
        empty={<p>This version could not be loaded just now. Please try again in a few minutes.</p>}
      />
    );
  }

  const doc = state.doc;
  const current = timeline.kind === 'published' ? timeline.current : null;
  let notice: ReactNode = null;
  if (doc.in_force === false) {
    notice = (
      <p>
        This version applies from <strong>{formatLegalDate(doc.effective_at)}</strong>.
        {current && (
          <>
            {' '}Until then{' '}
            <Link href={BASE} className="text-primary underline">version {current.version}</Link> applies.
          </>
        )}
      </p>
    );
  } else if (current && current.version !== doc.version) {
    notice = (
      <p>
        This version has been replaced.{' '}
        <Link href={BASE} className="text-primary underline">Read the version in effect ({current.version})</Link>.
      </p>
    );
  }

  return <LegalDocumentView title={TITLE} badge="MarketFlow" basePath={BASE} doc={doc} notice={notice} versions={versions} />;
}
