// Codevertex Services Configuration
// Production domains sourced from devops-k8s apps values.yaml files
// This file centralizes all service URLs for the Codevertex ecosystem.
// Services are grouped by category for easy navigation.

import {
  Box,
  Briefcase,
  Coffee,
  CreditCard,
  LayoutDashboard,
  LucideIcon,
  Monitor,
  ShoppingCart,
  Ticket,
  Truck,
  Wifi,
  Zap,
} from 'lucide-react';

export type ServiceStatus = 'live' | 'beta' | 'coming-soon' | 'offline';

export interface Service {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  icon: LucideIcon;
  url: string;
  apiUrl?: string;
  color: string;
  gradient: string;
  category: 'core' | 'operations' | 'enterprise' | 'specialized';
  status: ServiceStatus;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  services: Service[];
}

// Production domains from devops-k8s values.yaml files
export const PRODUCTION_DOMAINS = {
  // Auth & Identity
  sso: 'https://sso.codevertexitsolutions.com',
  accounts: 'https://accounts.codevertexitsolutions.com',

  // Core Services
  cafe: 'https://cafe.codevertexitsolutions.com',
  ordering: 'https://ordersapp.codevertexitsolutions.com',
  orderingApi: 'https://orderapi.codevertexitsolutions.com',
  pos: 'https://pos.codevertexitsolutions.com',
  posApi: 'https://posapi.codevertexitsolutions.com',

  // Operations
  logistics: 'https://logistics.codevertexitsolutions.com',
  logisticsApi: 'https://logisticsapi.codevertexitsolutions.com',
  inventory: 'https://inventory.codevertexitsolutions.com',
  inventoryApi: 'https://inventoryapi.codevertexitsolutions.com',

  // Finance & Enterprise
  books: 'https://books.codevertexitsolutions.com',
  booksApi: 'https://booksapi.codevertexitsolutions.com',
  erp: 'https://erp.masterspace.co.ke',
  erpApi: 'https://erpapi.masterspace.co.ke',

  // Project & Support
  projects: 'https://projects.codevertexitsolutions.com',
  projectsApi: 'https://projectsapi.codevertexitsolutions.com',
  ticketing: 'https://ticketing.codevertexitsolutions.com',
  ticketingApi: 'https://ticketingapi.codevertexitsolutions.com',

  // Specialized
  ispBilling: 'https://ispbilling.codevertexitsolutions.com',
  ispBillingApi: 'https://ispbillingapi.codevertexitsolutions.com',
  truload: 'https://truloadtest.masterspace.co.ke',
  truloadApi: 'https://truloadapitest.masterspace.co.ke',
  iot: 'https://iot.codevertexitsolutions.com',

  // Infrastructure
  notifications: 'https://notifications.codevertexitsolutions.com',
  notificationsApi: 'https://notificationsapi.codevertexitsolutions.com',
  subscription: 'https://pricingapi.codevertexitsolutions.com',
  superset: 'https://superset.codevertexitsolutions.com',
} as const;

