import axios from 'axios';

const SUBSCRIPTION_API_BASE = 'https://pricingapi.codevertexitsolutions.com/api/v1';

export interface ServiceSubscriptionEntry {
  service_tag: string;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'NONE';
  plan_code?: string;
  plan_name?: string;
  current_period_end?: string;
}

export interface ServiceSubscriptionsResult {
  tenant_id: string;
  subscription?: {
    id: string;
    plan_code: string;
    plan_name: string;
    status: string;
    current_period_end: string;
  };
  services: ServiceSubscriptionEntry[];
}

export interface Plan {
  id: string;
  ID?: string;
  plan_code: string;
  PlanCode?: string;
  name: string;
  Name?: string;
  description: string;
  Description?: string;
  billing_cycle: string;
  BillingCycle?: string;
  base_price: number;
  BasePrice?: number;
  currency: string;
  Currency?: string;
  is_active: boolean;
  IsActive?: boolean;
  tier_order: number;
  TierOrder?: number;
  plan_type?: string;
  features?: PlanFeature[];
  Features?: PlanFeature[];
  TierLimits?: Record<string, number>;
}

export interface PlanFeature {
  id: string;
  name: string;
  code: string;
  is_included: boolean;
}

/** Normalize PascalCase API response to snake_case Plan interface */
function normalizePlan(p: any): Plan {
  return {
    id: p.id ?? p.ID ?? '',
    plan_code: p.plan_code ?? p.PlanCode ?? '',
    name: p.name ?? p.Name ?? '',
    description: p.description ?? p.Description ?? '',
    billing_cycle: p.billing_cycle ?? p.BillingCycle ?? 'MONTHLY',
    base_price: p.base_price ?? p.BasePrice ?? 0,
    currency: p.currency ?? p.Currency ?? 'KES',
    is_active: p.is_active ?? p.IsActive ?? true,
    tier_order: p.tier_order ?? p.TierOrder ?? 0,
    features: (p.features ?? p.Features ?? []).map((f: any) => ({
      id: f.id ?? f.ID ?? '',
      name: f.name ?? f.Name ?? f.FeatureCode ?? f.feature_code ?? '',
      code: f.code ?? f.FeatureCode ?? f.feature_code ?? '',
      is_included: f.is_included ?? f.IsIncluded ?? true,
    })),
    TierLimits: p.TierLimits ?? p.tier_limits,
  };
}

export const subscriptionApi = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await axios.get(`${SUBSCRIPTION_API_BASE}/plans`);
    // API returns {plans: [...], count: N} — unwrap to get the array
    const raw = response.data;
    const arr: any[] = Array.isArray(raw) ? raw : (raw.plans ?? []);
    return arr.map(normalizePlan);
  },

  getPlanByCode: async (code: string): Promise<Plan> => {
    const response = await axios.get(`${SUBSCRIPTION_API_BASE}/plans/code/${code}`);
    const data = response.data;
    return normalizePlan(data.plan ?? data);
  },

  getPlansByService: async (serviceTag: string): Promise<Plan[]> => {
    const response = await axios.get(`${SUBSCRIPTION_API_BASE}/plans`, {
      params: { service: serviceTag, active: 'true' },
    });
    const raw = response.data;
    const arr: any[] = Array.isArray(raw) ? raw : (raw.plans ?? []);
    return arr.map(normalizePlan).sort((a, b) => a.tier_order - b.tier_order);
  },

  getServiceSubscriptions: async (tenantId: string): Promise<ServiceSubscriptionsResult> => {
    const response = await axios.get(`/api/subscriptions`, {
      params: { tenant_id: tenantId },
    });
    return response.data;
  },
};
