'use client';

import { useTenant } from '@/components/providers/tenant-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JoinOrganizationDialog } from '@/components/organizations/JoinOrganizationDialog';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useLogout';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useVisibleServices, type ServiceKey, AppSwitcherGrid, AppSwitcherTrigger } from '@bengo-hub/shared-ui-lib/app-switcher';
import { AccountPanel } from '@bengo-hub/shared-ui-lib/account-panel';
import {
  Bell,
  Building2,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  Home,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Store,
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// Same convention as every other *-ui's header.tsx SERVICE_URLS map: each app
// resolves its own env vars as literal expressions so its bundler can
// statically inline them, then hands the resolved base URLs to
// useVisibleServices — see shared-ui-lib's app-switcher README for why this
// isn't resolved inside the shared hook itself.
const SERVICE_URLS: Partial<Record<ServiceKey, string>> = {
  pos: process.env.NEXT_PUBLIC_POS_UI_URL ?? 'https://pos.codevertexafrica.com',
  inventory: process.env.NEXT_PUBLIC_INVENTORY_UI_URL ?? 'https://inventory.codevertexafrica.com',
  treasury: process.env.NEXT_PUBLIC_TREASURY_UI_URL ?? 'https://books.codevertexafrica.com',
  marketflow: process.env.NEXT_PUBLIC_CRM_UI_URL ?? 'https://marketflow.codevertexafrica.com',
  logistics: process.env.NEXT_PUBLIC_LOGISTICS_UI_URL ?? 'https://logistics.codevertexafrica.com',
  erp: process.env.NEXT_PUBLIC_ERP_UI_URL ?? 'https://erp.codevertexafrica.com',
  ordering: process.env.NEXT_PUBLIC_ORDERING_UI_URL ?? 'https://ordering.codevertexafrica.com',
  subscriptions: process.env.NEXT_PUBLIC_SUBSCRIPTIONS_UI_URL ?? 'https://pricing.codevertexafrica.com',
  projects: process.env.NEXT_PUBLIC_PROJECTS_UI_URL ?? 'https://projects.codevertexafrica.com',
  afya: process.env.NEXT_PUBLIC_HOSPITAL_UI_URL ?? 'https://afya.codevertexafrica.com',
  mail: process.env.NEXT_PUBLIC_MAIL_UI_URL ?? 'https://webmail.codevertexafrica.com',
  notifications: process.env.NEXT_PUBLIC_NOTIFICATIONS_UI_URL ?? 'https://notifications.codevertexafrica.com',
  library: process.env.NEXT_PUBLIC_LIBRARY_UI_URL ?? 'https://library.codevertexafrica.com',
  ticketing: process.env.NEXT_PUBLIC_TICKETING_UI_URL ?? 'https://ticketing.codevertexafrica.com',
  ispbilling: process.env.NEXT_PUBLIC_ISPBILLING_UI_URL ?? 'https://ispbilling.codevertexafrica.com',
  truload: process.env.NEXT_PUBLIC_TRULOAD_UI_URL ?? 'https://truload.codevertexafrica.com',
};

const MOBILE_NAV_ITEMS = [
  { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Profile', href: '/dashboard/profile', icon: User },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
  { title: 'My Organization', href: '/dashboard/my-tenant', icon: Store, tenantOnly: true },
];

const MOBILE_PLATFORM_ITEMS = [
  { title: 'Organizations', href: '/dashboard/tenants', icon: Building2 },
  { title: 'OAuth Clients', href: '/dashboard/developer/oauth-clients', icon: Key },
  { title: 'Integrations', href: '/dashboard/integrations', icon: Wrench },
  { title: 'Developer', href: '/dashboard/developer', icon: Code2 },
  { title: 'Apps & Keys', href: '/dashboard/developer/apps', icon: Cpu },
  { title: 'Users', href: '/dashboard/platform/users', icon: Users },
  { title: 'DB Backups', href: '/dashboard/platform/backups', icon: Database },
  { title: 'Membership Tiers', href: 'https://pricing.codevertexafrica.com/codevertex/platform/plans', icon: ExternalLink, newTab: true },
];

export function DashboardTopNav() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const { getServiceTitle } = useTenant();
  const { isPlatformOwner, isTenantAdmin } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);

  const displayTitle = getServiceTitle('SSO');
  const orgSlug = user?.tenant?.slug ?? user?.tenants?.[0]?.slug ?? '';
  const rawServices = useVisibleServices({
    orgSlug,
    urls: SERVICE_URLS,
    canManageLinks: isPlatformOwner || isTenantAdmin,
  });
  // mail-ui doesn't share this app's SSO session (it authenticates its own
  // mailbox credential separately) — its real entry point is /login?tenant=,
  // not the `${base}/${slug}` shape every other service uses.
  const services = rawServices.map((svc) =>
    svc.key === 'mail' && svc.href ? { ...svc, href: `${SERVICE_URLS.mail}/login?tenant=${orgSlug}` } : svc,
  );

  const drawer = (
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* Backdrop — rendered at body level to avoid stacking context issues */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            className="bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Right-side drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999, width: '80%', maxWidth: '24rem' }}
            className="bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-y-auto lg:hidden"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
                Navigation
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {/* "My Organization" is tenant-admin only — hidden from the platform owner
                  (who has the Platform section) and from non-admin tenant roles, who get
                  the Account/Profile section instead. */}
              {MOBILE_NAV_ITEMS.filter((item) =>
                !('tenantOnly' in item && item.tenantOnly && (isPlatformOwner || !isTenantAdmin)),
              ).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}

              {isPlatformOwner && (
                <>
                  <div className="pt-4 pb-2 px-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                      <Wrench className="h-3 w-3" /> Platform
                    </p>
                  </div>
                  {MOBILE_PLATFORM_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        target={item.newTab ? '_blank' : undefined}
                        rel={item.newTab ? 'noopener noreferrer' : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    );
                  })}
                </>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-rose-500 font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
    <header className="h-14 md:h-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — only on mobile where sidebar is hidden */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden rounded-xl"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Button>
        <Link href="/dashboard" className="hidden lg:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <Home className="h-5 w-5 text-primary" />
        </Link>
        <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase truncate max-w-[130px] sm:max-w-none">
          {displayTitle}
        </h1>
      </div>

      {/* Center: Search (Placeholder) - Hidden on mobile */}
      <div className="hidden lg:flex relative w-80 xl:w-96 max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-10 h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-3">
        <div className="hidden sm:block">
          <JoinOrganizationDialog />
        </div>
        <ThemeToggle />

        <AppSwitcherTrigger services={services} className="relative inline-flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors" />

        <Button variant="ghost" size="icon" className="relative group rounded-xl">
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
        </Button>

        <button
          onClick={() => setAccountPanelOpen(true)}
          className="flex items-center gap-2 sm:gap-3 pl-1 pr-1 sm:pl-2 sm:pr-3 h-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[100px]">
              {user?.name || user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {user?.roles?.[0] || 'User'}
            </p>
          </div>
        </button>
      </div>
    </header>

    <AccountPanel
      open={accountPanelOpen}
      onClose={() => setAccountPanelOpen(false)}
      user={{ name: user?.name || user?.email?.split('@')[0] || 'Account', email: user?.email || '' }}
      onSignOut={() => logout()}
    >
      <div className="flex flex-col gap-3">
        <div className="w-fit rounded-lg bg-primary/5 border border-primary/10 px-2 py-1">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">{user?.roles?.[0] || 'Member'}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <Link
            href="/dashboard/profile"
            onClick={() => setAccountPanelOpen(false)}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <User className="h-4 w-4 text-blue-500" /> Account Profile
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setAccountPanelOpen(false)}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <Settings className="h-4 w-4 text-amber-500" /> Preferences
          </Link>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Codevertex Suite</p>
          <AppSwitcherGrid services={services} onNavigate={() => setAccountPanelOpen(false)} label="" />
        </div>
      </div>
    </AccountPanel>
    {/* Portal: drawer rendered at document.body to escape header's backdrop-filter stacking context */}
    {typeof document !== 'undefined' && createPortal(drawer, document.body)}
    </>
  );
}
