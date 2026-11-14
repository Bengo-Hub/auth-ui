import { PolicyVersionPage } from '@/components/legal/PolicyPage';

export const revalidate = 300;

export default async function RefundPolicyVersionPage({ params }: { params: Promise<{ version: string }> }) {
  return <PolicyVersionPage slug="refund-policy" rawVersion={(await params).version} />;
}
