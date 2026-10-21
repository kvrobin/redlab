'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { MobileLabCameraModal } from '@/components/mobile/MobileLabCameraModal';

interface AppShellProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export function AppShell({ activeTab, setActiveTab, children }: AppShellProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isQuickCameraOpen, setIsQuickCameraOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-[#090A0F] text-slate-100 font-sans relative overflow-x-hidden">
      {/* 40px Scientific Micro-Grid Background */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#1e223015_1px,transparent_1px),linear-gradient(to_bottom,#1e223015_1px,transparent_1px)] bg-[size:40px_40px] opacity-75 z-0" />

      {/* Top Center Blurred Crimson Glow Beam */}
      <div className="fixed top-[-10rem] left-1/2 -translate-x-1/2 w-[70rem] h-[35rem] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(225,29,72,0.18),transparent)] pointer-events-none z-0" />

      {/* Bal oldali modul navigáció (Sidebar & Mobile Drawer) */}
      <div className="relative z-10">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />
      </div>

      {/* Fő tartalom és felső fejléc konténer */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 pb-[env(safe-area-inset-bottom,0px)]">
        <TopHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleMobileMenu={() => setIsMobileDrawerOpen((prev) => !prev)}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Fix Alsó Dokk Mobil & Tablet kijelzőkön */}
      <MobileBottomNav onOpenQuickCamera={() => setIsQuickCameraOpen(true)} />

      {/* PWA Gyors Laboratóriumi Kamera Modál */}
      <MobileLabCameraModal
        isOpen={isQuickCameraOpen}
        onClose={() => setIsQuickCameraOpen(false)}
      />
    </div>
  );
}
