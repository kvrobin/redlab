'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { formatNumber } from '@/lib/utils';
import {
  LayoutDashboard,
  KanbanSquare,
  BookOpenCheck,
  FolderGit2,
  Library,
  CalendarCheck2,
  GraduationCap,
  FlaskConical,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { tasks, milestones, researchLogs } = useStore();

  const totalWords = milestones.reduce((acc, m) => acc + (m.current_words || 0), 0);
  const targetWords = milestones.reduce((acc, m) => acc + (m.target_words || 0), 0);
  const progressPercent = targetWords > 0 ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0;

  const pendingApprovals = milestones.filter((m) => m.status === 'awaiting_approval').length;
  const activeTasksCount = tasks.filter((t) => t.status !== 'done').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Műszerfal',
      sublabel: 'Összegző áttekintés',
      icon: LayoutDashboard,
    },
    {
      id: 'kanban',
      label: 'Kutatási Feladatok',
      sublabel: 'Kanban & Teendők',
      icon: KanbanSquare,
      badge: activeTasksCount > 0 ? activeTasksCount : undefined,
    },
    {
      id: 'thesis',
      label: 'Szakdolgozat & Fejezetek',
      sublabel: 'Mérföldkövek & Kézirat',
      icon: BookOpenCheck,
      badge: pendingApprovals > 0 ? pendingApprovals : undefined,
      badgeColor: 'bg-rose-600',
    },
    {
      id: 'labbook',
      label: 'Kutatási Napló (ELN)',
      sublabel: 'Kísérleti & Szimulációs Füzet',
      icon: FlaskConical,
      badge: researchLogs.length > 0 ? researchLogs.length : undefined,
    },
    {
      id: 'files',
      label: 'Fájl & Verziókezelés',
      sublabel: 'Scientific Git & CAD',
      icon: FolderGit2,
    },
    {
      id: 'literature',
      label: 'Szakirodalom & DOI',
      sublabel: 'BibTeX & Cikkek',
      icon: Library,
    },
    {
      id: 'consultation',
      label: 'Konzultáció & Szavazás',
      sublabel: 'Consensus Scheduler Engine',
      icon: CalendarCheck2,
    },
    {
      id: 'supervisor',
      label: 'Témavezetői Központ',
      sublabel: 'Executive jóváhagyások',
      icon: GraduationCap,
      highlight: true,
      badge: pendingApprovals > 0 ? `${pendingApprovals} feladat` : undefined,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#0C0E15] border-r border-[#1E2230] flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Logo & Name */}
        <div className="p-5 border-b border-[#1E2230] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-900/40 border border-rose-400/30">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-400 to-rose-200">
                RED LAB
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/40">
                v2.4
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-tight">
              Robin • Emma • Domi
            </p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Fő Munkafolyamatok
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-rose-950/40 text-rose-200 border border-rose-800/50 shadow-sm shadow-rose-950/50'
                    : item.highlight
                    ? 'text-purple-300 hover:bg-purple-950/30 hover:text-purple-100 border border-transparent'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-rose-400'
                        : item.highlight
                        ? 'text-purple-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-xs font-medium leading-none truncate">{item.label}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.sublabel}</div>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ml-1.5 shrink-0 ${
                      item.badgeColor
                        ? `${item.badgeColor} text-white`
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Workstreams Section */}
        <div className="p-3 mt-2">
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center justify-between">
            <span>Workstreamek</span>
            <span className="text-[9px] text-slate-400">RED Csapat</span>
          </div>

          <div className="mt-2 space-y-1.5">
            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-[#1E2230] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-slate-300">Robin (R)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Architektúra</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-[#1E2230] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-xs font-medium text-slate-300">Emma (E)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Wet Lab</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-[#1E2230] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-xs font-medium text-slate-300">Domi (D)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Dry Lab & ML</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Thesis Progress Widget */}
      <div className="p-4 border-t border-[#1E2230] bg-[#090A0F]/50">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-slate-300">Szakdolgozat Haladás</span>
          <span className="font-mono text-xs font-bold text-rose-400">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-600 via-rose-500 to-rose-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2">
          <span suppressHydrationWarning>{formatNumber(totalWords)} / {formatNumber(targetWords)} szó</span>
          <span className="text-emerald-400 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
            Ütemterv szerint
          </span>
        </div>
      </div>
    </aside>
  );
}
