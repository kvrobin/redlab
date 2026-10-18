'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Milestone, MilestoneStatus } from '@/types';
import {
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  ListTodo,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  AlertTriangle,
  ChevronRight,
  FileCode,
  X,
} from 'lucide-react';
import { formatNumber, formatDateHungarian, formatDateOnlyHungarian } from '@/lib/utils';
import { AddEditMilestoneModal } from '@/components/modals/AddEditMilestoneModal';
import { toast } from 'sonner';

export function MilestoneTimeline() {
  const {
    milestones,
    tasks,
    currentProfile,
    isSupervisorMode,
    submitMilestoneForReview,
    supervisorApproveMilestone,
    supervisorRequestRevision,
    deleteMilestone,
    repositoryFiles,
    updateMilestoneContent,
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMilestoneForEdit, setSelectedMilestoneForEdit] = useState<Milestone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Editor modal state
  const [draftEditorMilestone, setDraftEditorMilestone] = useState<Milestone | null>(null);
  const [editorText, setEditorText] = useState('');

  // Supervisor feedback quick prompt
  const [actionPromptMilestone, setActionPromptMilestone] = useState<Milestone | null>(null);
  const [isApproving, setIsApproving] = useState(true);
  const [feedbackInput, setFeedbackInput] = useState('');

  // Overall calculations
  const totalWords = milestones.reduce((acc, m) => acc + (m.current_words || 0), 0);
  const targetWords = milestones.reduce((acc, m) => acc + (m.target_words || 0), 0);
  const overallProgress = targetWords > 0 ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0;
  const approvedCount = milestones.filter((m) => m.status === 'approved').length;
  const pendingCount = milestones.filter((m) => m.status === 'awaiting_approval').length;

  // Filtered milestones sorted by phase_number
  const sortedMilestones = [...milestones].sort((a, b) => a.phase_number - b.phase_number);
  const filteredMilestones = sortedMilestones.filter((m) => {
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
  });

  const getStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
            Szignózva & Jóváhagyva
          </span>
        );
      case 'awaiting_approval':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800 animate-pulse">
            <GraduationCap className="w-3 h-3 mr-1 text-purple-400" />
            Témavezetői Bírálatra Vár
          </span>
        );
      case 'revision_requested':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-400" />
            Átdolgozandó (Javítás kérve)
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-950 text-blue-300 border border-blue-800">
            <Clock className="w-3 h-3 mr-1 text-blue-400" />
            Kidolgozás alatt
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-900 border border-[#1E2230]">
            Tervezett
          </span>
        );
    }
  };

  const handleOpenDraftEditor = (m: Milestone) => {
    setDraftEditorMilestone(m);
    setEditorText(
      m.content_draft ||
        `# ${m.title}\n\n## 1. Bevezetés és Elméleti Hátter\nA kutatási fázis során rögzített kísérleti paraméterek és az elvégzett mérések bemutatása...\n\n## 2. Módszertan és Kísérleti Elrendezés\nA RED Lab infrastruktúrájában elvégzett tesztek és szimulációk eredményei.\n\n## 3. Eredmények és Diszkusszió\n(Írd ide a fejezet kidolgozott szövegét...)`
    );
  };

  const handleSaveDraft = () => {
    if (!draftEditorMilestone) return;
    const wordCount = editorText.trim().split(/\s+/).filter(Boolean).length;
    updateMilestoneContent(draftEditorMilestone.id, editorText, wordCount);
    setDraftEditorMilestone(null);
  };

  const handleOpenSupervisorAction = (m: Milestone, approve: boolean) => {
    setActionPromptMilestone(m);
    setIsApproving(approve);
    setFeedbackInput(
      approve
        ? 'A fejezet elméleti és gyakorlati része megfelel a tanszéki követelményeknek. Hivatalosan szignálva a disszertációhoz.'
        : 'Kérem a mérési bizonytalanságok és a kísérleti adatok részletesebb kifejtését a 3. fejezetben.'
    );
  };

  const handleExecuteSupervisorAction = () => {
    if (!actionPromptMilestone) return;
    if (isApproving) {
      supervisorApproveMilestone(actionPromptMilestone.id, feedbackInput);
    } else {
      supervisorRequestRevision(actionPromptMilestone.id, feedbackInput);
    }
    setActionPromptMilestone(null);
  };

  const handleExportConsolidatedDossier = () => {
    toast.success('Szakdolgozati Kézirat Összefűzve & Letöltve!', {
      description: `${milestones.length} fejezet, ${formatNumber(totalWords)} szó összefűzve (REDLab_Thesis_Manuscript.docx).`,
    });
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & SUMMARY CARD */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold tracking-wider uppercase">
                HALADÁSI TERV & ROADMAP
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] font-mono text-slate-400">
                Szakdolgozati Fejezetek & Témavezetői Szignók
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              Kutatási Mérföldkövek & Kézirat Idővonal
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Vizuális fázisterv a kezdeti irodalomkutatástól a laboratóriumi méréseken át a védésre kész disszertációig.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportConsolidatedDossier}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Teljes Kézirat Export (.docx)</span>
            </button>

            <button
              onClick={() => {
                setSelectedMilestoneForEdit(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Új Mérföldkő</span>
            </button>
          </div>
        </div>

        {/* Progress KPI Bar */}
        <div className="mt-6 pt-5 border-t border-[#1E2230] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Összesített Készültség</span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {overallProgress}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-red-600 to-emerald-400 h-full rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Össz Szószám</span>
            <div className="text-2xl font-black font-mono text-white mt-1" suppressHydrationWarning>
              {formatNumber(totalWords)}
              <span className="text-xs font-normal text-slate-400 ml-1">/ {formatNumber(targetWords)}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">IEEE szabvány terjedelem</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Jóváhagyott Fejezetek</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {approvedCount} <span className="text-xs font-normal text-slate-400">/ {milestones.length} fejezet</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Hivatalos szignóval ellátva</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Bírálatra Vár</span>
            <div className="text-2xl font-black font-mono text-purple-400 mt-1">
              {pendingCount} fejezet
            </div>
            <span className="text-[10px] font-mono text-slate-500">Professzori visszajelzés függőben</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER TABS */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-mono">
          {[
            { id: 'all', label: 'Összes Mérföldkő' },
            { id: 'awaiting_approval', label: `Bírálatra vár (${pendingCount})` },
            { id: 'approved', label: `Jóváhagyva (${approvedCount})` },
            { id: 'in_progress', label: 'Folyamatban' },
            { id: 'revision_requested', label: 'Átdolgozandó' },
            { id: 'upcoming', label: 'Tervezett' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-rose-900/50 text-rose-200 border border-rose-700/60 font-semibold'
                  : 'bg-[#12141D] text-slate-400 hover:text-white border border-[#1E2230]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-slate-500 shrink-0">
          Megjelenítve: {filteredMilestones.length} / {milestones.length} fázis
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 3. VISUAL ROADMAP TIMELINE */}
      {/* ========================================================================= */}
      <div className="relative pl-4 sm:pl-8 space-y-6 before:absolute before:top-4 before:bottom-4 before:left-3 sm:before:left-4 before:w-0.5 before:bg-gradient-to-b before:from-rose-500 before:via-purple-500/50 before:to-slate-800">
        {filteredMilestones.map((ms, idx) => {
          // Find associated tasks for this milestone
          const milestoneTasks = tasks.filter(
            (t) => t.milestone_id === ms.id || t.title.toLowerCase().includes(`fázis ${ms.phase_number}`)
          );
          const doneTasksCount = milestoneTasks.filter((t) => t.status === 'done').length;

          // Find associated deliverable file
          const attachedFile = repositoryFiles.find(
            (f) => f.milestone_id === ms.id || (ms.deliverable_url && f.storage_path.includes(ms.deliverable_url))
          );

          const isApproved = ms.status === 'approved';
          const isAwaiting = ms.status === 'awaiting_approval';
          const isRevision = ms.status === 'revision_requested';

          return (
            <div key={ms.id} className="relative group">
              {/* Timeline node bullet */}
              <div
                className={`absolute -left-[25px] sm:-left-[29px] top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isApproved
                    ? 'bg-emerald-500 border-emerald-300 ring-4 ring-emerald-950 shadow-md shadow-emerald-500/40'
                    : isAwaiting
                    ? 'bg-purple-500 border-purple-300 ring-4 ring-purple-950 animate-pulse'
                    : isRevision
                    ? 'bg-amber-500 border-amber-300 ring-4 ring-amber-950'
                    : 'bg-[#12141D] border-slate-600'
                }`}
              >
                {isApproved && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>

              {/* Milestone Card */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xl ${
                  isApproved
                    ? 'bg-[#12141D] border-emerald-900/50 hover:border-emerald-700/60'
                    : isAwaiting
                    ? 'bg-purple-950/20 border-purple-800/50 hover:border-purple-600/70'
                    : isRevision
                    ? 'bg-amber-950/20 border-amber-800/50 hover:border-amber-600/70'
                    : 'bg-[#12141D] border-[#1E2230] hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E2230]">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-slate-900 text-rose-400 border border-rose-900/40">
                      FÁZIS #{String(ms.phase_number).padStart(2, '0')}
                    </span>
                    <h3 className="text-base font-bold text-white">{ms.title}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(ms.status)}
                    <span className="text-[11px] font-mono text-slate-400 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {ms.due_date}
                    </span>
                  </div>
                </div>

                {/* Description & Targets */}
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Description & Progress */}
                  <div className="lg:col-span-2 space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ms.description}
                    </p>

                    {/* Progress Bar & Word count */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Haladás: <strong className="text-white">{ms.progress_percent}%</strong></span>
                        <span suppressHydrationWarning>
                          {formatNumber(ms.current_words || 0)} / {formatNumber(ms.target_words || 0)} szó
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isApproved
                              ? 'bg-emerald-400'
                              : isAwaiting
                              ? 'bg-purple-400'
                              : 'bg-gradient-to-r from-red-600 to-rose-400'
                          }`}
                          style={{ width: `${Math.min(100, ms.progress_percent)}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center px-2 py-1 rounded-lg bg-slate-900 border border-[#1E2230]">
                        <ListTodo className="w-3.5 h-3.5 mr-1 text-blue-400" />
                        Kapcsolódó feladatok: {doneTasksCount}/{milestoneTasks.length} kész
                      </span>

                      {attachedFile && (
                        <span className="flex items-center px-2 py-1 rounded-lg bg-slate-900 border border-[#1E2230] text-emerald-300">
                          <FileCode className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                          Csatolt fájl: {attachedFile.file_name} (v{attachedFile.version_number})
                        </span>
                      )}

                      {ms.deliverable_url && !attachedFile && (
                        <span className="flex items-center px-2 py-1 rounded-lg bg-slate-900 border border-[#1E2230]">
                          <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {ms.deliverable_url}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Supervisor Sign-off Stamp Box */}
                  <div className="rounded-xl bg-slate-900/80 border border-[#1E2230] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#1E2230]/70">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center">
                          <GraduationCap className="w-3.5 h-3.5 mr-1 text-purple-400" />
                          Témavezetői Pecsét
                        </span>
                        {isApproved && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            HITELLESÍTVE
                          </span>
                        )}
                      </div>

                      {isApproved ? (
                        <div className="mt-2.5 space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-300">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Professzori Szignó Megadva</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400" suppressHydrationWarning>
                            Dátum: {formatDateHungarian(ms.approved_at || ms.updated_at)}
                          </div>
                          {ms.supervisor_feedback && (
                            <p className="text-[11px] text-slate-300 italic bg-emerald-950/20 border border-emerald-900/40 p-2 rounded-lg mt-1">
                              &ldquo;{ms.supervisor_feedback}&rdquo;
                            </p>
                          )}
                        </div>
                      ) : isAwaiting ? (
                        <div className="mt-2.5 space-y-1.5">
                          <span className="text-xs font-bold text-purple-300 flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-purple-400" />
                            Szignálásra vár
                          </span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            A fejezet kézirata beküldve Prof. Dr. Kovács István témavezetőnek.
                          </p>
                        </div>
                      ) : isRevision ? (
                        <div className="mt-2.5 space-y-1.5">
                          <span className="text-xs font-bold text-amber-300 flex items-center">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
                            Átdolgozási észrevétel:
                          </span>
                          <p className="text-[11px] text-amber-200 bg-amber-950/30 border border-amber-900/40 p-2 rounded-lg">
                            {ms.supervisor_feedback || 'Kiegészítés és formai igazítás szükséges.'}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2.5 text-[11px] text-slate-500">
                          Még nincs beküldve témavezetői felülvizsgálatra.
                        </div>
                      )}
                    </div>

                    {/* Supervisor Quick Actions */}
                    {isSupervisorMode && (
                      <div className="mt-3 pt-3 border-t border-[#1E2230] flex items-center gap-2">
                        <button
                          onClick={() => handleOpenSupervisorAction(ms, false)}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60 transition-colors"
                        >
                          Javítás 💬
                        </button>
                        <button
                          onClick={() => handleOpenSupervisorAction(ms, true)}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                        >
                          Jóváhagy ✅
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Row */}
                <div className="mt-5 pt-4 border-t border-[#1E2230] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenDraftEditor(ms)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      <span>Kézirat Szerkesztése</span>
                    </button>

                    {!isApproved && ms.status !== 'awaiting_approval' && (
                      <button
                        onClick={() => submitMilestoneForReview(ms.id)}
                        className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-800/60 font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-purple-400" />
                        <span>Beküldés Bírálatra 🎓</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMilestoneForEdit(ms);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Mérföldkő szerkesztése"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMilestone(ms.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Mérföldkő törlése"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: ADD / EDIT MILESTONE */}
      {/* ========================================================================= */}
      <AddEditMilestoneModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMilestoneForEdit(null);
        }}
        milestoneToEdit={selectedMilestoneForEdit}
      />

      {/* ========================================================================= */}
      {/* 5. MODAL: CHAPTER DRAFT EDITOR */}
      {/* ========================================================================= */}
      {draftEditorMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl bg-[#12141D] border border-[#1E2230] p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-rose-500" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {draftEditorMilestone.title} — Fejezet Kézirat Piszkozat
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Szakdolgozat szövegtörzs és tudományos jegyzetek szerkesztése
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDraftEditorMilestone(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                <span>Markdown & Kézirat Szöveg:</span>
                <span>Szavak: {editorText.trim().split(/\s+/).filter(Boolean).length} szó</span>
              </div>
              <textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                className="flex-1 w-full rounded-xl bg-slate-900 border border-[#1E2230] p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed resize-none min-h-[300px]"
                placeholder="Írd ide a fejezet szövegét..."
              />
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E2230] flex items-center justify-between">
              <button
                onClick={() => {
                  submitMilestoneForReview(draftEditorMilestone.id);
                  setDraftEditorMilestone(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-800/60 transition-colors flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Mentés & Beküldés Bírálatra</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDraftEditorMilestone(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Mégse
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50"
                >
                  Piszkozat Mentése
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: SUPERVISOR SIGN-OFF PROMPT */}
      {/* ========================================================================= */}
      {actionPromptMilestone && (
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
                onClick={() => setActionPromptMilestone(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 font-bold">
                FÁZIS #{actionPromptMilestone.phase_number}
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                {actionPromptMilestone.title}
              </h4>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                Témavezetői Visszajelzés (Hivatalos észrevétel):
              </label>
              <textarea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-slate-900 border border-[#1E2230] p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#1E2230]">
              <button
                onClick={() => setActionPromptMilestone(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Mégse
              </button>
              <button
                onClick={handleExecuteSupervisorAction}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-colors flex items-center space-x-1.5 ${
                  isApproving
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproving ? 'Hivatalos Szignó Megadása' : 'Átdolgozási Kérelem Küldése'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
