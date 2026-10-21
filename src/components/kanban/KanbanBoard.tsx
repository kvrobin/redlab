'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { KanbanTask, TaskPriority, TaskStatus, WorkstreamType } from '@/types';
import {
  Plus,
  Filter,
  Search,
  CheckSquare,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  X,
  Trash2,
  Send,
  Flag,
  MoveRight,
} from 'lucide-react';
import { formatDateHungarian } from '@/lib/utils';
import { toast } from 'sonner';

interface KanbanBoardProps {
  openAddTaskModal: () => void;
}

export function KanbanBoard({ openAddTaskModal }: KanbanBoardProps) {
  const {
    tasks,
    moveTask,
    toggleChecklistItem,
    deleteTask,
    taskComments,
    addComment,
    profiles,
    milestones,
    currentProfile,
  } = useStore();

  const [selectedWorkstream, setSelectedWorkstream] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTaskModal, setActiveTaskModal] = useState<KanbanTask | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeMobileColumn, setActiveMobileColumn] = useState<TaskStatus>('todo');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedWorkstream !== 'all' && task.workstream !== selectedWorkstream) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchTag = task.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  const columns: { id: TaskStatus; label: string; countColor: string; shortLabel: string }[] = [
    { id: 'backlog', label: 'Ötlettár (Backlog)', shortLabel: 'Ötletek', countColor: 'text-slate-400' },
    { id: 'todo', label: 'Teendők (To Do)', shortLabel: 'Teendő', countColor: 'text-slate-300' },
    { id: 'in_progress', label: 'Folyamatban', shortLabel: 'Folyamatban', countColor: 'text-amber-400' },
    { id: 'review_professor', label: 'Professzori Review', shortLabel: 'Review', countColor: 'text-purple-400' },
    { id: 'done', label: 'Befejezve (Done)', shortLabel: 'Kész', countColor: 'text-emerald-400' },
  ];

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
            KRITIKUS
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60">
            MAGAS
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-950/80 text-blue-300 border border-blue-800/60">
            KÖZEPES
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
            ALACSONY
          </span>
        );
    }
  };

  const getWorkstreamTag = (ws: WorkstreamType) => {
    switch (ws) {
      case 'wet_lab':
        return (
          <span className="text-[10px] font-mono text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-900/40">
            Wet Lab
          </span>
        );
      case 'dry_lab_code':
        return (
          <span className="text-[10px] font-mono text-orange-400 bg-orange-950/50 px-1.5 py-0.5 rounded border border-orange-900/40">
            Dry Lab & ML
          </span>
        );
      case 'cad_hardware':
        return (
          <span className="text-[10px] font-mono text-purple-400 bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-900/40">
            CAD & Hardware
          </span>
        );
      case 'thesis_writing':
        return (
          <span className="text-[10px] font-mono text-red-400 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-900/40">
            Kézirat
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
            Általános
          </span>
        );
    }
  };

  const scrollToColumn = (colId: TaskStatus) => {
    setActiveMobileColumn(colId);
    const el = document.getElementById(`kanban-col-${colId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const currentModalTask = activeTaskModal
    ? tasks.find((t) => t.id === activeTaskModal.id) || activeTaskModal
    : null;
  const currentTaskComments = currentModalTask
    ? taskComments.filter((c) => c.task_id === currentModalTask.id)
    : [];

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#12141D] border border-[#1E2230]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terület:</span>
          </div>
          <select
            value={selectedWorkstream}
            onChange={(e) => setSelectedWorkstream(e.target.value)}
            className="px-2.5 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500 touch-target"
          >
            <option value="all">Minden workstream</option>
            <option value="wet_lab">Wet Lab</option>
            <option value="dry_lab_code">Dry Lab & ML</option>
            <option value="cad_hardware">CAD & Hardware</option>
            <option value="thesis_writing">Kézirat</option>
            <option value="general">Általános</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500 touch-target"
          >
            <option value="all">Minden prioritás</option>
            <option value="critical">Kritikus</option>
            <option value="high">Magas</option>
            <option value="medium">Közepes</option>
            <option value="low">Alacsony</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Keresés..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={openAddTaskModal}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all shrink-0 touch-target"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Új Feladat</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* MOBIL OSZLOP-VÁLASZTÓ SÁV (STATUS PILLS: < 768px) */}
      <div className="md:hidden flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 select-none">
        {columns.map((col) => {
          const count = filteredTasks.filter((t) => t.status === col.id).length;
          const isActive = activeMobileColumn === col.id;
          return (
            <button
              key={col.id}
              onClick={() => scrollToColumn(col.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all touch-target shrink-0 ${
                isActive
                  ? 'bg-rose-950 text-rose-200 border border-rose-700 shadow-md shadow-rose-950/60 font-bold'
                  : 'bg-slate-900/80 text-slate-400 border border-[#1E2230] hover:text-slate-200'
              }`}
            >
              <span>{col.shortLabel}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* KANBAN COLUMNS CONTAINER: CSS SCROLL SNAP MOBILON, GRID DESKTOPON */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-8 -mx-3 px-3 md:grid md:grid-cols-5 md:overflow-visible md:p-0 md:m-0">
        {columns.map((column) => {
          const colTasks = filteredTasks.filter((t) => t.status === column.id);
          return (
            <div
              key={column.id}
              id={`kanban-col-${column.id}`}
              className="w-[85vw] max-w-[320px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink flex flex-col rounded-2xl bg-[#0F111A] border border-[#1E2230] min-h-[520px] p-3 shadow-inner"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#1E2230]">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 truncate">
                    {column.label}
                  </h4>
                  <span className={`text-xs font-mono font-bold ${column.countColor}`}>
                    ({colTasks.length})
                  </span>
                </div>
              </div>

              {/* Tasks List in Column */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-28 border border-dashed border-[#1E2230] rounded-xl flex items-center justify-center text-xs text-slate-500">
                    Nincs feladat
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const completedChecklist = task.checklist.filter((c) => c.done).length;
                    const assignee = profiles.find((p) => p.id === task.assigned_to);
                    const linkedMilestone = milestones.find((m) => m.id === task.milestone_id);
                    const commentsCount = taskComments.filter((c) => c.task_id === task.id).length;

                    return (
                      <div
                        key={task.id}
                        onClick={() => setActiveTaskModal(task)}
                        className="p-3 rounded-xl bg-[#141622] border border-[#1E2230] hover:border-rose-500/50 hover:shadow-md transition-all cursor-pointer group"
                      >
                        {/* Header: Priority & Workstream */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          {getPriorityBadge(task.priority)}
                          {getWorkstreamTag(task.workstream)}
                        </div>

                        {/* Title */}
                        <h5 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                          {task.title}
                        </h5>

                        {/* Milestone Tag */}
                        {linkedMilestone && (
                          <div className="text-[10px] font-mono text-purple-300 bg-purple-950/40 px-1.5 py-0.5 rounded mt-1.5 border border-purple-900/30 truncate">
                            {linkedMilestone.phase_number}. Fázis: {linkedMilestone.title}
                          </div>
                        )}

                        {/* Checklist & Comments */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-[#1E2230]">
                          <div className="flex items-center space-x-2 font-mono text-[10px]">
                            {task.checklist.length > 0 && (
                              <span className="flex items-center space-x-1">
                                <CheckSquare className="w-3 h-3 text-slate-500" />
                                <span>
                                  {completedChecklist}/{task.checklist.length}
                                </span>
                              </span>
                            )}
                            {commentsCount > 0 && (
                              <span className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3 text-slate-500" />
                                <span>{commentsCount}</span>
                              </span>
                            )}
                          </div>

                          {assignee && (
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                              style={{ backgroundColor: assignee.badge_color }}
                              title={assignee.full_name}
                            >
                              {assignee.short_code}
                            </span>
                          )}
                        </div>

                        {/* Érintésbarát „Áthelyezés ➔” Gyorsmenü és Léptető */}
                        <div
                          className="mt-2 pt-2 border-t border-[#1E2230]/60 flex items-center justify-between gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Quick Dropdown: Move to any column */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-slate-500">Áthelyezés:</span>
                            <select
                              value={task.status}
                              onChange={(e) => {
                                const newSt = e.target.value as TaskStatus;
                                moveTask(task.id, newSt);
                                toast.success('Feladat áthelyezve!');
                              }}
                              className="bg-slate-900 text-[10px] font-mono text-slate-300 border border-[#1E2230] rounded-lg px-1.5 py-1 focus:outline-none focus:border-rose-500"
                            >
                              <option value="backlog">Ötlet</option>
                              <option value="todo">To-Do</option>
                              <option value="in_progress">Folyamat</option>
                              <option value="review_professor">Review</option>
                              <option value="done">Kész</option>
                            </select>
                          </div>

                          {/* Quick step forward/backward */}
                          <div className="flex items-center gap-1">
                            {column.id !== 'backlog' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const prevMap: Record<TaskStatus, TaskStatus> = {
                                    todo: 'backlog',
                                    in_progress: 'todo',
                                    review_professor: 'in_progress',
                                    done: 'review_professor',
                                    backlog: 'backlog',
                                  };
                                  moveTask(task.id, prevMap[column.id]);
                                }}
                                className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                                title="Visszaléptetés"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {column.id !== 'done' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const nextMap: Record<TaskStatus, TaskStatus> = {
                                    backlog: 'todo',
                                    todo: 'in_progress',
                                    in_progress: 'review_professor',
                                    review_professor: 'done',
                                    done: 'done',
                                  };
                                  moveTask(task.id, nextMap[column.id]);
                                }}
                                className="p-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white"
                                title="Előreléptetés"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details Modal */}
      {currentModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#1E2230]">
              <div className="space-y-1 pr-4">
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(currentModalTask.priority)}
                  {getWorkstreamTag(currentModalTask.workstream)}
                  <span className="text-xs font-mono text-slate-400">
                    Státusz: <strong className="text-slate-200">{currentModalTask.status}</strong>
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                  {currentModalTask.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveTaskModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 touch-target flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h5 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Leírás
              </h5>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-[#1E2230]">
                {currentModalTask.description}
              </p>
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                  Checklist ({currentModalTask.checklist.filter((c) => c.done).length}/
                  {currentModalTask.checklist.length})
                </h5>
              </div>
              <div className="space-y-1.5">
                {currentModalTask.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(currentModalTask.id, item.id)}
                    className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/40 border border-[#1E2230] hover:border-slate-700 cursor-pointer touch-target"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => {}}
                      className="rounded border-slate-700 text-rose-600 focus:ring-0 bg-slate-900 w-4 h-4"
                    />
                    <span
                      className={`text-xs ${
                        item.done ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Thread */}
            <div className="pt-3 border-t border-[#1E2230]">
              <h5 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2 flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                Szakmai és Professzori Megjegyzések ({currentTaskComments.length})
              </h5>

              <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                {currentTaskComments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Még nincs hozzászólás.</p>
                ) : (
                  currentTaskComments.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                        comm.is_professor_note
                          ? 'bg-purple-950/30 border-purple-800/40'
                          : 'bg-slate-900/60 border-[#1E2230]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span
                          className={`font-semibold ${
                            comm.is_professor_note ? 'text-purple-300' : 'text-slate-200'
                          }`}
                        >
                          {comm.author_name} {comm.is_professor_note && '(Témavezetői Instrukció)'}
                        </span>
                        <span className="font-mono" suppressHydrationWarning>
                          {formatDateHungarian(comm.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-300">{comm.content}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Megjegyzés hozzáfűzése a feladathoz..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCommentText.trim()) {
                      addComment(currentModalTask.id, undefined, newCommentText.trim());
                      setNewCommentText('');
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={() => {
                    if (newCommentText.trim()) {
                      addComment(currentModalTask.id, undefined, newCommentText.trim());
                      setNewCommentText('');
                    }
                  }}
                  disabled={!newCommentText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-medium flex items-center space-x-1 touch-target"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Küldés</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#1E2230] flex items-center justify-between">
              <button
                onClick={() => {
                  deleteTask(currentModalTask.id);
                  setActiveTaskModal(null);
                }}
                className="px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 text-xs font-medium flex items-center space-x-1 touch-target"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Feladat törlése</span>
              </button>

              <button
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 touch-target"
              >
                Bezárás
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
