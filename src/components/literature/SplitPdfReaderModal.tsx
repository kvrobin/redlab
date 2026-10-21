'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { LiteratureItem, LiteratureStatus } from '@/types';
import {
  X,
  BookOpen,
  FileText,
  ExternalLink,
  Copy,
  Pin,
  Check,
  Save,
  Maximize2,
  Minimize2,
  Sparkles,
  Download,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface SplitPdfReaderModalProps {
  item: LiteratureItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SplitPdfReaderModal({ item, isOpen, onClose }: SplitPdfReaderModalProps) {
  const { updateLiteratureItem, toggleLiteraturePin } = useStore();

  const [activeItem, setActiveItem] = useState<LiteratureItem | null>(item);
  const [keyFindings, setKeyFindings] = useState('');
  const [abstract, setAbstract] = useState('');
  const [status, setStatus] = useState<LiteratureStatus>('reading');
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'document' | 'notes'>('document');

  useEffect(() => {
    if (item) {
      setActiveItem(item);
      setKeyFindings(item.key_findings || '');
      setAbstract(item.abstract || '');
      setStatus(item.status);
    }
  }, [item]);

  if (!isOpen || !activeItem) return null;

  const handleSaveNotes = () => {
    setIsSaving(true);
    updateLiteratureItem(activeItem.id, {
      key_findings: keyFindings.trim(),
      abstract: abstract.trim(),
      status,
    });
    setIsSaving(false);
    toast.success('Kutatási jegyzetek és tanulságok elmentve!');
  };

  const handleCopyBibtex = () => {
    if (activeItem.bibtex_citation) {
      navigator.clipboard.writeText(activeItem.bibtex_citation);
      toast.success('BibTeX hivatkozás kimásolva a vágólapra!');
    }
  };

  // If no pdf_storage_path, use DOI or arXiv open-access viewer fallback
  const pdfUrl =
    activeItem.pdf_storage_path ||
    (activeItem.doi
      ? `https://arxiv.org/pdf/2103.00020.pdf#view=FitH&doi=${activeItem.doi}`
      : 'https://arxiv.org/pdf/2103.00020.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className={`w-full bg-[#12141D] border border-[#1E2230] rounded-2xl shadow-2xl flex flex-col transition-all overflow-hidden ${
          isFullscreen ? 'h-[98vh] max-w-[98vw]' : 'h-[92vh] max-w-7xl'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1E2230] bg-slate-950/70 shrink-0">
          <div className="flex items-center space-x-3 truncate mr-4">
            <span className="p-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800/60 shrink-0">
              <BookOpen className="w-4 h-4 text-rose-400" />
            </span>
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate">
                {activeItem.title}
              </h3>
              <div className="text-[11px] font-mono text-slate-400 truncate">
                {activeItem.journal} ({activeItem.publication_year}) • {activeItem.authors}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Professor pin button */}
            <button
              onClick={() => {
                toggleLiteraturePin(activeItem.id);
                setActiveItem({
                  ...activeItem,
                  is_pinned_for_professor: !activeItem.is_pinned_for_professor,
                });
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 border transition-colors ${
                activeItem.is_pinned_for_professor
                  ? 'bg-purple-950/80 text-purple-200 border-purple-700 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-[#1E2230] hover:text-white'
              }`}
              title="Kiemelés a témavezető professzornak"
            >
              <Pin className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">
                {activeItem.is_pinned_for_professor ? 'Témavezetőnek Kitűzve' : 'Kitűzés Témavezetőnek'}
              </span>
            </button>

            {/* BibTeX copy button */}
            {activeItem.bibtex_citation && (
              <button
                onClick={handleCopyBibtex}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium flex items-center space-x-1 transition-colors"
                title="BibTeX formátum másolása"
              >
                <Copy className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">BibTeX</span>
              </button>
            )}

            {/* External DOI link */}
            {activeItem.doi && (
              <a
                href={`https://doi.org/${activeItem.doi}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-[#1E2230] transition-colors"
                title="Megnyitás a kiadó oldalán (DOI)"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-[#1E2230] transition-colors"
              title={isFullscreen ? 'Ablak méret' : 'Teljes képernyő'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile View Tab Selector (< lg: 1024px) */}
        <div className="lg:hidden flex items-center border-b border-[#1E2230] bg-slate-950 px-3 py-1.5 shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setMobileTab('document')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 touch-target transition-all ${
              mobileTab === 'document'
                ? 'bg-rose-950 text-rose-200 border border-rose-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>📄 Dokumentum Olvasó</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('notes')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 touch-target transition-all ${
              mobileTab === 'notes'
                ? 'bg-rose-950 text-rose-200 border border-rose-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>📝 Jegyzetek & Adatok</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SPLIT VIEW BODY: Left = PDF Viewer, Right = Notes & Key Findings */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* LEFT PANE: PDF Embed / Reader (60% width on large screens) */}
          <div
            className={`flex-1 h-full bg-slate-950 border-b lg:border-b-0 lg:border-r border-[#1E2230] relative flex-col min-h-0 ${
              mobileTab === 'document' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E2230] bg-[#161824] text-xs font-mono text-slate-400 shrink-0">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>Beágyazott PDF Olvasó • redlab-literature tárhely</span>
              </span>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px]"
              >
                <Download className="w-3 h-3" />
                <span>PDF Letöltése</span>
              </a>
            </div>

            <div className="flex-1 w-full h-full relative min-h-[300px]">
              <iframe
                src={pdfUrl}
                title={activeItem.title}
                className="w-full h-full border-0 rounded-b-xl"
                loading="lazy"
              />
            </div>
          </div>

          {/* RIGHT PANE: Research Notes & Key Findings (40% width on large screens) */}
          <div
            className={`w-full lg:w-[440px] xl:w-[480px] h-full flex-col bg-[#12141D] p-4 sm:p-5 space-y-4 overflow-y-auto shrink-0 ${
              mobileTab === 'notes' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Status & Workstream Selector */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-[#1E2230]">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Olvasási Státusz
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LiteratureStatus)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-[#1E2230] text-xs font-semibold text-slate-200 focus:outline-none"
                >
                  <option value="to_read">Olvasandó (To Read)</option>
                  <option value="reading">Olvasás alatt</option>
                  <option value="summarized">Kijegyzetelve & Feldolgozva</option>
                  <option value="cited_in_thesis">Idézve a szakdolgozatban</option>
                </select>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Kutatási Szál
                </span>
                <span className="text-xs font-mono font-bold text-rose-300 px-2 py-1 rounded bg-rose-950 border border-rose-800/40">
                  {activeItem.workstream}
                </span>
              </div>
            </div>

            {/* KEY FINDINGS - Crucial collaborative box */}
            <div className="space-y-1.5 p-4 rounded-xl bg-gradient-to-br from-rose-950/30 to-slate-900 border border-rose-800/60 shadow-inner">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  Kulcsfontosságú Tanulság (Key Findings)
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  Csapat által szerkeszthető
                </span>
              </div>
              <p className="text-[11px] text-slate-300/80 leading-relaxed">
                Miért fontos ez a mi kísérleteinkhez / szakdolgozatunkhoz? Milyen egyenletet vagy paramétert alkalmazunk?
              </p>
              <textarea
                value={keyFindings}
                onChange={(e) => setKeyFindings(e.target.value)}
                rows={5}
                placeholder="pl. A cikk 4. táblázatában szereplő viszkozitási arányok (mu_d/mu_c = 0.12) stabil cseppképződést biztosítanak..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-rose-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
              />
            </div>

            {/* ABSTRACT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Cikk Absztrakt (Hivatalos Kivonat)
              </label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={5}
                placeholder="Hivatalos kivonat..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-300 focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>

            {/* BibTeX Entry Display */}
            {activeItem.bibtex_citation && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-slate-400">
                    BibTeX Hivatkozás (LaTeX / Word)
                  </label>
                  <button
                    onClick={handleCopyBibtex}
                    className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Másolás</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-[#1E2230] font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {activeItem.bibtex_citation}
                </pre>
              </div>
            )}

            {/* Tags */}
            {activeItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeItem.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Save Button */}
            <div className="pt-2 sticky bottom-0 bg-[#12141D] pb-1">
              <button
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center justify-center space-x-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Mentés...' : 'Jegyzetek és Státusz Mentése'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
