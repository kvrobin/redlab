'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ConsultationPoll, ConsultationSlot, VoteChoice } from '@/types';
import {
  CalendarCheck2,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  Plus,
  Users,
  ExternalLink,
  Check,
  Slash,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { formatDateHungarian } from '@/lib/utils';
import { toast } from 'sonner';

interface ConsultationManagerProps {
  openAddPollModal: () => void;
}

export function ConsultationManager({ openAddPollModal }: ConsultationManagerProps) {
  const {
    consultationPolls,
    voteConsultationSlot,
    confirmConsultationSlot,
    currentUser,
    users,
    isSupervisorMode,
  } = useStore();

  const handleVote = (pollId: string, slotId: string, choice: VoteChoice) => {
    voteConsultationSlot(pollId, slotId, choice);
  };

  const handleConfirm = (pollId: string, slotId: string) => {
    confirmConsultationSlot(pollId, slotId, 'https://meet.google.com/red-lab-thesis');
  };

  const getVoteBadge = (choice?: VoteChoice) => {
    switch (choice) {
      case 'available':
        return <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">✓</span>;
      case 'if_needed':
        return <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-xs">?</span>;
      case 'unavailable':
        return <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center font-bold text-xs">✕</span>;
      default:
        return <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center text-xs">-</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40">
              IDŐPONT-EGYEZTETÉS & KONZULTÁCIÓS NAPTÁR
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Calendly / Doodle Hibrid Rendszer
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Témavezetői Konzultációk & Értekezletek
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Többszereplős időpont-szavazás (Robin, Emma, Domi + Témavezetők), automatizált konszenzus-keresés,
            és véglegesített Google Meet videókonferenciák napirendi pontokkal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddPollModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Új Időpont-szavazás Kiírása</span>
          </button>
        </div>
      </div>

      {/* Polls Listing */}
      <div className="space-y-6">
        {consultationPolls.map((poll) => {
          const isConfirmed = poll.status === 'confirmed';
          const confirmedSlot = isConfirmed
            ? poll.slots.find((s) => s.id === poll.confirmedSlotId)
            : null;

          return (
            <div
              key={poll.id}
              className={`p-6 rounded-2xl border transition-all shadow-sm space-y-5 ${
                isConfirmed
                  ? 'bg-gradient-to-br from-[#12141D] to-[#151c27] border-emerald-500/30 ring-1 ring-emerald-500/20'
                  : 'bg-[#12141D] border-[#1E2230]'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#1E2230]">
                <div>
                  <div className="flex items-center space-x-2">
                    {isConfirmed ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Véglegesített Időpont
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center animate-pulse">
                        <Clock className="w-3.5 h-3.5 mr-1" /> Szavazás Folyamatban
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400">
                      Kiírta: {poll.createdByName}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{poll.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{poll.description}</p>
                </div>

                {isConfirmed && poll.meetingLink && (
                  <a
                    href={poll.meetingLink}
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

              {/* Agenda Bullets */}
              {poll.agenda.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230]">
                  <h5 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">
                    Tervezett Napirendi Pontok:
                  </h5>
                  <ul className="space-y-1">
                    {poll.agenda.map((item, idx) => (
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
                  Időpont-lehetőségek & Csapattagok Elérhetősége
                </h5>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1E2230] text-slate-400 font-mono text-[11px]">
                        <th className="py-2.5 px-3">Időpont & Időtartam</th>
                        {users.map((u) => (
                          <th key={u.id} className="py-2.5 px-2 text-center">
                            <div className="flex flex-col items-center">
                              <span
                                className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center mb-0.5"
                                style={{ backgroundColor: u.avatarColor }}
                              >
                                {u.initials}
                              </span>
                              <span className="truncate max-w-[65px]">{u.name}</span>
                            </div>
                          </th>
                        ))}
                        <th className="py-2.5 px-3 text-center">Elérhetőség</th>
                        <th className="py-2.5 px-3 text-right">Szavazatod ({currentUser.name})</th>
                        <th className="py-2.5 px-3 text-right">Művelet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2230]">
                      {poll.slots.map((slot) => {
                        const isThisSlotConfirmed = poll.confirmedSlotId === slot.id;
                        const availableCount = Object.values(slot.votes).filter((v) => v === 'available').length;
                        const myVote = slot.votes[currentUser.id];

                        return (
                          <tr
                            key={slot.id}
                            className={`hover:bg-slate-900/40 transition-colors ${
                              isThisSlotConfirmed ? 'bg-emerald-950/20 font-semibold' : ''
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-200">
                                {formatDateHungarian(slot.dateTime)}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {slot.durationMinutes} perc
                              </div>
                            </td>

                            {/* Participant votes */}
                            {users.map((u) => (
                              <td key={u.id} className="py-3 px-2 text-center">
                                <div className="flex justify-center">
                                  {getVoteBadge(slot.votes[u.id])}
                                </div>
                              </td>
                            ))}

                            {/* Tally */}
                            <td className="py-3 px-3 text-center font-mono">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                                {availableCount} elérhető
                              </span>
                            </td>

                            {/* My Vote Selector */}
                            <td className="py-3 px-3 text-right">
                              <div className="inline-flex rounded-lg border border-[#1E2230] p-0.5 bg-slate-900">
                                <button
                                  onClick={() => handleVote(poll.id, slot.id, 'available')}
                                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                                    myVote === 'available'
                                      ? 'bg-emerald-600 text-white'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                  title="Elérhető"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => handleVote(poll.id, slot.id, 'if_needed')}
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
                                  onClick={() => handleVote(poll.id, slot.id, 'unavailable')}
                                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                                    myVote === 'unavailable'
                                      ? 'bg-rose-600 text-white'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                  title="Nem jó"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>

                            {/* Confirm Action for Supervisor / Admin */}
                            <td className="py-3 px-3 text-right">
                              {isThisSlotConfirmed ? (
                                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center justify-end">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Végleges
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleConfirm(poll.id, slot.id)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-700 hover:text-white text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors"
                                  title="Időpont kiválasztása véglegesnek"
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
    </div>
  );
}
