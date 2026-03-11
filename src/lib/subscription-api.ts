import axios from 'axios';

const SUBSCRIPTION_API_BASE = 'https://pricingapi.codevertexitsolutions.com/api/v1';

export interface Plan {
  id: string;
  plan_code: string;
  name: string;
  description: string;
  billing_cycle: string;
  base_price: number;
  currency: string;
  is_active: boolean;
  tier_order: number;
  plan_type: string;
  features?: PlanFeature[];
}

export interface PlanFeature {
  id: string;
  name: string;
  code: string;
  is_included: boolean;
}

export const subscriptionApi = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await axios.get(`${SUBSCRIPTION_API_BASE}/plans`);
    return response.data;
  },
  
  getPlanByCode: async (code: string): Promise<Plan> => {
    const response = await axios.get(`${SUBSCRIPTION_API_BASE}/plans/code/${code}`);
    return response.data;
  }
};
