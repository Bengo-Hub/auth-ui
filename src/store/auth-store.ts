import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  brand_colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo_url?: string;
  subscription_plan?: string;
  subscription_status?: string;
  subscription_expires_at?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  permissions?: string[];
  tenants?: Array<Tenant & { roles: string[] }>;
  // /api/v1/auth/me returns the user's primary tenant as a single nested
  // object (not in a list). Use it as the default activeTenant when tenants[]
  // is empty so per-tenant UI (branding, settings) has something to scope to.
  tenant?: Tenant;
  is_platform_owner?: boolean;
}

interface AuthState {
  user: User | null;
  activeTenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setActiveTenant: (tenant: Tenant | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

/**
 * The organisation the dashboard works in after a user is set. The store is persisted in the
 * browser, so it must never carry one person's organisation into another person's session:
 * - a different user than the stored one starts fresh (no inherited organisation);
 * - an organisation the user is not a member of is dropped (platform owners excepted: they may
 *   switch into any tenant);
 * - otherwise the user's first membership, or the primary tenant /me returns, is used.
 */
export function nextActiveTenant(prev: User | null, user: User | null, active: Tenant | null): Tenant | null {
  if (!user) return null;
  let current = prev && prev.id !== user.id ? null : active;
  if (current && !user.is_platform_owner) {
    const slugs = new Set([...(user.tenants ?? []).map((t) => t.slug), user.tenant?.slug].filter(Boolean));
    if (!slugs.has(current.slug)) current = null;
  }
  return current ?? user.tenants?.[0] ?? user.tenant ?? null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      activeTenant: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => {
        set({ user, isAuthenticated: !!user, isLoading: false, activeTenant: nextActiveTenant(get().user, user, get().activeTenant) });
      },
      setActiveTenant: (activeTenant) => set({ activeTenant }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, activeTenant: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'bb-auth-storage',
      // Audit item L6: only the profile and the chosen organisation are kept in the browser.
      // The session itself is the HttpOnly bb_session cookie; no token is ever stored here.
      partialize: (state) => ({ user: state.user, activeTenant: state.activeTenant }),
      // The flags are rebuilt from the stored profile, so a reload behaves as it did when they
      // were stored too (setUser and logout always left isLoading false).
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Pick<AuthState, 'user' | 'activeTenant'>>;
        if (!persisted) return current;
        const user = saved.user ?? null;
        return { ...current, user, activeTenant: saved.activeTenant ?? null, isAuthenticated: !!user, isLoading: false };
      },
    }
  )
);
