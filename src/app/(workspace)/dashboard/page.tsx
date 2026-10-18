'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { AddTaskModal } from '@/components/modals/AddTaskModal';
import { AddFileModal } from '@/components/modals/AddFileModal';
import { AddPaperModal } from '@/components/modals/AddPaperModal';
import { AddPollModal } from '@/components/modals/AddPollModal';

export default function DashboardPage() {
  const router = useRouter();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  const handleTabNavigation = (tab: string) => {
    if (tab === 'dashboard') router.push('/dashboard');
    else if (tab === 'milestones' || tab === 'thesis') router.push('/milestones');
    else if (tab === 'kanban') router.push('/kanban');
    else if (tab === 'consultation' || tab === 'scheduler') router.push('/scheduler');
    else if (tab === 'files') router.push('/files');
    else if (tab === 'literature') router.push('/literature');
    else if (tab === 'labbook' || tab === 'logs') router.push('/logs');
    else if (tab === 'supervisor') router.push('/dashboard');
  };

  return (
    <>
      <DashboardClient
        setActiveTab={handleTabNavigation}
        openAddTaskModal={() => setIsTaskModalOpen(true)}
        openAddFileModal={() => setIsFileModalOpen(true)}
        openAddPaperModal={() => setIsPaperModalOpen(true)}
        openAddPollModal={() => setIsPollModalOpen(true)}
      />

      <AddTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <AddFileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
      />

      <AddPaperModal
        isOpen={isPaperModalOpen}
        onClose={() => setIsPaperModalOpen(false)}
      />

      <AddPollModal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
      />
    </>
  );
}
