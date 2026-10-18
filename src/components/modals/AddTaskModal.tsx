'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { TaskPriority, WorkstreamType } from '@/types';
import { X, Plus, Trash2, KanbanSquare } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const { addTask, profiles, milestones } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workstream, setWorkstream] = useState<WorkstreamType>('wet_lab');
  const [assignedTo, setAssignedTo] = useState('user-emma');
  const [milestoneId, setMilestoneId] = useState('ms-3');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [tagInput, setTagInput] = useState('Mikrofluidika, Validáció');
  const [checklistItems, setChecklistItems] = useState<string[]>([
    'Kísérleti setup előkészítése',
    'Adatgyűjtés és validáció',
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (newChecklistText.trim()) {
      setChecklistItems([...checklistItems, newChecklistText.trim()]);
      setNewChecklistText('');
    }
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const checklist = checklistItems.map((text, i) => ({
      id: `cl-new-${Date.now()}-${i}`,
      text,
      done: false,
    }));

    addTask({
      title: title.trim(),
      description: description.trim(),
      workstream,
      assigned_to: assignedTo,
      co_assignees: [],
      milestone_id: milestoneId || undefined,
      status: 'todo',
      priority,
      position: 5000.0,
      due_date: dueDate ? `${dueDate}T18:00:00Z` : undefined,
      tags,
      checklist,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
          <h3 className="text-base font-bold text-white flex items-center">
            <KanbanSquare className="w-5 h-5 text-rose-500 mr-2" />
            Új Kutatási Feladat Létrehozása
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Feladat Megnevezése *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pl. PDMS mikrocsatorna áteresztőképességének mérése..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Részletes Leírás & Célkitűzés
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Részletezd a kísérleti vagy számítási teendőket..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Kutatási Terület (Workstream)
              </label>
              <select
                value={workstream}
                onChange={(e) => {
                  const ws = e.target.value as WorkstreamType;
                  setWorkstream(ws);
                  if (ws === 'wet_lab') setAssignedTo('user-emma');
                  if (ws === 'dry_lab_code') setAssignedTo('user-domi');
                  if (ws === 'thesis_writing') setAssignedTo('user-robin');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="wet_lab">Wet Lab (Laboratórium & Mikrofluidika)</option>
                <option value="dry_lab_code">Dry Lab (Szimuláció & ML)</option>
                <option value="cad_hardware">CAD & Hardware Fabrikáció</option>
                <option value="thesis_writing">Szakdolgozatírás</option>
                <option value="general">Általános feladat</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Felelős Csapattag
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.role === 'supervisor' ? 'Témavezető' : 'Kutató'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Kapcsolódó Mérföldkő (Milestone)
              </label>
              <select
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="">Nincs mérföldkőhöz rendelve</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.phase_number}. Fázis: {m.title.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Prioritás
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="critical">Kritikus (Azonnali blokkoló)</option>
                <option value="high">Magas prioritás</option>
                <option value="medium">Közepes prioritás</option>
                <option value="low">Alacsony prioritás</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Határidő
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Címkék (vesszővel elválasztva)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="pl. Mikrofluidika, OpenFOAM, PDMS"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Checklist creation */}
          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Részfeladatok (Checklist)
            </label>
            <div className="space-y-1.5 mb-2">
              {checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-[#1E2230]"
                >
                  <span className="text-slate-300">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(idx)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Új ellenőrző pont hozzáadása..."
                className="flex-1 p-2 rounded-lg bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Hozzáadás</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1E2230]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-md shadow-rose-950/40"
            >
              Feladat Rögzítése
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
