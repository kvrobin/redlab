'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { LiteratureStatus, WorkstreamType } from '@/types';
import { X, BookOpen, Sparkles, Pin } from 'lucide-react';
import { toast } from 'sonner';

interface AddPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPaperModal({ isOpen, onClose }: AddPaperModalProps) {
  const { addLiteratureItem } = useStore();

  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [journal, setJournal] = useState('Nature Reviews Bioengineering');
  const [publicationYear, setPublicationYear] = useState<number>(2024);
  const [doi, setDoi] = useState('10.1038/');
  const [keyFindings, setKeyFindings] = useState('');
  const [abstract, setAbstract] = useState('');
  const [tagInput, setTagInput] = useState('Mikrofluidika, Cseppképződés');
  const [status, setStatus] = useState<LiteratureStatus>('reading');
  const [workstream, setWorkstream] = useState<WorkstreamType>('wet_lab');
  const [isPinned, setIsPinned] = useState(false);
  const [bibtex, setBibtex] = useState('');

  if (!isOpen) return null;

  const handleAutoFillBibtex = () => {
    const firstAuthor = authors.split(',')[0].trim().split(' ').pop()?.toLowerCase() || 'author';
    const cleanTitle = title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 15).toLowerCase().replace(/\s+/g, '_');
    const citeKey = `${firstAuthor}${publicationYear}${cleanTitle}`;

    const generated = `@article{${citeKey},
  title={${title || 'Untitled Paper'}},
  author={${authors || 'Unknown Authors'}},
  journal={${journal}},
  year={${publicationYear}},
  doi={${doi}}
}`;
    setBibtex(generated);
    toast.info('BibTeX hivatkozási sablon legenerálva!');
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
  year={${publicationYear}},
  doi={${doi.trim()}}
}`;

    addLiteratureItem({
      title: title.trim(),
      authors: authors.trim() || 'N/A',
      journal: journal.trim(),
      publication_year: Number(publicationYear) || 2024,
      doi: doi.trim(),
      abstract: abstract.trim(),
      key_findings: keyFindings.trim(),
      bibtex_citation: finalBibtex,
      tags,
      status,
      workstream,
      is_pinned_for_professor: isPinned,
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
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Megjelenési Év
              </label>
              <input
                type="number"
                value={publicationYear}
                onChange={(e) => setPublicationYear(Number(e.target.value))}
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
                Státusz
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LiteratureStatus)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="to_read">Olvasandó (to_read)</option>
                <option value="reading">Olvasás alatt (reading)</option>
                <option value="summarized">Összefoglalva (summarized)</option>
                <option value="cited_in_thesis">Idézve a szakdolgozatban (cited_in_thesis)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Kapcsolódó Workstream
              </label>
              <select
                value={workstream}
                onChange={(e) => setWorkstream(e.target.value as WorkstreamType)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="wet_lab">Wet Lab (Laboratórium)</option>
                <option value="dry_lab_code">Dry Lab (Szimuláció & ML)</option>
                <option value="cad_hardware">CAD & Hardware</option>
                <option value="thesis_writing">Szakdolgozat Kézirat</option>
                <option value="general">Általános</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 bg-slate-900"
                />
                <span className="flex items-center">
                  <Pin className="w-3.5 h-3.5 mr-1 text-purple-400" />
                  Kitűzés professzori áttekintésre
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Kulcsfontosságú Tanulság (Key Findings) *
            </label>
            <textarea
              rows={2}
              value={keyFindings}
              onChange={(e) => setKeyFindings(e.target.value)}
              placeholder="Miért fontos ez a mi kísérleteinkhez és szakdolgozatunkhoz..."
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
