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
  Sparkles,
  FileText,
  AlertTriangle,
  GraduationCap,
  Download,
  Users,
} from 'lucide-react';
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
  const {
    tasks,
    thesisChapters,
    labFiles,
    papers,
    consultationPolls,
    activities,
    currentUser,
    isSupervisorMode,
    supervisorApproveChapter,
  } = useStore();

  const totalWords = thesisChapters.reduce((acc, ch) => acc + ch.currentWords, 0);
  const targetWords = thesisChapters.reduce((acc, ch) => acc + ch.targetWords, 0);
  const progressPercent = Math.min(100, Math.round((totalWords / targetWords) * 100));

  const pendingChapters = thesisChapters.filter((ch) => ch.status === 'felulvizsgalatra_var');
  const approvedChapters = thesisChapters.filter((ch) => ch.status === 'jovahagyva');
  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const nextConsultation = consultationPolls.find((p) => p.status === 'open' || p.status === 'confirmed');

  return (
    <div className="space-y-6">
      {/* Top Banner with Crimson Accent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12141D] via-[#161926] to-[#12141D] border border-[#1E2230] p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                RED LAB KUTATÓCSOPORT
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentUser.name} bejelentkezve ({currentUser.role === 'supervisor' ? 'Témavezető' : 'Kutató'})
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
            <span>{approvedChapters.length}/6 fejezet elfogadva</span>
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
            <span className="text-2xl font-bold font-mono text-white">{pendingChapters.length}</span>
            <span className="text-xs text-amber-400 font-mono">fejezet vár bírálatra</span>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                pendingChapters.length > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className="text-xs text-slate-300 truncate">
              {pendingChapters.length > 0
                ? `${pendingChapters[0].title.substring(0, 24)}...`
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
            <span className="text-xs font-medium uppercase tracking-wider">Következő Konzultáció</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-bold text-emerald-300 truncate">
              {nextConsultation ? nextConsultation.title.substring(0, 22) + '...' : 'Nincs nyitott szavazás'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-300 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[11px]">
              {nextConsultation ? 'Határidő: 2026. 10. 21.' : 'Minden lezárva'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-end mt-2">
            Időpont-egyeztetés <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Main Content 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workstreams and Thesis Quick View (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workstream Progress Cards */}
          <div className="rounded-xl bg-[#12141D] border border-[#1E2230] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
                <Users className="w-4 h-4 mr-2 text-rose-500" />
                RED Lab Workstream Pillanatkép
              </h3>
              <span className="text-xs font-mono text-slate-400">Robin • Emma • Domi</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Robin */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[#1E2230] hover:border-red-500/40 transition-colors">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-white">Robin</span>
                  <span className="text-[10px] font-mono text-slate-400 ml-auto">Lead</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">Projekt-architektúra</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Rendszerintegráció, LaTeX & IEEE sablon, 1. és 5. fejezet koordinációja.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#1E2230] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Feladatok: {tasks.filter((t) => t.assigneeId === 'user-robin').length} db</span>
                  <span className="text-emerald-400">Aktív</span>
                </div>
              </div>

              {/* Emma */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[#1E2230] hover:border-rose-500/40 transition-colors">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-white">Emma</span>
                  <span className="text-[10px] font-mono text-slate-400 ml-auto">Wet-Lab</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">Biomikrofluidika</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  PDMS öntés, plazmatisztítás, Calcein-AM sejttúlélés és optikai mérések.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#1E2230] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Feladatok: {tasks.filter((t) => t.assigneeId === 'user-emma').length} db</span>
                  <span className="text-rose-400">Labor alatt</span>
                </div>
              </div>

              {/* Domi */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[#1E2230] hover:border-orange-500/40 transition-colors">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-xs font-bold text-white">Domi</span>
                  <span className="text-[10px] font-mono text-slate-400 ml-auto">Sim-GPU</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">Szimuláció & ML</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  OpenFOAM CFD, Navier-Stokes, YOLOv11 nagysebességű cseppszegmentáció.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#1E2230] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Feladatok: {tasks.filter((t) => t.assigneeId === 'user-domi').length} db</span>
                  <span className="text-orange-400">Számítás alatt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thesis Chapters Review Panel */}
          <div className="rounded-xl bg-[#12141D] border border-[#1E2230] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Szakdolgozat Fejezetek Státusza
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tudományos kézirat 6 fejezetének aktuális állapota
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
              {thesisChapters.map((chapter) => {
                const chapterPercent = Math.min(100, Math.round((chapter.currentWords / chapter.targetWords) * 100));
                return (
                  <div
                    key={chapter.id}
                    className="p-3.5 rounded-xl bg-slate-900/40 border border-[#1E2230] hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-rose-400">
                          {chapter.chapterNumber}. Fejezet
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {chapter.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                          {chapter.version}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Felelős: {chapter.leadResearcherName} • {chapter.currentWords.toLocaleString()} / {chapter.targetWords.toLocaleString()} szó ({chapterPercent}%)
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {chapter.status === 'jovahagyva' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Jóváhagyva
                        </span>
                      )}
                      {chapter.status === 'felulvizsgalatra_var' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                          <Clock className="w-3 h-3 mr-1" />
                          Bírálatra vár
                        </span>
                      )}
                      {chapter.status === 'tervezet' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          Piszkozat
                        </span>
                      )}

                      {/* Fast supervisor action */}
                      {isSupervisorMode && chapter.status === 'felulvizsgalatra_var' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            supervisorApproveChapter(chapter.id, 'Gyors témavezetői jóváhagyás az áttekintőből.');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 text-xs font-medium transition-colors"
                        >
                          Sign-Off
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Stream & Key Files */}
        <div className="space-y-6">
          {/* Latest Scientific Files */}
          <div className="rounded-xl bg-[#12141D] border border-[#1E2230] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
                <FolderGit2 className="w-4 h-4 mr-2 text-rose-500" />
                Legfrissebb Fájlok
              </h3>
              <button
                onClick={() => setActiveTab('files')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Mind ({labFiles.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {labFiles.slice(0, 4).map((file) => (
                <div
                  key={file.id}
                  onClick={() => setActiveTab('files')}
                  className="p-3 rounded-lg bg-slate-900/50 border border-[#1E2230] hover:border-slate-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200 truncate max-w-[180px]">
                      {file.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40">
                      {file.currentVersion}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    {file.versions[0]?.changelog || file.description}
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
                Élő események
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {activities.slice(0, 7).map((act) => (
                <div key={act.id} className="text-xs border-b border-[#1E2230]/70 pb-2.5 last:border-0">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">{act.userName}</span>
                    <span className="font-mono text-[10px]">{formatDateHungarian(act.timestamp)}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {act.description}{' '}
                    <span className="text-slate-200 font-medium">{act.targetTitle}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
