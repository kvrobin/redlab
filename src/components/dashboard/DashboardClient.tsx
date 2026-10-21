'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  GraduationCap,
  BookOpenCheck,
  CheckCircle2,
  CalendarCheck2,
  AlertTriangle,
  Clock,
  Plus,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Download,
  Flame,
  FileCode,
  Layers,
  ArrowRight,
  Sparkles,
  CheckSquare,
  Video,
  ListTodo,
  ThumbsUp,
  MessageSquare,
  X,
  FileText,
} from 'lucide-react';
import { formatNumber, formatDateHungarian, formatDateOnlyHungarian } from '@/lib/utils';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Milestone, KanbanTask, WorkstreamType, TaskPriority } from '@/types';
import { toast } from 'sonner';

interface DashboardClientProps {
  setActiveTab: (tab: string) => void;
  openAddTaskModal: () => void;
  openAddFileModal: () => void;
  openAddPaperModal: () => void;
  openAddPollModal: () => void;
}

export function DashboardClient({
  setActiveTab,
  openAddTaskModal,
  openAddFileModal,
  openAddPaperModal,
  openAddPollModal,
}: DashboardClientProps) {
  const {
    currentProfile,
    profiles,
    isSupervisorMode,
    toggleSupervisorMode,
    milestones,
    tasks,
    moveTask,
    toggleChecklistItem,
    meetings,
    repositoryFiles,
    supervisorApproveMilestone,
    supervisorRequestRevision,
  } = useStore();

  // Supervisor quick review modal state
  const [selectedMilestoneForAction, setSelectedMilestoneForAction] = useState<Milestone | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isApproving, setIsApproving] = useState(true);

  // Stats calculation
  const totalWords = milestones.reduce((acc, m) => acc + (m.current_words || 0), 0);
  const targetWords = milestones.reduce((acc, m) => acc + (m.target_words || 0), 0);
  const overallProgressPercent = targetWords > 0 ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0;
  const approvedMilestonesCount = milestones.filter((m) => m.status === 'approved').length;
  const awaitingApprovalMilestones = milestones.filter((m) => m.status === 'awaiting_approval');

  // Tasks stats
  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const criticalTasksCount = tasks.filter((t) => t.priority === 'critical' && t.status !== 'done').length;
  const professorReviewTasks = tasks.filter((t) => t.status === 'review_professor');

  // My focus tasks for the logged-in user
  const myTasks = tasks.filter((t) => {
    if (t.status === 'done') return false;
    return (
      t.assigned_to === currentProfile.id ||
      (t.co_assignees && t.co_assignees.includes(currentProfile.id))
    );
  });

  // Upcoming confirmed consultation
  const confirmedMeetings = meetings
    .filter((m) => m.status === 'confirmed' && m.confirmed_slot_id)
    .sort((a, b) => {
      const slotA = a.slots.find((s) => s.id === a.confirmed_slot_id)?.start_time || '';
      const slotB = b.slots.find((s) => s.id === b.confirmed_slot_id)?.start_time || '';
      return new Date(slotA).getTime() - new Date(slotB).getTime();
    });
  const nextMeeting = confirmedMeetings[0];
  const nextMeetingSlot = nextMeeting?.slots.find((s) => s.id === nextMeeting.confirmed_slot_id);

  // Urgent meetings requiring voting or rescheduling
  const urgentMeetings = meetings.filter(
    (m) => m.status === 'voting' || m.status === 'reschedule_needed'
  );

  // Workstream counts
  const workstreamStats: { type: WorkstreamType; label: string; count: number; color: string }[] = [
    { type: 'wet_lab', label: 'Wet Lab', count: tasks.filter((t) => t.workstream === 'wet_lab').length, color: 'bg-emerald-500' },
    { type: 'dry_lab_code', label: 'Dry Lab & Kód', count: tasks.filter((t) => t.workstream === 'dry_lab_code').length, color: 'bg-blue-500' },
    { type: 'cad_hardware', label: 'CAD & Hardver', count: tasks.filter((t) => t.workstream === 'cad_hardware').length, color: 'bg-amber-500' },
    { type: 'thesis_writing', label: 'Kéziratírás', count: tasks.filter((t) => t.workstream === 'thesis_writing').length, color: 'bg-rose-500' },
    { type: 'administration', label: 'Adminisztráció', count: tasks.filter((t) => t.workstream === 'administration').length, color: 'bg-purple-500' },
  ];

  // Latest thesis manuscript file
  const latestManuscript = repositoryFiles.find(
    (f) => f.folder_category === 'thesis_writing' && f.is_latest
  ) || repositoryFiles[0];

  const handleDownloadManuscript = () => {
    toast.success('Kézirat Dosszié Exportálva!', {
      description: `${latestManuscript?.file_name} (v${latestManuscript?.version_number || 1}) sikeresen letöltve.`,
    });
  };

  const handleOpenApprovalModal = (milestone: Milestone, approve: boolean) => {
    setSelectedMilestoneForAction(milestone);
    setIsApproving(approve);
    setFeedbackText(
      approve
        ? 'A fejezet szerkezete és a mérési adatok megfelelnek a szakdolgozati követelményeknek. Hivatalosan szignálva.'
        : 'Kérlek pótold a mérési bizonytalanságok és a konvergencia-analízis részletes ábráit.'
    );
  };

  const handleSubmitMilestoneAction = () => {
    if (!selectedMilestoneForAction) return;
    if (isApproving) {
      supervisorApproveMilestone(selectedMilestoneForAction.id, feedbackText);
    } else {
      supervisorRequestRevision(selectedMilestoneForAction.id, feedbackText);
    }
    setSelectedMilestoneForAction(null);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP BANNER / GREETING */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#181B26] to-[#12141D] border border-[#1E2230] p-6 shadow-xl relative overflow-hidden">
        {/* Crimson glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-rose-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold tracking-wider uppercase">
                RED LAB VEZÉRLŐPULT
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] font-mono text-slate-400">
                {isSupervisorMode ? 'TÉMAVEZETŐI NÉZET' : 'KUTATÓI NÉZET'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
              Üdvözlünk, <span className="text-rose-400">{currentProfile.full_name}</span>!
              {isSupervisorMode && (
                <span className="text-xs px-2.5 py-1 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/60 font-semibold flex items-center">
                  <GraduationCap className="w-3.5 h-3.5 mr-1" />
                  Executive Mode
                </span>
              )}
            </h1>

            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {isSupervisorMode
                ? 'Professzori döntéshozatali központ: jóváhagyások, felülvizsgálatok és a szakdolgozati haladás áttekintése.'
                : 'A RED Lab zártkörű kutatócsoporti felülete. Robin, Emma és Domi közös szakdolgozati munkafolyamata.'}
            </p>
          </div>

          {/* Quick Switch or Supervisor Toggle */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={toggleSupervisorMode}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSupervisorMode
                  ? 'bg-purple-950/60 text-purple-200 border-purple-700/60 shadow-lg shadow-purple-950/40 hover:bg-purple-900/60'
                  : 'bg-slate-900/80 text-slate-300 border-[#1E2230] hover:border-slate-700 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>{isSupervisorMode ? 'Váltás Kutatói Nézetre' : 'Váltás Professzori Nézetre'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUPERVISOR EXECUTIVE VIEW (if isSupervisorMode === true) */}
      {/* ========================================================================= */}
      {isSupervisorMode ? (
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Pending Approvals */}
            <div className="rounded-2xl bg-[#12141D] border border-purple-900/40 p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-purple-300 font-semibold uppercase tracking-wider">
                  Jóváhagyásra Váró Mérföldkövek
                </span>
                <span className="p-2 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/60">
                  <BookOpenCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black font-mono text-white">
                  {awaitingApprovalMilestones.length}
                </span>
                <span className="text-xs text-purple-300 font-mono">fejezet szignóra vár</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {awaitingApprovalMilestones.length > 0
                  ? 'Azonnali professzori szignálást igényel!'
                  : 'Nincs függőben lévő jóváhagyási kérelem.'}
              </p>
            </div>

            {/* Card 2: Professor Task Reviews */}
            <div className="rounded-2xl bg-[#12141D] border border-blue-900/40 p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-blue-300 font-semibold uppercase tracking-wider">
                  Bírálatra Váró Feladatok
                </span>
                <span className="p-2 rounded-xl bg-blue-950/80 text-blue-300 border border-blue-800/60">
                  <CheckSquare className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black font-mono text-white">
                  {professorReviewTasks.length}
                </span>
                <span className="text-xs text-blue-300 font-mono">feladat kész</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                A kutatók befejezték és ellenőrzést kérnek.
              </p>
            </div>

            {/* Card 3: Manuscript Progress */}
            <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Kézirat Összkészültség
                </span>
                <span className="p-2 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-900/50">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black font-mono text-white">
                  {overallProgressPercent}%
                </span>
                <span className="text-xs text-slate-400 font-mono" suppressHydrationWarning>
                  {formatNumber(totalWords)} / {formatNumber(targetWords)} szó
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-red-600 via-rose-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Card 4: Next Consultation */}
            <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Következő Konzultáció
                </span>
                <span className="p-2 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-900/50">
                  <CalendarCheck2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-sm font-bold text-white truncate" suppressHydrationWarning>
                  {nextMeetingSlot ? formatDateHungarian(nextMeetingSlot.start_time) : 'Nincs kitűzve'}
                </div>
                <div className="text-[11px] font-mono text-amber-400 mt-1 truncate">
                  {nextMeeting ? nextMeeting.title : 'Szavazás szükséges'}
                </div>
              </div>
              {nextMeeting?.location_or_link && (
                <a
                  href={nextMeeting.location_or_link.startsWith('http') ? nextMeeting.location_or_link : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center text-xs font-semibold text-rose-400 hover:text-rose-300"
                >
                  <Video className="w-3.5 h-3.5 mr-1" />
                  Csatlakozás a híváshoz
                </a>
              )}
            </div>
          </div>

          {/* Supervisor Decision Center: Awaiting Milestones & Review Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Milestones awaiting Sign-Off */}
            <div className="rounded-2xl bg-[#12141D] border border-purple-900/40 p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    1-Kattintásos Mérföldkő Jóváhagyás (Sign-Off)
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                  {awaitingApprovalMilestones.length} fejezet
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {awaitingApprovalMilestones.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-[#1E2230] text-slate-500 text-xs">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    Minden eddig beküldött fejezet és mérföldkő elbírálva!
                  </div>
                ) : (
                  awaitingApprovalMilestones.map((ms) => (
                    <div
                      key={ms.id}
                      className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/50 hover:border-purple-600/70 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 font-bold">
                            FÁZIS #{ms.phase_number}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1.5">{ms.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ms.description}</p>
                          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400 mt-2">
                            <span suppressHydrationWarning>Terjedelem: {formatNumber(ms.current_words || 0)} szó</span>
                            <span>•</span>
                            <span>Határidő: {ms.due_date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-purple-900/40 flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenApprovalModal(ms, false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60 transition-colors"
                        >
                          Javítást kérek 💬
                        </button>
                        <button
                          onClick={() => handleOpenApprovalModal(ms, true)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Jóváhagyom a mérföldkövet ✅</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Professor Review Tasks */}
            <div className="rounded-2xl bg-[#12141D] border border-blue-900/40 p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Professzori Bírálatra Váró Feladatok
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  {professorReviewTasks.length} feladat
                </span>
              </div>

              <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {professorReviewTasks.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-[#1E2230] text-slate-500 text-xs">
                    <CheckCircle2 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    Jelenleg nincs átnézésre beküldött sprint feladat.
                  </div>
                ) : (
                  professorReviewTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230] hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {t.workstream}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-rose-400">
                              {t.priority.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-100 mt-1">{t.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{t.description}</p>
                          <div className="text-[10px] font-mono text-slate-500 mt-1.5">
                            Felelős: <strong className="text-slate-300">{profiles.find((p) => p.id === t.assigned_to)?.full_name || 'Kutató'}</strong>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0 ml-2">
                          <button
                            onClick={() => {
                              moveTask(t.id, 'in_progress');
                              toast.info(`Feladat visszaküldve átdolgozásra: ${t.title}`);
                            }}
                            className="p-1.5 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60 text-[10px]"
                            title="Visszaküldés javításra"
                          >
                            Javítás
                          </button>
                          <button
                            onClick={() => {
                              moveTask(t.id, 'done');
                              toast.success(`Feladat elfogadva (Done): ${t.title}`);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                            title="Elfogadás (Done)"
                          >
                            Elfogad ✅
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Research Team Status & Consolidated Manuscript Dossier */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Individual Status */}
            <div className="lg:col-span-2 rounded-2xl bg-[#12141D] border border-[#1E2230] p-5 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
                Kutatói Csapat Státusz & Fókuszterületek
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {profiles
                  .filter((p) => p.role === 'researcher')
                  .map((res) => {
                    const resTasks = tasks.filter(
                      (t) => t.assigned_to === res.id || (t.co_assignees && t.co_assignees.includes(res.id))
                    );
                    const doneCount = resTasks.filter((t) => t.status === 'done').length;
                    return (
                      <div
                        key={res.id}
                        className="p-4 rounded-xl bg-slate-900/50 border border-[#1E2230] space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: res.badge_color }}
                          >
                            {res.short_code}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{res.full_name}</h4>
                            <span className="text-[10px] font-mono text-slate-400 block truncate">
                              {res.primary_workstream}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#1E2230] text-[11px] font-mono text-slate-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Sprint feladatok:</span>
                            <span className="text-white font-bold">{resTasks.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Befejezve:</span>
                            <span className="text-emerald-400 font-bold">{doneCount}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Consolidated Thesis Dossier Card */}
            <div className="rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#12141D] to-[#12141D] border border-purple-900/50 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 font-bold">
                  DISSZERTÁCIÓ DOSSZIÉ
                </span>
                <h3 className="text-sm font-bold text-white mt-2">
                  Konszolidált Szakdolgozat Kézirat
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Minden jóváhagyott és piszkozat fejezet egyetlen dokumentumba fűzve, IEEE sablon szerint.
                </p>
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-[#1E2230] text-[11px] font-mono text-slate-300">
                  📁 {latestManuscript?.file_name} (v{latestManuscript?.version_number || 1})
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-900/30">
                <button
                  onClick={handleDownloadManuscript}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Kézirat Letöltése Átolvasásra (.docx)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. NORMAL RESEARCHER COMMAND CENTER DASHBOARD */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Szakdolgozat Összkészültség */}
            <div
              onClick={() => setActiveTab('thesis')}
              className="group cursor-pointer rounded-2xl bg-[#12141D] hover:bg-[#161924] border border-[#1E2230] hover:border-rose-500/40 p-5 shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Szakdolgozat Készültség
                </span>
                <span className="p-2 rounded-xl bg-rose-950/50 text-rose-400 border border-rose-900/40 group-hover:bg-rose-900/50 transition-colors">
                  <BookOpenCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black font-mono text-white">
                  {overallProgressPercent}%
                </span>
                <span className="text-xs text-slate-400 font-mono" suppressHydrationWarning>
                  {formatNumber(totalWords)} / {formatNumber(targetWords)} szó
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-red-600 via-rose-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Szignózva: {approvedMilestonesCount} / {milestones.length} fejezet</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-400 transition-colors" />
              </div>
            </div>

            {/* KPI 2: Aktív Sprint Feladatok */}
            <div
              onClick={() => setActiveTab('kanban')}
              className="group cursor-pointer rounded-2xl bg-[#12141D] hover:bg-[#161924] border border-[#1E2230] hover:border-blue-500/40 p-5 shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Aktív Sprint Feladatok
                </span>
                <span className="p-2 rounded-xl bg-blue-950/50 text-blue-400 border border-blue-900/40 group-hover:bg-blue-900/50 transition-colors">
                  <ListTodo className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black font-mono text-white">
                  {activeTasks.length}
                </span>
                <span className="text-xs text-blue-400 font-mono">aktív teendő</span>
              </div>
              <div className="mt-2 flex items-center space-x-2 text-[11px] font-mono">
                {criticalTasksCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold flex items-center">
                    <Flame className="w-3 h-3 mr-1 text-rose-400" />
                    {criticalTasksCount} kritikus
                  </span>
                ) : (
                  <span className="text-emerald-400">Nincs blokkoló feladat</span>
                )}
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>To Do: {tasks.filter((t) => t.status === 'todo').length} | Folyamatban: {tasks.filter((t) => t.status === 'in_progress').length}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>

            {/* KPI 3: Következő Megerősített Konzultáció */}
            <div
              onClick={() => setActiveTab('consultation')}
              className="group cursor-pointer rounded-2xl bg-[#12141D] hover:bg-[#161924] border border-[#1E2230] hover:border-emerald-500/40 p-5 shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Következő Konzultáció
                </span>
                <span className="p-2 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 group-hover:bg-emerald-900/50 transition-colors">
                  <CalendarCheck2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-sm font-bold text-white truncate" suppressHydrationWarning>
                  {nextMeetingSlot ? formatDateHungarian(nextMeetingSlot.start_time) : 'Nincs egyeztetve'}
                </div>
                <div className="text-[11px] font-mono text-emerald-400 mt-0.5 truncate">
                  {nextMeeting ? `${nextMeeting.title} (${nextMeeting.duration_minutes}p)` : 'Szavazás kiírása szükséges'}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-emerald-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Megerősítve
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>

            {/* KPI 4: Szavazásra Váró Megbeszélések */}
            <div
              onClick={() => setActiveTab('consultation')}
              className={`group cursor-pointer rounded-2xl p-5 shadow-lg transition-all border ${
                urgentMeetings.length > 0
                  ? 'bg-rose-950/20 hover:bg-rose-950/30 border-rose-800/60'
                  : 'bg-[#12141D] hover:bg-[#161924] border-[#1E2230]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Időpont-egyeztetés
                </span>
                <span
                  className={`p-2 rounded-xl border ${
                    urgentMeetings.length > 0
                      ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                      : 'bg-slate-900 text-slate-400 border-[#1E2230]'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black font-mono text-white">
                  {urgentMeetings.length}
                </span>
                <span className="text-xs text-rose-400 font-mono">szavazásra vár</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {urgentMeetings.length > 0
                  ? 'Közös időpont-döntés szükséges a professzorral!'
                  : 'Minden időpont lezárva és megerősítve.'}
              </p>
              <div className="mt-2 flex justify-end">
                <span className="text-xs text-rose-400 font-semibold group-hover:underline flex items-center">
                  Szavazok most <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons Bar */}
          <div className="p-4 rounded-2xl bg-[#12141D] border border-[#1E2230] flex flex-wrap items-center justify-between gap-3 shadow-md">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
              Gyors Műveletek:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openAddTaskModal}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50 transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Új Feladat</span>
              </button>

              <button
                onClick={openAddPollModal}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Új Időpont-szavazás</span>
              </button>

              <button
                onClick={openAddFileModal}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Fájl / Verzió Feltöltése</span>
              </button>

              <button
                onClick={openAddPaperModal}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Cikk Hozzáadása (DOI)</span>
              </button>
            </div>
          </div>

          {/* "Saját fókuszom ma" blokk */}
          <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2230]">
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: currentProfile.badge_color }}
                >
                  {currentProfile.short_code}
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Saját Fókuszom Ma
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    A nevedre kitűzött aktív feladatok ({currentProfile.full_name})
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {myTasks.length} feladat
              </span>
            </div>

            <div className="mt-4">
              {myTasks.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-[#1E2230] text-slate-500 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  Nincs mára kitűzött személyes feladatod – válassz egyet a Kanban tábláról!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {myTasks.map((t) => {
                    const doneChecks = t.checklist.filter((c) => c.done).length;
                    return (
                      <div
                        key={t.id}
                        className="p-4 rounded-xl bg-slate-900/70 border border-[#1E2230] hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {t.workstream}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                t.priority === 'critical'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : t.priority === 'high'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {t.priority.toUpperCase()}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-100 mt-2">{t.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{t.description}</p>
                        </div>

                        {/* Checklist preview */}
                        {t.checklist.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-[#1E2230]">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400">
                              <span>Checklist:</span>
                              <span>{doneChecks}/{t.checklist.length} kész</span>
                            </div>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {t.checklist.slice(0, 2).map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => toggleChecklistItem(t.id, item.id)}
                                  className="flex items-center space-x-2 text-[11px] cursor-pointer text-slate-300 hover:text-white"
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.done}
                                    onChange={() => {}}
                                    className="rounded border-slate-700 text-rose-600 focus:ring-0"
                                  />
                                  <span className={`truncate ${item.done ? 'line-through text-slate-500' : ''}`}>
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status switcher */}
                        <div className="pt-2 border-t border-[#1E2230] flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400 capitalize">
                            Státusz: <strong className="text-slate-200">{t.status}</strong>
                          </span>
                          <button
                            onClick={() => {
                              if (t.status === 'todo') moveTask(t.id, 'in_progress');
                              else if (t.status === 'in_progress') moveTask(t.id, 'review_professor');
                              else if (t.status === 'review_professor') moveTask(t.id, 'done');
                            }}
                            className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          >
                            {t.status === 'todo' && 'Indítás ▶'}
                            {t.status === 'in_progress' && 'Bírálatra küldés 🎓'}
                            {t.status === 'review_professor' && 'Késznek jelölés ✅'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Grid: Workstreams Status & Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workstreams breakdown & Git repository status */}
            <div className="lg:col-span-1 space-y-6">
              {/* Workstream summary */}
              <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-5 shadow-lg">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3">
                  Munkafolyamat Eloszlás
                </h3>
                <div className="space-y-3">
                  {workstreamStats.map((ws) => (
                    <div key={ws.type} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">{ws.label}</span>
                        <span className="text-slate-400">{ws.count} feladat</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`${ws.color} h-full rounded-full`}
                          style={{
                            width: `${tasks.length > 0 ? (ws.count / tasks.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Git Commits & Files */}
              <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Legutóbbi Git Verziók
                  </h3>
                  <button
                    onClick={() => setActiveTab('files')}
                    className="text-[11px] font-mono text-rose-400 hover:underline"
                  >
                    Összes fájl
                  </button>
                </div>

                <div className="space-y-2.5">
                  {repositoryFiles.slice(0, 4).map((f) => (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-[#1E2230] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-200 font-semibold truncate max-w-[170px]">
                          {f.file_name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/40">
                          v{f.version_number}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{f.commit_message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Real-time Activity Feed */}
            <div className="lg:col-span-2">
              <ActivityFeed onNavigateTab={setActiveTab} />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: SUPERVISOR APPROVE / REVISE PROMPT */}
      {/* ========================================================================= */}
      {selectedMilestoneForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#12141D] border border-purple-800/60 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  {isApproving ? 'Mérföldkő Jóváhagyása & Szignó' : 'Javítás & Átdolgozás Kérése'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMilestoneForAction(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 font-bold">
                FÁZIS #{selectedMilestoneForAction.phase_number}
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                {selectedMilestoneForAction.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {selectedMilestoneForAction.description}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                Témavezetői Visszajelzés (Megjegyzés):
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-slate-900 border border-[#1E2230] p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                placeholder="Írd le a kutatóknak szánt észrevételeket..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#1E2230]">
              <button
                onClick={() => setSelectedMilestoneForAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Mégse
              </button>
              <button
                onClick={handleSubmitMilestoneAction}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-colors flex items-center space-x-1.5 ${
                  isApproving
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproving ? 'Hivatalos Jóváhagyás (Sign-Off)' : 'Átdolgozási Kérelem Elküldése'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
