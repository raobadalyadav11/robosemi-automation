'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Loading Robosemi Automation...</p>
      </div>
    </div>
  );
}