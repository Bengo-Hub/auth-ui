import type { Plan } from '@/lib/subscription-api';

// Turns subscriptions-api's flat public plan list into the pricing page's shape:
// category > product > tier, each tier pairing its monthly plan with its perpetual licence.

export const SUBSCRIPTIONS_UI_URL = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_UI_URL || 'https://pricing.codevertexafrica.com';

export interface Tier {
  /** Code used for links: the monthly plan when there is one, else the licence. */
  code: string;
  label: string;
  description: string;
  monthly?: Plan;
  licence?: Plan;
  limits: { value: string; label: string }[];
  /** Usage charges on top of the price, such as a per-subscriber fee. */
  notes: string[];
}

export interface Product {
  key: string;
  name: string;
  forWho: string;
  serviceTag: string;
  trialDays: number;
  tiers: Tier[];
}

export interface Category {
  id: string;
  title: string;
  lead: string;
  products: Product[];
}

interface ProductDef {
  key: string;
  name: string;
  forWho: string;
  category: string;
  /** Plan-code prefix stripped to get the tier name (POWERSUITE_DUKA_BASIC -> Basic). */
  prefix: string;
  matches: (p: Plan) => boolean;
}

const tag = (t: string, useCase?: string) => (p: Plan) =>
  p.service_tag === t && (!useCase || (p.use_case ?? '').toLowerCase() === useCase);

// Order here is display order within a category.
const PRODUCTS: ProductDef[] = [
  { key: 'duka', name: 'PowerSuite Retail (Duka)', forWho: 'Shops, supermarkets and wholesalers', category: 'shops', prefix: 'POWERSUITE_DUKA_', matches: tag('pos', 'retail') },
  { key: 'hospitality', name: 'PowerSuite Hospitality', forWho: 'Restaurants, cafes, bars and hotels', category: 'shops', prefix: 'POWERSUITE_HOSP_', matches: tag('pos', 'hospitality') },
  { key: 'afya', name: 'Codevertex Afya', forWho: 'Chemists, pharmacies and clinics', category: 'health', prefix: 'AFYA_', matches: tag('hospital') },
  { key: 'erp', name: 'ERP Suite', forWho: 'HR, payroll, procurement and CRM', category: 'business', prefix: 'ERP_', matches: tag('erp') },
  { key: 'treasury', name: 'Treasury', forWho: 'Payments, wallets and approvals', category: 'business', prefix: 'TREASURY_', matches: tag('treasury') },
  { key: 'maskani', name: 'Maskani', forWho: 'Landlords and property managers', category: 'business', prefix: 'MASKANI_', matches: tag('maskani') },
  { key: 'truload', name: 'TruLoad', forWho: 'Weighbridges and axle-load stations', category: 'operations', prefix: 'TRULOAD_', matches: tag('truload') },
  { key: 'isp', name: 'ISP Billing', forWho: 'Internet providers and Wi-Fi hotspots', category: 'operations', prefix: 'ISP_BILLING_', matches: tag('isp_billing') },
  { key: 'library', name: 'Library', forWho: 'School, college and public libraries', category: 'operations', prefix: 'LIBRARY_', matches: tag('library') },
  { key: 'etims', name: 'eTIMS API', forWho: 'Developers connecting their own app to KRA eTIMS', category: 'developers', prefix: 'ETIMS_API_', matches: tag('etims_api') },
];

const CATEGORIES: Omit<Category, 'products'>[] = [
  { id: 'shops', title: 'Shops and restaurants', lead: 'Point of sale, stock and KRA eTIMS receipts in one till.' },
  { id: 'health', title: 'Healthcare', lead: 'Dispensing, patient records and billing for chemists and clinics.' },
  { id: 'business', title: 'Running the business', lead: 'People, money and property, with approvals built in.' },
  { id: 'operations', title: 'Specialist operations', lead: 'Software for weighbridges, internet providers and libraries.' },
  { id: 'developers', title: 'For developers', lead: 'Our APIs, priced by usage, for your own software.' },
  { id: 'more', title: 'More products', lead: 'Other plans you can subscribe to.' },
];

