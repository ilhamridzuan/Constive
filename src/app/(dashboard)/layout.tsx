'use client';

import { Header } from '@/components/shared/header';
import { Sidebar } from '@/components/shared/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
