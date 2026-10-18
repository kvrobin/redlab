'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { ActivityLog } from '@/types';
import {
  Activity,
  CheckCircle2,
  FileCode,
  CalendarCheck2,
  BookOpenCheck,
  Filter,
  ArrowUpRight,
  Sparkles,
  GitCommit,
  Clock,
  Layers,
} from 'lucide-react';
import { formatDateHungarian } from '@/lib/utils';
import { toast } from 'sonner';

interface ActivityFeedProps {
  onNavigateTab?: (tab: string) => void;
  maxItems?: number;
  compact?: boolean;
}

export function ActivityFeed({ onNavigateTab, maxItems = 15, compact = false }: ActivityFeedProps) {
  const { activityLogs, logActivity, profiles } = useStore();
  const [filterType, setFilterType] = useState<string>('all');

  // Supabase Realtime channel listener for live activity feed
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createClient();
    const channel = supabase
      .channel('realtime:activity_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        (payload) => {
          const newAct = payload.new as any;
          if (newAct) {
            logActivity(
              newAct.action_type || 'ACTIVITY',
              newAct.entity_title || 'Esemény',
              newAct.details,
              newAct.target_url
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [logActivity]);

  const getFilteredLogs = () => {
    if (filterType === 'all') return activityLogs;
    if (filterType === 'tasks') {
      return activityLogs.filter((a) =>
        a.action_type.includes('TASK') || a.target_url?.includes('kanban')
      );
    }
    if (filterType === 'files') {
      return activityLogs.filter((a) =>
        a.action_type.includes('FILE') || a.action_type.includes('COMMIT') || a.target_url?.includes('files')
      );
    }
    if (filterType === 'meetings') {
      return activityLogs.filter((a) =>
        a.action_type.includes('MEETING') || a.action_type.includes('VOTE') || a.target_url?.includes('scheduler') || a.target_url?.includes('consultation')
      );
    }
    if (filterType === 'thesis') {
      return activityLogs.filter((a) =>
        a.action_type.includes('MILESTONE') || a.action_type.includes('THESIS') || a.target_url?.includes('thesis') || a.target_url?.includes('milestones')
      );
    }
    return activityLogs;
  };

  const filteredLogs = getFilteredLogs().slice(0, maxItems);

  const getActorBadge = (actorId?: string | null, actorName?: string | null) => {
    const profile = profiles.find((p) => (actorId && p.id === actorId) || (actorName && p.full_name === actorName));
    const shortCode = profile?.short_code || (actorName ? actorName.substring(0, 1).toUpperCase() : 'R');
    const badgeColor = profile?.badge_color || '#E11D48';

    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
        style={{ backgroundColor: badgeColor }}
        title={`${actorName || 'Kutató'} (${profile?.role === 'supervisor' ? 'Témavezető' : 'Kutató'})`}
      >
        {shortCode}
      </div>
    );
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('TASK')) return <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />;
    if (actionType.includes('FILE') || actionType.includes('COMMIT')) return <GitCommit className="w-3.5 h-3.5 text-emerald-400" />;
    if (actionType.includes('MEETING') || actionType.includes('VOTE')) return <CalendarCheck2 className="w-3.5 h-3.5 text-amber-400" />;
    if (actionType.includes('MILESTONE') || actionType.includes('THESIS')) return <BookOpenCheck className="w-3.5 h-3.5 text-purple-400" />;
    return <Activity className="w-3.5 h-3.5 text-rose-400" />;
  };

  const handleItemClick = (log: ActivityLog) => {
    if (onNavigateTab) {
      if (log.target_url?.includes('kanban') || log.action_type.includes('TASK')) {
        onNavigateTab('kanban');
      } else if (log.target_url?.includes('files') || log.action_type.includes('FILE')) {
        onNavigateTab('files');
      } else if (log.target_url?.includes('consultation') || log.target_url?.includes('scheduler') || log.action_type.includes('MEETING')) {
        onNavigateTab('consultation');
      } else if (log.target_url?.includes('thesis') || log.target_url?.includes('milestones') || log.action_type.includes('MILESTONE')) {
        onNavigateTab('thesis');
      }
    }
  };

  return (
    <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-5 shadow-lg relative flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E2230] gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              Aktivitási Eseményfolyam
              <span className="inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                Supabase Realtime
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Kutatócsoporti audit és digitális cselekvési napló
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center space-x-1 overflow-x-auto text-[11px] font-mono">
          {[
            { id: 'all', label: 'Mind' },
            { id: 'tasks', label: 'Feladat' },
            { id: 'files', label: 'Git / Fájl' },
            { id: 'meetings', label: 'Megbeszélés' },
            { id: 'thesis', label: 'Kézirat' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-rose-900/40 text-rose-200 border border-rose-700/60 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed list */}
      <div className="mt-4 space-y-3 flex-1 overflow-y-auto pr-1 max-h-[480px]">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            Nincs rögzített aktivitás ebben a kategóriában.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => handleItemClick(log)}
              className="group p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/90 border border-[#1E2230] hover:border-slate-700 transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2.5 min-w-0">
                  {getActorBadge(log.actor_id, log.actor_name)}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-semibold text-slate-200">{log.actor_name}</span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center text-[10px] font-mono text-slate-400 space-x-1">
                        {getActionIcon(log.action_type)}
                        <span>{log.action_type}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium mt-0.5 truncate">
                      {log.entity_title}
                    </p>

                    {log.details && (
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className="text-[10px] font-mono text-slate-500 block"
                    suppressHydrationWarning
                  >
                    {formatDateHungarian(log.created_at)}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-400 transition-colors ml-auto mt-1" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer count indicator */}
      <div className="mt-3 pt-3 border-t border-[#1E2230] flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>Összesen: {activityLogs.length} audit esemény</span>
        <span className="text-rose-400/80">RED Lab Audit Engine</span>
      </div>
    </div>
  );
}
