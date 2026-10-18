'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Meeting, MeetingSlot, VoteType, TaskPriority, WorkstreamType } from '@/types';
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
  Download,
  Calendar,
  FileText,
  CheckSquare,
  Sparkles,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Trash2,
  Send,
} from 'lucide-react';
import { formatDateHungarian } from '@/lib/utils';
import { downloadIcsFile, generateGoogleCalendarUrl } from '@/lib/calendar';
import { castVoteAction, addSlotAction, confirmSlotAction, saveMeetingNotesAction, createTaskFromMinutesAction } from '@/app/actions/scheduler';
import { toast } from 'sonner';

interface MeetingVotingCardProps {
  meeting: Meeting;
}

export function MeetingVotingCard({ meeting }: MeetingVotingCardProps) {
  const {
    currentProfile,
    profiles,
    voteMeetingSlot,
    confirmMeetingSlot,
    addMeetingSlot,
    updateMeetingNotes,
    deleteMeeting,
    addTask,
  } = useStore();

  // Downvote / If-needed comment modal
  const [commentModalData, setCommentModalData] = useState<{
    slotId: string;
    vote: VoteType;
  } | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Propose new alternative slot inline
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('');

  // Meeting minutes toggle & state
  const [isMinutesOpen, setIsMinutesOpen] = useState(false);
  const [notesContent, setNotesContent] = useState(
    meeting.meeting_notes ||
      `### Konzultáció Emlékeztető (${meeting.title})\n\n**Résztvevők:** ${profiles.map((p) => p.full_name).join(', ')}\n\n#### Megbeszélt pontok:\n- Sprint előrehaladás: mérési eredmények átbeszélése\n- Felmerült hibák: konvergencia instabilitás 3. tesztnél\n\n#### Akcióterv (Következő lépések):\n- [ ] Szenzor kalibráció megismétlése 5 Celsius fokon\n- [ ] Fejezet bevezető revíziója a témavezetői észrevételek szerint`
  );
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Generate task from minutes state
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskWorkstream, setQuickTaskWorkstream] = useState<WorkstreamType>('wet_lab');

  const isConfirmed = meeting.status === 'confirmed';
  const isRescheduleNeeded = meeting.status === 'reschedule_needed';
  const confirmedSlot = meeting.slots.find((s) => s.id === meeting.confirmed_slot_id);

  // Quick voting handler
  const handleVoteClick = (slotId: string, vote: VoteType) => {
    if (vote === 'downvote' || vote === 'if_needed') {
      setCommentModalData({ slotId, vote });
      setCommentInput('');
    } else {
      voteMeetingSlot(meeting.id, slotId, vote);
      castVoteAction({
        meetingId: meeting.id,
        slotId,
        voterId: currentProfile.id,
        vote,
      });
    }
  };

  const handleConfirmCommentVote = () => {
    if (!commentModalData) return;
    const { slotId, vote } = commentModalData;

    voteMeetingSlot(meeting.id, slotId, vote, commentInput.trim() || undefined);
    castVoteAction({
      meetingId: meeting.id,
      slotId,
      voterId: currentProfile.id,
      vote,
      comment: commentInput.trim() || undefined,
    });

    setCommentModalData(null);
    setCommentInput('');
  };

  const handleProposeNewSlot = () => {
    if (!newSlotTime) {
      toast.error('Válassz ki egy időpontot az új sávhoz!');
      return;
    }

    addMeetingSlot(meeting.id, newSlotTime);
    addSlotAction({
      meetingId: meeting.id,
      proposedBy: currentProfile.id,
      startTime: newSlotTime,
      durationMinutes: meeting.duration_minutes,
    });

    setNewSlotTime('');
    setIsAddingSlot(false);
  };

  const handleConfirmSlot = (slotId: string) => {
    confirmMeetingSlot(meeting.id, slotId, meeting.location_or_link);
    confirmSlotAction({
      meetingId: meeting.id,
      slotId,
      meetingLink: meeting.location_or_link,
      confirmedBy: currentProfile.id,
    });
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      updateMeetingNotes(meeting.id, notesContent);
      await saveMeetingNotesAction({
        meetingId: meeting.id,
        notes: notesContent,
        updatedBy: currentProfile.id,
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCreateTaskFromMinutes = () => {
    if (!quickTaskTitle.trim()) {
      toast.error('Adj meg egy feladat címet!');
      return;
    }

    addTask({
      title: quickTaskTitle.trim(),
      description: `Generálva a(z) "${meeting.title}" megbeszélés jegyzőkönyvéből.`,
      workstream: quickTaskWorkstream,
      priority: 'high',
      status: 'todo',
      position: 0,
      assigned_to: currentProfile.id,
      checklist: [],
      tags: ['megbeszélés', 'akcióterv'],
    });

    createTaskFromMinutesAction({
      title: quickTaskTitle.trim(),
      description: `Generálva a(z) "${meeting.title}" megbeszélés jegyzőkönyvéből.`,
      workstream: quickTaskWorkstream,
      priority: 'high',
      assignedTo: currentProfile.id,
      createdBy: currentProfile.id,
    });

    toast.success('Kanban feladat sikeresen létrehozva a jegyzőkönyvből!');
    setQuickTaskTitle('');
  };

  const getVoteBadge = (voteObj?: { vote: VoteType; comment?: string | null }) => {
    if (!voteObj) {
      return (
        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-500 border border-slate-700/60 flex items-center justify-center text-xs font-mono">
          -
        </span>
      );
    }
    switch (voteObj.vote) {
      case 'upvote':
        return (
          <span
            className="w-6 h-6 rounded-lg bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 flex items-center justify-center font-bold text-xs shadow-sm shadow-emerald-950/40"
            title={voteObj.comment ? `Elfogadva: "${voteObj.comment}"` : 'Elfogadva (Upvote)'}
          >
            ✓
          </span>
        );
      case 'if_needed':
        return (
          <span
            className="w-6 h-6 rounded-lg bg-amber-500/25 text-amber-300 border border-amber-500/50 flex items-center justify-center font-bold text-xs"
            title={voteObj.comment ? `Ha muszáj: "${voteObj.comment}"` : 'Ha szükséges (If needed)'}
          >
            ?
          </span>
        );
      case 'downvote':
        return (
          <span
            className="w-6 h-6 rounded-lg bg-rose-600/30 text-rose-300 border border-rose-500/60 flex items-center justify-center font-bold text-xs animate-pulse"
            title={voteObj.comment ? `Ütközik: "${voteObj.comment}"` : 'Ütközik (Downvote)'}
          >
            ✕
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all shadow-xl space-y-5 p-5 sm:p-6 ${
        isConfirmed
          ? 'bg-gradient-to-br from-[#12141D] via-[#131a26] to-[#12141D] border-emerald-500/50 ring-1 ring-emerald-500/20'
          : isRescheduleNeeded
          ? 'bg-gradient-to-br from-[#12141D] via-[#241318] to-[#12141D] border-rose-500/70 ring-2 ring-rose-500/30 shadow-rose-950/40'
          : 'bg-[#12141D] border-[#1E2230]'
      }`}
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#1E2230]">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {isConfirmed && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Véglegesített Időpont
              </span>
            )}
            {isRescheduleNeeded && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/25 text-rose-300 border border-rose-500/60 flex items-center animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-400" /> Újraütemezés Szükséges (Reschedule Needed)
              </span>
            )}
            {!isConfirmed && !isRescheduleNeeded && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" /> Szavazás Folyamatban
              </span>
            )}

            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {meeting.duration_minutes} perc
            </span>

            {meeting.requires_supervisor && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800/60 text-purple-300 flex items-center gap-1 font-semibold">
                <GraduationCap className="w-3 h-3" />
                Témavezetői szignó szükséges
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {meeting.title}
          </h3>
          {meeting.description && (
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {meeting.description}
            </p>
          )}
        </div>

        {/* Action button in header */}
        <div className="flex items-center space-x-2 shrink-0">
          {meeting.location_or_link && meeting.location_or_link.includes('http') && (
            <a
              href={meeting.location_or_link}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-950/40 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Google Meet</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          )}

          <button
            onClick={() => deleteMeeting(meeting.id)}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
            title="Megbeszélés törlése"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. AUTO-RESCHEDULE ALERT BANNER (If every slot has at least one downvote) */}
      {isRescheduleNeeded && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/60 to-rose-900/30 border border-rose-600/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-200 shadow-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-bold text-sm">
                ⚠️ Minden javasolt időpont ütközik!
              </strong>
              <p className="text-rose-200/90 mt-0.5">
                Az adatbázis konszenzus-motorja érzékelte, hogy nincs olyan időpont, amely mindenkinek megfelel.
                Kérlek, adjatok hozzá új alternatív idősávot!
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingSlot(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-950/50 flex items-center space-x-1.5 transition-all shrink-0 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>+ Új idősáv javaslása ehhez a megbeszéléshez</span>
          </button>
        </div>
      )}

      {/* 3. Inline Propose New Slot Form */}
      {isAddingSlot && (
        <div className="p-4 rounded-xl bg-slate-900 border border-rose-800/60 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-400" />
              Új alternatív idősáv rögzítése (a megbeszélés visszavált szavazásra)
            </span>
            <button
              onClick={() => setIsAddingSlot(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Bezárás
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="datetime-local"
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-[#1E2230] text-xs text-white focus:outline-none focus:border-rose-500 flex-1"
            />
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleProposeNewSlot}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40"
              >
                Idősáv Rögzítése
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSlot(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Mégse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Agenda Bullets */}
      {meeting.agenda_items && meeting.agenda_items.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-[#1E2230]">
          <h5 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-2 font-semibold">
            Tervezett Napirendi Pontok:
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {meeting.agenda_items.map((item, idx) => (
              <div key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Voting Matrix Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
            Szavazási Mátrix & Javasolt Időpontok
          </h5>

          {!isRescheduleNeeded && !isConfirmed && (
            <button
              onClick={() => setIsAddingSlot(true)}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Új idősáv felvétele</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1E2230] bg-slate-950/40">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E2230] text-slate-400 font-mono text-[10px] uppercase">
                <th className="py-2.5 px-3">Idősáv</th>
                {profiles.map((p) => (
                  <th key={p.id} className="py-2.5 px-2 text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center mb-0.5 shadow-sm"
                        style={{ backgroundColor: p.badge_color }}
                        title={`${p.full_name} (${p.role === 'supervisor' ? 'Témavezető' : 'Kutató'})`}
                      >
                        {p.short_code}
                      </span>
                      <span className="truncate max-w-[65px] font-mono">{p.full_name.split(' ')[0]}</span>
                    </div>
                  </th>
                ))}
                <th className="py-2.5 px-2 text-center">Állás</th>
                <th className="py-2.5 px-3 text-right">Szavazatod ({currentProfile.full_name.split(' ')[0]})</th>
                <th className="py-2.5 px-3 text-right">Művelet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2230]">
              {meeting.slots.map((slot) => {
                const isThisSlotConfirmed = meeting.confirmed_slot_id === slot.id;
                const votesMap = slot.votes || {};
                const upvoteCount = Object.values(votesMap).filter((v) => v.vote === 'upvote').length;
                const downvoteCount = Object.values(votesMap).filter((v) => v.vote === 'downvote').length;
                const ifNeededCount = Object.values(votesMap).filter((v) => v.vote === 'if_needed').length;
                const myVote = votesMap[currentProfile.id]?.vote;

                // Collect downvote or if_needed comments
                const slotComments = Object.entries(votesMap)
                  .filter(([_, v]) => v.comment && v.comment.trim().length > 0)
                  .map(([voterId, v]) => {
                    const voterProfile = profiles.find((p) => p.id === voterId);
                    return {
                      voterName: voterProfile?.full_name || 'Kutató',
                      badgeColor: voterProfile?.badge_color || '#E11D48',
                      vote: v.vote,
                      comment: v.comment,
                    };
                  });

                return (
                  <React.Fragment key={slot.id}>
                    <tr
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isThisSlotConfirmed
                          ? 'bg-emerald-950/30 font-semibold'
                          : downvoteCount > 0
                          ? 'bg-rose-950/15'
                          : ''
                      }`}
                    >
                      {/* Slot time */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200" suppressHydrationWarning>
                          {formatDateHungarian(slot.start_time)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {meeting.duration_minutes} perc • Javasolta: {profiles.find((p) => p.id === slot.proposed_by)?.full_name || 'Csapattag'}
                        </div>
                      </td>

                      {/* Participant vote badges */}
                      {profiles.map((p) => (
                        <td key={p.id} className="py-3 px-2 text-center">
                          <div className="flex justify-center">
                            {getVoteBadge(votesMap[p.id])}
                          </div>
                        </td>
                      ))}

                      {/* Tally counter */}
                      <td className="py-3 px-2 text-center font-mono">
                        <div className="flex items-center justify-center space-x-1.5">
                          <span className="text-emerald-400 font-bold" title="Upvotes">
                            +{upvoteCount}
                          </span>
                          {ifNeededCount > 0 && (
                            <span className="text-amber-400 font-semibold" title="Ha szükséges">
                              ?{ifNeededCount}
                            </span>
                          )}
                          {downvoteCount > 0 && (
                            <span className="text-rose-400 font-bold" title="Downvotes (Ütközik)">
                              -{downvoteCount}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3 Voting buttons: Upvote, If needed, Downvote */}
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex rounded-xl border border-[#1E2230] p-0.5 bg-slate-900 shadow-inner">
                          <button
                            onClick={() => handleVoteClick(slot.id, 'upvote')}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                              myVote === 'upvote'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-emerald-300'
                            }`}
                            title="👍 Upvote (Zöld: Megfelel)"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleVoteClick(slot.id, 'if_needed')}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                              myVote === 'if_needed'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-amber-300'
                            }`}
                            title="⚠️ Ha muszáj (Borostyán: Nem ideális, de megoldható)"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleVoteClick(slot.id, 'downvote')}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                              myVote === 'downvote'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-rose-400'
                            }`}
                            title="👎 Downvote (Karmazsin: Ütközik!)"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Confirm Slot Action */}
                      <td className="py-3 px-3 text-right">
                        {isThisSlotConfirmed ? (
                          <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Végleges
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConfirmSlot(slot.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            Véglegesítés
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Display Downvote / If-needed reasoning comments under this slot */}
                    {slotComments.length > 0 && (
                      <tr className="bg-slate-950/80">
                        <td colSpan={profiles.length + 4} className="py-2 px-3">
                          <div className="space-y-1">
                            {slotComments.map((cm, idx) => (
                              <div
                                key={idx}
                                className="flex items-center space-x-2 text-[11px] text-slate-300 pl-4 border-l-2 border-rose-500/60"
                              >
                                <span
                                  className="w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: cm.badgeColor }}
                                >
                                  {cm.voterName.substring(0, 1)}
                                </span>
                                <span className="font-semibold text-rose-300">
                                  {cm.voterName} ({cm.vote === 'downvote' ? 'Ütközik' : 'Ha muszáj'}):
                                </span>
                                <span className="text-slate-300 italic">„{cm.comment}”</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. CONFIRMED MEETING ACTIONS: Calendar Exports (.ics, Google Calendar) */}
      {isConfirmed && confirmedSlot && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
              <CalendarCheck2 className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Véglegesített Időpont:</span>
                <span className="text-emerald-300 font-mono" suppressHydrationWarning>
                  {formatDateHungarian(confirmedSlot.start_time)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                1-kattintásos naptár szinkronizáció minden csapattagnak (.ics vagy Google Calendar).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => downloadIcsFile(meeting, confirmedSlot)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Apple Calendar, Outlook vagy iCal formátum"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Letöltés Naptárba (.ics)</span>
            </button>

            <a
              href={generateGoogleCalendarUrl(meeting, confirmedSlot)}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-950/40 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Megnyitás Google Naptárban</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      )}

      {/* 7. MEETING MINUTES & KANBAN TASK GENERATOR TOGGLE */}
      <div className="pt-2 border-t border-[#1E2230]">
        <button
          onClick={() => setIsMinutesOpen(!isMinutesOpen)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-[#1E2230] text-xs font-semibold text-slate-300 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Közös Megbeszélés Jegyzőkönyv (Meeting Minutes) & Feladatgenerátor</span>
            {meeting.meeting_notes && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
                Mentve
              </span>
            )}
          </div>
          {isMinutesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isMinutesOpen && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-[#1E2230] space-y-4 animate-in fade-in">
            {/* Markdown notes editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Markdown Jegyzőkönyv Szövege:
                </label>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1 shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSavingNotes ? 'Mentés...' : 'Jegyzőkönyv Mentése'}</span>
                </button>
              </div>
              <textarea
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500 leading-relaxed"
                placeholder="# Megbeszélés Jegyzőkönyv..."
              />
            </div>

            {/* Quick Kanban Task Generation */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  1-Kattintásos Kanban Feladat Generálás a Jegyzőkönyvből:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  placeholder="pl. Szenzor kalibráció megismétlése"
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-950 border border-[#1E2230] text-xs text-white focus:outline-none focus:border-rose-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTaskFromMinutes();
                  }}
                />
                <div className="flex items-center space-x-2">
                  <select
                    value={quickTaskWorkstream}
                    onChange={(e) => setQuickTaskWorkstream(e.target.value as WorkstreamType)}
                    className="flex-1 px-2.5 py-2 rounded-xl bg-slate-950 border border-[#1E2230] text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="wet_lab">Labor (Wet Lab)</option>
                    <option value="dry_lab_code">Kód (Dry Lab)</option>
                    <option value="cad_hardware">CAD / Hardver</option>
                    <option value="thesis_writing">Kéziratírás</option>
                    <option value="administration">Adminisztráció</option>
                  </select>
                  <button
                    onClick={handleCreateTaskFromMinutes}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-md shadow-emerald-950/40"
                  >
                    + Hozzáadás
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. Downvote / If-Needed Comment Modal */}
      {commentModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#12141D] border border-rose-800/80 shadow-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-[#1E2230]">
              <span className="p-2 rounded-xl bg-rose-950 text-rose-300 border border-rose-800/60">
                <MessageSquare className="w-4 h-4 text-rose-400" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {commentModalData.vote === 'downvote' ? '👎 Downvote Indoklás' : '⚠️ Ha muszáj - Feltétel'}
                </h4>
                <p className="text-xs text-slate-400">
                  Miért ütközik, vagy melyik másik sáv lenne jó helyette?
                </p>
              </div>
            </div>

            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              rows={3}
              placeholder="pl. 14:00-ig laborgyakorlatom van a B épületben, 15:30-tól vagy csütörtökön ráérek!"
              className="w-full p-3 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              autoFocus
            />

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  if (commentModalData) {
                    voteMeetingSlot(meeting.id, commentModalData.slotId, commentModalData.vote);
                    castVoteAction({
                      meetingId: meeting.id,
                      slotId: commentModalData.slotId,
                      voterId: currentProfile.id,
                      vote: commentModalData.vote,
                    });
                  }
                  setCommentModalData(null);
                  setCommentInput('');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Indoklás Nélkül
              </button>
              <button
                onClick={handleConfirmCommentVote}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40"
              >
                Szavazat és Indoklás Rögzítése
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
