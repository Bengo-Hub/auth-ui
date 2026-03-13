'use client';

import { useTenant } from '@/components/providers/tenant-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { JoinOrganizationDialog } from '@/components/organizations/JoinOrganizationDialog';
import { useLogout } from '@/hooks/useLogout';
import { useAuthStore } from '@/store/auth-store';
import {
  Bell,
  Home,
  LogOut,
  Search,
  Settings,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardTopNav() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const { getServiceTitle } = useTenant();

  const displayTitle = getServiceTitle('SSO');

  return (
    <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Branded Title */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <Home className="h-5 w-5 text-primary" />
        </Link>
        <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase truncate max-w-[150px] sm:max-w-none">
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
        
        <Button variant="ghost" size="icon" className="relative group rounded-xl">
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-1 pr-1 sm:pl-2 sm:pr-1 h-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent">
              <div className="flex items-center gap-2 sm:gap-3 group">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                  {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left mr-2">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[100px]">
                    {user?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {user?.roles?.[0] || 'User'}
                  </p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-3 shadow-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <DropdownMenuLabel className="mb-2 px-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-black text-slate-900 dark:text-white">{user?.name || 'Account'}</p>
                <p className="text-xs text-slate-500 truncate font-medium">{user?.email}</p>
                <div className="mt-2 py-1 px-2 rounded-lg bg-primary/5 border border-primary/10 w-fit">
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                     {user?.roles?.[0] || 'Member'}
                   </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            
            <div className="grid gap-1 py-1">
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 focus:bg-primary/5 focus:text-primary">
                <Link href="/dashboard/profile" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-bold text-sm">Account Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 focus:bg-primary/5 focus:text-primary">
                <Link href="/dashboard/settings" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="font-bold text-sm">Preferences</span>
                </Link>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem
              onClick={() => logout()}
              className="rounded-xl cursor-pointer py-3 text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-600"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Sign Out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
