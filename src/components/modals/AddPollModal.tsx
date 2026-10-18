'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ConsultationSlot } from '@/types';
import { X, CalendarCheck2, Plus, Trash2 } from 'lucide-react';

interface AddPollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPollModal({ isOpen, onClose }: AddPollModalProps) {
  const { createConsultationPoll, currentUser } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2026-10-25T18:00:00');
  const [agendaInput, setAgendaInput] = useState(
    'Mérési eredmények összevetése a numerikus szimulációval\nKézirat fejezetek átbeszélése\nTémavezetői észrevételek'
  );
  const [slotDates, setSlotDates] = useState<string[]>([
    '2026-10-27T10:00',
    '2026-10-27T14:30',
    '2026-10-28T11:00',
  ]);
  const [newSlotDateTime, setNewSlotDateTime] = useState('');

  if (!isOpen) return null;

  const handleAddSlot = () => {
    if (newSlotDateTime) {
      setSlotDates([...slotDates, newSlotDateTime]);
      setNewSlotDateTime('');
    }
  };

  const handleRemoveSlot = (idx: number) => {
    setSlotDates(slotDates.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || slotDates.length === 0) return;

    const agenda = agendaInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const slots: ConsultationSlot[] = slotDates.map((dt, idx) => ({
      id: `slot-new-${Date.now()}-${idx}`,
      dateTime: dt,
      durationMinutes: 60,
      votes: {
        [currentUser.id]: 'available',
      },
    }));

    createConsultationPoll({
      title: title.trim(),
      description: description.trim(),
      deadline,
      agenda,
      slots,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
          <h3 className="text-base font-bold text-white flex items-center">
            <CalendarCheck2 className="w-5 h-5 text-emerald-400 mr-2" />
            Új Témavezetői Időpont-egyeztetés Kiírása
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Értekezlet Tárgya (Cím) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pl. 5. Fejezet Eredmény-felülvizsgálat és Házi Védés"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Rövid Tájékoztatás
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A konzultáció célja, kitérve az átbeszélendő kérdésekre..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Szavazási Határidő
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 font-mono focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Napirendi Pontok (soronként egy)
            </label>
            <textarea
              rows={3}
              value={agendaInput}
              onChange={(e) => setAgendaInput(e.target.value)}
              placeholder="1. Napirendi pont&#10;2. Napirendi pont"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Javasolt Időpontok ({slotDates.length} időpont rögzítve) *
            </label>
            <div className="space-y-1.5 mb-2.5">
              {slotDates.map((dt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-[#1E2230]"
                >
                  <span className="font-mono text-slate-200">{dt.replace('T', ' ')} (60 perc)</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(idx)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="datetime-local"
                value={newSlotDateTime}
                onChange={(e) => setNewSlotDateTime(e.target.value)}
                className="flex-1 p-2 rounded-lg bg-slate-900 border border-[#1E2230] text-slate-200 font-mono focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddSlot}
                disabled={!newSlotDateTime}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Időpont hozzáadása</span>
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
              Szavazás Kiírása
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
