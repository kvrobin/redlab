'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { PaperReadStatus } from '@/types';
import { X, BookOpen, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AddPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPaperModal({ isOpen, onClose }: AddPaperModalProps) {
  const { addPaper } = useStore();

  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [journal, setJournal] = useState('Lab on a Chip');
  const [year, setYear] = useState<number>(2024);
  const [doi, setDoi] = useState('10.1039/');
  const [summary, setSummary] = useState('');
  const [tagInput, setTagInput] = useState('Mikrofluidika, Cseppgenerálás');
  const [readStatus, setReadStatus] = useState<PaperReadStatus>('olvasas_alatt');
  const [bibtex, setBibtex] = useState('');

  if (!isOpen) return null;

  // Auto-generate BibTeX draft if title/authors change
  const handleAutoFillBibtex = () => {
    const firstAuthor = authors.split(',')[0].trim().split(' ').pop()?.toLowerCase() || 'author';
    const cleanTitle = title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 15).toLowerCase().replace(/\s+/g, '_');
    const citeKey = `${firstAuthor}${year}${cleanTitle}`;
    
    const generated = `@article{${citeKey},
  title={${title || 'Untitled Paper'}},
  author={${authors || 'Unknown Authors'}},
  journal={${journal}},
  year={${year}},
  doi={${doi}}
}`;
    setBibtex(generated);
    toast.info('BibTeX hivatkozási sablon automatikusan legenerálva!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const finalBibtex = bibtex.trim() || `@article{ref_${Date.now()},
  title={${title.trim()}},
  author={${authors.trim()}},
  journal={${journal.trim()}},
  year={${year}},
  doi={${doi.trim()}}
}`;

    addPaper({
      title: title.trim(),
      authors: authors.trim() || 'N/A',
      journal: journal.trim() || 'Folyóirat',
      year: Number(year) || 2024,
      doi: doi.trim(),
      bibtex: finalBibtex,
      tags,
      readStatus,
      summary: summary.trim() || 'Nincs rögzített kivonat.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
          <h3 className="text-base font-bold text-white flex items-center">
            <BookOpen className="w-5 h-5 text-amber-400 mr-2" />
            Új Tudományos Publikáció / DOI Rögzítése
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Cikk Címe (Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pl. Continuous-Flow Microfluidic Droplet Formation..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Szerzők (Authors)
            </label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="pl. Whitesides, G. M., Weitz, D. A."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Folyóirat (Journal)
              </label>
              <input
                type="text"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="pl. Nature Reviews Bioengineering"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Megjelenési Év
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                DOI Azonosító
              </label>
              <input
                type="text"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="10.1038/s44222-024-00182-w"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Kezdeti Olvasottsági Állapot
              </label>
              <select
                value={readStatus}
                onChange={(e) => setReadStatus(e.target.value as PaperReadStatus)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="olvasas_alatt">Olvasás alatt lévő</option>
                <option value="elolvasva">Elolvasva & kijegyzetelve</option>
                <option value="feldolgozando">Feldolgozásra váró</option>
              </select>
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
              placeholder="pl. SingleCell, CFD, PDMS"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Szakmai Kivonat & Tanulságok a Kutatás Szempontjából
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Miért fontos ez a szakirodalom a mi szakdolgozatunkhoz..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-mono uppercase">
                BibTeX Hivatkozás
              </label>
              <button
                type="button"
                onClick={handleAutoFillBibtex}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generálás a mezőkből</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={bibtex}
              onChange={(e) => setBibtex(e.target.value)}
              placeholder="@article{...}"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 font-mono text-[11px] focus:outline-none focus:border-rose-500"
            />
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
              Publikáció Rögzítése
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
