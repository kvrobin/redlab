'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { LiteratureItem, LiteratureStatus, WorkstreamType } from '@/types';
import { AddLiteratureModal } from '@/components/literature/AddLiteratureModal';
import { SplitPdfReaderModal } from '@/components/literature/SplitPdfReaderModal';
import { BibtexExportToolbar } from '@/components/literature/BibtexExportToolbar';
import { AiCopilotModal } from '@/components/ai/AiCopilotModal';
import { RedLabLogo } from '@/components/brand/RedLabLogo';
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
  FileText,
  CheckCircle2,
  Clock,
  Bookmark,
  GraduationCap,
  Layers,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface LiteratureManagerProps {
  openAddPaperModal?: () => void;
}

export function LiteratureManager({ openAddPaperModal }: LiteratureManagerProps) {
  const {
    literatureItems,
    updateLiteratureStatus,
    toggleLiteratureUpvote,
    toggleLiteraturePin,
    deleteLiteratureItem,
    currentProfile,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedWorkstream, setSelectedWorkstream] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [readingItem, setReadingItem] = useState<LiteratureItem | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [aiSummaryPaper, setAiSummaryPaper] = useState<LiteratureItem | null>(null);

  const handleOpenAdd = () => {
    if (openAddPaperModal) openAddPaperModal();
    else setIsAddModalOpen(true);
  };

  const handleOpenReader = (item: LiteratureItem) => {
    setReadingItem(item);
    setIsReaderOpen(true);
  };

  const handleCopyBibtex = (item: LiteratureItem) => {
    if (item.bibtex_citation) {
      navigator.clipboard.writeText(item.bibtex_citation);
      toast.success('BibTeX hivatkozás kimásolva a vágólapra!', {
        description: `@article for ${item.title.substring(0, 35)}...`,
      });
    }
  };

  // Stats
  const totalCount = literatureItems.length;
  const citedCount = literatureItems.filter((i) => i.status === 'cited_in_thesis').length;
  const pinnedCount = literatureItems.filter((i) => i.is_pinned_for_professor).length;
  const summarizedCount = literatureItems.filter((i) => i.status === 'summarized').length;
  const readingCount = literatureItems.filter((i) => i.status === 'reading').length;
  const toReadCount = literatureItems.filter((i) => i.status === 'to_read').length;

  // Filter items
  const filteredItems = literatureItems.filter((item) => {
    // Tab filter
    if (activeTab === 'pinned' && !item.is_pinned_for_professor) return false;
    if (activeTab === 'to_read' && item.status !== 'to_read') return false;
    if (activeTab === 'reading' && item.status !== 'reading') return false;
    if (activeTab === 'summarized' && item.status !== 'summarized') return false;
    if (activeTab === 'cited_in_thesis' && item.status !== 'cited_in_thesis') return false;

    // Workstream filter
    if (selectedWorkstream !== 'all' && item.workstream !== selectedWorkstream) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAuthors = item.authors.toLowerCase().includes(q);
      const matchJournal = (item.journal || '').toLowerCase().includes(q);
      const matchDoi = (item.doi || '').toLowerCase().includes(q);
      const matchFindings = (item.key_findings || '').toLowerCase().includes(q);
      const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthors && !matchJournal && !matchDoi && !matchFindings && !matchTag) {
        return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status: LiteratureStatus, itemId: string) => {
    return (
      <select
        value={status}
        onChange={(e) => updateLiteratureStatus(itemId, e.target.value as LiteratureStatus)}
        className={`text-[11px] font-mono font-medium rounded-lg px-2 py-1 border focus:outline-none transition-colors ${
          status === 'cited_in_thesis'
            ? 'bg-purple-950/70 text-purple-200 border-purple-700 shadow-sm'
            : status === 'summarized'
            ? 'bg-emerald-950/70 text-emerald-200 border-emerald-700 shadow-sm'
            : status === 'reading'
            ? 'bg-amber-950/70 text-amber-200 border-amber-700'
            : 'bg-slate-900 text-slate-400 border-[#1E2230]'
        }`}
      >
        <option value="to_read">Olvasandó (To Read)</option>
        <option value="reading">Olvasás alatt</option>
        <option value="summarized">Kijegyzetelve (Summarized)</option>
        <option value="cited_in_thesis">Szakdogában hivatkozva</option>
      </select>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#161822] to-[#12141D] border border-[#1E2230] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-rose-600/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold tracking-wider uppercase">
                RED LAB LITERATURE HUB
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] font-mono text-slate-400">
                Crossref DOI Varázsló & Beépített PDF Olvasó
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
              Szakirodalom & DOI Cikk-központ
            </h1>

            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              A kutatási szálakat alátámasztó nemzetközi publikációk (Nature, IEEE, Elsevier). 1-kattintásos Crossref DOI
              metaadat-letöltés, BibTeX hivatkozás export, osztott képernyős PDF olvasó és professzori kiemelés.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center space-x-2 transition-all shrink-0 self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Új Cikk Hozzáadása (DOI)</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="p-4 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Összes Publikáció
            </span>
            <BookOpen className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1.5">
            {totalCount}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{toReadCount} elolvasandó</p>
        </div>

        {/* Card 2: Cited */}
        <div className="p-4 rounded-2xl bg-[#12141D] border border-purple-900/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300">
              Szakdogában Idézve
            </span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1.5">
            {citedCount}
          </div>
          <p className="text-[10px] text-purple-300/80 mt-0.5">Irodalomjegyzékbe beépítve</p>
        </div>

        {/* Card 3: Pinned for professor */}
        <div className="p-4 rounded-2xl bg-[#12141D] border border-amber-900/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
              Témavezetőnek Kiemelve
            </span>
            <Pin className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1.5">
            {pinnedCount}
          </div>
          <p className="text-[10px] text-amber-300/80 mt-0.5">Professzori fókusz cikkek</p>
        </div>

        {/* Card 4: Summarized */}
        <div className="p-4 rounded-2xl bg-[#12141D] border border-emerald-900/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              Kijegyzetelve / Kész
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1.5">
            {summarizedCount}
          </div>
          <p className="text-[10px] text-emerald-400/80 mt-0.5">{readingCount} olvasás alatt</p>
        </div>
      </div>

      {/* 2.5 BibTeX Export Toolbar */}
      <BibtexExportToolbar />

      {/* 3. Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#12141D] border border-[#1E2230] space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-rose-950/80 text-rose-200 border border-rose-800/70 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/40'
              }`}
            >
              Minden cikk ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('pinned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'pinned'
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-700 shadow-sm'
                  : 'text-slate-400 hover:text-purple-300 bg-slate-900/40'
              }`}
            >
              <Pin className="w-3.5 h-3.5 text-purple-400" />
              <span>Témavezetői Kiemelés ({pinnedCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('to_read')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'to_read'
                  ? 'bg-rose-950/80 text-rose-200 border border-rose-800/70 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/40'
              }`}
            >
              Elolvasandó ({toReadCount})
            </button>
            <button
              onClick={() => setActiveTab('reading')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'reading'
                  ? 'bg-amber-950/80 text-amber-200 border border-amber-800/70 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/40'
              }`}
            >
              Olvasás alatt ({readingCount})
            </button>
            <button
              onClick={() => setActiveTab('summarized')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'summarized'
                  ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-800/70 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/40'
              }`}
            >
              Jegyzetelve ({summarizedCount})
            </button>
            <button
              onClick={() => setActiveTab('cited_in_thesis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'cited_in_thesis'
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-800/70 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/40'
              }`}
            >
              Szakdogában hivatkozva ({citedCount})
            </button>
          </div>

          {/* Workstream selector */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-slate-400">Szál:</span>
            <select
              value={selectedWorkstream}
              onChange={(e) => setSelectedWorkstream(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">Minden terület</option>
              <option value="wet_lab">Labor (Wet Lab)</option>
              <option value="dry_lab_code">Kód (Dry Lab)</option>
              <option value="cad_hardware">CAD & Hardver</option>
              <option value="thesis_writing">Kéziratírás</option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Keresés cím, szerző, folyóirat, DOI, kulcsszó vagy Key Finding alapján..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* 4. Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isUpvoted = (item.upvotes || []).includes(currentProfile.id);

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-[#12141D] border transition-all shadow-md flex flex-col justify-between space-y-4 ${
                  item.is_pinned_for_professor
                    ? 'border-purple-600/60 ring-2 ring-purple-600/20 shadow-purple-950/30'
                    : 'border-[#1E2230] hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Header: Journal, Pin & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-xs font-mono font-bold text-rose-400 truncate">
                        {item.journal} ({item.publication_year})
                      </span>

                      {item.is_pinned_for_professor && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-200 border border-purple-700 flex items-center gap-1 font-semibold shrink-0 animate-pulse">
                          <Pin className="w-2.5 h-2.5" /> Témavezetői Fókusz
                        </span>
                      )}
                    </div>

                    {getStatusBadge(item.status, item.id)}
                  </div>

                  {/* Paper Title (Clickable to open Split PDF Reader) */}
                  <h3
                    onClick={() => handleOpenReader(item)}
                    className="text-sm font-bold text-white hover:text-rose-400 cursor-pointer transition-colors leading-snug"
                    title="Kattints a beépített osztott PDF olvasó megnyitásához!"
                  >
                    {item.title}
                  </h3>

                  {/* Authors */}
                  <p className="text-xs text-slate-400 mt-1 font-medium">{item.authors}</p>

                  {/* DOI & PDF indicator */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                    {item.doi && (
                      <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                        <span className="text-slate-500 uppercase">DOI:</span>
                        <a
                          href={`https://doi.org/${item.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-400 hover:text-purple-300 hover:underline flex items-center"
                        >
                          {item.doi} <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    )}

                    <button
                      onClick={() => handleOpenReader(item)}
                      className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{item.pdf_storage_path ? 'PDF Csatolva' : 'Olvasás & Jegyzetek'}</span>
                    </button>
                  </div>

                  {/* KEY FINDINGS BOX */}
                  {item.key_findings && (
                    <div className="mt-3 bg-slate-900/70 p-3 rounded-xl border border-rose-900/30">
                      <div className="text-[10px] font-mono uppercase text-rose-400 font-bold mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Kulcsfontosságú Tanulság (Key Findings):
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {item.key_findings}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags.length > 0 && (
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
                  )}
                </div>

                {/* Bottom Card Action Toolbar */}
                <div className="pt-3 border-t border-[#1E2230] flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    {/* Professor pin button */}
                    <button
                      onClick={() => toggleLiteraturePin(item.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        item.is_pinned_for_professor
                          ? 'bg-purple-950/80 text-purple-200 border-purple-700'
                          : 'bg-slate-900 text-slate-500 border-[#1E2230] hover:text-purple-300'
                      }`}
                      title="Kiemelés a témavezetőnek"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {/* Upvote button */}
                    <button
                      onClick={() => toggleLiteratureUpvote(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors border ${
                        isUpvoted
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800/50'
                          : 'bg-slate-900 text-slate-400 border-[#1E2230] hover:text-white'
                      }`}
                      title="Kutatási hasznosság szavazat"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{(item.upvotes || []).length}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center space-x-2">
                    {/* AI Summarize Paper */}
                    <button
                      onClick={() => setAiSummaryPaper(item)}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600/30 to-rose-600/30 hover:from-red-600/50 hover:to-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-semibold flex items-center space-x-1 transition-all shadow-sm"
                      title="AI Kulcsmegállapítások szintézise (Gemini 2.5 Flash)"
                    >
                      <Sparkles className="w-3 h-3 text-rose-400" />
                      <span>AI Szintézis</span>
                    </button>

                    {/* Read split view button */}
                    <button
                      onClick={() => handleOpenReader(item)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1 transition-colors border border-slate-700"
                    >
                      <BookOpen className="w-3 h-3 text-emerald-400" />
                      <span>PDF Olvasó</span>
                    </button>

                    {/* Copy BibTeX */}
                    {item.bibtex_citation && (
                      <button
                        onClick={() => handleCopyBibtex(item)}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium flex items-center space-x-1 transition-colors border border-rose-800/40"
                        title="BibTeX formátum másolása"
                      >
                        <Copy className="w-3 h-3 text-rose-400" />
                        <span>BibTeX</span>
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => deleteLiteratureItem(item.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Publikáció törlése"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 rounded-2xl bg-[#12141D] border border-dashed border-[#1E2230] p-8 space-y-3">
            <RedLabLogo variant="icon" size="md" className="mx-auto opacity-75" />
            <h4 className="text-sm font-bold text-white">Nincs találat a szűrésnek megfelelően</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Próbálj más szűrőt vagy adj hozzá egy új tudományos cikket a DOI varázslóval!
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              + Új Publikáció Hozzáadása
            </button>
          </div>
        )}
      </div>

      {/* 5. Modals */}
      <AddLiteratureModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <SplitPdfReaderModal
        item={readingItem}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
      />

      <AiCopilotModal
        isOpen={Boolean(aiSummaryPaper)}
        onClose={() => setAiSummaryPaper(null)}
        mode="summarize_paper"
        initialData={{ paper: aiSummaryPaper || undefined }}
      />
    </div>
  );
}
