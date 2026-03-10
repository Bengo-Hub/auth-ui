import IntegrationsClient from './client';

export const metadata = {
  title: 'Integrations | Bengobox Admin',
  description: 'Manage third-party integrations, OAuth, and external services securely.',
};

export default function IntegrationsPage() {
  return <IntegrationsClient />;
}
