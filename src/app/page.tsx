'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ThesisManager } from '@/components/thesis/ThesisManager';
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
    <div className="flex min-h-screen bg-[#090A0F] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <OverviewDashboard
              setActiveTab={setActiveTab}
              openAddTaskModal={() => setIsTaskModalOpen(true)}
              openAddFileModal={() => setIsFileModalOpen(true)}
              openAddPaperModal={() => setIsPaperModalOpen(true)}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanBoard openAddTaskModal={() => setIsTaskModalOpen(true)} />
          )}

          {activeTab === 'thesis' && <ThesisManager />}

          {activeTab === 'files' && (
            <FileManager openAddFileModal={() => setIsFileModalOpen(true)} />
          )}

          {activeTab === 'literature' && (
            <LiteratureManager openAddPaperModal={() => setIsPaperModalOpen(true)} />
          )}

          {activeTab === 'consultation' && (
            <ConsultationManager openAddPollModal={() => setIsPollModalOpen(true)} />
          )}

          {activeTab === 'supervisor' && <SupervisorView />}
        </main>
      </div>

      {/* Global Modals */}
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
    </div>
  );
}
