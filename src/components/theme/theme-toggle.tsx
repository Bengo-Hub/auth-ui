'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group overflow-hidden"
    >
      <div className="relative h-5 w-5 flex items-center justify-center">
        <Sun className="h-5 w-5 text-rose-500 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 group-hover:scale-110" />
        <Moon className="absolute h-5 w-5 text-indigo-400 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 group-hover:scale-110" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
