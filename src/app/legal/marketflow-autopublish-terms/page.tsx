import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import {
  MARKETFLOW_AUTOPUBLISH_TERMS,
  formatLegalDate,
  getLegalDocument,
  listLegalDocumentVersions,
} from '@/lib/legal-documents';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'MarketFlow Autopilot Terms | Codevertex Africa Limited',
  description:
    'Terms for MarketFlow Autopilot publishing your ad videos by itself after a veto window, unless you cancel them first.',
};

const BASE = '/legal/marketflow-autopublish-terms';
const TITLE = 'MarketFlow Autopilot Terms';
const BADGE = 'MarketFlow';

/**
 * The version in force, read from auth-api. During a new version's notice period the page says
 * when it applies and links to it; before any version is published it says so.
 */
export default async function MarketFlowAutopublishTermsPage() {
  const [state, versions] = await Promise.all([
    getLegalDocument(MARKETFLOW_AUTOPUBLISH_TERMS),
    listLegalDocumentVersions(MARKETFLOW_AUTOPUBLISH_TERMS),
  ]);

  if (state.kind !== 'published') {
    return (
      <LegalDocumentView
        title={TITLE}
        badge={BADGE}
        basePath={BASE}
        doc={null}
        versions={[]}
        empty={
          state.kind === 'not_published' ? (
            <>
              <p className="font-semibold">These terms are not published yet.</p>
              <p className="mt-2">
                They will appear here once they are final. Our{' '}
                <Link href="/terms-of-service" className="text-primary underline">Terms of Service</Link> apply to all
                our services, MarketFlow included.
              </p>
            </>
          ) : (
            <p>These terms could not be loaded just now. Please try again in a few minutes.</p>
          )
        }
      />
    );
  }

  const { current, upcoming } = state;
  const shown = current ?? upcoming;
  const notice = upcoming ? (
    current ? (
      <p>
        A new version ({upcoming.version}) applies from <strong>{formatLegalDate(upcoming.effective_at)}</strong>.{' '}
        <Link href={`${BASE}/${encodeURIComponent(upcoming.version)}`} className="text-primary underline">
          Read the new version
        </Link>
        . Accept it in MarketFlow before then to keep Autopilot posting by itself.
      </p>
    ) : (
      <p>
        These terms apply from <strong>{formatLegalDate(upcoming.effective_at)}</strong>.
      </p>
    )
  ) : undefined;

  return <LegalDocumentView title={TITLE} badge={BADGE} basePath={BASE} doc={shown} notice={notice} versions={versions} />;
}
