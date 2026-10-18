'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { RepositoryFile, WorkstreamType } from '@/types';
import {
  FolderGit2,
  FileCode2,
  FileSpreadsheet,
  FileBox,
  FileText,
  Upload,
  Download,
  History,
  Search,
  Filter,
  Plus,
  GitCommit,
  CheckCircle2,
  X,
} from 'lucide-react';
import { formatBytes, formatDateHungarian } from '@/lib/utils';
import { toast } from 'sonner';

interface FileManagerProps {
  openAddFileModal: () => void;
}

export function FileManager({ openAddFileModal }: FileManagerProps) {
  const { repositoryFiles, uploadFileVersion, currentProfile } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [commitMessageInput, setCommitMessageInput] = useState('');

  // Group files by file_group_key
  const groupKeys = Array.from(new Set(repositoryFiles.map((f) => f.file_group_key)));

  const filteredGroupKeys = groupKeys.filter((groupKey) => {
    const filesInGroup = repositoryFiles.filter((f) => f.file_group_key === groupKey);
    const latest = filesInGroup.find((f) => f.is_latest) || filesInGroup[0];
    if (!latest) return false;

    if (selectedCategory !== 'all' && latest.folder_category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = latest.file_name.toLowerCase().includes(q);
      const matchCommit = filesInGroup.some((f) => f.commit_message.toLowerCase().includes(q));
      if (!matchName && !matchCommit) return false;
    }
    return true;
  });

  const getCategoryIcon = (category: WorkstreamType) => {
    switch (category) {
      case 'dry_lab_code':
        return <FileCode2 className="w-5 h-5 text-blue-400" />;
      case 'cad_hardware':
        return <FileBox className="w-5 h-5 text-purple-400" />;
      case 'wet_lab':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'thesis_writing':
      default:
        return <FileText className="w-5 h-5 text-rose-400" />;
    }
  };

  const getCategoryLabel = (category: WorkstreamType) => {
    switch (category) {
      case 'dry_lab_code':
        return 'Forráskód / Szkript';
      case 'cad_hardware':
        return 'CAD / 3D Modell';
      case 'wet_lab':
        return 'Laboratóriumi Adatsor';
      case 'thesis_writing':
        return 'Szakdolgozat Kézirat';
      default:
        return 'Dokumentum';
    }
  };

  const handleDownload = (fileName: string, versionNumber: number) => {
    toast.success(`Fájl letöltése elindult: ${fileName} (v${versionNumber})`, {
      description: 'A tudományos állomány közvetlen elérése ellenőrizve.',
    });
  };

  const selectedGroupFiles = selectedGroupKey
    ? repositoryFiles.filter((f) => f.file_group_key === selectedGroupKey)
    : [];
  const latestSelectedFile = selectedGroupFiles.find((f) => f.is_latest) || selectedGroupFiles[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40">
              SUPABASE SCIENTIFIC REPO
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Triggerek által automatikusan verziózott állományok
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Fájl- és Verziókezelő Repozitórium
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Szakdolgozati kéziratok, OpenFOAM CFD szkriptek, CAD öntőformák (.stl) és mérési nyersadatok (.csv)
            verziókövetése GitHub-stílusú automatikus `handle_file_versioning` triggerrel.
          </p>
        </div>

        <button
          onClick={openAddFileModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Új Tudományos Fájl Regisztrálása</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#12141D] border border-[#1E2230]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Kategória:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="all">Minden kategória</option>
            <option value="thesis_writing">Szakdolgozat Kéziratok</option>
            <option value="cad_hardware">CAD & 3D Modellek</option>
            <option value="dry_lab_code">Szimulációs Kódok & Szkriptek</option>
            <option value="wet_lab">Laboratóriumi Adatsorok</option>
          </select>
        </div>

        <div className="relative flex-1 sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Keresés fájlnév vagy commit üzenet alapján..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Files List Grouped by file_group_key */}
      <div className="space-y-4">
        {filteredGroupKeys.map((groupKey) => {
          const filesInGroup = repositoryFiles
            .filter((f) => f.file_group_key === groupKey)
            .sort((a, b) => b.version_number - a.version_number);
          const latest = filesInGroup.find((f) => f.is_latest) || filesInGroup[0];

          return (
            <div
              key={groupKey}
              className="p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] hover:border-slate-700 transition-all shadow-sm space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-[#1E2230] shrink-0">
                    {getCategoryIcon(latest.folder_category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white hover:text-rose-400 transition-colors">
                        {latest.file_name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-rose-950/80 text-rose-300 border border-rose-800/40">
                        v{latest.version_number} (Latest)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {getCategoryLabel(latest.folder_category)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{latest.commit_message}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedGroupKey(groupKey);
                      setCommitMessageInput(`v${latest.version_number + 1}: Témavezetői javítások beépítése`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-400" />
                    <span>Új Verzió Commit (v{latest.version_number + 1})</span>
                  </button>
                  <button
                    onClick={() => handleDownload(latest.file_name, latest.version_number)}
                    className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition-colors"
                    title="Legfrissebb változat letöltése"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Version History Table */}
              <div className="pt-3 border-t border-[#1E2230]">
                <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 mb-2.5">
                  <span className="flex items-center">
                    <History className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    Verziótörténet & Commit Log ({filesInGroup.length} revízió)
                  </span>
                </div>

                <div className="space-y-2">
                  {filesInGroup.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 rounded-xl bg-slate-900/40 border border-[#1E2230] flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono font-bold text-rose-400 text-[11px] px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-900/40">
                          v{file.version_number}
                        </span>
                        {file.is_latest && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            LATEST
                          </span>
                        )}
                        <span className="text-slate-300">{file.commit_message}</span>
                      </div>

                      <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400 shrink-0">
                        <span>{file.uploaded_by_name || 'Kutató'}</span>
                        <span>{formatBytes(file.file_size_bytes)}</span>
                        <span suppressHydrationWarning>{formatDateHungarian(file.created_at)}</span>
                        <button
                          onClick={() => handleDownload(file.file_name, file.version_number)}
                          className="text-slate-400 hover:text-white"
                          title="Ezen változat letöltése"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload New Version Modal */}
      {selectedGroupKey && latestSelectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Upload className="w-4 h-4 text-rose-500 mr-2" />
                Új Verzió Feltöltése & Automata Triggerezés
              </h3>
              <button
                onClick={() => setSelectedGroupKey(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Állomány: <strong className="text-white">{latestSelectedFile.file_name}</strong>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Következő verzió: <strong className="text-rose-400">v{latestSelectedFile.version_number + 1}</strong>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Commit Üzenet *
              </label>
              <textarea
                rows={3}
                required
                value={commitMessageInput}
                onChange={(e) => setCommitMessageInput(e.target.value)}
                placeholder="Részletezd, milyen paraméterek vagy fejezetek változtak ebben a revízióban..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-4 border border-dashed border-[#1E2230] rounded-xl text-center text-xs text-slate-400 bg-slate-900/30">
              <Upload className="w-5 h-5 mx-auto mb-1 text-slate-500" />
              <span>Fájl tallózása vagy idehúzása (Supabase Storage upload)</span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1E2230]">
              <button
                onClick={() => setSelectedGroupKey(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Mégse
              </button>
              <button
                onClick={() => {
                  if (commitMessageInput.trim()) {
                    uploadFileVersion(
                      latestSelectedFile.file_group_key,
                      latestSelectedFile.file_name,
                      latestSelectedFile.folder_category,
                      commitMessageInput.trim()
                    );
                    setSelectedGroupKey(null);
                  }
                }}
                disabled={!commitMessageInput.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 disabled:opacity-50"
              >
                Commit & Verzió Emelése
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
