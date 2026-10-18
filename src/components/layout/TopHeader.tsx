'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
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
  Users,
  LogOut,
  Radio,
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface TopHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TopHeader({ activeTab, setActiveTab }: TopHeaderProps) {
  const router = useRouter();
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
    addNotification,
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState<Record<string, boolean>>({
    'user-robin': true,
    'user-emma': true,
    'user-domi': true,
    'user-prof-kovacs': true,
  });

  const pendingApprovals = milestones.filter((m) => m.status === 'awaiting_approval').length;
  const unreadNotifs = notifications.filter((n) => !n.is_read);

  // Supabase Realtime Subscription for Notifications & Presence
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createClient();

    // 1. Listen for new notifications
    const notifChannel = supabase
      .channel('realtime:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotif = payload.new as any;
          if (newNotif && (!newNotif.recipient_id || newNotif.recipient_id === currentProfile.id)) {
            addNotification({
              recipient_id: newNotif.recipient_id || currentProfile.id,
              title: newNotif.title,
              message: newNotif.message,
              link_url: newNotif.link_url,
              severity: newNotif.severity || 'info',
            });
            toast.info(newNotif.title, {
              description: newNotif.message,
            });
          }
        }
      )
      .subscribe();

    // 2. Online Presence tracking
    const presenceChannel = supabase.channel('redlab:presence', {
      config: {
        presence: {
          key: currentProfile.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const activeMap: Record<string, boolean> = {
          'user-robin': true,
          'user-emma': true,
          'user-domi': true,
          'user-prof-kovacs': true,
        };
        Object.keys(state).forEach((userId) => {
          activeMap[userId] = true;
        });
        setOnlineMembers(activeMap);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: currentProfile.id,
            user_name: currentProfile.full_name,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [currentProfile, addNotification]);

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
      // Clear demo auth cookie
      document.cookie = 'redlab_demo_auth=; path=/; max-age=0';
      toast.success('Sikeres kijelentkezés.');
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

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
    <header className="sticky top-0 z-40 w-full h-16 border-b border-[#1E2230] bg-[#090A0F]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Left: Active Module Breadcrumb & Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            RED LAB
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-xs sm:text-sm font-bold text-white capitalize">
            {activeTab === 'dashboard' && 'Központ & Áttekintés'}
            {activeTab === 'thesis' && 'Haladási Terv & Kézirat'}
            {activeTab === 'kanban' && 'Kanban Kutatási Tábla'}
            {activeTab === 'consultation' && 'Időpont-egyeztető & Konzultáció'}
            {activeTab === 'files' && 'Fájltár & Git Verziók'}
            {activeTab === 'literature' && 'Szakirodalom & DOI Tár'}
            {activeTab === 'labbook' && 'Kutatási & Laboratóriumi Napló'}
            {activeTab === 'supervisor' && 'Témavezetői Döntéshozói Központ'}
          </span>
        </div>

        {isSupervisorMode && (
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/60 shadow-sm animate-pulse">
            <GraduationCap className="w-3 h-3 mr-1" />
            Professzori Mód Aktív
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Supabase Presence Team Indicator (R, E, D, P) */}
        <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#12141D] border border-[#1E2230]">
          <span className="text-[10px] font-mono text-slate-400 mr-1.5 flex items-center">
            <Radio className="w-3 h-3 text-emerald-400 mr-1 animate-pulse" />
            Online:
          </span>
          <div className="flex items-center -space-x-1.5">
            {profiles.slice(0, 4).map((p) => {
              const isOnline = onlineMembers[p.id] ?? true;
              return (
                <div
                  key={p.id}
                  className="relative group cursor-pointer"
                  title={`${p.full_name} (${p.short_code}) - ${isOnline ? 'Online' : 'Offline'}`}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#12141D] shadow-sm"
                    style={{ backgroundColor: p.badge_color }}
                  >
                    {p.short_code}
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#090A0F]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TÉMAVEZETŐI NÉZET (Supervisor Mode) Kapcsoló */}
        <button
          onClick={toggleSupervisorMode}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            isSupervisorMode
              ? 'bg-gradient-to-r from-purple-900/60 to-purple-800/60 text-purple-200 border-purple-600/60 shadow-md shadow-purple-950/50'
              : 'bg-[#12141D] text-slate-400 hover:text-slate-200 border-[#1E2230] hover:border-slate-700'
          }`}
          title="Témavezetői jóváhagyási és szignálási nézet átkapcsolása"
        >
          <GraduationCap className={`w-3.5 h-3.5 ${isSupervisorMode ? 'text-purple-300' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">Témavezetői Nézet</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isSupervisorMode ? 'bg-purple-400 ring-2 ring-purple-300/40' : 'bg-slate-600'
            }`}
          />
        </button>

        {/* Real-time Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-[#12141D] border border-[#1E2230] text-slate-300 hover:text-white hover:border-slate-700 transition-all relative"
            title="Értesítések"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#090A0F] animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Valós Idejű Értesítések
                  </h4>
                  {unreadNotifs.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                      {unreadNotifs.length} új
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-mono text-rose-400 hover:text-rose-300 hover:underline"
                  >
                    Mind olvasottnak jelölése
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Nincs új rendszerértesítés.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link_url?.includes('thesis') || n.link_url?.includes('milestone')) {
                          setActiveTab('thesis');
                        } else if (n.link_url?.includes('scheduler') || n.link_url?.includes('meeting')) {
                          setActiveTab('consultation');
                        } else if (n.link_url?.includes('kanban')) {
                          setActiveTab('kanban');
                        } else if (n.link_url?.includes('file')) {
                          setActiveTab('files');
                        }
                        setShowNotifications(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        !n.is_read
                          ? 'bg-slate-900/90 border-slate-700/80 hover:border-rose-500/50 hover:bg-slate-900'
                          : 'bg-slate-900/20 border-[#1E2230] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          {getSeverityBadge(n.severity)}
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {n.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {n.created_at ? n.created_at.substring(11, 16) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Persona & Profile Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#12141D] border border-[#1E2230] hover:border-slate-700 transition-all text-left"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/20"
              style={{ backgroundColor: currentProfile.badge_color }}
            >
              {currentProfile.short_code}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {currentProfile.full_name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono leading-none">
                {currentProfile.role === 'supervisor' ? 'Témavezető' : 'Kutató'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-[#1E2230]">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Aktív Munkamenet
                </p>
                <p className="text-xs text-white font-bold mt-0.5">
                  {currentProfile.full_name}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {currentProfile.email}
                </p>
              </div>

              <div className="py-2 space-y-1">
                <div className="px-2 pt-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  RED Lab Csapattagok:
                </div>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentProfileById(p.id);
                      setIsUserMenuOpen(false);
                      toast.success(`Felhasználó átváltva: ${p.full_name}`);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors text-xs ${
                      currentProfile.id === p.id
                        ? 'bg-rose-950/40 text-rose-200 border border-rose-900/40'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: p.badge_color }}
                    >
                      {p.short_code}
                    </span>
                    <div className="min-w-0 flex-1 truncate">
                      <div className="font-semibold text-slate-200 truncate">{p.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {p.role === 'supervisor' ? 'Témavezető Prof.' : 'Kutató'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[#1E2230]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Kijelentkezés</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[#12141D] border border-[#1E2230] text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all"
          title="Sötét / Világos téma"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
        </button>
      </div>
    </header>
  );
}