export const SERVICES: Service[] = [
  // Core Services - Customer-facing
  {
    id: 'cafe',
    name: 'Codevertex Cafe',
    shortName: 'Cafe',
    description: 'Premium dining, business hub, and event bookings. The central hub for the Urban Cafe ecosystem.',
    icon: Coffee,
    url: PRODUCTION_DOMAINS.cafe,
    color: 'bg-orange-500',
    gradient: 'from-orange-500 to-amber-500',
    category: 'core',
    status: 'live',
  },
  {
    id: 'ordering',
    name: 'Codevertex Ordering App',
    shortName: 'Ordering',
    description: 'Multi-tenant online ordering and delivery platform with real-time tracking and PWA support.',
    icon: ShoppingCart,
    url: PRODUCTION_DOMAINS.ordering,
    apiUrl: PRODUCTION_DOMAINS.orderingApi,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
    category: 'core',
    status: 'live',
  },
  {
    id: 'pos',
    name: 'Codevertex POS',
    shortName: 'POS',
    description: 'High-performance, offline-capable point of sale for retail and dining environments.',
    icon: Monitor,
    url: PRODUCTION_DOMAINS.pos,
    apiUrl: PRODUCTION_DOMAINS.posApi,
    color: 'bg-indigo-600',
    gradient: 'from-indigo-600 to-purple-600',
    category: 'core',
    status: 'live',
  },

  // Operations - Backend services
  {
    id: 'logistics',
    name: 'Codevertex Logistics',
    shortName: 'Logistics',
    description: 'Fleet management and real-time rider orchestration. Specialized for delivery and logistics operations.',
    icon: Truck,
    url: PRODUCTION_DOMAINS.logistics,
    apiUrl: PRODUCTION_DOMAINS.logisticsApi,
    color: 'bg-green-500',
    gradient: 'from-green-500 to-emerald-500',
    category: 'operations',
    status: 'coming-soon',
  },
  {
    id: 'inventory',
    name: 'Codevertex Inventory',
    shortName: 'Inventory',
    description: 'Real-time stock management, procurement, and recipe/BOM management across all outlets.',
    icon: Box,
    url: PRODUCTION_DOMAINS.inventory,
    apiUrl: PRODUCTION_DOMAINS.inventoryApi,
    color: 'bg-amber-600',
    gradient: 'from-amber-500 to-orange-500',
    category: 'operations',
    status: 'coming-soon',
  },

  // Enterprise - Finance & Management
  {
    id: 'books',
    name: 'Codevertex Books',
    shortName: 'Books',
    description: 'Treasury, payments, and financial reconciliation. Manage payment intents and payouts.',
    icon: CreditCard,
    url: PRODUCTION_DOMAINS.books,
    apiUrl: PRODUCTION_DOMAINS.booksApi,
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-pink-500',
    category: 'enterprise',
    status: 'coming-soon',
  },
  {
    id: 'erp',
    name: 'Codevertex ERP',
    shortName: 'ERP',
    description: 'Enterprise resource planning and back-office operations including HRM, Finance, and CRM.',
    icon: LayoutDashboard,
    url: PRODUCTION_DOMAINS.erp,
    apiUrl: PRODUCTION_DOMAINS.erpApi,
    color: 'bg-slate-700',
    gradient: 'from-slate-700 to-slate-900',
    category: 'enterprise',
    status: 'live',
  },
  {
    id: 'projects',
    name: 'Codevertex Projects',
    shortName: 'Projects',
    description: 'Collaborative project management and task tracking for internal and client initiatives.',
    icon: Briefcase,
    url: PRODUCTION_DOMAINS.projects,
    apiUrl: PRODUCTION_DOMAINS.projectsApi,
    color: 'bg-cyan-600',
    gradient: 'from-cyan-500 to-blue-500',
    category: 'enterprise',
    status: 'coming-soon',
  },
  {
    id: 'ticketing',
    name: 'Codevertex Ticketing',
    shortName: 'Support',
    description: 'Multi-tenant customer support and helpdesk with real-time updates and knowledge base.',
    icon: Ticket,
    url: PRODUCTION_DOMAINS.ticketing,
    apiUrl: PRODUCTION_DOMAINS.ticketingApi,
    color: 'bg-rose-500',
    gradient: 'from-rose-500 to-red-500',
    category: 'enterprise',
    status: 'coming-soon',
  },

  // Specialized - Industry-specific
  {
    id: 'isp',
    name: 'Codevertex ISP Billing',
    shortName: 'ISP',
    description: 'Comprehensive billing and management for ISPs, including captive portals and SaaS marketing.',
    icon: Wifi,
    url: PRODUCTION_DOMAINS.ispBilling,
    apiUrl: PRODUCTION_DOMAINS.ispBillingApi,
    color: 'bg-sky-500',
    gradient: 'from-sky-500 to-blue-500',
    category: 'specialized',
    status: 'coming-soon',
  },
  {
    id: 'truload',
    name: 'Codevertex TruLoad',
    shortName: 'TruLoad',
    description: 'Axle load weighing, prosecution management, and analytics for transport authorities.',
    icon: Zap,
    url: PRODUCTION_DOMAINS.truload,
    apiUrl: PRODUCTION_DOMAINS.truloadApi,
    color: 'bg-yellow-500',
    gradient: 'from-yellow-500 to-orange-500',
    category: 'specialized',
    status: 'beta',
  },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'core',
    name: 'Core Services',
    description: 'Customer-facing applications for ordering, payments, and retail operations',
    services: SERVICES.filter(s => s.category === 'core'),
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Backend services for logistics, inventory, and supply chain management',
    services: SERVICES.filter(s => s.category === 'operations'),
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Business management, finance, and project tracking tools',
    services: SERVICES.filter(s => s.category === 'enterprise'),
  },
  {
    id: 'specialized',
    name: 'Specialized',
    description: 'Industry-specific solutions for ISPs, transport, and more',
    services: SERVICES.filter(s => s.category === 'specialized'),
  },
];

// Helper functions
export const getServiceById = (id: string): Service | undefined => {
  return SERVICES.find(s => s.id === id);
};

export const getServicesByCategory = (category: Service['category']): Service[] => {
  return SERVICES.filter(s => s.category === category);
};

export const getLiveServices = (): Service[] => {
  return SERVICES.filter(s => s.status === 'live');
};

export const getServiceUrl = (serviceId: string, isAuthenticated: boolean, returnPath?: string): string => {
  const service = getServiceById(serviceId);
  if (!service) return '/';

  if (isAuthenticated) {
    return service.url;
  }

  const returnTo = returnPath || service.url;
  return `/login?return_to=${encodeURIComponent(returnTo)}`;
};
