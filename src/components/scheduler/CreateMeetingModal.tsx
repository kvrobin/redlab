'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { createMeetingAction } from '@/app/actions/scheduler';
import {
  X,
  CalendarCheck2,
  Clock,
  Video,
  ListPlus,
  Trash2,
  Plus,
  GraduationCap,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMeetingModal({ isOpen, onClose }: CreateMeetingModalProps) {
  const { createMeeting, currentProfile } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [locationOrLink, setLocationOrLink] = useState('https://meet.google.com/red-lab-thesis');
  const [requiresSupervisor, setRequiresSupervisor] = useState(false);

  // Agenda items
  const [agendaItems, setAgendaItems] = useState<string[]>([
    'Sprint eredmények áttekintése (Robin & Emma)',
    'CAD modellek és laboratóriumi mérések validálása (Domi)',
    'Következő heti célkitűzések & témavezetői iránymutatás',
  ]);
  const [newAgendaInput, setNewAgendaInput] = useState('');

  // Proposed slots (ISO strings)
  const [proposedSlots, setProposedSlots] = useState<string[]>(() => {
    // Default 3 upcoming slots
    const now = new Date();
    const slot1 = new Date(now);
    slot1.setDate(slot1.getDate() + 1);
    slot1.setHours(10, 0, 0, 0);

    const slot2 = new Date(now);
    slot2.setDate(slot2.getDate() + 1);
    slot2.setHours(14, 0, 0, 0);

    const slot3 = new Date(now);
    slot3.setDate(slot3.getDate() + 2);
    slot3.setHours(11, 0, 0, 0);

    return [
      slot1.toISOString().slice(0, 16),
      slot2.toISOString().slice(0, 16),
      slot3.toISOString().slice(0, 16),
    ];
  });

  const [slotPickerValue, setSlotPickerValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddAgendaItem = () => {
    if (!newAgendaInput.trim()) return;
    setAgendaItems([...agendaItems, newAgendaInput.trim()]);
    setNewAgendaInput('');
  };

  const handleRemoveAgendaItem = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };

  const handleAddSlot = () => {
    if (!slotPickerValue) {
      toast.error('Válassz dátumot és időpontot!');
      return;
    }
    if (proposedSlots.includes(slotPickerValue)) {
      toast.warning('Ez az idősáv már szerepel a listában!');
      return;
    }
    setProposedSlots([...proposedSlots, slotPickerValue]);
    setSlotPickerValue('');
  };

  const handleRemoveSlot = (index: number) => {
    if (proposedSlots.length <= 1) {
      toast.error('Legalább egy javasolt idősáv szükséges!');
      return;
    }
    setProposedSlots(proposedSlots.filter((_, i) => i !== index));
  };

  const handleQuickSlotTemplate = (daysFromNow: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, 0, 0, 0);
    const val = d.toISOString().slice(0, 16);
    if (!proposedSlots.includes(val)) {
      setProposedSlots([...proposedSlots, val]);
      toast.success('Idősáv hozzáadva!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('A megbeszélés címe nem lehet üres!');
      return;
    }
    if (proposedSlots.length === 0) {
      toast.error('Legalább egy javasolt idősávot adj meg!');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Build initial slot objects
      const slotsData = proposedSlots.map((startTime, idx) => {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + durationMinutes * 60000);
        const slotId = `slot-${Date.now()}-${idx}`;

        return {
          id: slotId,
          meeting_id: '',
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          proposed_by: currentProfile.id,
          created_at: new Date().toISOString(),
          votes: {
            [currentProfile.id]: {
              id: `vote-${Date.now()}-${idx}`,
              slot_id: slotId,
              meeting_id: '',
              voter_id: currentProfile.id,
              vote: 'upvote' as const,
              updated_at: new Date().toISOString(),
            },
          },
        };
      });

      // 2. Client store optimistic save
      createMeeting({
        title: title.trim(),
        description: description.trim(),
        duration_minutes: durationMinutes,
        location_or_link: locationOrLink.trim() || 'https://meet.google.com/red-lab-thesis',
        requires_supervisor: requiresSupervisor,
        agenda_items: agendaItems,
        slots: slotsData,
      });

      // 3. Server Action background sync
      createMeetingAction({
        title: title.trim(),
        description: description.trim(),
        duration_minutes: durationMinutes,
        location_or_link: locationOrLink.trim() || 'https://meet.google.com/red-lab-thesis',
        requires_supervisor: requiresSupervisor,
        agenda_items: agendaItems,
        proposed_slots: proposedSlots,
        created_by: currentProfile.id,
      });

      onClose();
    } catch (err: any) {
      toast.error('Hiba történt a megbeszélés kiírásakor: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2230]">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-800/60">
              <CalendarCheck2 className="w-5 h-5 text-rose-400" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                Új Időpont-szavazás & Konzultáció Kiírása
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                RED Lab Smart Scheduler • Többszereplős Konszenzus-motor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick templates */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Gyors sablonok:</span>
            <button
              type="button"
              onClick={() => {
                setTitle('Heti RED Lab Sprint Szinkron');
                setDescription('Közös heti haladási áttekintés, laboreredmények és nyitott blokkerek egyeztetése.');
                setDurationMinutes(45);
                setRequiresSupervisor(false);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-[#1E2230] text-slate-300 hover:border-rose-700 hover:text-white transition-all"
            >
              Heti Szinkron
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle('Konzultáció a Témavezető Professzorral');
                setDescription('Szakdolgozati fejezetek jóváhagyása, laboreredmények bemutatása és témavezetői szignó.');
                setDurationMinutes(60);
                setRequiresSupervisor(true);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-950/50 border border-purple-800/50 text-purple-300 hover:bg-purple-900/60 transition-all flex items-center gap-1"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Témavezetői Konzultáció
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle('Wet-Lab & Mérési Protokoll Validálás');
                setDescription('Kísérleti beállítások, vegyszerrendelések és validációs mérési sorozatok megbeszélése.');
                setDurationMinutes(30);
                setRequiresSupervisor(false);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/50 transition-all"
            >
              Lab Mérés
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Megbeszélés Címe *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pl. Heti RED Lab Szinkron vagy Témavezetői Szakdolgozat Konzultáció"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Rövid Cél & Leírás
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="A megbeszélés fő témája, felkészülési követelmények a csapattagoknak..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Duration & Location row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Időtartam
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                      durationMinutes === mins
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                        : 'bg-slate-900 text-slate-400 border border-[#1E2230] hover:text-white'
                    }`}
                  >
                    {mins} perc
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Helyszín vagy Google Meet Link
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  placeholder="https://meet.google.com/red-lab-thesis"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Supervisor Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230]">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-lg bg-purple-950 text-purple-300 border border-purple-800/60">
                <GraduationCap className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-semibold text-white">
                  Témavezető részvétele kötelező (requires_supervisor)
                </div>
                <div className="text-[11px] text-slate-400">
                  Ha be van kapcsolva, a megbeszélés nem véglegesülhet a professzor elfogadó szavazata nélkül.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRequiresSupervisor(!requiresSupervisor)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                requiresSupervisor ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  requiresSupervisor ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Napirendi pontok (Agenda) */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Napirendi Pontok ({agendaItems.length})
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {agendaItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-[#1E2230] text-xs text-slate-300"
                >
                  <span className="flex items-center space-x-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">{item}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAgendaItem(idx)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={newAgendaInput}
                onChange={(e) => setNewAgendaInput(e.target.value)}
                placeholder="Új napirendi pont hozzáadása..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAgendaItem();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAgendaItem}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Hozzáadás</span>
              </button>
            </div>
          </div>

          {/* Javasolt Idősávok (Multiple Proposed Slots) */}
          <div className="space-y-2 pt-2 border-t border-[#1E2230]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300">
                Javasolt Idősávok a Szavazásra ({proposedSlots.length}) *
              </label>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleQuickSlotTemplate(1, 10)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  +Holnap 10:00
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSlotTemplate(1, 14)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  +Holnap 14:00
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSlotTemplate(2, 16)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  +Holnapután 16:00
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {proposedSlots.map((slotTime, idx) => {
                const dateObj = new Date(slotTime);
                const isInvalid = isNaN(dateObj.getTime());
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-mono">
                        {isInvalid
                          ? slotTime
                          : dateObj.toLocaleString('hu-HU', {
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Sáv törlése"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add custom slot input */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="datetime-local"
                value={slotPickerValue}
                onChange={(e) => setSlotPickerValue(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddSlot}
                className="px-3.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Sáv Felvétele</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#1E2230]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 flex items-center space-x-1.5 transition-all"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Kiírás...' : 'Szavazás Kiírása a Csapatnak'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
