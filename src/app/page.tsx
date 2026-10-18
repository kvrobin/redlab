'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ThesisManager } from '@/components/thesis/ThesisManager';
import { ResearchLogManager } from '@/components/research-logs/ResearchLogManager';
import { FileManager } from '@/components/files/FileManager';
import { LiteratureManager } from '@/components/literature/LiteratureManager';
import { ConsultationManager } from '@/components/consultation/ConsultationManager';
import { SupervisorView } from '@/components/supervisor/SupervisorView';
import { AddTaskModal } from '@/components/modals/AddTaskModal';
import { AddFileModal } from '@/components/modals/AddFileModal';
import { AddPaperModal } from '@/components/modals/AddPaperModal';
import { AddPollModal } from '@/components/modals/AddPollModal';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  return (
    <>
      <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && (
          <OverviewDashboard
            setActiveTab={setActiveTab}
            openAddTaskModal={() => setIsTaskModalOpen(true)}
            openAddFileModal={() => setIsFileModalOpen(true)}
            openAddPaperModal={() => setIsPaperModalOpen(true)}
          />
        )}

        {activeTab === 'thesis' && <ThesisManager />}

        {activeTab === 'kanban' && (
          <KanbanBoard openAddTaskModal={() => setIsTaskModalOpen(true)} />
        )}

        {activeTab === 'consultation' && (
          <ConsultationManager openAddPollModal={() => setIsPollModalOpen(true)} />
        )}

        {activeTab === 'files' && (
          <FileManager openAddFileModal={() => setIsFileModalOpen(true)} />
        )}

        {activeTab === 'literature' && (
          <LiteratureManager openAddPaperModal={() => setIsPaperModalOpen(true)} />
        )}

        {activeTab === 'labbook' && <ResearchLogManager />}

        {activeTab === 'supervisor' && <SupervisorView />}
      </AppShell>

      {/* Global Action Modals */}
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
