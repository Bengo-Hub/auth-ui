import {
  BellRing,
  BookText,
  Boxes,
  Building2,
  KanbanSquare,
  Library,
  ShoppingBag,
  Stethoscope,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * The apps shown on the landing page and the sign-in panel. This is a presentation list (accurate
 * names, one icon style, live apps only), separate from config/services.ts, whose statuses and
 * per-brand colours drive the health page rather than the marketing surfaces.
 */
export interface LauncherApp {
  id: string;
  name: string;
  /** One line on what the app does. */
  blurb: string;
  icon: LucideIcon;
  url: string;
}

export const LAUNCHER_APPS: LauncherApp[] = [
  { id: 'pos', name: 'POS', blurb: 'Tills, tabs and receipts', icon: Store, url: 'https://pos.codevertexafrica.com' },
  { id: 'inventory', name: 'Inventory', blurb: 'Stock, purchasing, counts', icon: Boxes, url: 'https://inventory.codevertexafrica.com' },
  { id: 'books', name: 'Books', blurb: 'Invoices, payments, accounts', icon: BookText, url: 'https://books.codevertexafrica.com' },
  { id: 'ordering', name: 'Ordering', blurb: 'Your storefront and delivery', icon: ShoppingBag, url: 'https://ordering.codevertexafrica.com' },
  { id: 'erp', name: 'HR and payroll', blurb: 'People, leave, pay', icon: Users, url: 'https://erp.codevertexafrica.com' },
  { id: 'logistics', name: 'Logistics', blurb: 'Dispatch and riders', icon: Truck, url: 'https://logistics.codevertexafrica.com' },
  { id: 'notifications', name: 'Messaging', blurb: 'Email, SMS, WhatsApp', icon: BellRing, url: 'https://notifications.codevertexafrica.com' },
  { id: 'projects', name: 'Projects', blurb: 'Work, budgets, milestones', icon: KanbanSquare, url: 'https://projects.codevertexafrica.com' },
  { id: 'maskani', name: 'Maskani', blurb: 'Estates and owner portals', icon: Building2, url: 'https://maskaniapp.codevertexafrica.com' },
  { id: 'afya', name: 'Afya', blurb: 'Clinic front desk and records', icon: Stethoscope, url: 'https://afya.codevertexafrica.com' },
  { id: 'library', name: 'Library', blurb: 'Catalogue, loans, holds', icon: Library, url: 'https://library.codevertexafrica.com' },
];
