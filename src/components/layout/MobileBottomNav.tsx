'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  LayoutDashboard,
  KanbanSquare,
  Camera,
  CalendarCheck2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenQuickCamera: () => void;
}

export function MobileBottomNav({ onOpenQuickCamera }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { tasks, meetings } = useStore();

  const activeTasksCount = tasks.filter((t) => t.status !== 'done').length;

  const urgentMeetings = meetings.filter(
    (m) => m.status === 'voting' || m.status === 'reschedule_needed'
  );
  const hasUrgentMeeting = urgentMeetings.length > 0;

  const isDashboard = pathname === '/dashboard' || pathname === '/';
  const isKanban = pathname.startsWith('/kanban');
  const isScheduler = pathname.startsWith('/scheduler') || pathname.startsWith('/consultation');
  const isThesis = pathname.startsWith('/thesis') || pathname.startsWith('/milestones');

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0C14]/95 backdrop-blur-2xl border-t border-[#1E2230] pb-[env(safe-area-inset-bottom,8px)] shadow-[0_-8px_25px_rgba(0,0,0,0.65)] select-none"
      aria-label="Mobil alsó navigáció"
    >
      <div className="grid grid-cols-5 items-center px-1 pt-1.5 pb-1 max-w-md mx-auto relative">
        {/* 1. Dashboard */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center py-1 transition-all touch-target rounded-xl ${
            isDashboard ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className={`w-5 h-5 ${isDashboard ? 'scale-110 text-rose-500' : ''}`} />
          </div>
          <span className="text-[10px] font-mono mt-1 tracking-tight">Központ</span>
        </Link>

        {/* 2. Kanban */}
        <Link
          href="/kanban"
          className={`flex flex-col items-center justify-center py-1 transition-all touch-target rounded-xl ${
            isKanban ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <KanbanSquare className={`w-5 h-5 ${isKanban ? 'scale-110 text-rose-500' : ''}`} />
            {activeTasksCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-rose-600 text-[9px] font-mono font-bold text-white leading-none">
                {activeTasksCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono mt-1 tracking-tight">Kanban</span>
        </Link>

        {/* 3. Middle Floating Camera Action Button */}
        <div className="flex flex-col items-center justify-center -mt-6">
          <button
            type="button"
            onClick={onOpenQuickCamera}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-rose-500 text-white shadow-xl shadow-rose-950/70 ring-4 ring-[#0A0C14] flex items-center justify-center active:scale-90 transition-transform cursor-pointer group"
            title="Labor Fotó / Mikroszkóp Kamera"
            aria-label="Labor Fotó Kamera Indítása"
          >
            <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-[10px] font-mono text-rose-400 font-semibold mt-1 tracking-tight">
            Labor Fotó
          </span>
        </div>

        {/* 4. Időpontok / Scheduler */}
        <Link
          href="/scheduler"
          className={`flex flex-col items-center justify-center py-1 transition-all touch-target rounded-xl ${
            isScheduler ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CalendarCheck2 className={`w-5 h-5 ${isScheduler ? 'scale-110 text-rose-500' : ''}`} />
            {hasUrgentMeeting && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            )}
            {hasUrgentMeeting && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 border border-white" />
            )}
          </div>
          <span className="text-[10px] font-mono mt-1 tracking-tight">Időpontok</span>
        </Link>

        {/* 5. Thesis Studio */}
        <Link
          href="/thesis"
          className={`flex flex-col items-center justify-center py-1 transition-all touch-target rounded-xl ${
            isThesis ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <GraduationCap className={`w-5 h-5 ${isThesis ? 'scale-110 text-rose-500' : ''}`} />
          </div>
          <span className="text-[10px] font-mono mt-1 tracking-tight">Thesis</span>
        </Link>
      </div>
    </nav>
  );
}