// Plain names for the limits a buyer compares, singular and plural. Keys not listed are left out of
// the summary; the full list is on the comparison page in subscriptions-ui, which reads the catalog.
const LIMIT_LABEL: Record<string, [string, string]> = {
  max_branches: ['branch', 'branches'], max_outlets: ['outlet', 'outlets'], max_staff: ['staff account', 'staff accounts'],
  max_users: ['user', 'users'], max_admins: ['admin', 'admins'], max_cashiers: ['cashier', 'cashiers'],
  max_devices: ['device', 'devices'], inventory_max_sku: ['product', 'products'],
  max_patients_per_day: ['patient a day', 'patients a day'], max_employees: ['employee', 'employees'],
  max_units: ['rental unit', 'rental units'], max_wallets: ['wallet', 'wallets'],
  max_payment_links: ['payment link', 'payment links'], max_stations: ['station', 'stations'],
  max_weighings_month: ['weighing a month', 'weighings a month'], max_library_branches: ['branch', 'branches'],
  max_library_members: ['member', 'members'], max_library_titles: ['title', 'titles'],
  etims_transactions_per_month: ['eTIMS invoice a month', 'eTIMS invoices a month'],
};

// The limits worth leading with for each product, most telling first.
const PRODUCT_LIMITS: Record<string, string[]> = {
  duka: ['max_branches', 'max_cashiers', 'max_staff', 'inventory_max_sku'],
  hospitality: ['max_branches', 'max_cashiers', 'max_staff', 'inventory_max_sku'],
  afya: ['max_branches', 'max_staff', 'max_patients_per_day', 'inventory_max_sku'],
  erp: ['max_employees', 'max_users', 'max_branches'],
  treasury: ['max_users', 'max_wallets', 'max_payment_links'],
  maskani: ['max_units', 'max_employees', 'max_users'],
  truload: ['max_stations', 'max_users', 'max_weighings_month'],
  library: ['max_library_branches', 'max_library_members', 'max_library_titles'],
  etims: ['etims_transactions_per_month'],
};
const DEFAULT_LIMITS = ['max_branches', 'max_users', 'max_staff', 'inventory_max_sku'];

const kes = (n: number) => `KES ${n.toLocaleString('en-KE')}`;

function tierLimits(p: Plan, productKey: string): Tier['limits'] {
  const raw = p.tier_limits ?? {};
  return (PRODUCT_LIMITS[productKey] ?? DEFAULT_LIMITS)
    .filter((k) => typeof raw[k] === 'number' && raw[k] !== 0)
    .map((k) => {
      const v = raw[k] as number;
      const [one, many] = LIMIT_LABEL[k];
      return v === -1 ? { value: 'Unlimited', label: many } : { value: v.toLocaleString('en-KE'), label: v === 1 ? one : many };
    });
}

/** Usage charges billed on top of the plan price, read from the plan's own rates. */
function usageNotes(p: Plan): string[] {
  const raw = p.tier_limits ?? {};
  const notes: string[] = [];
  if (typeof raw.pppoe_per_subscriber_fee === 'number') notes.push(`Plus ${kes(raw.pppoe_per_subscriber_fee)} a month per active PPPoE subscriber.`);
  if (typeof raw.service_charge_percentage === 'number' && typeof raw.service_charge_threshold === 'number') {
    notes.push(`Plus ${raw.service_charge_percentage}% of hotspot sales in any month they pass ${kes(raw.service_charge_threshold)}.`);
  }
  if (typeof raw.overage_etims_price_per_100_month === 'number') notes.push(`Extra invoices ${kes(raw.overage_etims_price_per_100_month)} per 100.`);
  return notes;
}

export const isLicence = (p: Plan) => p.billing_cycle === 'ONE_TIME' || /_ONE_TIME$|LICENSE/.test(p.plan_code);
const baseCode = (code: string) => code.replace(/_ONE_TIME$/, '');

