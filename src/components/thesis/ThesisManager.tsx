'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ThesisChapter, ChapterStatus } from '@/types';
import {
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Edit3,
  FileCheck2,
  FileText,
  AlertCircle,
  Download,
  Send,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  History,
  X,
} from 'lucide-react';
import { formatDateHungarian } from '@/lib/utils';
import { toast } from 'sonner';

export function ThesisManager() {
  const {
    thesisChapters,
    updateChapterContent,
    submitChapterForReview,
    supervisorApproveChapter,
    supervisorRequestRevision,
    currentUser,
    isSupervisorMode,
  } = useStore();

  const [activeChapter, setActiveChapter] = useState<ThesisChapter>(thesisChapters[0]);
  const [editorContent, setEditorContent] = useState<string>(activeChapter.contentDraft);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [modalActionType, setModalActionType] = useState<'approve' | 'revise'>('approve');

  // Switch selected chapter
  const handleSelectChapter = (ch: ThesisChapter) => {
    setActiveChapter(ch);
    setEditorContent(ch.contentDraft);
  };

  const totalWords = thesisChapters.reduce((acc, ch) => acc + ch.currentWords, 0);
  const targetWords = thesisChapters.reduce((acc, ch) => acc + ch.targetWords, 0);
  const progressPercent = Math.min(100, Math.round((totalWords / targetWords) * 100));

  const approvedCount = thesisChapters.filter((c) => c.status === 'jovahagyva').length;
  const pendingCount = thesisChapters.filter((c) => c.status === 'felulvizsgalatra_var').length;

  const handleExportFullDossier = () => {
    toast.success('Szakdolgozat Kézirat Összefűzve & Letöltve!', {
      description: `6 fejezet, ${totalWords.toLocaleString()} szó, IEEE formai megfelelőség (REDLab_Thesis_Manuscript.docx).`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40">
              KÉZIRAT & FEJEZET MENEDZSMENT
            </span>
            <span className="text-xs text-slate-400 font-mono">
              IEEE / Kar specifikus sablon v2.4
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Diplomamunka és Kutatási Szakdolgozat
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            A disszertáció 6 fejezete, felelős kutatók, szószám kalkuláció és a témavezető professzorok
            hivatalos digitális szignója (Sign-off).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportFullDossier}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Kézirat Export (.docx)</span>
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#12141D] border border-[#1E2230]">
          <div className="text-xs text-slate-400 uppercase font-medium">Összesített Terjedelem</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {totalWords.toLocaleString()} <span className="text-xs text-slate-400">/ {targetWords.toLocaleString()} szó</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="text-[11px] font-mono text-rose-400 mt-2">{progressPercent}% készültség</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141D] border border-[#1E2230]">
          <div className="text-xs text-slate-400 uppercase font-medium">Témavezetői Jóváhagyás</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {approvedCount} <span className="text-xs text-slate-400">/ 6 fejezet</span>
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
        {/* Left: Chapter Selector List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Fejezetek Jegyzéke
            </h4>
            <span className="text-xs font-mono text-slate-500">6 fejezet</span>
          </div>

          <div className="space-y-2.5">
            {thesisChapters.map((ch) => {
              const isSelected = activeChapter.id === ch.id;
              const chPercent = Math.min(100, Math.round((ch.currentWords / ch.targetWords) * 100));
              return (
                <div
                  key={ch.id}
                  onClick={() => handleSelectChapter(ch)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#181B26] border-rose-500/60 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/30'
                      : 'bg-[#12141D] border-[#1E2230] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {ch.chapterNumber}. Fejezet
                    </span>
                    {ch.status === 'jovahagyva' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Jóváhagyva
                      </span>
                    )}
                    {ch.status === 'felulvizsgalatra_var' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center animate-pulse">
                        <Clock className="w-2.5 h-2.5 mr-1" /> Felülvizsgálat
                      </span>
                    )}
                    {ch.status === 'tervezet' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        Piszkozat
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-bold text-slate-200 line-clamp-1">
                    {ch.title}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {ch.subtitle}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#1E2230] flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Felelős: {ch.leadResearcherName}</span>
                    <span>
                      {ch.currentWords} / {ch.targetWords} szó ({chPercent}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chapter Detailed Dossier (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-6 shadow-sm space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#1E2230]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {activeChapter.chapterNumber}. FEJEZET DOSSZIÉ
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Verzió: {activeChapter.version}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {activeChapter.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeChapter.subtitle}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {activeChapter.status === 'jovahagyva' ? (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-right">
                    <div className="text-xs font-semibold text-emerald-300 flex items-center justify-end">
                      <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" />
                      Hivatalosan Jóváhagyva
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {activeChapter.supervisorApprovedBy}
                    </div>
                  </div>
                ) : activeChapter.status === 'felulvizsgalatra_var' ? (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-right">
                    <div className="text-xs font-semibold text-amber-300 flex items-center justify-end">
                      <Clock className="w-4 h-4 mr-1 text-amber-400 animate-spin" />
                      Felülvizsgálatra beküldve
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Várakozás témavezetői döntésre
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
                    <div className="text-xs font-medium text-slate-400">Piszkozat állapot</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      Kutatói kidolgozás alatt
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Researcher Info & Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-900/60 border border-[#1E2230] text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Felelős Kutató</span>
                <p className="font-semibold text-slate-200 mt-0.5">{activeChapter.leadResearcherName}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Jelenlegi Terjedelem</span>
                <p className="font-semibold text-slate-200 mt-0.5">{activeChapter.currentWords.toLocaleString()} szó</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Cél Terjedelem</span>
                <p className="font-semibold text-slate-200 mt-0.5">{activeChapter.targetWords.toLocaleString()} szó</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Utolsó Módosítás</span>
                <p className="font-semibold text-slate-200 mt-0.5">{formatDateHungarian(activeChapter.lastModified)}</p>
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
                        updateChapterContent(activeChapter.id, editorContent);
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
                  {activeChapter.contentDraft || 'Ehhez a fejezethez még nem került rögzítésre piszkozat.'}
                </div>
              )}
            </div>

            {/* Action Buttons for Researchers & Supervisors */}
            <div className="pt-4 border-t border-[#1E2230] flex flex-wrap items-center justify-between gap-3">
              {/* Researcher actions */}
              <div className="flex items-center space-x-2">
                {activeChapter.status !== 'felulvizsgalatra_var' && activeChapter.status !== 'jovahagyva' && (
                  <button
                    onClick={() => submitChapterForReview(activeChapter.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-md shadow-rose-950/40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Beküldés Témavezetői Felülvizsgálatra</span>
                  </button>
                )}
              </div>

              {/* Supervisor actions */}
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
                    <span>Hivatalos Jóváhagyás (Sign-Off)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Feedback History */}
            <div className="pt-4 border-t border-[#1E2230]">
              <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2.5 flex items-center">
                <History className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                Témavezetői Vélemények és Visszajelzési Előzmények
              </h4>

              <div className="space-y-2.5">
                {activeChapter.feedbackHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Még nincs rögzített hivatalos bírálat.</p>
                ) : (
                  activeChapter.feedbackHistory.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="font-semibold text-purple-300">
                          {fb.supervisorName} (Témavezető)
                        </span>
                        <span className="font-mono text-[10px]">{formatDateHungarian(fb.createdAt)}</span>
                      </div>
                      <p className="text-slate-300">{fb.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supervisor Feedback / Approval Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <h3 className="text-base font-bold text-white flex items-center">
                {modalActionType === 'approve' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
                    Fejezet Hivatalos Jóváhagyása (Sign-Off)
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
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Fejezet: <span className="font-bold text-white">{activeChapter.title}</span> (Felelős: {activeChapter.leadResearcherName})
            </p>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Témavezetői Megjegyzés / Instrukciók
              </label>
              <textarea
                rows={4}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder={
                  modalActionType === 'approve'
                    ? 'A fejezet szerkezete és az eredmények hitelesek, leadásra alkalmas...'
                    : 'Kérjük a kísérleti bizonytalanságok és a konvergencia görbék kiegészítését...'
                }
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
                    supervisorApproveChapter(activeChapter.id, feedbackInput);
                  } else {
                    supervisorRequestRevision(activeChapter.id, feedbackInput);
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
