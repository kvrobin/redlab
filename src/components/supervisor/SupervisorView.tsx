'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Milestone } from '@/types';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  X,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

export function SupervisorView() {
  const {
    milestones,
    supervisorApproveMilestone,
    supervisorRequestRevision,
    currentProfile,
    repositoryFiles,
  } = useStore();

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'revise'>('approve');

  const pendingMilestones = milestones.filter((m) => m.status === 'awaiting_approval');
  const approvedMilestones = milestones.filter((m) => m.status === 'approved');

  const totalWords = milestones.reduce((acc, m) => acc + (m.current_words || 0), 0);
  const targetWords = milestones.reduce((acc, m) => acc + (m.target_words || 0), 0);
  const overallPercent = targetWords > 0 ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0;

  const thesisFile = repositoryFiles.find((f) => f.folder_category === 'thesis_writing' && f.is_latest) || repositoryFiles[0];

  const handleDownloadDraft = () => {
    toast.success('Szakdolgozat Kézirat Dosszié letöltése elindult!', {
      description: `${thesisFile?.file_name} (v${thesisFile?.version_number}) letöltve átolvasásra.`,
    });
  };

  const openActionModal = (ms: Milestone, type: 'approve' | 'revise') => {
    setSelectedMilestone(ms);
    setActionType(type);
    setFeedbackComment(
      type === 'approve'
        ? 'A fejezet elméleti megalapozottsága és ábrái kielégítik a tanszéki elvárásokat. Hivatalosan jóváhagyva a végleges kézirathoz.'
        : 'Kérem a mérési bizonytalanságok és a konvergencia-görbék részletesebb kifejtését a 3. alfejezetben.'
    );
  };

  const handleExecuteAction = () => {
    if (!selectedMilestone) return;
    if (actionType === 'approve') {
      supervisorApproveMilestone(selectedMilestone.id, feedbackComment);
    } else {
      supervisorRequestRevision(selectedMilestone.id, feedbackComment);
    }
    setSelectedMilestone(null);
  };

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/70 via-[#161224] to-[#12141D] border border-purple-500/30 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-500/20 text-purple-200 border border-purple-500/40 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                SUPERVISOR EXECUTIVE MODE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentProfile.full_name} ({currentProfile.title})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Témavezetői Döntéshozói és Jóváhagyási Központ
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Fókuszált nézet a professzorok számára: mérföldkövek áttekintése, egykattintásos hivatalos jóváhagyás
              (Sign-off), kézirat-letöltés és döntéshozatali naplózás.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadDraft}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/50 flex items-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Teljes Kézirat Letöltése (v{thesisFile?.version_number})</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Level Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#12141D] border border-[#1E2230]">
          <div className="text-xs font-mono uppercase text-slate-400">Összesített Készültség</div>
          <div className="text-3xl font-bold font-mono text-white mt-1">{overallPercent}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-rose-500 h-full rounded-full" style={{ width: `${overallPercent}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2" suppressHydrationWarning>
            {formatNumber(totalWords)} / {formatNumber(targetWords)} szó kidolgozva
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#12141D] border border-[#1E2230]">
          <div className="text-xs font-mono uppercase text-slate-400">Jóváhagyási Sorban</div>
          <div className="text-3xl font-bold font-mono text-amber-400 mt-1">
            {pendingMilestones.length} <span className="text-xs text-slate-400">fejezet</span>
          </div>
          <div className="text-xs text-amber-300/80 mt-3 flex items-center">
            <Clock className="w-4 h-4 mr-1.5 animate-pulse" />
            Témavezetői szignóra és visszajelzésre vár
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#12141D] border border-[#1E2230]">
          <div className="text-xs font-mono uppercase text-slate-400">Hivatalosan Jóváhagyva</div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
            {approvedMilestones.length} <span className="text-xs text-slate-400">/ 6 fejezet</span>
          </div>
          <div className="text-xs text-emerald-300/80 mt-3 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Védésre kész, elfogadott részek
          </div>
        </div>
      </div>

      {/* Priority 1: Pending Approvals Queue */}
      <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Bírálatra Váró Fejezetek ({pendingMilestones.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Azonnali Sign-Off vagy Átdolgozás kérése
          </span>
        </div>

        {pendingMilestones.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-dashed border-[#1E2230]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">Nincs függőben lévő jóváhagyás!</h4>
            <p className="text-xs text-slate-400 mt-1">
              Minden eddig beküldött mérföldkő el lett bírálva a professzorok által.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingMilestones.map((ms) => (
              <div
                key={ms.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-[#1E2230] hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {ms.phase_number}. Fázis
                    </span>
                    <span className="text-sm font-bold text-white truncate">{ms.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {ms.progress_percent}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{ms.description}</p>
                  <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400 mt-2">
                    <span suppressHydrationWarning>Terjedelem: {formatNumber(ms.current_words || 0)} / {formatNumber(ms.target_words || 0)} szó</span>
                    <span>Határidő: {ms.due_date}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => openActionModal(ms, 'revise')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    Átdolgozás Kérése
                  </button>
                  <button
                    onClick={() => openActionModal(ms, 'approve')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-950/40 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hivatalos Sign-Off</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Milestone Matrix */}
      <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          A Szakdolgozat Teljes Mérföldkő-Térképe
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {milestones.map((ms) => (
            <div
              key={ms.id}
              className="p-4 rounded-xl bg-slate-900/40 border border-[#1E2230] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-400">
                  {ms.phase_number}. Fázis
                </span>
                {ms.status === 'approved' ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Elfogadva
                  </span>
                ) : ms.status === 'awaiting_approval' ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> Bírálatra vár
                  </span>
                ) : ms.status === 'revision_requested' ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> Átdolgozandó
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Folyamatban
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{ms.title}</h4>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    ms.status === 'approved'
                      ? 'bg-emerald-500'
                      : ms.status === 'awaiting_approval'
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${ms.progress_percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{ms.progress_percent}%</span>
                <span suppressHydrationWarning>{formatNumber(ms.current_words || 0)} / {formatNumber(ms.target_words || 0)} szó</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <h3 className="text-base font-bold text-white flex items-center">
                {actionType === 'approve' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
                    Témavezetői Sign-Off Megerősítése
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-400 mr-2" />
                    Átdolgozási Kérelem Elküldése
                  </>
                )}
              </h3>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Fejezet: <span className="font-bold text-white">{selectedMilestone.title}</span>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Témavezetői Észrevétel / Hivatalos Vélemény
              </label>
              <textarea
                rows={4}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1E2230]">
              <button
                onClick={() => setSelectedMilestone(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Mégse
              </button>
              <button
                onClick={handleExecuteAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50'
                }`}
              >
                {actionType === 'approve' ? 'Hivatalos Sign-Off Rögzítése' : 'Visszaküldés Átdolgozásra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
