'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Milestone, MilestoneStatus } from '@/types';
import { X, BookOpenCheck, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddEditMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneToEdit?: Milestone | null;
}

export function AddEditMilestoneModal({
  isOpen,
  onClose,
  milestoneToEdit,
}: AddEditMilestoneModalProps) {
  const { addMilestone, updateMilestone, currentProfile } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phaseNumber, setPhaseNumber] = useState<number>(1);
  const [dueDate, setDueDate] = useState('2026-11-15');
  const [targetWords, setTargetWords] = useState<number>(8000);
  const [currentWords, setCurrentWords] = useState<number>(0);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [status, setStatus] = useState<MilestoneStatus>('upcoming');

  useEffect(() => {
    if (milestoneToEdit) {
      setTitle(milestoneToEdit.title);
      setDescription(milestoneToEdit.description);
      setPhaseNumber(milestoneToEdit.phase_number);
      setDueDate(milestoneToEdit.due_date);
      setTargetWords(milestoneToEdit.target_words || 8000);
      setCurrentWords(milestoneToEdit.current_words || 0);
      setDeliverableUrl(milestoneToEdit.deliverable_url || '');
      setStatus(milestoneToEdit.status);
    } else {
      setTitle('');
      setDescription('');
      setPhaseNumber(7);
      setDueDate('2026-12-01');
      setTargetWords(8000);
      setCurrentWords(0);
      setDeliverableUrl('');
      setStatus('upcoming');
    }
  }, [milestoneToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Hiányzó cím!', { description: 'Kérlek adj meg egy mérföldkő címet.' });
      return;
    }

    const calculatedProgress =
      targetWords > 0 ? Math.min(100, Math.round((currentWords / targetWords) * 100)) : 0;

    if (milestoneToEdit) {
      updateMilestone(milestoneToEdit.id, {
        title,
        description,
        phase_number: Number(phaseNumber),
        due_date: dueDate,
        target_words: Number(targetWords),
        current_words: Number(currentWords),
        progress_percent: calculatedProgress,
        deliverable_url: deliverableUrl.trim() || null,
        status,
      });
    } else {
      addMilestone({
        title,
        description,
        phase_number: Number(phaseNumber),
        due_date: dueDate,
        status,
        progress_percent: calculatedProgress,
        target_words: Number(targetWords),
        current_words: Number(currentWords),
        deliverable_url: deliverableUrl.trim() || null,
        created_by: currentProfile.id,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-[#12141D] border border-[#1E2230] p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2230]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-300">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {milestoneToEdit ? 'Mérföldkő Szerkesztése' : 'Új Mérföldkő / Fejezet Létrehozása'}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Szakdolgozat ütemterv és kutatási fázis rögzítése
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-mono uppercase text-slate-300 mb-1">
                Fejezet / Mérföldkő Címe:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="pl. 6. Eredmények & Validáció"
                className="w-full rounded-xl bg-slate-900 border border-[#1E2230] px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block font-mono uppercase text-slate-300 mb-1">
                Fázis Sorszám:
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={phaseNumber}
                onChange={(e) => setPhaseNumber(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 border border-[#1E2230] px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase text-slate-300 mb-1">
              Részletes Leírás & Célkitűzések:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A fázishoz tartozó tudományos célok, elvárt eredmények és mérések..."
              className="w-full rounded-xl bg-slate-900 border border-[#1E2230] p-3 text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono uppercase text-slate-300 mb-1">
                Határidő:
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-[#1E2230] px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-mono uppercase text-slate-300 mb-1">
                Cél Szószám:
              </label>
              <input
                type="number"
                step={500}
                value={targetWords}
                onChange={(e) => setTargetWords(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 border border-[#1E2230] px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-mono uppercase text-slate-300 mb-1">
                Jelenlegi Szószám:
              </label>
              <input
                type="number"
                step={100}
                value={currentWords}
                onChange={(e) => setCurrentWords(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 border border-[#1E2230] px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono uppercase text-slate-300 mb-1">
                Státusz:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
                className="w-full rounded-xl bg-slate-900 border border-[#1E2230] px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="upcoming">Tervezett (Upcoming)</option>
                <option value="in_progress">Folyamatban (In Progress)</option>
                <option value="awaiting_approval">Jóváhagyásra vár (Awaiting Approval)</option>
                <option value="approved">Jóváhagyva (Approved)</option>
                <option value="revision_requested">Javítás kérése (Revision Requested)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono uppercase text-slate-300 mb-1">
                Csatolt Dokumentum / URL:
              </label>
              <input
                type="text"
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                placeholder="/files/fejezet_v2.docx vagy link"
                className="w-full rounded-xl bg-slate-900 border border-[#1E2230] px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#1E2230]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 transition-colors flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{milestoneToEdit ? 'Módosítások Mentése' : 'Mérföldkő Létrehozása'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
