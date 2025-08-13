'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, LogOut, Moon, Sun, Settings, Users, Activity } from 'lucide-react';

export default function AdminNavbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const isAdmin = session?.user.role === 'admin';

  return (
    <nav className="h-16 border-b border-red-200/50 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-700/50">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-2.5 rounded-xl shadow-lg">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <span className="hidden sm:block font-bold text-xl bg-gradient-to-r from-red-900 to-pink-900 dark:from-red-100 dark:to-pink-100 bg-clip-text text-transparent">
            Admin Panel
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          <Link href="/admin">
            <Button variant="ghost" className="text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/20">
              <Users className="h-4 w-4 mr-2" />
              Users
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/20">
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/street-lights">
            <Button variant="ghost" className="text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/20">
              <Lightbulb className="h-4 w-4 mr-2" />
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
          
          <Badge className={`text-xs font-medium ${
            isAdmin 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
          }`}>
            {isAdmin ? 'ADMIN' : 'OPERATOR'}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}