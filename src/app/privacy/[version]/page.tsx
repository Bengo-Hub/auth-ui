import { PolicyVersionPage } from '@/components/legal/PolicyPage';

export const revalidate = 300;

export default async function PrivacyPolicyVersionPage({ params }: { params: Promise<{ version: string }> }) {
  return <PolicyVersionPage slug="privacy-policy" rawVersion={(await params).version} />;
}
