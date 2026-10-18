'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Meeting, VoteType } from '@/types';
import {
  CalendarCheck2,
  Clock,
  Video,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { formatDateHungarian } from '@/lib/utils';
import { toast } from 'sonner';

interface ConsultationManagerProps {
  openAddPollModal: () => void;
}

export function ConsultationManager({ openAddPollModal }: ConsultationManagerProps) {
  const {
    meetings,
    voteMeetingSlot,
    confirmMeetingSlot,
    currentProfile,
    profiles,
  } = useStore();

  const [activeSlotCommentInput, setActiveSlotCommentInput] = useState<{ meetingId: string; slotId: string; vote: VoteType } | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleQuickVote = (meetingId: string, slotId: string, vote: VoteType) => {
    if (vote === 'downvote' || vote === 'if_needed') {
      // Prompt for optional comment (e.g. "Laborom van 14:00-ig")
      setActiveSlotCommentInput({ meetingId, slotId, vote });
      setCommentText('');
    } else {
      voteMeetingSlot(meetingId, slotId, vote);
    }
  };

  const handleConfirmCommentVote = () => {
    if (!activeSlotCommentInput) return;
    voteMeetingSlot(
      activeSlotCommentInput.meetingId,
      activeSlotCommentInput.slotId,
      activeSlotCommentInput.vote,
      commentText.trim() || undefined
    );
    setActiveSlotCommentInput(null);
    setCommentText('');
  };

  const getVoteBadge = (voteObj?: { vote: VoteType; comment?: string }) => {
    if (!voteObj) {
      return (
        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center text-xs">
          -
        </span>
      );
    }
    switch (voteObj.vote) {
      case 'upvote':
        return (
          <span
            className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-xs"
            title={voteObj.comment || 'Elfogadva (Upvote)'}
          >
            ✓
          </span>
        );
      case 'if_needed':
        return (
          <span
            className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-xs"
            title={voteObj.comment || 'Ha muszáj (If needed)'}
          >
            ?
          </span>
        );
      case 'downvote':
        return (
          <span
            className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center font-bold text-xs"
            title={voteObj.comment || 'Ütközik (Downvote)'}
          >
            ✕
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40">
              SUPABASE CONSENSUS ENGINE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Intelligens evaluate_meeting_consensus() Trigger
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Konzultációk & Értekezlet Ütemező
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Többszereplős konszenzus-motor: ha minden idősáv vétót kap (Downvote), a rendszer azonnal
            `reschedule_needed` állapotba vált és értesíti a kutatókat. Ha konszenzus van, automatikusan véglegesít.
          </p>
        </div>

        <button
          onClick={openAddPollModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Új Időpont-szavazás Kiírása</span>
        </button>
      </div>

      {/* Meetings List */}
      <div className="space-y-6">
        {meetings.map((meeting) => {
          const isConfirmed = meeting.status === 'confirmed';
          const isRescheduleNeeded = meeting.status === 'reschedule_needed';

          return (
            <div
              key={meeting.id}
              className={`p-6 rounded-2xl border transition-all shadow-sm space-y-5 ${
                isConfirmed
                  ? 'bg-gradient-to-br from-[#12141D] to-[#151c27] border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : isRescheduleNeeded
                  ? 'bg-gradient-to-br from-[#12141D] to-[#251318] border-rose-500/50 ring-1 ring-rose-500/30'
                  : 'bg-[#12141D] border-[#1E2230]'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#1E2230]">
                <div>
                  <div className="flex items-center space-x-2">
                    {isConfirmed && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Véglegesített Időpont
                      </span>
                    )}
                    {isRescheduleNeeded && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/25 text-rose-300 border border-rose-500/50 flex items-center animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-400" /> Újütemezés Szükséges (Reschedule Needed)
                      </span>
                    )}
                    {!isConfirmed && !isRescheduleNeeded && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" /> Szavazás Folyamatban
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400">
                      {meeting.location_or_link}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1.5">{meeting.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{meeting.description}</p>
                </div>

                {isConfirmed && meeting.location_or_link.includes('http') && (
                  <a
                    href={meeting.location_or_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-950/40 shrink-0"
                  >
                    <Video className="w-4 h-4" />
                    <span>Belépés a Google Meet-be</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                )}
              </div>

              {/* Reschedule alert banner */}
              {isRescheduleNeeded && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center space-x-3 text-xs text-rose-200">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <strong className="block text-white font-bold">Automatikus Konszenzus Figyelmeztetés!</strong>
                    A megbeszélés összes javasolt idősávját leszavazták (Downvote). Kérlek javasoljatok új időpontokat!
                  </div>
                </div>
              )}

              {/* Agenda Bullets */}
              {meeting.agenda_items.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230]">
                  <h5 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">
                    Tervezett Napirendi Pontok:
                  </h5>
                  <ul className="space-y-1">
                    {meeting.agenda_items.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Voting Matrix Table */}
              <div>
                <h5 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                  Időpontok & Szavazási Mátrix
                </h5>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1E2230] text-slate-400 font-mono text-[11px]">
                        <th className="py-2.5 px-3">Idősáv</th>
                        {profiles.map((p) => (
                          <th key={p.id} className="py-2.5 px-2 text-center">
                            <div className="flex flex-col items-center">
                              <span
                                className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center mb-0.5"
                                style={{ backgroundColor: p.badge_color }}
                              >
                                {p.short_code}
                              </span>
                              <span className="truncate max-w-[65px]">{p.full_name}</span>
                            </div>
                          </th>
                        ))}
                        <th className="py-2.5 px-3 text-center">Állás</th>
                        <th className="py-2.5 px-3 text-right">Szavazatod ({currentProfile.full_name})</th>
                        <th className="py-2.5 px-3 text-right">Művelet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2230]">
                      {meeting.slots.map((slot) => {
                        const isThisSlotConfirmed = meeting.confirmed_slot_id === slot.id;
                        const votesMap = slot.votes || {};
                        const upvoteCount = Object.values(votesMap).filter((v) => v.vote === 'upvote').length;
                        const downvoteCount = Object.values(votesMap).filter((v) => v.vote === 'downvote').length;
                        const myVote = votesMap[currentProfile.id]?.vote;

                        return (
                          <tr
                            key={slot.id}
                            className={`hover:bg-slate-900/40 transition-colors ${
                              isThisSlotConfirmed ? 'bg-emerald-950/20 font-semibold' : ''
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-200" suppressHydrationWarning>
                                {formatDateHungarian(slot.start_time)}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {meeting.duration_minutes} perc
                              </div>
                            </td>

                            {/* Participant votes */}
                            {profiles.map((p) => (
                              <td key={p.id} className="py-3 px-2 text-center">
                                <div className="flex justify-center">
                                  {getVoteBadge(votesMap[p.id])}
                                </div>
                              </td>
                            ))}

                            {/* Tally */}
                            <td className="py-3 px-3 text-center font-mono">
                              <div className="flex items-center justify-center space-x-1.5">
                                <span className="text-emerald-400 font-bold">+{upvoteCount}</span>
                                {downvoteCount > 0 && (
                                  <span className="text-rose-400 font-bold">-{downvoteCount}</span>
                                )}
                              </div>
                            </td>

                            {/* My Vote Selector */}
                            <td className="py-3 px-3 text-right">
                              <div className="inline-flex rounded-lg border border-[#1E2230] p-0.5 bg-slate-900">
                                <button
                                  onClick={() => handleQuickVote(meeting.id, slot.id, 'upvote')}
                                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                                    myVote === 'upvote'
                                      ? 'bg-emerald-600 text-white'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                  title="Elfogadva (Upvote)"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => handleQuickVote(meeting.id, slot.id, 'if_needed')}
                                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                                    myVote === 'if_needed'
                                      ? 'bg-amber-600 text-white'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                  title="Ha szükséges"
                                >
                                  ?
                                </button>
                                <button
                                  onClick={() => handleQuickVote(meeting.id, slot.id, 'downvote')}
                                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                                    myVote === 'downvote'
                                      ? 'bg-rose-600 text-white'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                  title="Ütközik (Downvote)"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>

                            {/* Confirm Action */}
                            <td className="py-3 px-3 text-right">
                              {isThisSlotConfirmed ? (
                                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center justify-end">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Végleges
                                </span>
                              ) : (
                                <button
                                  onClick={() => confirmMeetingSlot(meeting.id, slot.id)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-700 hover:text-white text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors"
                                >
                                  Véglegesítés
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vote Comment Input Drawer Modal */}
      {activeSlotCommentInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center">
              <MessageSquare className="w-4 h-4 text-rose-500 mr-2" />
              Indoklás / Megjegyzés hozzáadása
            </h4>
            <p className="text-xs text-slate-400">
              Ha nem jó az időpont vagy feltételhez kötött, írd le az okot a csapatnak:
            </p>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="pl. Laborom van 14:00-ig, 15:00-tól jó lenne!"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCommentVote();
              }}
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  if (activeSlotCommentInput) {
                    voteMeetingSlot(activeSlotCommentInput.meetingId, activeSlotCommentInput.slotId, activeSlotCommentInput.vote);
                  }
                  setActiveSlotCommentInput(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Kihagyás
              </button>
              <button
                onClick={handleConfirmCommentVote}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Szavazat Rögzítése
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
