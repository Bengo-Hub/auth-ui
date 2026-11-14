import { PolicyVersionPage } from '@/components/legal/PolicyPage';

export const revalidate = 300;

export default async function TermsOfServiceVersionPage({ params }: { params: Promise<{ version: string }> }) {
  return <PolicyVersionPage slug="terms-of-service" rawVersion={(await params).version} />;
}
