'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';

interface AppShellProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export function AppShell({ activeTab, setActiveTab, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#090A0F] text-slate-100 font-sans">
      {/* Bal oldali modul navigáció (Sidebar) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Fő tartalom és felső fejléc konténer */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
