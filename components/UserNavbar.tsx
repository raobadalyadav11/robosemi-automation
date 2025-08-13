'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, LogOut, Moon, Sun, BarChart3, Zap } from 'lucide-react';

export default function UserNavbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="h-16 border-b border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700/50">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <span className="hidden sm:block font-bold text-xl bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
            Street Light Control
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/20">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/street-lights">
            <Button variant="ghost" className="text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/20">
              <Zap className="h-4 w-4 mr-2" />
              Controls
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 px-0"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium">
            USER
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/20"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}