'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { LiteratureItem } from '@/types';
import {
  FileDown,
  Copy,
  Check,
  BookMarked,
  Filter,
  FileText,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export function BibtexExportToolbar() {
  const { literatureItems } = useStore();
  const [filterMode, setFilterMode] = useState<'cited_only' | 'all'>('cited_only');
  const [copiedFormat, setCopiedFormat] = useState<'ieee' | 'apa' | null>(null);

  const targetItems = filterMode === 'cited_only'
    ? literatureItems.filter((i) => i.status === 'cited_in_thesis')
    : literatureItems;

  const totalCitedCount = literatureItems.filter((i) => i.status === 'cited_in_thesis').length;

  // Generate clean BibTeX string
  const generateBibtexContent = (items: LiteratureItem[]) => {
    return items
      .map((item, index) => {
        if (item.bibtex_citation && item.bibtex_citation.trim().startsWith('@')) {
          return item.bibtex_citation.trim();
        }

        // Generate synthetic BibTeX entry
        const firstAuthor = item.authors.split(',')[0].split(' ').pop() || 'RedLab';
        const citeKey = `${firstAuthor.toLowerCase()}${item.publication_year || 2026}_${index + 1}`;

        return `@article{${citeKey},
  author  = {${item.authors}},
  title   = {{${item.title}}},
  journal = {${item.journal || 'RED Lab Working Papers'}},
  year    = {${item.publication_year || 2026}},
  doi     = {${item.doi || ''}},
  url     = {${item.external_url || ''}},
  note    = {RED Lab Thesis Reference ID: ${item.id}}
}`;
      })
      .join('\n\n');
  };

  // Download .bib file for Overleaf / LaTeX
  const handleDownloadBib = () => {
    if (targetItems.length === 0) {
      toast.warning('Nincs exportálható cikk a kiválasztott szűrésben!');
      return;
    }

    const content = `% ==============================================================================
% RED LAB THESIS BIBLIOGRAPHY - OVERLEAF & LATEX COMPATIBLE
% Exported: ${new Date().toLocaleString('hu-HU')}
% Cikkek száma: ${targetItems.length}
% ==============================================================================

${generateBibtexContent(targetItems)}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'redlab_thesis_references.bib';
    a.click();
    URL.revokeObjectURL(url);

    toast.success('BibTeX (.bib) fájl letöltve! 📄', {
      description: `${targetItems.length} db hivatkozás Overleaf & LaTeX kompatibilis formátumban.`,
    });
  };

  // Copy IEEE format to clipboard for Word
  const handleCopyIeee = () => {
    if (targetItems.length === 0) {
      toast.warning('Nincs hivatkozás a másoláshoz!');
      return;
    }

    const text = targetItems
      .map((item, idx) => {
        const year = item.publication_year ? `, ${item.publication_year}` : '';
        const journal = item.journal ? ` *${item.journal}*` : '';
        const doi = item.doi ? `, doi: ${item.doi}` : '';
        return `[${idx + 1}] ${item.authors}, "${item.title},"${journal}${year}${doi}.`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopiedFormat('ieee');
    toast.success('IEEE irodalomjegyzék vágólapra másolva! 📋');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  // Copy APA format to clipboard
  const handleCopyApa = () => {
    if (targetItems.length === 0) {
      toast.warning('Nincs hivatkozás a másoláshoz!');
      return;
    }

    const text = targetItems
      .map((item) => {
        const year = item.publication_year ? ` (${item.publication_year}).` : ' (n.d.).';
        const journal = item.journal ? ` *${item.journal}*.` : '';
        const url = item.doi ? ` https://doi.org/${item.doi}` : item.external_url ? ` ${item.external_url}` : '';
        return `${item.authors}${year} ${item.title}.${journal}${url}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopiedFormat('apa');
    toast.success('APA irodalomjegyzék vágólapra másolva! 📋');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="p-4 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-md flex flex-wrap items-center justify-between gap-4">
      {/* Left: Summary & Filter Switch */}
      <div className="flex items-center space-x-3 flex-wrap gap-y-2">
        <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400">
          <BookMarked className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs uppercase tracking-wider text-white">
              Szakdolgozati Irodalomjegyzék Export
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              {totalCitedCount} hivatkozva
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Overleaf, LaTeX és Microsoft Word kompatibilis azonnali export
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 ml-0 sm:ml-2">
          <button
            type="button"
            onClick={() => setFilterMode('cited_only')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'cited_only'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hivatkozott Cikkek ({totalCitedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Minden Tétel ({literatureItems.length})
          </button>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center space-x-2 flex-wrap gap-y-2">
        {/* BibTeX Download Button */}
        <button
          type="button"
          onClick={handleDownloadBib}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs shadow-md shadow-rose-950/40 transition-all"
        >
          <FileDown className="w-4 h-4" />
          <span>Exportálás (.bib)</span>
        </button>

        {/* IEEE Copy Button */}
        <button
          type="button"
          onClick={handleCopyIeee}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          title="Hivatkozások másolása IEEE formátumban"
        >
          {copiedFormat === 'ieee' ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Másolás (IEEE)</span>
        </button>

        {/* APA Copy Button */}
        <button
          type="button"
          onClick={handleCopyApa}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          title="Hivatkozások másolása APA formátumban"
        >
          {copiedFormat === 'apa' ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Másolás (APA)</span>
        </button>
      </div>
    </div>
  );
}
