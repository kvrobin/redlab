'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Milestone, MilestoneStatus } from '@/types';
import {
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Edit3,
  Download,
  Send,
  ShieldCheck,
  AlertCircle,
  History,
  X,
  Sparkles,
} from 'lucide-react';
import { formatDateHungarian, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

export function ThesisManager() {
  const {
    milestones,
    updateMilestoneContent,
    submitMilestoneForReview,
    supervisorApproveMilestone,
    supervisorRequestRevision,
    currentProfile,
    isSupervisorMode,
  } = useStore();

  const [activeMilestone, setActiveMilestone] = useState<Milestone>(milestones[0]);
  const [editorContent, setEditorContent] = useState<string>(activeMilestone.content_draft || '');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [modalActionType, setModalActionType] = useState<'approve' | 'revise'>('approve');

  const handleSelectMilestone = (ms: Milestone) => {
    setActiveMilestone(ms);
    setEditorContent(ms.content_draft || '');
  };

  const totalWords = milestones.reduce((acc, m) => acc + (m.current_words || 0), 0);
  const targetWords = milestones.reduce((acc, m) => acc + (m.target_words || 0), 0);
  const progressPercent = targetWords > 0 ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0;

  const approvedCount = milestones.filter((m) => m.status === 'approved').length;
  const pendingCount = milestones.filter((m) => m.status === 'awaiting_approval').length;

  const handleExportFullDossier = () => {
    toast.success('Szakdolgozat Kézirat Összefűzve & Letöltve!', {
      description: `6 fejezet, ${formatNumber(totalWords)} szó, IEEE formai megfelelőség (REDLab_Thesis_Manuscript.docx).`,
    });
  };

  const getStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center">
            <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Jóváhagyva
          </span>
        );
      case 'awaiting_approval':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center animate-pulse">
            <Clock className="w-2.5 h-2.5 mr-1" /> Bírálatra vár
          </span>
        );
      case 'revision_requested':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center">
            <AlertCircle className="w-2.5 h-2.5 mr-1" /> Átdolgozandó
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Folyamatban
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Közelgő
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40">
              SZAKDOLGOZAT & KUTATÁSI MÉRFÖLDKÖVEK
            </span>
            <span className="text-xs text-slate-400 font-mono">
              IEEE / Kar specifikus sablon
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Diplomamunka és Kutatási Szakdolgozat
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            A disszertáció 6 fázisa, fejezeti szószámok és a témavezető professzorok
            hivatalos digitális szignója (Sign-off).
          </p>
        </div>

        <button
          onClick={handleExportFullDossier}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Kézirat Export (.docx)</span>
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#12141D] border border-[#1E2230]">
          <div className="text-xs text-slate-400 uppercase font-medium">Összesített Terjedelem</div>
          <div className="text-2xl font-bold font-mono text-white mt-1" suppressHydrationWarning>
            {formatNumber(totalWords)} <span className="text-xs text-slate-400">/ {formatNumber(targetWords)} szó</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="text-[11px] font-mono text-rose-400 mt-2">{progressPercent}% készültség</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141D] border border-[#1E2230]">
          <div className="text-xs text-slate-400 uppercase font-medium">Témavezetői Jóváhagyás</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {approvedCount} <span className="text-xs text-slate-400">/ 6 fázis</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-3 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
            Véglegesített szövegrészek
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141D] border border-[#1E2230]">
          <div className="text-xs text-slate-400 uppercase font-medium">Bírálati Sorban</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {pendingCount} <span className="text-xs text-slate-400">fejezet várakozik</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-3 flex items-center">
            <Clock className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
            Professzori visszajelzés alatt
          </div>
        </div>
      </div>

      {/* Chapters Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Selector List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mérföldkövek & Fejezetek
            </h4>
            <span className="text-xs font-mono text-slate-500">{milestones.length} mérföldkő</span>
          </div>

          <div className="space-y-2.5">
            {milestones.map((ms) => {
              const isSelected = activeMilestone.id === ms.id;
              return (
                <div
                  key={ms.id}
                  onClick={() => handleSelectMilestone(ms)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#181B26] border-rose-500/60 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/30'
                      : 'bg-[#12141D] border-[#1E2230] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {ms.phase_number}. Fázis
                    </span>
                    {getStatusBadge(ms.status)}
                  </div>

                  <h5 className="text-xs font-bold text-slate-200 line-clamp-1">
                    {ms.title}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {ms.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#1E2230] flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Haladás: {ms.progress_percent}%</span>
                    <span suppressHydrationWarning>
                      {formatNumber(ms.current_words || 0)} / {formatNumber(ms.target_words || 0)} szó
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Dossier (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#1E2230]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {activeMilestone.phase_number}. FÁZIS RÉSZLETEK
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Határidő: {activeMilestone.due_date}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {activeMilestone.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeMilestone.description}
                </p>
              </div>

              <div>
                {activeMilestone.status === 'approved' ? (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-right">
                    <div className="text-xs font-semibold text-emerald-300 flex items-center justify-end">
                      <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" />
                      Hivatalosan Jóváhagyva
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5" suppressHydrationWarning>
                      {formatDateHungarian(activeMilestone.approved_at || activeMilestone.updated_at)}
                    </div>
                  </div>
                ) : activeMilestone.status === 'awaiting_approval' ? (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-right">
                    <div className="text-xs font-semibold text-amber-300 flex items-center justify-end">
                      <Clock className="w-4 h-4 mr-1 text-amber-400 animate-spin" />
                      Felülvizsgálatra beküldve
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
                    <div className="text-xs font-medium text-slate-400">Kidolgozás alatt</div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Preview & Draft Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                  Kézirat Tartalmi Kivonat & Piszkozat
                </h4>
                <button
                  onClick={() => setIsEditorOpen(!isEditorOpen)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditorOpen ? 'Piszkozat bezárása' : 'Kézirat Szerkesztése'}</span>
                </button>
              </div>

              {isEditorOpen ? (
                <div className="space-y-3">
                  <textarea
                    rows={8}
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-slate-900 border border-[#1E2230] text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-rose-500"
                    placeholder="Írd ide a fejezet tudományos szövegét..."
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      Számolt szavak: {editorContent.trim().split(/\s+/).filter(Boolean).length} szó
                    </span>
                    <button
                      onClick={() => {
                        updateMilestoneContent(activeMilestone.id, editorContent);
                        setIsEditorOpen(false);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
                    >
                      Mentés Kéziratként
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/50 border border-[#1E2230] text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto font-sans">
                  {activeMilestone.content_draft || 'Ehhez a fázishoz még nincs beillesztve szöveges kivonat.'}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#1E2230] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                {activeMilestone.status !== 'awaiting_approval' && activeMilestone.status !== 'approved' && (
                  <button
                    onClick={() => submitMilestoneForReview(activeMilestone.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-md shadow-rose-950/40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Beküldés Témavezetői Felülvizsgálatra</span>
                  </button>
                )}
              </div>

              {isSupervisorMode && (
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => {
                      setModalActionType('revise');
                      setShowFeedbackModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium"
                  >
                    Átdolgozás Kérése
                  </button>
                  <button
                    onClick={() => {
                      setModalActionType('approve');
                      setShowFeedbackModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-950/40"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hivatalos Sign-Off</span>
                  </button>
                </div>
              )}
            </div>

            {/* Supervisor Feedback */}
            {activeMilestone.supervisor_feedback && (
              <div className="pt-3 border-t border-[#1E2230]">
                <h4 className="text-xs font-mono uppercase text-purple-400 tracking-wider mb-2 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                  Hivatalos Témavezetői Visszajelzés
                </h4>
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-slate-200">
                  {activeMilestone.supervisor_feedback}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Supervisor Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <h3 className="text-base font-bold text-white flex items-center">
                {modalActionType === 'approve' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
                    Mérföldkő Hivatalos Jóváhagyása (Sign-Off)
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-400 mr-2" />
                    Átdolgozás és Javítás Kérése
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Témavezetői Megjegyzés / Instrukciók
              </label>
              <textarea
                rows={4}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-[#1E2230]">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Mégse
              </button>
              <button
                onClick={() => {
                  if (modalActionType === 'approve') {
                    supervisorApproveMilestone(activeMilestone.id, feedbackInput);
                  } else {
                    supervisorRequestRevision(activeMilestone.id, feedbackInput);
                  }
                  setShowFeedbackModal(false);
                  setFeedbackInput('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md ${
                  modalActionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50'
                }`}
              >
                {modalActionType === 'approve' ? 'Hivatalos Sign-Off Rögzítése' : 'Visszaküldés Átdolgozásra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
