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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeTenant: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => {
        set({ user, isAuthenticated: !!user, isLoading: false });
        // Bootstrap activeTenant once per login. Prefer the membership list,
        // fall back to user.tenant (the primary tenant /me returns when the
        // user has no explicit multi-tenant membership payload yet).
        if (user && !useAuthStore.getState().activeTenant) {
          const first = user.tenants?.[0] ?? user.tenant;
          if (first) set({ activeTenant: first });
        }
      },
      setActiveTenant: (activeTenant) => set({ activeTenant }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, activeTenant: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'bb-auth-storage',
    }
  )
);
