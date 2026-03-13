'use client';

import { useTenant } from '@/components/providers/tenant-provider';
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
import { useLogout } from '@/hooks/useLogout';
import { useAuthStore } from '@/store/auth-store';
import {
    Bell,
    ChevronRight,
    Home,
    Search,
    User,
    Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardTopNav() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const pathname = usePathname();
  const { getServiceTitle } = useTenant();

  const displayTitle = getServiceTitle('Account');

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(p => p !== '');
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      const isLast = index === paths.length - 1;

      return (
        <div key={href} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-slate-400 mx-1" />
          {isLast ? (
            <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{label}</span>
          ) : (
            <Link href={href} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors capitalize">
              {label}
            </Link>
          )}
        </div>
      );
    });
  };

  return (
    <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      {/* Left: Branded Title */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <Home className="h-5 w-5 text-primary" />
        </Link>
        <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
          {displayTitle}
        </h1>
      </div>

      {/* Center: Search (Placeholder) */}
      <div className="hidden md:flex relative w-96 max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          type="search" 
          placeholder="Search settings, users, orgs..." 
          className="pl-10 h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative group rounded-xl">
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-2 pr-1 h-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20">
                  {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left mr-2">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[100px]">
                    {user?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {user?.roles?.[0] || 'User'}
                  </p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 dark:border-slate-800">
            <DropdownMenuLabel className="mb-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'Account'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link href="/dashboard/profile" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => logout()}
              className="rounded-xl cursor-pointer text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20 focus:text-rose-600"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
