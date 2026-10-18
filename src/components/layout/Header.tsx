'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  GraduationCap,
  Users,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
  Radio,
  Bell,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const {
    currentUser,
    users,
    setCurrentUserById,
    isSupervisorMode,
    toggleSupervisorMode,
    theme,
    toggleTheme,
    thesisChapters,
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingApprovals = thesisChapters.filter((ch) => ch.status === 'felulvizsgalatra_var').length;

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-[#1E2230] bg-[#090A0F]/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Left Title / Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest hidden sm:inline-block">
            RED LAB CLUSTER
          </span>
        </div>
        <div className="h-4 w-px bg-[#1E2230] hidden sm:block" />
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-300">
            {activeTab === 'dashboard' && 'Vezérlőpult'}
            {activeTab === 'kanban' && 'Kutatási Feladatok & Kanban'}
            {activeTab === 'thesis' && 'Szakdolgozat & Fejezet Menedzser'}
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
            {pendingApprovals > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#090A0F]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Kutatócsoporti Értesítések
                </h4>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                  Valós idejű
                </span>
              </div>
              <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto">
                {pendingApprovals > 0 ? (
                  <div
                    onClick={() => {
                      setActiveTab('thesis');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 hover:bg-rose-900/30 cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-medium text-rose-200">
                      {pendingApprovals} fejezet jóváhagyásra vár
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      A professzori jóváhagyási listán teendő található.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    Minden fejezet és jóváhagyás naprakész!
                  </div>
                )}
                <div
                  onClick={() => {
                    setActiveTab('consultation');
                    setShowNotifications(false);
                  }}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-[#1E2230] hover:border-slate-700 cursor-pointer transition-colors"
                >
                  <p className="text-xs font-medium text-slate-200">
                    Nyitott konzultációs szavazás
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Heti Témavezetői Konzultáció & Eredmény-felülvizsgálat
                  </p>
                </div>
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

        {/* Persona / User Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg bg-[#12141D] border border-[#1E2230] hover:border-slate-700 transition-all text-left"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/20"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-slate-200 flex items-center">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono leading-none">
                {currentUser.role === 'supervisor' ? 'Témavezető' : 'Kutató'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-[#1E2230]">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Aktív Szerepkör & Felhasználó
                </p>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Válassz kutatót vagy témavezetőt:
                </p>
              </div>

              <div className="py-1 space-y-1">
                <div className="px-2 pt-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  RED Lab Kutatók
                </div>
                {users
                  .filter((u) => u.role === 'researcher')
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUserById(u.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left transition-colors text-xs ${
                        currentUser.id === u.id
                          ? 'bg-rose-950/40 text-rose-200 border border-rose-900/40'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: u.avatarColor }}
                      >
                        {u.initials}
                      </span>
                      <div className="flex-1 truncate">
                        <div className="font-medium text-slate-200">{u.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.workstreamDescription}</div>
                      </div>
                    </button>
                  ))}

                <div className="px-2 pt-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Témavezetők (Supervisors)
                </div>
                {users
                  .filter((u) => u.role === 'supervisor')
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUserById(u.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left transition-colors text-xs ${
                        currentUser.id === u.id
                          ? 'bg-purple-950/40 text-purple-200 border border-purple-900/40'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: u.avatarColor }}
                      >
                        {u.initials}
                      </span>
                      <div className="flex-1 truncate">
                        <div className="font-medium text-slate-200">{u.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.title}</div>
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
