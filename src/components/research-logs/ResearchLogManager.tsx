'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { ResearchLog, WorkstreamType, RepositoryFile } from '@/types';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  Calendar,
  Tag,
  Paperclip,
  Trash2,
  Code,
  Sliders,
  X,
  FileText,
  User,
  Eye,
  Edit3,
  Copy,
  Download,
  CheckCircle2,
  Check,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  Timer,
} from 'lucide-react';
import { LiveLabTimerWidget } from '@/components/logs/LiveLabTimerWidget';
import { formatDateOnlyHungarian, triggerFileDownload, formatBytes } from '@/lib/utils';
import { toast } from 'sonner';

interface ParamRow {
  key: string;
  value: string;
}

const PRESET_PARAMETERS = [
  { key: 'Áramlási sebesség (folytonos)', value: '15 µL/min' },
  { key: 'Áramlási sebesség (diszpergált)', value: '2.5 µL/min' },
  { key: 'Hőmérséklet', value: '37 °C' },
  { key: 'Kamranyomás', value: '0.3 mbar' },
  { key: 'Max Courant szám', value: '0.38' },
  { key: 'Cellaszám', value: '1 250 000' },
  { key: 'Mért kontakt szög', value: '108.4 deg' },
  { key: 'Reynolds-szám', value: '4.2' },
];

/**
 * Clean custom Markdown renderer for research logs
 * Handles headers, bold, bullet points, blockquotes, code blocks, and inline code
 */
function MarkdownViewer({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // H3: ###
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-white mt-2 mb-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 shrink-0" />
              {parseInlineFormatting(trimmed.substring(4))}
            </h4>
          );
        }

        // H2: ##
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-base font-bold text-rose-300 mt-3 mb-1.5 border-b border-[#1E2230] pb-1">
              {parseInlineFormatting(trimmed.substring(3))}
            </h3>
          );
        }

        // H1: #
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="text-lg font-extrabold text-white mt-3 mb-2">
              {parseInlineFormatting(trimmed.substring(2))}
            </h2>
          );
        }

        // Bullet item: - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="text-rose-500 text-xs font-bold leading-relaxed select-none">•</span>
              <div className="flex-1">{parseInlineFormatting(trimmed.substring(2))}</div>
            </div>
          );
        }

        // Blockquote: >
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-rose-500/60 pl-3 py-1 bg-rose-950/20 text-slate-300 italic rounded-r-lg my-1 font-serif text-xs"
            >
              {parseInlineFormatting(trimmed.substring(2))}
            </blockquote>
          );
        }

        // Code block: ```
        if (trimmed.startsWith('```')) {
          return null; // Handle code lines cleanly
        }

        return <p key={idx}>{parseInlineFormatting(line)}</p>;
      })}
    </div>
  );
}

/**
 * Parses bold (**text**), inline code (`text`), and italic (*text*)
 */
function parseInlineFormatting(text: string): React.ReactNode {
  // Regex to match **bold** or `code`
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    const codeMatch = remaining.match(/`(.*?)`/);

    let firstMatchIndex = -1;
    let matchType: 'bold' | 'code' | null = null;
    let matchLength = 0;
    let matchedText = '';

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatchIndex = boldMatch.index;
      matchType = 'bold';
      matchLength = boldMatch[0].length;
      matchedText = boldMatch[1];
    }

    if (codeMatch && codeMatch.index !== undefined) {
      if (firstMatchIndex === -1 || codeMatch.index < firstMatchIndex) {
        firstMatchIndex = codeMatch.index;
        matchType = 'code';
        matchLength = codeMatch[0].length;
        matchedText = codeMatch[1];
      }
    }

    if (firstMatchIndex === -1 || matchType === null) {
      parts.push(remaining);
      break;
    }

    // Add string before match
    if (firstMatchIndex > 0) {
      parts.push(remaining.substring(0, firstMatchIndex));
    }

    // Add formatted element
    if (matchType === 'bold') {
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-bold text-white">
          {matchedText}
        </strong>
      );
    } else if (matchType === 'code') {
      parts.push(
        <code
          key={`c-${keyIdx++}`}
          className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/80 font-mono text-[11px] text-rose-300 font-semibold"
        >
          {matchedText}
        </code>
      );
    }

    remaining = remaining.substring(firstMatchIndex + matchLength);
  }

  return parts;
}

