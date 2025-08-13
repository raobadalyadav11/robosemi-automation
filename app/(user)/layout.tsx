'use client';

import RoleGuard from '@/components/RoleGuard';
import UserNavbar from '@/components/UserNavbar';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['admin', 'operator', 'user']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-100 dark:from-blue-950 dark:via-indigo-950 dark:to-cyan-950">
        <UserNavbar />
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-blue-200/50 bg-blue-50/30 py-4 dark:border-blue-700/50 dark:bg-blue-900/10">
          <div className="container mx-auto px-4 text-center text-sm text-blue-600 dark:text-blue-400">
            Street Light Control - Robosemi Automation System
          </div>
        </footer>
      </div>
    </RoleGuard>
  );
}