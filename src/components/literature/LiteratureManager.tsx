'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { LiteratureItem, LiteratureStatus } from '@/types';
import {
  Library,
  BookOpen,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Copy,
  ThumbsUp,
  Pin,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface LiteratureManagerProps {
  openAddPaperModal: () => void;
}

export function LiteratureManager({ openAddPaperModal }: LiteratureManagerProps) {
  const { literatureItems, updateLiteratureStatus, toggleLiteratureUpvote, currentProfile } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReadFilter, setSelectedReadFilter] = useState<string>('all');

  const filteredItems = literatureItems.filter((item) => {
    if (selectedReadFilter !== 'all' && item.status !== selectedReadFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAuthors = item.authors.toLowerCase().includes(q);
      const matchJournal = (item.journal || '').toLowerCase().includes(q);
      const matchDoi = (item.doi || '').toLowerCase().includes(q);
      const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthors && !matchJournal && !matchDoi && !matchTag) return false;
    }
    return true;
  });

  const handleCopyBibtex = (item: LiteratureItem) => {
    if (item.bibtex_citation) {
      navigator.clipboard.writeText(item.bibtex_citation);
      toast.success('BibTeX hivatkozás kimásolva a vágólapra!', {
        description: `@article for ${item.title.substring(0, 32)}...`,
      });
    }
  };

  const getStatusBadge = (status: LiteratureStatus, itemId: string) => {
    return (
      <select
        value={status}
        onChange={(e) => updateLiteratureStatus(itemId, e.target.value as LiteratureStatus)}
        className={`text-[11px] font-mono font-medium rounded-lg px-2 py-1 border focus:outline-none transition-colors ${
          status === 'cited_in_thesis'
            ? 'bg-purple-950/60 text-purple-300 border-purple-800/40'
            : status === 'summarized'
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
            : status === 'reading'
            ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
            : 'bg-slate-900 text-slate-400 border-[#1E2230]'
        }`}
      >
        <option value="cited_in_thesis">Idézve a szakdolgozatban</option>
        <option value="summarized">Kijegyzetelve & Feldolgozva</option>
        <option value="reading">Olvasás folyamatban</option>
        <option value="to_read">Olvasandó (To Read)</option>
      </select>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40">
              SUPABASE LITERATURE HUB
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Nature, IEEE, Lab on a Chip & Elsevier Hivatkozások
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Szakirodalom & DOI Repozitórium
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            A szakdolgozat elméleti hátterét és kísérleti módszertanát alátámasztó nemzetközi publikációk,
            kulcsfontosságú tanulságok (Key Findings) és professzori kitűzések.
          </p>
        </div>

        <button
          onClick={openAddPaperModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Új Publikáció / DOI Hozzáadása</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#12141D] border border-[#1E2230]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Státusz:
          </span>
          <select
            value={selectedReadFilter}
            onChange={(e) => setSelectedReadFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="all">Minden cikk ({literatureItems.length})</option>
            <option value="cited_in_thesis">Idézve a szakdolgozatban</option>
            <option value="summarized">Kijegyzetelve / Összefoglalva</option>
            <option value="reading">Olvasás folyamatban</option>
            <option value="to_read">Olvasásra váró</option>
          </select>
        </div>

        <div className="relative flex-1 sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Keresés cím, szerző, DOI vagy kulcsszó alapján..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isUpvoted = (item.upvotes || []).includes(currentProfile.id);
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl bg-[#12141D] border transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                item.is_pinned_for_professor
                  ? 'border-purple-500/40 ring-1 ring-purple-500/20'
                  : 'border-[#1E2230] hover:border-slate-700'
              }`}
            >
              <div>
                {/* Journal & Year & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {item.journal} ({item.publication_year})
                    </span>
                    {item.is_pinned_for_professor && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 flex items-center">
                        <Pin className="w-2.5 h-2.5 mr-0.5" /> Témavezetői Fókusz
                      </span>
                    )}
                  </div>
                  {getStatusBadge(item.status, item.id)}
                </div>

                {/* Paper Title */}
                <h3 className="text-sm font-bold text-white hover:text-rose-300 transition-colors">
                  {item.title}
                </h3>

                {/* Authors */}
                <p className="text-xs text-slate-400 mt-1 font-medium">{item.authors}</p>

                {/* DOI link */}
                {item.doi && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500">DOI:</span>
                    <a
                      href={`https://doi.org/${item.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-purple-400 hover:text-purple-300 hover:underline flex items-center"
                    >
                      {item.doi} <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}

                {/* Key Findings */}
                {item.key_findings && (
                  <div className="mt-3 bg-slate-900/60 p-3 rounded-xl border border-[#1E2230]">
                    <div className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                      Kulcsfontosságú Tanulság (Key Finding):
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.key_findings}
                    </p>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-3 border-t border-[#1E2230] flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] font-mono">
                  Kategória: <span className="text-slate-300">{item.workstream}</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleLiteratureUpvote(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors border ${
                      isUpvoted
                        ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                        : 'bg-slate-900 text-slate-400 border-[#1E2230] hover:text-white'
                    }`}
                    title="Kutatási hasznosság szavazat"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{(item.upvotes || []).length}</span>
                  </button>

                  {item.bibtex_citation && (
                    <button
                      onClick={() => handleCopyBibtex(item)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 transition-colors border border-slate-700"
                      title="BibTeX formátum vágólapra másolása"
                    >
                      <Copy className="w-3 h-3 text-rose-400" />
                      <span>BibTeX</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
