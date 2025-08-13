'use client';

import RoleGuard from '@/components/RoleGuard';
import AdminNavbar from '@/components/AdminNavbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['admin', 'operator']}>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 dark:from-red-950 dark:via-pink-950 dark:to-rose-950">
        <AdminNavbar />
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-red-200/50 bg-red-50/30 py-4 dark:border-red-700/50 dark:bg-red-900/10">
          <div className="container mx-auto px-4 text-center text-sm text-red-600 dark:text-red-400">
            Admin Panel - Robosemi Automation System
          </div>
        </footer>
      </div>
    </RoleGuard>
  );
}