'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  GraduationCap,
  ChevronDown,
  Sun,
  Moon,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const {
    currentProfile,
    profiles,
    setCurrentProfileById,
    isSupervisorMode,
    toggleSupervisorMode,
    theme,
    toggleTheme,
    milestones,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingApprovals = milestones.filter((m) => m.status === 'awaiting_approval').length;
  const unreadNotifs = notifications.filter((n) => !n.is_read);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'urgent':
        return <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />;
      case 'warning':
        return <span className="w-2 h-2 rounded-full bg-amber-400" />;
      case 'success':
        return <span className="w-2 h-2 rounded-full bg-emerald-400" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-blue-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-[#1E2230] bg-[#090A0F]/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Left Title / Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest hidden sm:inline-block">
            SUPABASE RED LAB CLUSTER
          </span>
        </div>
        <div className="h-4 w-px bg-[#1E2230] hidden sm:block" />
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-300">
            {activeTab === 'dashboard' && 'Vezérlőpult'}
            {activeTab === 'kanban' && 'Kutatási Feladatok & Kanban'}
            {activeTab === 'thesis' && 'Szakdolgozat & Mérföldkövek'}
            {activeTab === 'labbook' && 'Kutatási Napló (ELN)'}
            {activeTab === 'files' && 'Fájl & Verziókezelés (Scientific Git)'}
            {activeTab === 'literature' && 'Szakirodalom & DOI Repozitórium'}
            {activeTab === 'consultation' && 'Konzultáció & Időpont-egyeztetés'}
            {activeTab === 'supervisor' && 'Témavezetői Vezetői Nézet'}
          </span>
          {isSupervisorMode && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Témavezetői Mód
            </span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Supervisor Mode Fast Switcher */}
        <button
          onClick={() => {
            toggleSupervisorMode();
            if (!isSupervisorMode) {
              setActiveTab('supervisor');
            }
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 border ${
            isSupervisorMode
              ? 'bg-purple-600/20 text-purple-200 border-purple-500/50 shadow-sm'
              : 'bg-[#12141D] text-slate-400 border-[#1E2230] hover:text-slate-200 hover:border-slate-700'
          }`}
          title="Témavezetői Vezetői Nézet aktiválása"
        >
          <GraduationCap className={`w-3.5 h-3.5 ${isSupervisorMode ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="hidden md:inline">Témavezetői Nézet</span>
          {pendingApprovals > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
              {pendingApprovals}
            </span>
          )}
        </button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-[#12141D] border border-[#1E2230] text-slate-400 hover:text-slate-200 hover:border-slate-700 relative transition-all"
            title="Értesítések"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#090A0F]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Értesítések ({unreadNotifs.length})
                </h4>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-mono text-rose-400 hover:underline"
                  >
                    Mind olvasott
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500">
                    Nincs új értesítés
                  </div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link_url?.includes('thesis')) setActiveTab('thesis');
                        if (n.link_url?.includes('scheduler')) setActiveTab('consultation');
                        if (n.link_url?.includes('kanban')) setActiveTab('kanban');
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        !n.is_read
                          ? 'bg-slate-900/90 border-slate-700/80 hover:bg-slate-800'
                          : 'bg-slate-900/30 border-[#1E2230] opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1">
                        {getSeverityBadge(n.severity)}
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {n.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-[#12141D] border border-[#1E2230] text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all"
          title="Téma váltása"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Profile / Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg bg-[#12141D] border border-[#1E2230] hover:border-slate-700 transition-all text-left"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/20"
              style={{ backgroundColor: currentProfile.badge_color }}
            >
              {currentProfile.short_code}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-slate-200 flex items-center">
                {currentProfile.full_name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono leading-none">
                {currentProfile.role === 'supervisor' ? 'Témavezető' : 'Kutató'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-[#1E2230]">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Supabase Profil & Szerepkör
                </p>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Válassz aktív csapattagot:
                </p>
              </div>

              <div className="py-1 space-y-1">
                <div className="px-2 pt-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  RED Lab Kutatók
                </div>
                {profiles
                  .filter((p) => p.role === 'researcher')
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentProfileById(p.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left transition-colors text-xs ${
                        currentProfile.id === p.id
                          ? 'bg-rose-950/40 text-rose-200 border border-rose-900/40'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: p.badge_color }}
                      >
                        {p.short_code}
                      </span>
                      <div className="flex-1 truncate">
                        <div className="font-medium text-slate-200">{p.full_name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.title}</div>
                      </div>
                    </button>
                  ))}

                <div className="px-2 pt-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Témavezetők (Supervisors)
                </div>
                {profiles
                  .filter((p) => p.role === 'supervisor')
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentProfileById(p.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left transition-colors text-xs ${
                        currentProfile.id === p.id
                          ? 'bg-purple-950/40 text-purple-200 border border-purple-900/40'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: p.badge_color }}
                      >
                        {p.short_code}
                      </span>
                      <div className="flex-1 truncate">
                        <div className="font-medium text-slate-200">{p.full_name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.title}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