function tierLabel(code: string, prefix: string): string {
  const s = baseCode(code).replace(new RegExp('^' + prefix), '') || code;
  return s.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

// "PowerSuite Hospitality — Basic Perpetual License" -> "PowerSuite Hospitality"
const fallbackName = (p: Plan) => p.name.split(/\s+[—–-]\s+/)[0].replace(/\s+(Starter|Basic|Perpetual.*)$/i, '');

/**
 * Public, active, non-annual plans grouped for display. Annual rows are retired (the period is
 * picked at checkout) and is_public=false rows such as support contracts are sold by the team.
 */
export function buildCatalog(plans: Plan[]): Category[] {
  const visible = plans.filter((p) => p.is_public !== false && p.is_active !== false && p.billing_cycle !== 'ANNUAL');

  const byProduct = new Map<string, { def: ProductDef; plans: Plan[] }>();
  for (const p of visible) {
    const def =
      PRODUCTS.find((d) => d.matches(p)) ??
      ({ key: p.service_tag ?? p.plan_code, name: fallbackName(p), forWho: '', category: 'more', prefix: (p.plan_code.split('_')[0] ?? '') + '_', matches: () => false } as ProductDef);
    const entry = byProduct.get(def.key) ?? { def, plans: [] };
    entry.plans.push(p);
    byProduct.set(def.key, entry);
  }

  const products: (Product & { category: string; order: number })[] = [];
  for (const { def, plans: list } of byProduct.values()) {
    const tiers = new Map<string, Tier>();
    for (const p of [...list].sort((a, b) => a.tier_order - b.tier_order || a.base_price - b.base_price)) {
      const key = baseCode(p.plan_code);
      const tier = tiers.get(key) ?? { code: key, label: tierLabel(p.plan_code, def.prefix), description: '', limits: [], notes: [] };
      if (isLicence(p)) tier.licence = p;
      else tier.monthly = p;
      tier.code = tier.monthly?.plan_code ?? p.plan_code;
      tier.description = tier.monthly?.description || tier.licence?.description || '';
      tier.limits = tierLimits(tier.monthly ?? p, def.key);
      tier.notes = usageNotes(tier.monthly ?? p);
      tiers.set(key, tier);
    }
    const ordered = [...tiers.values()];
    products.push({
      key: def.key,
      name: def.name,
      forWho: def.forWho,
      serviceTag: list[0].service_tag ?? '',
      trialDays: Math.max(0, ...list.filter((p) => !isLicence(p)).map((p) => p.free_trial_days ?? 0)),
      tiers: ordered,
      category: def.category,
      order: PRODUCTS.indexOf(def),
    });
  }

  return CATEGORIES.map((c) => ({
    ...c,
    products: products
      .filter((p) => p.category === c.id)
      .sort((a, b) => (a.order === -1 ? 99 : a.order) - (b.order === -1 ? 99 : b.order) || a.name.localeCompare(b.name)),
  })).filter((c) => c.products.length > 0);
}

/** Lowest price a product starts from, monthly first. */
export function fromPrice(product: Product): { amount: number; currency: string; once: boolean } | null {
  const monthly = product.tiers.map((t) => t.monthly).filter((p): p is Plan => !!p && p.base_price > 0);
  const licences = product.tiers.map((t) => t.licence).filter((p): p is Plan => !!p);
  const pool = monthly.length ? monthly : licences;
  if (!pool.length) return null;
  const cheapest = pool.reduce((a, b) => (b.base_price < a.base_price ? b : a));
  return { amount: cheapest.base_price, currency: cheapest.currency, once: !monthly.length };
}

// Plan codes are case sensitive in subscriptions-api: /plans/code/erp_starter is a 404.
export const subscribeUrl = (code: string) => `${SUBSCRIPTIONS_UI_URL}/subscribe?plan=${encodeURIComponent(code)}`;
export const compareUrl = (serviceTag: string, code?: string) =>
  `${SUBSCRIPTIONS_UI_URL}/plans?service=${encodeURIComponent(serviceTag)}${code ? `&plan=${encodeURIComponent(code)}` : ''}`;
