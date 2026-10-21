'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { KanbanTask, LiteratureItem, WorkstreamType, TaskPriority } from '@/types';
import {
  Sparkles,
  X,
  CheckCircle2,
  Copy,
  Printer,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
  Check,
  Cpu,
  Microscope,
  Binary,
  Bot,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export type AiCopilotMode = 'extract_tasks' | 'summarize_paper' | 'weekly_briefing';

interface ExtractedTaskItem {
  id?: string;
  title: string;
  description: string;
  suggested_assignee: string;
  workstream: WorkstreamType;
  priority: TaskPriority;
  checklist?: string[];
  selected?: boolean;
}

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AiCopilotMode;
  initialData?: {
    meetingTitle?: string;
    meetingNotes?: string;
    paper?: LiteratureItem;
  };
}

export function AiCopilotModal({
  isOpen,
  onClose,
  mode,
  initialData,
}: AiCopilotModalProps) {
  const {
    profiles,
    addTask,
    updateLiteratureItem,
    tasks,
    milestones,
    repositoryFiles,
    activityLogs,
    currentProfile,
  } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mode: extract_tasks
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTaskItem[]>([]);
  const [meetingSummary, setMeetingSummary] = useState('');

  // Mode: summarize_paper
  const [paperSummary, setPaperSummary] = useState('');

  // Mode: weekly_briefing
  const [weeklyBriefing, setWeeklyBriefing] = useState('');

  // Trigger Generation
  const handleRunAi = async () => {
    setIsLoading(true);

    try {
      let payload: any = {};

      if (mode === 'extract_tasks') {
        payload = {
          meetingTitle: initialData?.meetingTitle || 'Labor Megbeszélés',
          meetingNotes: initialData?.meetingNotes || '',
          teamMembers: profiles.map((p) => ({ name: p.full_name, role: p.role, code: p.short_code })),
        };
      } else if (mode === 'summarize_paper') {
        payload = {
          title: initialData?.paper?.title || '',
          abstract: initialData?.paper?.abstract || '',
          journal: initialData?.paper?.journal || '',
          year: initialData?.paper?.publication_year || '',
        };
      } else if (mode === 'weekly_briefing') {
        const completedTasks = tasks.filter((t) => t.status === 'done');
        payload = {
          completedTasks,
          newFiles: repositoryFiles.slice(0, 8),
          recentActivities: activityLogs.slice(0, 12),
          milestones: milestones.slice(0, 6),
        };
      }

      const res = await fetch('/api/ai-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, payload }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Hiba az AI kérés során');
      }

      if (mode === 'extract_tasks') {
        const list = (data.data?.tasks || []).map((t: any, i: number) => ({
          ...t,
          id: `ext-${Date.now()}-${i}`,
          selected: true,
        }));
        setExtractedTasks(list);
        setMeetingSummary(data.data?.meeting_summary || '');
        toast.success(`AI: ${list.length} feladat kinyerve a jegyzőkönyvből! ✨`);
      } else if (mode === 'summarize_paper') {
        setPaperSummary(data.data?.summary || '');
        toast.success('AI: Szakirodalom szintézis elkészült! ✨');
      } else if (mode === 'weekly_briefing') {
        setWeeklyBriefing(data.data?.briefing || '');
        toast.success('AI: Témavezetői heti briefing legenerálva! ✨');
      }

      setHasGenerated(true);
    } catch (err: any) {
      toast.error('AI Co-Pilot hiba: ' + (err.message || 'Ismeretlen hiba'));
    } finally {
      setIsLoading(false);
    }
  };

  // Insert extracted tasks into Kanban board
  const handleInsertTasks = async () => {
    const selected = extractedTasks.filter((t) => t.selected);
    if (selected.length === 0) {
      toast.error('Nincs kijelölt feladat a beszúráshoz!');
      return;
    }

    try {
      for (const item of selected) {
        // Resolve assignee id from suggested name
        let assignedId = currentProfile.id;
        const lowerName = item.suggested_assignee.toLowerCase();
        const foundProfile = profiles.find((p) =>
          p.full_name.toLowerCase().includes(lowerName) ||
          (lowerName === 'robin' && p.short_code === 'R') ||
          (lowerName === 'emma' && p.short_code === 'E') ||
          (lowerName === 'domi' && p.short_code === 'D')
        );
        if (foundProfile) assignedId = foundProfile.id;

        const checklistItems = (item.checklist || []).map((cText, idx) => ({
          id: `chk-${Date.now()}-${idx}`,
          text: cText,
          done: false,
        }));

        await addTask({
          title: item.title,
          description: item.description,
          status: 'todo',
          priority: item.priority || 'medium',
          workstream: item.workstream || 'general',
          position: 1000 + Math.random() * 500,
          assigned_to: assignedId,
          checklist: checklistItems,
          tags: ['AI-Generált', initialData?.meetingTitle ? 'Konzultáció' : 'Megbeszélés'],
        });
      }

      toast.success(`${selected.length} db feladat sikeresen beszúrva a Kanban táblára! 🚀`);
      onClose();
    } catch (err: any) {
      toast.error('Hiba a feladatok mentésekor: ' + err.message);
    }
  };

  // Save paper summary to literature record
  const handleSavePaperSummary = async () => {
    if (!initialData?.paper?.id) return;
    try {
      await updateLiteratureItem(initialData.paper.id, {
        key_findings: paperSummary,
      });
      toast.success('Kulcsmegállapítások sikeresen elmentve a cikkhez! 📚');
      onClose();
    } catch (err: any) {
      toast.error('Hiba a mentéskor: ' + err.message);
    }
  };

  // Copy text to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Vágólapra másolva!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0C101A] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-900/50 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {mode === 'extract_tasks' && 'AI Feladat Kinyerés & Kiosztás'}
                  {mode === 'summarize_paper' && 'AI Szakirodalom Szintézis'}
                  {mode === 'weekly_briefing' && 'Témavezetői Heti Executive Briefing'}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {mode === 'extract_tasks' && 'Megbeszélés jegyzőkönyv strukturált Kanban feladatokká alakítása'}
                {mode === 'summarize_paper' && '3 pontos tudományos kivonat generálása a szakdolgozathoz'}
                {mode === 'weekly_briefing' && 'Elmúlt 7 nap elért eredményeinek és döntési pontjainak összefoglalása'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {/* Initial State / Generation CTA */}
          {!hasGenerated && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-700/50 mx-auto flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/50">
                <Bot className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-bold text-white text-base">
                  Készen állsz a tudományos elemzésre?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {mode === 'extract_tasks' &&
                    `A Gemini elemzi a(z) "${initialData?.meetingTitle || 'Konzultáció'}" jegyzőkönyvét, kinyeri a teendőket és felajánlja a felelősöket.`}
                  {mode === 'summarize_paper' &&
                    `A Gemini megvizsgálja a(z) "${initialData?.paper?.title}" absztraktját, és magyarul kivonatolja a 3 legfőbb megállapítást.`}
                  {mode === 'weekly_briefing' &&
                    'A Gemini összefűzi a heti Kanban kártyákat, kutatási naplókat és mérföldköveket egy professzor-kész heti jelentéssé.'}
                </p>
              </div>

              <button
                onClick={handleRunAi}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-950/60 transition-all flex items-center space-x-2 mx-auto disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Gemini elemzés folyamatban...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {mode === 'extract_tasks' && 'Feladatok kinyerése jegyzőkönyvből'}
                      {mode === 'summarize_paper' && 'Cikk elemzése és szintézis generálása'}
                      {mode === 'weekly_briefing' && 'Heti jelentés generálása (1 kattintás)'}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 1. EXTRACT TASKS RESULTS */}
          {hasGenerated && mode === 'extract_tasks' && (
            <div className="space-y-4">
              {meetingSummary && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <span className="font-mono uppercase font-bold text-slate-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>AI Megbeszélés Összefoglaló</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">{meetingSummary}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold uppercase font-mono text-slate-400">
                  Kinyert Feladatok ({extractedTasks.length} db)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setExtractedTasks((prev) =>
                      prev.map((t) => ({ ...t, selected: !prev.every((p) => p.selected) }))
                    )
                  }
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  {extractedTasks.every((t) => t.selected)
                    ? 'Kijelölések törlése'
                    : 'Mind kijelölése'}
                </button>
              </div>

              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {extractedTasks.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      t.selected
                        ? 'bg-slate-900/90 border-slate-700 shadow-md'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={t.selected}
                        onChange={(e) =>
                          setExtractedTasks((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, selected: e.target.checked } : item
                            )
                          )
                        }
                        className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                      />

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={t.title}
                            onChange={(e) =>
                              setExtractedTasks((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, title: e.target.value } : item
                                )
                              )
                            }
                            className="bg-transparent font-semibold text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 rounded px-1 -ml-1 w-full"
                          />

                          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 ml-2 shrink-0">
                            {t.priority}
                          </span>
                        </div>

                        <textarea
                          rows={2}
                          value={t.description}
                          onChange={(e) =>
                            setExtractedTasks((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, description: e.target.value } : item
                              )
                            )
                          }
                          className="w-full bg-[#141A29]/60 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                        />

                        {/* Metadata Tags & Assignee */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-800/80 text-[11px] text-slate-300 font-mono">
                            <span className="text-slate-500">Felelős:</span>
                            <select
                              value={t.suggested_assignee}
                              onChange={(e) =>
                                setExtractedTasks((prev) =>
                                  prev.map((item, i) =>
                                    i === idx
                                      ? { ...item, suggested_assignee: e.target.value }
                                      : item
                                  )
                                )
                              }
                              className="bg-transparent text-rose-300 font-bold focus:outline-none cursor-pointer"
                            >
                              <option value="Robin" className="bg-slate-900 text-white">
                                Robin (Hardver/CAD)
                              </option>
                              <option value="Emma" className="bg-slate-900 text-white">
                                Emma (Wet Lab)
                              </option>
                              <option value="Domi" className="bg-slate-900 text-white">
                                Domi (Szimuláció/MI)
                              </option>
                            </select>
                          </div>

                          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-800/80 text-[11px] text-slate-300 font-mono">
                            <span className="text-slate-500">Terület:</span>
                            <span className="text-slate-200 capitalize">
                              {t.workstream.replace('_', ' ')}
                            </span>
                          </div>

                          {t.checklist && t.checklist.length > 0 && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">
                              ✓ {t.checklist.length} checklist tétel
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. SUMMARIZE PAPER RESULTS */}
          {hasGenerated && mode === 'summarize_paper' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-rose-400" />
                    <span>3 Pontos Szakirodalmi Szintézis</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopy(paperSummary)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Másolás</span>
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={paperSummary}
                  onChange={(e) => setPaperSummary(e.target.value)}
                  className="w-full bg-[#141A29] border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-sans leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* 3. WEEKLY BRIEFING RESULTS */}
          {hasGenerated && mode === 'weekly_briefing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Kovács Professzor Úr Heti Briefingje</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(weeklyBriefing)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1.5 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Másolás (Markdown)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1.5 border border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Nyomtatás / PDF</span>
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 font-sans text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-[55vh] overflow-y-auto shadow-inner">
                {weeklyBriefing}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Bezárás
          </button>

          {hasGenerated && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRunAi}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Újragenerálás</span>
              </button>

              {mode === 'extract_tasks' && (
                <button
                  type="button"
                  onClick={handleInsertTasks}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>
                    Beszúrás a Kanban táblára ({extractedTasks.filter((t) => t.selected).length} db)
                  </span>
                </button>
              )}

              {mode === 'summarize_paper' && (
                <button
                  type="button"
                  onClick={handleSavePaperSummary}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mentés a Cikkhez</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
