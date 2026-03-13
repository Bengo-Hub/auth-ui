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
  tenants: Array<Tenant & { roles: string[] }>;
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
        if (user && user.tenants.length > 0 && !useAuthStore.getState().activeTenant) {
          set({ activeTenant: user.tenants[0] });
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
