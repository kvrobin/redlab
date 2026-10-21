'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
  BookOpenCheck,
  KanbanSquare,
  FolderGit2,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  FlaskConical,
  GraduationCap,
  Users,
  Sparkles,
} from 'lucide-react';
import { AiCopilotModal } from '@/components/ai/AiCopilotModal';
import { formatDateHungarian } from '@/lib/utils';

interface OverviewDashboardProps {
  setActiveTab: (tab: string) => void;
  openAddTaskModal: () => void;
  openAddFileModal: () => void;
  openAddPaperModal: () => void;
}

export function OverviewDashboard({
  setActiveTab,
  openAddTaskModal,
  openAddFileModal,
  openAddPaperModal,
}: OverviewDashboardProps) {
  const [isAiBriefingOpen, setIsAiBriefingOpen] = React.useState(false);
  const {
    tasks,
    milestones,
    repositoryFiles,
    literatureItems,
    meetings,
    activityLogs,
    currentProfile,
    isSupervisorMode,
    supervisorApproveMilestone,
  } = useStore();

  const totalWords = milestones.reduce((acc, m) => acc + (m.current_words || 0), 0);
  const targetWords = milestones.reduce((acc, m) => acc + (m.target_words || 0), 0);
  const progressPercent = targetWords > 0 ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0;

  const pendingMilestones = milestones.filter((m) => m.status === 'awaiting_approval');
  const approvedMilestones = milestones.filter((m) => m.status === 'approved');
  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const activeMeeting = meetings.find((m) => m.status === 'voting' || m.status === 'confirmed');

  return (
    <div className="space-y-6">
      {/* Top Banner with Crimson Accent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12141D] via-[#161926] to-[#12141D] border border-[#1E2230] p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                RED LAB SUPABASE CLUSTER
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentProfile.full_name} ({currentProfile.short_code}) • {currentProfile.role === 'supervisor' ? 'Témavezető' : 'Kutató'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Biomikrofluidikai & Numerikus Szimulációs Platform
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Zártkörű, nagy pontosságú tudományos kutatócsoporti felület: feladatok, kézirat-verziók,
              kísérleti adatok és témavezetői jóváhagyások egyetlen integrált környezetben.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={openAddTaskModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Új Feladat</span>
            </button>
            <button
              onClick={openAddFileModal}
              className="px-3.5 py-2 rounded-xl bg-[#181B26] hover:bg-slate-800 text-slate-200 border border-[#1E2230] font-medium text-xs flex items-center space-x-1.5 transition-all"
            >
              <FolderGit2 className="w-4 h-4 text-rose-400" />
              <span>Verzió Feltöltés</span>
            </button>
            <button
              onClick={openAddPaperModal}
              className="px-3.5 py-2 rounded-xl bg-[#181B26] hover:bg-slate-800 text-slate-200 border border-[#1E2230] font-medium text-xs flex items-center space-x-1.5 transition-all"
            >
              <BookOpenCheck className="w-4 h-4 text-amber-400" />
              <span>DOI Cikk</span>
            </button>
            <button
              onClick={() => setIsAiBriefingOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all"
              title="Gemini AI heti szintézis és professzori executive összefoglaló"
            >
              <Sparkles className="w-4 h-4 text-rose-200" />
              <span>✨ Heti AI Riport</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Thesis Progress */}
        <div
          onClick={() => setActiveTab('thesis')}
          className="p-5 rounded-xl bg-[#12141D] border border-[#1E2230] hover:border-rose-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Szakdolgozat Kézirat</span>
            <BookOpenCheck className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{progressPercent}%</span>
            <span className="text-xs font-mono text-slate-400">készültségi fok</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mt-2">
            <span>{approvedMilestones.length}/6 fejezet elfogadva</span>
            <span className="text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center">
              Részletek <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Pending Approvals */}
        <div
          onClick={() => setActiveTab(isSupervisorMode ? 'supervisor' : 'thesis')}
          className="p-5 rounded-xl bg-[#12141D] border border-[#1E2230] hover:border-purple-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Témavezetői Jóváhagyás</span>
            <GraduationCap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{pendingMilestones.length}</span>
            <span className="text-xs text-amber-400 font-mono">fejezet vár bírálatra</span>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                pendingMilestones.length > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className="text-xs text-slate-300 truncate">
              {pendingMilestones.length > 0
                ? `${pendingMilestones[0].title.substring(0, 24)}...`
                : 'Minden fejezet felülvizsgálva'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-end mt-2">
            Bírálat <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </div>
        </div>

        {/* Card 3: Active Tasks */}
        <div
          onClick={() => setActiveTab('kanban')}
          className="p-5 rounded-xl bg-[#12141D] border border-[#1E2230] hover:border-blue-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Kutatási Sprint</span>
            <KanbanSquare className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{activeTasks.length}</span>
            <span className="text-xs font-mono text-slate-400">aktív feladat a táblán</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
            <span className="text-amber-400 font-mono">
              {tasks.filter((t) => t.status === 'in_progress').length} folyamatban
            </span>
            <span className="text-emerald-400 font-mono">
              {tasks.filter((t) => t.status === 'done').length} befejezve
            </span>
          </div>
          <div className="text-[11px] font-mono text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-end mt-2">
            Kanban Tábla <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </div>
        </div>

        {/* Card 4: Upcoming Consultation */}
        <div
          onClick={() => setActiveTab('consultation')}
          className="p-5 rounded-xl bg-[#12141D] border border-[#1E2230] hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Konzultáció & Szavazás</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-bold text-emerald-300 truncate">
              {activeMeeting ? activeMeeting.title.substring(0, 22) + '...' : 'Nincs nyitott szavazás'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-300 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[11px]">
              {activeMeeting?.status === 'confirmed' ? 'Véglegesítve' : activeMeeting?.status === 'reschedule_needed' ? 'Újütemezés szükséges' : 'Szavazás folyamatban'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-end mt-2">
            Egyeztetés <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Main Content 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workstreams and Milestones View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workstream Progress Cards */}
          <div className="rounded-xl bg-[#12141D] border border-[#1E2230] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
                <Users className="w-4 h-4 mr-2 text-rose-500" />
                RED Lab Workstream Pillanatkép
              </h3>
              <span className="text-xs font-mono text-slate-400">Robin (R) • Emma (E) • Domi (D)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Robin */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[#1E2230] hover:border-red-500/40 transition-colors">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">R</span>
                  <span className="text-xs font-bold text-white">Robin</span>
                  <span className="text-[10px] font-mono text-slate-400 ml-auto">Lead</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">Projekt-architektúra</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Rendszerintegráció, LaTeX & IEEE sablon, 1. és 5. fejezet koordinációja.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#1E2230] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Feladatok: {tasks.filter((t) => t.assigned_to === 'user-robin').length} db</span>
                  <span className="text-emerald-400">Aktív</span>
                </div>
              </div>

              {/* Emma */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[#1E2230] hover:border-rose-500/40 transition-colors">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">E</span>
                  <span className="text-xs font-bold text-white">Emma</span>
                  <span className="text-[10px] font-mono text-slate-400 ml-auto">Wet-Lab</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">Biomikrofluidika</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  PDMS öntés, plazmatisztítás, Calcein-AM sejttúlélés és optikai mérések.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#1E2230] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Feladatok: {tasks.filter((t) => t.assigned_to === 'user-emma').length} db</span>
                  <span className="text-rose-400">Labor alatt</span>
                </div>
              </div>

              {/* Domi */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[#1E2230] hover:border-orange-500/40 transition-colors">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center">D</span>
                  <span className="text-xs font-bold text-white">Domi</span>
                  <span className="text-[10px] font-mono text-slate-400 ml-auto">Sim-GPU</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">Szimuláció & ML</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  OpenFOAM CFD, Navier-Stokes, YOLOv11 nagysebességű cseppszegmentáció.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#1E2230] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Feladatok: {tasks.filter((t) => t.assigned_to === 'user-domi').length} db</span>
                  <span className="text-orange-400">Számítás alatt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thesis Milestones Review Panel */}
          <div className="rounded-xl bg-[#12141D] border border-[#1E2230] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Kutatási Mérföldkövek & Fejezetek
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automatizált haladási kalkuláció a kapcsolódó Kanban kártyák alapján
                </p>
              </div>
              <button
                onClick={() => setActiveTab('thesis')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center"
              >
                Kézirat szerkesztő <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="space-y-3">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-slate-900/40 border border-[#1E2230] hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-rose-400">
                        {m.phase_number}. Fázis
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {m.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                        {m.progress_percent}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {m.description}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {m.status === 'approved' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Jóváhagyva
                      </span>
                    )}
                    {m.status === 'awaiting_approval' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                        <Clock className="w-3 h-3 mr-1" />
                        Bírálatra vár
                      </span>
                    )}
                    {m.status === 'in_progress' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        Folyamatban
                      </span>
                    )}
                    {m.status === 'upcoming' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        Közelgő
                      </span>
                    )}

                    {isSupervisorMode && m.status === 'awaiting_approval' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          supervisorApproveMilestone(m.id, 'Gyors jóváhagyás a vezérlőpultból.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 text-xs font-medium transition-colors"
                      >
                        Sign-Off
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key Repositories & Activity */}
        <div className="space-y-6">
          {/* Latest Files in Repository */}
          <div className="rounded-xl bg-[#12141D] border border-[#1E2230] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
                <FolderGit2 className="w-4 h-4 mr-2 text-rose-500" />
                Repozitórium Állományok
              </h3>
              <button
                onClick={() => setActiveTab('files')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Mind ({repositoryFiles.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {repositoryFiles.filter((f) => f.is_latest).slice(0, 4).map((file) => (
                <div
                  key={file.id}
                  onClick={() => setActiveTab('files')}
                  className="p-3 rounded-lg bg-slate-900/50 border border-[#1E2230] hover:border-slate-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200 truncate max-w-[180px]">
                      {file.file_name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40">
                      v{file.version_number}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    {file.commit_message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-xl bg-[#12141D] border border-[#1E2230] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Aktivitási Napló
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                Supabase Audit
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {activityLogs.slice(0, 7).map((act) => (
                <div key={act.id} className="text-xs border-b border-[#1E2230]/70 pb-2.5 last:border-0">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">{act.actor_name}</span>
                    <span className="font-mono text-[10px]" suppressHydrationWarning>{formatDateHungarian(act.created_at)}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    <span className="font-mono text-[10px] px-1 rounded bg-slate-800 text-slate-300 mr-1">{act.action_type}</span>{' '}
                    <strong className="text-slate-200">{act.entity_title}</strong>: {act.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Weekly Briefing Modal */}
      <AiCopilotModal
        isOpen={isAiBriefingOpen}
        onClose={() => setIsAiBriefingOpen(false)}
        mode="weekly_briefing"
      />
    </div>
  );
}
