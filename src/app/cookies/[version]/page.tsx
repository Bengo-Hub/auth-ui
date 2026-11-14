import { PolicyVersionPage } from '@/components/legal/PolicyPage';

export const revalidate = 300;

export default async function CookiePolicyVersionPage({ params }: { params: Promise<{ version: string }> }) {
  return <PolicyVersionPage slug="cookie-policy" rawVersion={(await params).version} />;
}
