'use client';

import IntegrationsClient from '@/app/dashboard/integrations/client';

// Reuse the main integrations page component to avoid duplicate/broken implementation.
// The Settings > Integrations tab was previously a separate implementation that sent
// PUT /api/v1/admin/integrations/{id} (wrong — backend only has /status endpoint),
// causing 405 errors. Now both views share the same working component.
export function IntegrationsTab() {
  return <IntegrationsClient />;
}
