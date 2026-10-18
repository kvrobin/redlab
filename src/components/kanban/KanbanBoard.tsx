'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Task, TaskPriority, TaskStatus, WorkstreamId } from '@/types';
import {
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  CheckSquare,
  Tag,
  ArrowRight,
  ArrowLeft,
  X,
  Trash2,
  Send,
  User as UserIcon,
} from 'lucide-react';
import { formatDateHungarian } from '@/lib/utils';

interface KanbanBoardProps {
  openAddTaskModal: () => void;
}

export function KanbanBoard({ openAddTaskModal }: KanbanBoardProps) {
  const {
    tasks,
    moveTask,
    toggleChecklistItem,
    addTaskComment,
    deleteTask,
    users,
    currentUser,
  } = useStore();

  const [selectedWorkstream, setSelectedWorkstream] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTaskModal, setActiveTaskModal] = useState<Task | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

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

  const columns: { id: TaskStatus; label: string; countColor: string }[] = [
    { id: 'todo', label: 'Teendők (Backlog)', countColor: 'text-slate-400' },
    { id: 'in_progress', label: 'Folyamatban', countColor: 'text-amber-400' },
    { id: 'review', label: 'Kísérlet / Szimuláció alatt', countColor: 'text-purple-400' },
    { id: 'done', label: 'Befejezve (Signed-off)', countColor: 'text-emerald-400' },
  ];

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'kritikus':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">KRITIKUS</span>;
      case 'magas':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60">MAGAS</span>;
      case 'kozepes':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-950/80 text-blue-300 border border-blue-800/60">KÖZEPES</span>;
      case 'alacsony':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">ALACSONY</span>;
    }
  };

  const getWorkstreamTag = (ws: WorkstreamId) => {
    switch (ws) {
      case 'robin':
        return <span className="text-[10px] font-mono text-red-400 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-900/40">Robin (Architektúra)</span>;
      case 'emma':
        return <span className="text-[10px] font-mono text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-900/40">Emma (Labor)</span>;
      case 'domi':
        return <span className="text-[10px] font-mono text-orange-400 bg-orange-950/50 px-1.5 py-0.5 rounded border border-orange-900/40">Domi (Szimuláció)</span>;
      default:
        return <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Általános</span>;
    }
  };

  const currentModalTask = activeTaskModal ? tasks.find((t) => t.id === activeTaskModal.id) || activeTaskModal : null;

  return (
    <div className="space-y-5">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#12141D] border border-[#1E2230]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Workstream Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Kutató:</span>
          </div>
          <select
            value={selectedWorkstream}
            onChange={(e) => setSelectedWorkstream(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="all">Minden kutató</option>
            <option value="robin">Robin (Architektúra)</option>
            <option value="emma">Emma (Biomikrofluidika)</option>
            <option value="domi">Domi (Szimuláció & ML)</option>
          </select>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 ml-2">
            <span>Prioritás:</span>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="all">Minden prioritás</option>
            <option value="kritikus">Kritikus</option>
            <option value="magas">Magas</option>
            <option value="kozepes">Közepes</option>
            <option value="alacsony">Alacsony</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Keresés feladatok között..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
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

          {/* Add Task Button */}
          <button
            onClick={openAddTaskModal}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Új Feladat</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const colTasks = filteredTasks.filter((t) => t.status === column.id);
          return (
            <div
              key={column.id}
              className="flex flex-col rounded-xl bg-[#0F111A] border border-[#1E2230] min-h-[580px] p-3 shadow-inner"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2230]">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {column.label}
                  </h4>
                  <span className={`text-xs font-mono font-bold ${column.countColor}`}>
                    ({colTasks.length})
                  </span>
                </div>
              </div>

              {/* Tasks List in Column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-32 border border-dashed border-[#1E2230] rounded-xl flex items-center justify-center text-xs text-slate-400">
                    Nincs feladat ebben a fázisban
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const completedChecklist = task.checklist.filter((c) => c.completed).length;
                    const assignee = users.find((u) => u.id === task.assigneeId);
                    return (
                      <div
                        key={task.id}
                        onClick={() => setActiveTaskModal(task)}
                        className="p-3.5 rounded-xl bg-[#141622] border border-[#1E2230] hover:border-rose-500/50 hover:shadow-md transition-all cursor-pointer group"
                      >
                        {/* Header: Priority & Workstream */}
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          {getPriorityBadge(task.priority)}
                          {getWorkstreamTag(task.workstream)}
                        </div>

                        {/* Title */}
                        <h5 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                          {task.title}
                        </h5>

                        {/* Description Preview */}
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {task.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer Info: Checklist, Comments, Assignee */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-[#1E2230]">
                          <div className="flex items-center space-x-2.5">
                            {task.checklist.length > 0 && (
                              <span className="flex items-center space-x-1 font-mono text-[10px]">
                                <CheckSquare className="w-3 h-3 text-slate-500" />
                                <span>
                                  {completedChecklist}/{task.checklist.length}
                                </span>
                              </span>
                            )}
                            {task.comments.length > 0 && (
                              <span className="flex items-center space-x-1 font-mono text-[10px]">
                                <MessageSquare className="w-3 h-3 text-slate-500" />
                                <span>{task.comments.length}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {assignee && (
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                                style={{ backgroundColor: assignee.avatarColor }}
                                title={assignee.name}
                              >
                                {assignee.initials}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Move Buttons */}
                        <div
                          className="mt-2.5 pt-2 border-t border-[#1E2230]/60 flex items-center justify-between"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center space-x-1">
                            {column.id !== 'todo' && (
                              <button
                                onClick={() => {
                                  const prevMap: Record<TaskStatus, TaskStatus> = {
                                    in_progress: 'todo',
                                    review: 'in_progress',
                                    done: 'review',
                                    todo: 'todo',
                                  };
                                  moveTask(task.id, prevMap[column.id]);
                                }}
                                className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                title="Visszaléptetés"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center space-x-1">
                            {column.id !== 'done' && (
                              <button
                                onClick={() => {
                                  const nextMap: Record<TaskStatus, TaskStatus> = {
                                    todo: 'in_progress',
                                    in_progress: 'review',
                                    review: 'done',
                                    done: 'done',
                                  };
                                  moveTask(task.id, nextMap[column.id]);
                                }}
                                className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#1E2230]">
              <div className="space-y-1 pr-4">
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(currentModalTask.priority)}
                  {getWorkstreamTag(currentModalTask.workstream)}
                  <span className="text-xs font-mono text-slate-400">
                    Határidő: {currentModalTask.deadline}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {currentModalTask.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveTaskModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="mt-4">
              <h5 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Részletes Leírás
              </h5>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-[#1E2230]">
                {currentModalTask.description}
              </p>
            </div>

            {/* Checklist */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                  Ellenőrzőlista (Checklist)
                </h5>
                <span className="text-xs font-mono text-slate-400">
                  {currentModalTask.checklist.filter((c) => c.completed).length} / {currentModalTask.checklist.length} kész
                </span>
              </div>
              <div className="space-y-2">
                {currentModalTask.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(currentModalTask.id, item.id)}
                    className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/40 border border-[#1E2230] hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}} // handled by parent onClick
                      className="rounded border-slate-700 text-rose-600 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                    />
                    <span
                      className={`text-xs ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-200'
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Thread */}
            <div className="mt-6 pt-4 border-t border-[#1E2230]">
              <h5 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3 flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                Szakmai Megjegyzések & Észrevételek ({currentModalTask.comments.length})
              </h5>

              <div className="space-y-2.5 max-h-48 overflow-y-auto mb-4">
                {currentModalTask.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Még nincs hozzászólás ehhez a feladathoz.</p>
                ) : (
                  currentModalTask.comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-[#1E2230] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="font-semibold text-slate-200">
                          {comm.userName} ({comm.userRole === 'supervisor' ? 'Témavezető' : 'Kutató'})
                        </span>
                        <span className="font-mono text-[10px]">{formatDateHungarian(comm.createdAt)}</span>
                      </div>
                      <p className="text-slate-300">{comm.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Hozzászólás küldése kutatócsoporti megosztásra..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCommentText.trim()) {
                      addTaskComment(currentModalTask.id, newCommentText.trim());
                      setNewCommentText('');
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={() => {
                    if (newCommentText.trim()) {
                      addTaskComment(currentModalTask.id, newCommentText.trim());
                      setNewCommentText('');
                    }
                  }}
                  disabled={!newCommentText.trim()}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-medium flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Küldés</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-[#1E2230] flex items-center justify-between">
              <button
                onClick={() => {
                  deleteTask(currentModalTask.id);
                  setActiveTaskModal(null);
                }}
                className="px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Feladat törlése</span>
              </button>

              <button
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
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
