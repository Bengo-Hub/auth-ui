// Shared types/helpers used by more than one My Organization tab.

export interface TenantOutlet {
  id: string;
  name: string;
  code?: string;
  use_case?: string;
  address?: string | null;
  is_hq?: boolean;
  status?: string;
  metadata?: Record<string, unknown> | null;
}

// Outlets are served by auth-api at /api/v1/tenants/{slug}/outlets. Centralize the
// path so the Team assign-outlet dropdown and the Branches CRUD tab never drift.
export const outletsPath = (slug: string) => `/api/v1/tenants/${slug}/outlets`;

// Front-end plans portal (subscriptions-ui), NOT the API. Shared between billing-tab.tsx
// and billing-plan-card.tsx.
export const SUBSCRIPTIONS_BASE = 'https://pricing.codevertexafrica.com';