export function ResearchLogManager() {
  const {
    researchLogs,
    addResearchLog,
    deleteResearchLog,
    repositoryFiles,
    currentProfile,
    profiles,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkstream, setSelectedWorkstream] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Check URL query parameters to auto-launch timer
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('timer=start')) {
      setIsTimerOpen(true);
    }
  }, []);

  // New log form state
  const [modalTab, setModalTab] = useState<'edit' | 'preview'>('edit');
  const [title, setTitle] = useState('');
  const [logDate, setLogDate] = useState('2026-10-18');
  const [workstream, setWorkstream] = useState<WorkstreamType>('wet_lab');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [parameterRows, setParameterRows] = useState<ParamRow[]>([
    { key: 'Áramlási sebesség', value: '15 µL/min' },
    { key: 'Hőmérséklet', value: '37 °C' },
  ]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return researchLogs.filter((log) => {
      if (selectedWorkstream !== 'all' && log.workstream !== selectedWorkstream) return false;
      if (selectedAuthor !== 'all' && log.author_name !== selectedAuthor) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = log.title.toLowerCase().includes(q);
        const matchContent = log.content_markdown.toLowerCase().includes(q);
        const matchParams = Object.entries(log.parameters_json || {}).some(
          ([k, v]) => k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)
        );
        if (!matchTitle && !matchContent && !matchParams) return false;
      }
      return true;
    });
  }, [researchLogs, selectedWorkstream, selectedAuthor, searchQuery]);

  const getWorkstreamBadge = (ws: WorkstreamType) => {
    switch (ws) {
      case 'wet_lab':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            Wet Lab (Labor & Mikrofluidika)
          </span>
        );
      case 'dry_lab_code':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60">
            Dry Lab & Szimuláció (Domi)
          </span>
        );
      case 'cad_hardware':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60">
            CAD & Hardver (.stl)
          </span>
        );
      case 'thesis_writing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
            Szakdolgozat Kézirat & Sablon
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
            Általános
          </span>
        );
    }
  };

  const handleAddParamRow = () => {
    setParameterRows((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveParamRow = (index: number) => {
    setParameterRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyPreset = (preset: { key: string; value: string }) => {
    // Check if key already exists
    const exists = parameterRows.some((r) => r.key === preset.key);
    if (!exists) {
      setParameterRows((prev) => [...prev, { key: preset.key, value: preset.value }]);
    } else {
      toast.info(`A(z) "${preset.key}" paraméter már szerepel a listában.`);
    }
  };

  const handleToggleFileSelection = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleInsertMarkdownSnippet = (snippet: string) => {
    setContentMarkdown((prev) => prev + (prev.endsWith('\n') ? '' : '\n') + snippet);
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentMarkdown.trim()) {
      toast.error('Kérlek töltsd ki a címet és a napló szövegét!');
      return;
    }

    const parameters: Record<string, string | number> = {};
    parameterRows.forEach((r) => {
      if (r.key.trim()) {
        parameters[r.key.trim()] = r.value.trim();
      }
    });

    addResearchLog({
      title: title.trim(),
      log_date: logDate,
      workstream,
      content_markdown: contentMarkdown.trim(),
      parameters_json: parameters,
      linked_file_ids: selectedFileIds,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setContentMarkdown('');
    setSelectedFileIds([]);
    setParameterRows([
      { key: 'Áramlási sebesség', value: '15 µL/min' },
      { key: 'Hőmérséklet', value: '37 °C' },
    ]);
  };

  const handleCopyMarkdown = (log: ResearchLog) => {
    const paramsText = Object.entries(log.parameters_json || {})
      .map(([k, v]) => `- **${k}**: \`${v}\``)
      .join('\n');

    const markdownToCopy = `# ${log.title}\n**Dátum:** ${log.log_date} | **Szerző:** ${log.author_name} | **Terület:** ${log.workstream}\n\n### Mért Paraméterek:\n${paramsText || 'Nincs rögzített paraméter'}\n\n${log.content_markdown}`;

    navigator.clipboard.writeText(markdownToCopy);
    toast.success('Naplóbejegyzés vágólapra másolva Markdown formátumban! 📋');
  };

  const handleDownloadAttachedFile = (file: RepositoryFile) => {
    triggerFileDownload(
      file.file_name,
      `# RED Lab Kísérleti Melléklet: ${file.file_name}\n# Verzió: v${file.version_number}\n# Commit: ${file.commit_message}\n# Feltöltő: ${file.uploaded_by_name}`
    );
    toast.success(`Csatolt fájl letöltve: ${file.file_name} (v${file.version_number})`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/40 flex items-center">
              <FlaskConical className="w-3.5 h-3.5 mr-1 text-rose-400" />
              DIGITÁLIS KUTATÁSI NAPLÓ (ELN)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Elektronikus Laboratóriumi & Szimulációs Jegyzetfüzet
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Kísérleti & Szimulációs Kutatási Napló
          </h1>

          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Időrendi kutatási napló a nedves-laboratóriumi (wet-lab) mérésekről, mikrofluidikai cseppformálásról,
            OpenFOAM szimulációkról és a szakdolgozati eredményekről. Támogatja a gazdag Markdown formázást,
            kulcs-érték alapú fizikai paramétereket (`Áramlási sebesség`, `Hőmérséklet`, `Nyomás`), valamint
            a Fájltárban tárolt állományok becsatolását.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsTimerOpen(!isTimerOpen)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
              isTimerOpen
                ? 'bg-rose-950/80 text-rose-300 border-rose-700 shadow-md shadow-rose-950/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Timer className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>{isTimerOpen ? 'Stopper Elrejtése' : '⏱️ Élő Kísérleti Stopper'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-xs shadow-lg shadow-rose-950/50 flex items-center space-x-2 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Új Naplóbejegyzés</span>
          </button>
        </div>
      </div>

      {/* Live Lab Timer & Protocol Runner Widget */}
      {isTimerOpen && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <LiveLabTimerWidget onSaved={() => setIsTimerOpen(false)} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-[#12141D] border border-[#1E2230]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Workstream Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Terület:</span>
            <select
              value={selectedWorkstream}
              onChange={(e) => setSelectedWorkstream(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">Minden terület ({researchLogs.length})</option>
              <option value="wet_lab">Wet Lab (Laboratórium & Mikrofluidika)</option>
              <option value="dry_lab_code">Dry Lab (Szimuláció & ML)</option>
              <option value="cad_hardware">CAD & Hardver (.stl)</option>
              <option value="thesis_writing">Szakdolgozat Kézirat</option>
            </select>
          </div>

          {/* Author Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Szerző:</span>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">Minden kutató</option>
              <option value="Robin">Robin (Szakdolgozat)</option>
              <option value="Emma">Emma (Wet Lab)</option>
              <option value="Domi">Domi (Dry Lab / CFD)</option>
              <option value="Prof. Dr. Kovács Gergely">Prof. Dr. Kovács Gergely</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 lg:max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Keresés naplócím, Markdown szöveg vagy paraméter szerint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Logs Stream */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#12141D] border border-dashed border-[#1E2230] space-y-3">
          <FlaskConical className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Nincs találat a szűrési feltételeknek megfelelően</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Próbáld törölni a szűrőket vagy hozz létre egy új kísérleti bejegyzést.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const linkedFiles = repositoryFiles.filter((f) => log.linked_file_ids.includes(f.id));

            return (
              <div
                key={log.id}
                className="p-6 rounded-2xl bg-[#12141D] border border-[#1E2230] hover:border-slate-700 transition-all shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2230]">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-[#1E2230] shrink-0 text-rose-500">
                      <FlaskConical className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-base font-bold text-white hover:text-rose-400 transition-colors">
                        {log.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="flex items-center text-slate-300 font-mono text-[11px]" suppressHydrationWarning>
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          {formatDateOnlyHungarian(log.log_date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center text-slate-300">
                          <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          Szerző: <strong className="ml-1 text-white">{log.author_name}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Quick Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {getWorkstreamBadge(log.workstream)}

                    <button
                      onClick={() => handleCopyMarkdown(log)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                      title="Markdown másolása vágólapra"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteResearchLog(log.id)}
                      className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Naplóbejegyzés törlése"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Structured Parameters Grid */}
                {Object.keys(log.parameters_json || {}).length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-[#1E2230]">
                    <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center mb-2.5">
                      <Sliders className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                      Mért / Számított Főbb Paraméterek:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
                      {Object.entries(log.parameters_json).map(([k, v]) => (
                        <div
                          key={k}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors"
                        >
                          <span className="text-[10px] font-mono text-slate-500 block truncate mb-0.5">{k}</span>
                          <span className="font-mono text-slate-100 font-bold text-xs truncate block">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Markdown Rendered Content */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-[#1E2230]">
                  <MarkdownViewer content={log.content_markdown} />
                </div>

                {/* Linked Files Section */}
                {linkedFiles.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1E2230]/70 text-xs">
                    <span className="text-slate-400 flex items-center text-[11px] font-mono mr-1">
                      <Paperclip className="w-3.5 h-3.5 mr-1 text-rose-400" />
                      Kapcsolt Repozitóriumi Állományok:
                    </span>
                    {linkedFiles.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handleDownloadAttachedFile(f)}
                        className="group flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                        title="Fájl letöltése"
                      >
                        <span className="text-rose-400 font-mono text-[10px] font-bold">
                          v{f.version_number}
                        </span>
                        <span className="font-medium text-xs text-white group-hover:text-rose-300">
                          {f.file_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({formatBytes(f.file_size_bytes)})
                        </span>
                        <Download className="w-3 h-3 text-slate-400 group-hover:text-white ml-0.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD RESEARCH LOG MODAL (Rich Markdown + Dynamic Parameters + File Link) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">
                  Új Kísérleti & Szimulációs Naplóbejegyzés
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Bejegyzés Címe *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="pl. Fluoreszcens mikroszkópos droplet sebességmérés és PDMS plazmatisztítás #43"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Workstream & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-mono uppercase block mb-1">
                    Kutatási Terület (Workstream) *
                  </label>
                  <select
                    value={workstream}
                    onChange={(e) => setWorkstream(e.target.value as WorkstreamType)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="wet_lab">Wet Lab (Labor & Biomikrofluidika)</option>
                    <option value="dry_lab_code">Dry Lab (CFD & Neurális Háló)</option>
                    <option value="cad_hardware">CAD & Hardware Fabrikáció</option>
                    <option value="thesis_writing">Szakdolgozat Kézirat & Sablon</option>
                    <option value="general">Általános kutatási összefoglaló</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono uppercase block mb-1">
                    Kísérlet Dátuma *
                  </label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Dynamic Structured Parameters */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mért / Számított Főbb Paraméterek (Kulcs-Érték Párok)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddParamRow}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-[11px] font-medium flex items-center space-x-1 border border-rose-900/40"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Új paraméter</span>
                  </button>
                </div>

                {/* Quick Preset Buttons */}
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-1.5">
                    Gyakori paraméterek gyors hozzáadása:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PARAMETERS.map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700 transition-colors"
                      >
                        + {preset.key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parameter Rows List */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {parameterRows.map((row, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Paraméter neve (pl. Áramlási sebesség)"
                        value={row.key}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParameterRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, key: val } : r))
                          );
                        }}
                        className="flex-1 p-2 rounded-lg bg-slate-900 border border-[#1E2230] text-slate-200 text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Érték (pl. 15 µL/min)"
                        value={row.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParameterRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, value: val } : r))
                          );
                        }}
                        className="flex-1 p-2 rounded-lg bg-slate-900 border border-[#1E2230] text-slate-200 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveParamRow(idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Markdown Editor with Tabs (Edit vs Preview) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-mono uppercase block">
                    Kísérleti Napló Szövege (Markdown támogatással) *
                  </label>

                  <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-900 border border-[#1E2230]">
                    <button
                      type="button"
                      onClick={() => setModalTab('edit')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center space-x-1 ${
                        modalTab === 'edit'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Szerkesztés</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalTab('preview')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center space-x-1 ${
                        modalTab === 'preview'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Élő Előnézet</span>
                    </button>
                  </div>
                </div>

                {/* Markdown Quick Snippet Buttons */}
                {modalTab === 'edit' && (
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdownSnippet('### Kísérleti Elrendezés és Cél\n')}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      # Címsor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdownSnippet('**Félkövér kiemelés** ')}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      **Félkövér**
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdownSnippet('- Mérési pont #1: stabil cseppképződés\n')}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      • Lista
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdownSnippet('> Megfigyelés: A szilanozott felület nem mutatott hidrofób regenerációt.\n')}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 italic"
                    >
                      &quot; Idézet
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdownSnippet('`flow_rate = 15.0` ')}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono"
                    >
                      `Kód`
                    </button>
                  </div>
                )}

                {modalTab === 'edit' ? (
                  <textarea
                    rows={6}
                    required
                    value={contentMarkdown}
                    onChange={(e) => setContentMarkdown(e.target.value)}
                    placeholder="### Kísérleti Elrendezés és Megfigyelések&#10;A mért adatok alapján az áramlási sebesség 15 µL/min mellett lamináris maradt.&#10;- Megfigyelés 1: Egyenletes, 45 µm átmérőjű cseppképződés&#10;- Megfigyelés 2: A Navier-Stokes szimuláció kiválóan fedi a kísérleti pontokat."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 font-mono text-xs focus:outline-none focus:border-rose-500 leading-relaxed"
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-[#1E2230] min-h-[140px] max-h-56 overflow-y-auto">
                    {contentMarkdown.trim() ? (
                      <MarkdownViewer content={contentMarkdown} />
                    ) : (
                      <span className="text-slate-500 italic">Nincs még megadva szöveg az előnézethez.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Linked Files Selector from File Vault */}
              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Kapcsolódó Fájlok Csatolása a Fájltárból
                </label>
                <div className="p-3 rounded-xl bg-slate-900 border border-[#1E2230] max-h-36 overflow-y-auto space-y-1.5">
                  {repositoryFiles.map((f) => {
                    const isSelected = selectedFileIds.includes(f.id);
                    return (
                      <div
                        key={f.id}
                        onClick={() => handleToggleFileSelection(f.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? 'bg-rose-950/40 border border-rose-800/60 text-white'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-rose-500 focus:ring-0 bg-slate-900 border-slate-700"
                          />
                          <span className="font-mono text-[10px] text-rose-400 font-bold">
                            v{f.version_number}
                          </span>
                          <span className="truncate">{f.file_name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                          {formatBytes(f.file_size_bytes)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1E2230]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-md shadow-rose-950/40"
                >
                  Naplóbejegyzés Rögzítése
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
