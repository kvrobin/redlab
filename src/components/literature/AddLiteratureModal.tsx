'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { LiteratureStatus, WorkstreamType } from '@/types';
import { fetchDoiMetadata, cleanDoi } from '@/lib/doi-fetcher';
import {
  X,
  BookOpen,
  Sparkles,
  Pin,
  Upload,
  Copy,
  Check,
  FileText,
  Search,
  ExternalLink,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

interface AddLiteratureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddLiteratureModal({ isOpen, onClose }: AddLiteratureModalProps) {
  const { addLiteratureItem, currentProfile } = useStore();

  const [doiInput, setDoiInput] = useState('10.1038/s41586-020-2649-2');
  const [isFetchingDoi, setIsFetchingDoi] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [journal, setJournal] = useState('');
  const [publicationYear, setPublicationYear] = useState<number>(2024);
  const [abstract, setAbstract] = useState('');
  const [keyFindings, setKeyFindings] = useState('');
  const [bibtex, setBibtex] = useState('');
  const [status, setStatus] = useState<LiteratureStatus>('to_read');
  const [workstream, setWorkstream] = useState<WorkstreamType>('wet_lab');
  const [isPinned, setIsPinned] = useState(false);
  const [tagInput, setTagInput] = useState('Mikrofluidika, Cseppképződés, Validáció');
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfStoragePath, setPdfStoragePath] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1-Click DOI Fetch
  const handleFetchDoi = async () => {
    if (!doiInput.trim()) {
      toast.error('Adj meg egy DOI azonosítót vagy URL-t!');
      return;
    }

    setIsFetchingDoi(true);
    try {
      const data = await fetchDoiMetadata(doiInput);
      setTitle(data.title);
      setAuthors(data.authors);
      setJournal(data.journal);
      setPublicationYear(data.publication_year);
      setAbstract(data.abstract || '');
      setBibtex(data.bibtex_citation);

      toast.success('DOI metaadatok sikeresen lekérve a Crossrefből!', {
        description: `${data.title.substring(0, 45)}...`,
      });
    } catch (err: any) {
      toast.error('DOI Lekérési hiba', {
        description: err.message || 'Nem sikerült elérni a Crossref szervert. Töltsd ki manuálisan!',
      });
    } finally {
      setIsFetchingDoi(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.pdf')) {
        toast.error('Csak PDF formátumú publikáció tölthető fel!');
        return;
      }
      setPdfFileName(file.name);
      // Simulation of Supabase Storage redlab-literature bucket upload
      const simulatedPath = `https://arxiv.org/pdf/2103.00020.pdf#redlab-literature-${Date.now()}`;
      setPdfStoragePath(simulatedPath);
      toast.success(`PDF feltöltve a redlab-literature tárba: ${file.name}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('A publikáció címe kötelező!');
      return;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addLiteratureItem({
      title: title.trim(),
      authors: authors.trim() || 'Ismeretlen szerzők',
      journal: journal.trim() || 'Tudományos Folyóirat',
      publication_year: Number(publicationYear) || 2024,
      doi: cleanDoi(doiInput),
      external_url: doiInput.startsWith('http') ? doiInput : `https://doi.org/${cleanDoi(doiInput)}`,
      pdf_storage_path: pdfStoragePath,
      abstract: abstract.trim(),
      key_findings: keyFindings.trim(),
      bibtex_citation: bibtex.trim(),
      tags,
      status,
      workstream,
      is_pinned_for_professor: isPinned,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2230]">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-800/60">
              <BookOpen className="w-5 h-5 text-rose-400" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                Új Szakirodalom & Cikk Rögzítése
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                1-Kattintásos Crossref DOI Lekérdezés & Automatikus BibTeX Generálás
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

        {/* 1. DOI FETCH WIZARD BAR */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-800/40 space-y-2">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-400" />
            Automatikus Adatbetöltés DOI Azonosító Alapján
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={doiInput}
              onChange={(e) => setDoiInput(e.target.value)}
              placeholder="pl. 10.1038/s41586-020-2649-2 vagy https://doi.org/..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-[#1E2230] text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-rose-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleFetchDoi();
                }
              }}
            />
            <button
              type="button"
              onClick={handleFetchDoi}
              disabled={isFetchingDoi}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-rose-950/40 flex items-center justify-center space-x-1.5 transition-all shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isFetchingDoi ? 'Lekérdezés...' : 'Adatok automatikus betöltése (DOI)'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            A Crossref REST API-ból automatikusan letölti a címet, szerzőket, kiadót, évet és absztraktot.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Publikáció Címe (Title) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pl. High-throughput microfluidic droplets for single-cell genomics..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-medium"
              required
            />
          </div>

          {/* Authors & Journal Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Szerzők (Authors)
              </label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="pl. Macosko, Evan Z. and Basu, Anirban and ..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Folyóirat & Év (Journal & Year)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  placeholder="pl. Nature Reviews Bioengineering"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <input
                  type="number"
                  value={publicationYear}
                  onChange={(e) => setPublicationYear(Number(e.target.value))}
                  className="w-20 px-2 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white text-center font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Kivonat (Abstract)
            </label>
            <textarea
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              rows={3}
              placeholder="A cikk hivatalos absztraktja..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed"
            />
          </div>

          {/* Key Findings - Crucial for thesis team */}
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-1.5">
            <label className="block text-xs font-bold text-rose-300">
              💡 Kulcsfontosságú Tanulság & Relevancia (Key Findings):
            </label>
            <p className="text-[11px] text-slate-400">
              Miért fontos ez a mi kutatásunkhoz? Melyik mérési eljárást vagy képletet vettük át belőle?
            </p>
            <textarea
              value={keyFindings}
              onChange={(e) => setKeyFindings(e.target.value)}
              rows={2}
              placeholder="pl. A 3.2-es ábra geometriai arányai csökkentik a pezsgést a fúvókában 40%-kal. Ezt fogjuk adaptálni a CAD modellünkben."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-rose-900/40 text-xs text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed"
            />
          </div>

          {/* PDF Upload */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-400" />
                Teljes PDF Csatolása (redlab-literature tároló)
              </span>
              {pdfFileName && (
                <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {pdfFileName}
                </span>
              )}
            </div>

            <label className="block border border-dashed border-[#1E2230] hover:border-slate-600 rounded-xl p-3 text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-xs text-slate-400">
                Kattints ide a cikk PDF fájljának feltöltéséhez (max. 50 MB)
              </span>
            </label>
          </div>

          {/* Status & Workstream & Pin Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Olvasottsági Státusz
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LiteratureStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none"
              >
                <option value="to_read">Olvasandó (To Read)</option>
                <option value="reading">Olvasás alatt</option>
                <option value="summarized">Kijegyzetelve & Feldolgozva</option>
                <option value="cited_in_thesis">Idézve a szakdolgozatban</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kutatási Terület (Workstream)
              </label>
              <select
                value={workstream}
                onChange={(e) => setWorkstream(e.target.value as WorkstreamType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none"
              >
                <option value="wet_lab">Labor (Wet Lab)</option>
                <option value="dry_lab_code">Kód (Dry Lab)</option>
                <option value="cad_hardware">CAD & Hardver</option>
                <option value="thesis_writing">Kéziratírás</option>
                <option value="general">Általános Háttér</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Professzori Kiemelés
              </label>
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border ${
                  isPinned
                    ? 'bg-purple-950/80 text-purple-200 border-purple-700 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-[#1E2230] hover:text-white'
                }`}
              >
                <Pin className="w-3.5 h-3.5 text-purple-400" />
                <span>{isPinned ? 'Kitűzve a Témavezetőnek' : 'Kiemelés a Professzornak'}</span>
              </button>
            </div>
          </div>

          {/* BibTeX Citation Preview */}
          {bibtex && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-slate-400 uppercase">
                  Generált BibTeX Hivatkozás:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(bibtex);
                    toast.success('BibTeX vágólapra másolva!');
                  }}
                  className="text-[11px] font-mono text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Másolás</span>
                </button>
              </div>
              <textarea
                value={bibtex}
                onChange={(e) => setBibtex(e.target.value)}
                rows={4}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-[#1E2230] font-mono text-[11px] text-slate-300 focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Címkék (vesszővel elválasztva)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="pl. Mikrofluidika, Cseppképződés, Validáció"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#1E2230]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 flex items-center space-x-1.5 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Publikáció Mentése a Repozitóriumba</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
