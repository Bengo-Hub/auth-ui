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
    bundle_code?: string;
    current_period_start?: string;
    current_period_end: string;
    features?: string[];
    limits?: Record<string, number>;
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
  service_tag?: string;
  ServiceTag?: string;
  features?: PlanFeature[];
  Features?: PlanFeature[];
  TierLimits?: Record<string, number>;
  tier_limits?: Record<string, number>;
}

export interface PlanFeature {
  id: string;
  name: string;
  code: string;
  is_included: boolean;
}

export interface ServiceChargePlan {
  id: string;
  code: string;
  name: string;
  description: string;
  charge_type: 'PERCENTAGE' | 'FIXED_PER_TRANSACTION' | 'TIERED';
  charge_value: number;
  currency: string;
  min_charge?: number;
  max_charge?: number;
  applicable_services: string[];
  is_active: boolean;
  is_default?: boolean;
}

/** Normalize API response to snake_case Plan interface.
 *  Handles all three casing conventions the subscriptions-api has used:
 *  camelCase (current default), snake_case, and PascalCase (legacy).
 */
function normalizePlan(p: any): Plan {
  const tierLimits = p.tierLimits ?? p.TierLimits ?? p.tier_limits_json ?? p.tier_limits;
  return {
    id: p.id ?? p.ID ?? '',
    plan_code: p.plan_code ?? p.planCode ?? p.PlanCode ?? '',
    name: p.name ?? p.Name ?? '',
    description: p.description ?? p.Description ?? '',
    billing_cycle: p.billing_cycle ?? p.billingCycle ?? p.BillingCycle ?? 'MONTHLY',
    base_price: p.base_price ?? p.basePrice ?? p.BasePrice ?? 0,
    currency: p.currency ?? p.Currency ?? 'KES',
    is_active: p.is_active ?? p.isActive ?? p.IsActive ?? true,
    tier_order: p.tier_order ?? p.tierOrder ?? p.TierOrder ?? 0,
    plan_type: p.plan_type ?? p.planType ?? p.PlanType,
    service_tag: p.service_tag ?? p.serviceTag ?? p.ServiceTag,
    features: (p.features ?? p.Features ?? []).map((f: any) => ({
      id: f.id ?? f.ID ?? '',
      name: f.name ?? f.Name ?? f.featureCode ?? f.FeatureCode ?? f.feature_code ?? '',
      code: f.code ?? f.featureCode ?? f.FeatureCode ?? f.feature_code ?? '',
      is_included: f.is_included ?? f.isIncluded ?? f.IsIncluded ?? true,
    })),
    TierLimits: tierLimits,
    tier_limits: tierLimits,
  };
}

export const subscriptionApi = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await axios.get(`${SUBSCRIPTION_API_BASE}/plans`);
    const raw = response.data;
    const arr: any[] = Array.isArray(raw) ? raw : (raw.data ?? raw.plans ?? []);
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
    const arr: any[] = Array.isArray(raw) ? raw : (raw.data ?? raw.plans ?? []);
    return arr.map(normalizePlan).sort((a, b) => a.tier_order - b.tier_order);
  },

  getServiceChargePlans: async (): Promise<ServiceChargePlan[]> => {
    const response = await axios.get(`${SUBSCRIPTION_API_BASE}/service-charges/plans`);
    const raw = response.data;
    const arr: any[] = Array.isArray(raw) ? raw : (raw.data ?? raw.plans ?? []);
    return arr.filter((p: any) => p.is_active !== false);
  },

  getServiceSubscriptions: async (tenantId: string): Promise<ServiceSubscriptionsResult> => {
    const response = await axios.get(`/api/subscriptions`, {
      params: { tenant_id: tenantId },
    });
    return response.data;
  },
};
