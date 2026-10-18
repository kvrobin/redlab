'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab from pathname
  let activeTab = 'dashboard';
  if (pathname.startsWith('/milestones') || pathname.startsWith('/thesis')) activeTab = 'thesis';
  else if (pathname.startsWith('/kanban')) activeTab = 'kanban';
  else if (pathname.startsWith('/scheduler') || pathname.startsWith('/consultation')) activeTab = 'consultation';
  else if (pathname.startsWith('/files')) activeTab = 'files';
  else if (pathname.startsWith('/literature')) activeTab = 'literature';
  else if (pathname.startsWith('/logs') || pathname.startsWith('/labbook')) activeTab = 'labbook';
  else if (pathname.startsWith('/supervisor')) activeTab = 'supervisor';

  const handleTabChange = (tab: string) => {
    if (tab === 'dashboard') router.push('/dashboard');
    else if (tab === 'thesis' || tab === 'milestones') router.push('/milestones');
    else if (tab === 'kanban') router.push('/kanban');
    else if (tab === 'consultation' || tab === 'scheduler') router.push('/scheduler');
    else if (tab === 'files') router.push('/files');
    else if (tab === 'literature') router.push('/literature');
    else if (tab === 'labbook' || tab === 'logs') router.push('/logs');
    else if (tab === 'supervisor') router.push('/supervisor');
  };

  return (
    <AppShell activeTab={activeTab} setActiveTab={handleTabChange}>
      {children}
    </AppShell>
  );
}
