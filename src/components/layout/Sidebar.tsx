'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { formatNumber } from '@/lib/utils';
import { RedLabLogo } from '@/components/brand/RedLabLogo';
import Link from 'next/link';
import {
  LayoutDashboard,
  KanbanSquare,
  BookOpenCheck,
  FolderGit2,
  Library,
  CalendarCheck2,
  GraduationCap,
  FlaskConical,
  ShieldCheck,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { tasks, milestones, meetings, researchLogs, isSupervisorMode } = useStore();

  const totalWords = milestones.reduce((acc, m) => acc + (m.current_words || 0), 0);
  const targetWords = milestones.reduce((acc, m) => acc + (m.target_words || 0), 0);
  const progressPercent = targetWords > 0 ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0;

  const pendingApprovals = milestones.filter((m) => m.status === 'awaiting_approval').length;
  const activeTasksCount = tasks.filter((t) => t.status !== 'done').length;

  // Check if any meeting is in voting or reschedule_needed state
  const urgentMeetings = meetings.filter(
    (m) => m.status === 'voting' || m.status === 'reschedule_needed'
  );
  const hasUrgentMeeting = urgentMeetings.length > 0;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Központ',
      sublabel: 'Dashboard & Áttekintés',
      icon: LayoutDashboard,
    },
    {
      id: 'thesis',
      label: 'Thesis & TDK Studio',
      sublabel: 'Fejezet-építő & Mátrix',
      icon: GraduationCap,
      highlight: true,
      badge: 'ÚJ',
      badgeColor: 'bg-rose-600 font-bold',
    },
    {
      id: 'milestones',
      label: 'Haladási Terv',
      sublabel: 'Mérföldkövek & Szignók',
      icon: BookOpenCheck,
      badge: pendingApprovals > 0 ? `${pendingApprovals} szignó` : undefined,
      badgeColor: 'bg-amber-600',
    },
    {
      id: 'kanban',
      label: 'Kanban Tábla',
      sublabel: 'Tasks & Teendők',
      icon: KanbanSquare,
      badge: activeTasksCount > 0 ? activeTasksCount : undefined,
    },
    {
      id: 'consultation',
      label: 'Időpont-egyeztető',
      sublabel: 'Smart Scheduler',
      icon: CalendarCheck2,
      badge: hasUrgentMeeting ? `${urgentMeetings.length} szavazás` : undefined,
      badgeColor: 'bg-red-600 animate-pulse font-bold',
      isUrgent: hasUrgentMeeting,
    },
    {
      id: 'files',
      label: 'Fájltár & Verziók',
      sublabel: 'File Vault & Git',
      icon: FolderGit2,
    },
    {
      id: 'literature',
      label: 'Szakirodalom',
      sublabel: 'Literature Hub & DOI',
      icon: Library,
    },
    {
      id: 'labbook',
      label: 'Kutatási Napló',
      sublabel: 'Lab Logs & ELN',
      icon: FlaskConical,
      badge: researchLogs.length > 0 ? researchLogs.length : undefined,
    },
    {
      id: 'supervisor',
      label: 'Témavezetői Központ',
      sublabel: 'Executive Hub',
      icon: ShieldCheck,
      badge: pendingApprovals > 0 ? `${pendingApprovals} függőben` : undefined,
      badgeColor: 'bg-purple-600',
    },
    {
      id: 'settings',
      label: 'Beállítások & Webhook',
      sublabel: 'Értesítések & Meghívók',
      icon: Settings,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Logo & Name */}
        <div className="p-4 border-b border-[#1E2230] flex items-center justify-between">
          <RedLabLogo variant="full" size="md" />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 touch-target flex items-center justify-center transition-colors"
              aria-label="Menü bezárása"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Rendszermodulok
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group touch-target ${
                  isActive
                    ? 'bg-rose-950/40 text-rose-200 border border-rose-800/50 shadow-sm shadow-rose-950/50'
                    : item.highlight
                    ? 'text-rose-300 hover:bg-rose-950/30 hover:text-rose-100 border border-rose-900/30'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-rose-400'
                        : item.highlight
                        ? 'text-rose-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <div className="truncate">
                    <div
                      className={`text-xs font-semibold leading-tight ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-white'
                          : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md text-white shrink-0 ml-1.5 ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Workstreams overview pill */}
        <div className="px-5 py-3 border-t border-[#1E2230]/60 mx-3 mt-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
            Aktív Kutatási Szálak
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                Robin (Rendszer)
              </span>
              <span className="text-[10px] text-slate-400">Dry Lab</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
                Emma (Reagensek)
              </span>
              <span className="text-[10px] text-slate-400">Wet Lab</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                Domi (CAD/Hardver)
              </span>
              <span className="text-[10px] text-slate-400">Hardware</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Thesis Progress Widget */}
      <div className="p-4 border-t border-[#1E2230] bg-[#090A0F]/60">
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

        <div className="pt-2.5 mt-2.5 border-t border-[#1E2230]/70 flex items-center justify-between text-[10px] font-mono">
          <Link
            href="/privacy"
            onClick={() => onCloseMobile && onCloseMobile()}
            className="text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            Adatvédelem & Jogi nyilatkozat
          </Link>
          <span className="text-slate-600">Béta</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-[#0C0E15] border-r border-[#1E2230] shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-Over) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Slide-over panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#0C0E15]/95 backdrop-blur-2xl border-r border-[#1E2230] shadow-2xl z-10 animate-in slide-in-from-left duration-250 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
