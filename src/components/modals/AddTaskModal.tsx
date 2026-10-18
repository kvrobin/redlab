'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { TaskPriority, WorkstreamId } from '@/types';
import { X, Plus, Trash2, KanbanSquare } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const { addTask, users } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workstream, setWorkstream] = useState<WorkstreamId>('robin');
  const [assigneeId, setAssigneeId] = useState('user-robin');
  const [priority, setPriority] = useState<TaskPriority>('magas');
  const [deadline, setDeadline] = useState('2026-10-30');
  const [tagInput, setTagInput] = useState('Mikrofluidika, Szimuláció');
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
      completed: false,
    }));

    addTask({
      title: title.trim(),
      description: description.trim(),
      workstream,
      assigneeId,
      status: 'todo',
      priority,
      deadline,
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
              Részletes Leírás & Hipotézis
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Részletezd a laboratóriumi lépéseket, számítási paramétereket..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Workstream (Kutató)
              </label>
              <select
                value={workstream}
                onChange={(e) => {
                  const ws = e.target.value as WorkstreamId;
                  setWorkstream(ws);
                  if (ws === 'robin') setAssigneeId('user-robin');
                  if (ws === 'emma') setAssigneeId('user-emma');
                  if (ws === 'domi') setAssigneeId('user-domi');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="robin">Robin (Architektúra & Rendszerintegráció)</option>
                <option value="emma">Emma (Labor & Biomikrofluidika)</option>
                <option value="domi">Domi (Szimuláció & Gépi Tanulás)</option>
                <option value="general">Általános RED Lab feladat</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Felelős Személy
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'supervisor' ? 'Témavezető' : 'Kutató'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Prioritás
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="kritikus">Kritikus (Azonnali blokkoló)</option>
                <option value="magas">Magas prioritás</option>
                <option value="kozepes">Közepes prioritás</option>
                <option value="alacsony">Alacsony prioritás</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Leadási Határidő
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
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
