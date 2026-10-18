'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { MeetingVotingCard } from '@/components/scheduler/MeetingVotingCard';
import { CreateMeetingModal } from '@/components/scheduler/CreateMeetingModal';
import {
  CalendarCheck2,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Search,
  Filter,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface SchedulerViewProps {
  openAddPollModal?: () => void;
}

export function SchedulerView({ openAddPollModal }: SchedulerViewProps) {
  const { meetings } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'voting' | 'reschedule' | 'confirmed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = () => {
    if (openAddPollModal) openAddPollModal();
    else setIsModalOpen(true);
  };

  // Stats calculation
  const confirmedCount = meetings.filter((m) => m.status === 'confirmed').length;
  const votingCount = meetings.filter((m) => m.status === 'voting').length;
  const rescheduleCount = meetings.filter((m) => m.status === 'reschedule_needed').length;
  const supervisorMeetingsCount = meetings.filter((m) => m.requires_supervisor).length;

  // Filtered meetings
  const filteredMeetings = meetings.filter((meeting) => {
    // Tab filter
    if (filterTab === 'voting' && meeting.status !== 'voting') return false;
    if (filterTab === 'reschedule' && meeting.status !== 'reschedule_needed') return false;
    if (filterTab === 'confirmed' && meeting.status !== 'confirmed') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = meeting.title.toLowerCase().includes(q);
      const matchDesc = meeting.description.toLowerCase().includes(q);
      const matchAgenda = meeting.agenda_items.some((item) => item.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchAgenda) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#161822] to-[#12141D] border border-[#1E2230] p-6 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-rose-600/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold tracking-wider uppercase">
                RED LAB KONSZENZUS MOTOR
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] font-mono text-slate-400">
                evaluate_meeting_consensus() Trigger & Automatikus Újraütemezés
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
              Intelligens Időpont-egyeztető & Konzultáció Kezelő
            </h1>

            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Többszereplős szavazási mátrix (Upvote / If-needed / Downvote). Ha minden javasolt idősáv vétót kap, a rendszer azonnal
              átvált <span className="text-rose-400 font-semibold">Reschedule Needed</span> állapotba. A véglegesített időpontok 1 kattintással exportálhatók Google Naptárba vagy .ics fájlba!
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center space-x-2 transition-all shrink-0 self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Új Időpont-szavazás Kiírása</span>
          </button>
        </div>
      </div>

      {/* 2. STATS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Confirmed */}
        <div className="p-4 rounded-2xl bg-[#12141D] border border-emerald-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Véglegesített Időpontok
            </span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {confirmedCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Naptárba szinkronizálva</p>
          </div>
          <span className="p-3 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </span>
        </div>

        {/* Card 2: In voting */}
        <div className="p-4 rounded-2xl bg-[#12141D] border border-amber-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Szavazás Alatt
            </span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {votingCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Döntésre váró egyeztetések</p>
          </div>
          <span className="p-3 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-800/60">
            <Clock className="w-5 h-5 text-amber-400" />
          </span>
        </div>

        {/* Card 3: Reschedule needed */}
        <div
          className={`p-4 rounded-2xl bg-[#12141D] border shadow-sm flex items-center justify-between transition-all ${
            rescheduleCount > 0
              ? 'border-rose-600/70 shadow-rose-950/40 ring-1 ring-rose-500/30'
              : 'border-[#1E2230]'
          }`}
        >
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1">
              Újraütemezés Szükséges
              {rescheduleCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
            </span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {rescheduleCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {rescheduleCount > 0 ? 'Új idősávot kell javasolni!' : 'Nincs ütköző egyeztetés'}
            </p>
          </div>
          <span className="p-3 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800/60">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </span>
        </div>

        {/* Card 4: Supervisor */}
        <div className="p-4 rounded-2xl bg-[#12141D] border border-purple-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-semibold">
              Témavezetői Részvétel
            </span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {supervisorMeetingsCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Professzori jelenléttel</p>
          </div>
          <span className="p-3 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-800/60">
            <GraduationCap className="w-5 h-5 text-purple-400" />
          </span>
        </div>
      </div>

      {/* 3. SEARCH & FILTER TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#12141D] border border-[#1E2230]">
        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTab === 'all'
                ? 'bg-rose-950/80 text-rose-200 border border-rose-800/70 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/40'
            }`}
          >
            Összes ({meetings.length})
          </button>
          <button
            onClick={() => setFilterTab('voting')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTab === 'voting'
                ? 'bg-amber-950/80 text-amber-200 border border-amber-800/70 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/40'
            }`}
          >
            Szavazás alatt ({votingCount})
          </button>
          <button
            onClick={() => setFilterTab('reschedule')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterTab === 'reschedule'
                ? 'bg-rose-950/90 text-rose-200 border border-rose-700 shadow-sm ring-1 ring-rose-500/30'
                : 'text-slate-400 hover:text-rose-300 bg-slate-900/40'
            }`}
          >
            <span>Újraütemezés Szükséges</span>
            {rescheduleCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-[10px] text-white font-mono font-bold">
                {rescheduleCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('confirmed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTab === 'confirmed'
                ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-800/70 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/40'
            }`}
          >
            Véglegesített ({confirmedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Keresés téma, napirend szerint..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* 4. MEETINGS LIST */}
      <div className="space-y-6">
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => (
            <MeetingVotingCard key={meeting.id} meeting={meeting} />
          ))
        ) : (
          <div className="text-center py-12 rounded-2xl bg-[#12141D] border border-dashed border-[#1E2230] p-8 space-y-3">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">Nincs találat a szűrésnek megfelelően</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Próbálj meg más keresési kifejezést vagy hozz létre egy új időpont-szavazást!
            </p>
            <button
              onClick={handleOpenModal}
              className="mt-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              + Új Időpont-szavazás Létrehozása
            </button>
          </div>
        )}
      </div>

      {/* 5. CREATE MEETING MODAL */}
      <CreateMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
