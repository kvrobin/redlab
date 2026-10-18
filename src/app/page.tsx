'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { MilestoneTimeline } from '@/components/milestones/MilestoneTimeline';
import { ThesisManager } from '@/components/thesis/ThesisManager';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ResearchLogManager } from '@/components/research-logs/ResearchLogManager';
import { FileManager } from '@/components/files/FileManager';
import { LiteratureManager } from '@/components/literature/LiteratureManager';
import { ConsultationManager } from '@/components/consultation/ConsultationManager';
import { SupervisorView } from '@/components/supervisor/SupervisorView';
import { AddTaskModal } from '@/components/modals/AddTaskModal';
import { AddFileModal } from '@/components/modals/AddFileModal';
import { AddPaperModal } from '@/components/modals/AddPaperModal';
import { AddPollModal } from '@/components/modals/AddPollModal';
import { BookOpenCheck, Layers } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [thesisSubView, setThesisSubView] = useState<'timeline' | 'editor'>('timeline');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  return (
    <>
      <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && (
          <DashboardClient
            setActiveTab={setActiveTab}
            openAddTaskModal={() => setIsTaskModalOpen(true)}
            openAddFileModal={() => setIsFileModalOpen(true)}
            openAddPaperModal={() => setIsPaperModalOpen(true)}
            openAddPollModal={() => setIsPollModalOpen(true)}
          />
        )}

        {activeTab === 'thesis' && (
          <div className="space-y-4">
            {/* Sub-view toggle for Thesis */}
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2230]">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setThesisSubView('timeline')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    thesisSubView === 'timeline'
                      ? 'bg-rose-950/80 text-rose-200 border border-rose-800 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Haladási Terv & Idővonal (Roadmap)</span>
                </button>

                <button
                  onClick={() => setThesisSubView('editor')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    thesisSubView === 'editor'
                      ? 'bg-rose-950/80 text-rose-200 border border-rose-800 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  <BookOpenCheck className="w-3.5 h-3.5" />
                  <span>Kézirat Íróasztal & Dosszié</span>
                </button>
              </div>
            </div>

            {thesisSubView === 'timeline' ? <MilestoneTimeline /> : <ThesisManager />}
          </div>
        )}

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
