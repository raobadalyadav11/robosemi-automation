'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session && !pathname?.startsWith('/auth')) {
      router.push('/auth/signin');
      return;
    }
    
    if (pathname === '/' && session) {
      const redirectPath = session.user.role === 'admin' || session.user.role === 'operator' ? '/admin' : '/dashboard';
      router.push(redirectPath);
      return;
    }
    
    // Restrict admin from accessing user routes
    if (session && (session.user.role === 'admin' || session.user.role === 'operator')) {
      if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/street-lights')) {
        router.push('/admin');
        return;
      }
    }
  }, [session, status, pathname, router]);
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <LayoutContent>{children}</LayoutContent>
            <Toaster position="top-right" richColors theme="system" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}