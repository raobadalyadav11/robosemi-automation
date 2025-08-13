'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/setup';

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
              {!isAuthPage && (
                <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80">
                  <Navbar />
                </header>
              )}
              <main className={`flex-1 ${!isAuthPage ? 'container mx-auto px-4 py-8 sm:px-6 lg:px-8' : ''}`}>
                {children}
              </main>
              {!isAuthPage && (
                <footer className="border-t border-slate-200/50 bg-white/30 py-6 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/30">
                  <div className="container mx-auto px-4 text-center text-sm text-slate-600 dark:text-slate-400">
                    © 2024 Street Light Management System. Powered by IoT Technology.
                  </div>
                </footer>
              )}
            </div>
            <Toaster position="top-right" richColors theme="system" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}