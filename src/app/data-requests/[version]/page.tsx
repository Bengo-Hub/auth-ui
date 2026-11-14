import { PolicyVersionPage } from '@/components/legal/PolicyPage';

export const revalidate = 300;

export default async function DataRequestsVersionPage({ params }: { params: Promise<{ version: string }> }) {
  return <PolicyVersionPage slug="data-requests" rawVersion={(await params).version} />;
}
