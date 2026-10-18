'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ResearchLog, WorkstreamType } from '@/types';
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
} from 'lucide-react';
import { formatDateOnlyHungarian } from '@/lib/utils';
import { toast } from 'sonner';

export function ResearchLogManager() {
  const {
    researchLogs,
    addResearchLog,
    deleteResearchLog,
    repositoryFiles,
    currentProfile,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkstream, setSelectedWorkstream] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New log form state
  const [title, setTitle] = useState('');
  const [logDate, setLogDate] = useState('2026-10-18');
  const [workstream, setWorkstream] = useState<WorkstreamType>('wet_lab');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [paramKey1, setParamKey1] = useState('flow_rate');
  const [paramVal1, setParamVal1] = useState('2.5 µl/min');
  const [paramKey2, setParamKey2] = useState('temperature');
  const [paramVal2, setParamVal2] = useState('37 °C');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const filteredLogs = researchLogs.filter((log) => {
    if (selectedWorkstream !== 'all' && log.workstream !== selectedWorkstream) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = log.title.toLowerCase().includes(q);
      const matchContent = log.content_markdown.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }
    return true;
  });

  const getWorkstreamBadge = (ws: WorkstreamType) => {
    switch (ws) {
      case 'wet_lab':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/40">Wet Lab (Emma)</span>;
      case 'dry_lab_code':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-950/80 text-orange-300 border border-orange-800/40">Dry Lab & ML (Domi)</span>;
      case 'cad_hardware':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/40">CAD & Hardware</span>;
      case 'thesis_writing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800/40">Kézirat & Sablon</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800">Általános</span>;
    }
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentMarkdown.trim()) return;

    const parameters: Record<string, string | number> = {};
    if (paramKey1.trim()) parameters[paramKey1.trim()] = paramVal1.trim();
    if (paramKey2.trim()) parameters[paramKey2.trim()] = paramVal2.trim();

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
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40">
              DIGITÁLIS KUTATÁSI NAPLÓ (ELN)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Elektronikus Laboratóriumi & Szimulációs Füzet
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Laboratóriumi & Szimulációs Kutatási Napló
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            A kísérleti protokollok, fizikai paraméterek (áramlás, nyomás, koncentráció, hálósűrűség)
            és numerikus futások strukturált, auditálható rögzítése kapcsolt forrásfájlokkal.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Új Naplóbejegyzés</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#12141D] border border-[#1E2230]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Workstream:
          </span>
          <select
            value={selectedWorkstream}
            onChange={(e) => setSelectedWorkstream(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="all">Minden terület ({researchLogs.length})</option>
            <option value="wet_lab">Wet Lab (Laboratórium & Mikrofluidika)</option>
            <option value="dry_lab_code">Dry Lab (Szimuláció & ML)</option>
            <option value="cad_hardware">CAD & Hardware</option>
            <option value="thesis_writing">Kézirat & Sablon</option>
          </select>
        </div>

        <div className="relative flex-1 sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Keresés naplóbejegyzések között..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Logs Stream */}
      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const linkedFiles = repositoryFiles.filter((f) => log.linked_file_ids.includes(f.id));
          return (
            <div
              key={log.id}
              className="p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] hover:border-slate-700 transition-all shadow-sm space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E2230]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-[#1E2230]">
                    <FlaskConical className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{log.title}</h3>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center" suppressHydrationWarning>
                        <Calendar className="w-3 h-3 mr-1 text-slate-500" />
                        {formatDateOnlyHungarian(log.log_date)}
                      </span>
                      <span>•</span>
                      <span>Szerző: <strong className="text-slate-300">{log.author_name}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getWorkstreamBadge(log.workstream)}
                  <button
                    onClick={() => deleteResearchLog(log.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400"
                    title="Bejegyzés törlése"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Parameters Grid */}
              {Object.keys(log.parameters_json).length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E2230]">
                  <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center mb-2">
                    <Sliders className="w-3.5 h-3.5 mr-1 text-amber-400" />
                    Kísérleti & Szimulációs Paraméterek:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {Object.entries(log.parameters_json).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 block truncate">{k}</span>
                        <span className="font-mono text-slate-200 font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Markdown Content */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/30 p-4 rounded-xl border border-[#1E2230] whitespace-pre-line font-sans">
                {log.content_markdown}
              </div>

              {/* Linked Files */}
              {linkedFiles.length > 0 && (
                <div className="flex items-center space-x-2 text-xs text-slate-400 pt-2 border-t border-[#1E2230]/60">
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span>Kapcsolt repó fájlok:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {linkedFiles.map((f) => (
                      <span
                        key={f.id}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-rose-300 border border-slate-700"
                      >
                        {f.file_name} ({f.version_number ? `v${f.version_number}` : 'v1'})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Research Log Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <h3 className="text-base font-bold text-white flex items-center">
                <FlaskConical className="w-5 h-5 text-rose-500 mr-2" />
                Új Kísérleti / Szimulációs Naplóbejegyzés
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Bejegyzés Címe *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="pl. Fluoreszcens mikroszkópos droplet sebességmérés #43"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-mono uppercase block mb-1">
                    Kutatási Terület (Workstream)
                  </label>
                  <select
                    value={workstream}
                    onChange={(e) => setWorkstream(e.target.value as WorkstreamType)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="wet_lab">Wet Lab (Labor & Biomikrofluidika)</option>
                    <option value="dry_lab_code">Dry Lab (CFD & Neurális Háló)</option>
                    <option value="cad_hardware">CAD & Hardware Fabrikáció</option>
                    <option value="thesis_writing">Kézirat & Sablon</option>
                    <option value="general">Általános</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono uppercase block mb-1">
                    Kísérlet Dátuma
                  </label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Parameters Input */}
              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Mért / Számított Főbb Paraméterek (Kulcs-Érték)
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={paramKey1}
                    onChange={(e) => setParamKey1(e.target.value)}
                    placeholder="Paraméter 1 kulcs"
                    className="p-2 rounded-lg bg-slate-900 border border-[#1E2230] text-slate-200 font-mono"
                  />
                  <input
                    type="text"
                    value={paramVal1}
                    onChange={(e) => setParamVal1(e.target.value)}
                    placeholder="Paraméter 1 érték"
                    className="p-2 rounded-lg bg-slate-900 border border-[#1E2230] text-slate-200 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={paramKey2}
                    onChange={(e) => setParamKey2(e.target.value)}
                    placeholder="Paraméter 2 kulcs"
                    className="p-2 rounded-lg bg-slate-900 border border-[#1E2230] text-slate-200 font-mono"
                  />
                  <input
                    type="text"
                    value={paramVal2}
                    onChange={(e) => setParamVal2(e.target.value)}
                    placeholder="Paraméter 2 érték"
                    className="p-2 rounded-lg bg-slate-900 border border-[#1E2230] text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Markdown Content */}
              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Kísérleti Napló Szövege (Markdown formátum) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  placeholder="### Kísérleti Elrendezés és Megfigyelések&#10;A mért adatok alapján a Reynolds-szám..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-md shadow-rose-950/40"
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
