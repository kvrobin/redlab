'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { LabFile, FileCategory, WorkstreamId } from '@/types';
import {
  FolderGit2,
  FileCode2,
  FileSpreadsheet,
  FileBox,
  FileText,
  Upload,
  Download,
  History,
  Tag,
  Search,
  Filter,
  Plus,
  GitCommit,
  Clock,
  User,
  X,
  File,
} from 'lucide-react';
import { formatBytes, formatDateHungarian } from '@/lib/utils';
import { toast } from 'sonner';

interface FileManagerProps {
  openAddFileModal: () => void;
}

export function FileManager({ openAddFileModal }: FileManagerProps) {
  const { labFiles, uploadFileVersion, currentUser } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileForVersion, setSelectedFileForVersion] = useState<LabFile | null>(null);
  const [newVersionInput, setNewVersionInput] = useState('');
  const [changelogInput, setChangelogInput] = useState('');

  const filteredFiles = labFiles.filter((file) => {
    if (selectedCategory !== 'all' && file.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = file.name.toLowerCase().includes(q);
      const matchDesc = file.description.toLowerCase().includes(q);
      const matchTag = file.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'code':
        return <FileCode2 className="w-5 h-5 text-blue-400" />;
      case 'cad':
        return <FileBox className="w-5 h-5 text-purple-400" />;
      case 'data':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'thesis':
      case 'presentation':
      default:
        return <FileText className="w-5 h-5 text-rose-400" />;
    }
  };

  const getCategoryLabel = (category: FileCategory) => {
    switch (category) {
      case 'code':
        return 'Forráskód / Szkript';
      case 'cad':
        return 'CAD / 3D Modell';
      case 'data':
        return 'Nyers Kísérleti Adat';
      case 'thesis':
        return 'Szakdolgozat Kézirat';
      case 'microscopy':
        return 'Mikroszkópos TIFF';
      case 'presentation':
        return 'Prezentáció';
      default:
        return 'Dokumentum';
    }
  };

  const handleDownload = (fileName: string, version: string) => {
    toast.success(`Fájl letöltése elindult: ${fileName} (${version})`, {
      description: 'A tudományos állomány közvetlen elérése ellenőrizve.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40">
              SCIENTIFIC GIT REPO & STORAGE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Verziózott Laboratóriumi Állományok
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Fájl- és Verziókezelő Repozitórium
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Szakdolgozati kéziratok, OpenFOAM CFD szkriptek, CAD öntőformák (.stl) és mérési nyersadatok (.csv)
            verziókövetése és auditálása commit-hash azonosítókkal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddFileModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-xs shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Új Tudományos Fájl Regisztrálása</span>
          </button>
        </div>
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
            <option value="all">Minden kategória ({labFiles.length})</option>
            <option value="thesis">Szakdolgozat Kéziratok</option>
            <option value="cad">CAD & 3D Modellek</option>
            <option value="code">Szimulációs Kódok & Szkriptek</option>
            <option value="data">Mérési Adatsorok (.csv)</option>
            <option value="presentation">Prezentációk</option>
          </select>
        </div>

        <div className="relative flex-1 sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Keresés fájlnév, leírás vagy tag alapján..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-[#1E2230] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Files List with Expandable Version History */}
      <div className="space-y-4">
        {filteredFiles.map((file) => {
          const latestVersion = file.versions[0];
          return (
            <div
              key={file.id}
              className="p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] hover:border-slate-700 transition-all shadow-sm space-y-4"
            >
              {/* File Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-[#1E2230] shrink-0">
                    {getCategoryIcon(file.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white hover:text-rose-400 transition-colors">
                        {file.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-rose-950/80 text-rose-300 border border-rose-800/40">
                        {file.currentVersion}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {getCategoryLabel(file.category)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{file.description}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedFileForVersion(file);
                      // Suggest next minor version
                      const vNum = parseFloat(file.currentVersion.replace('v', '')) || 1.0;
                      setNewVersionInput(`v${(vNum + 0.1).toFixed(1)}`);
                      setChangelogInput('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-400" />
                    <span>Új Verzió Feltöltése</span>
                  </button>
                  <button
                    onClick={() => handleDownload(file.name, file.currentVersion)}
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
                    Verziótörténet & Commit Log ({file.versions.length} revízió)
                  </span>
                </div>

                <div className="space-y-2">
                  {file.versions.map((ver, idx) => (
                    <div
                      key={ver.commitHash + idx}
                      className="p-3 rounded-xl bg-slate-900/40 border border-[#1E2230] flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono font-bold text-rose-400 text-[11px] px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-900/40">
                          {ver.version}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 flex items-center">
                          <GitCommit className="w-3 h-3 mr-0.5 text-slate-400" />
                          {ver.commitHash}
                        </span>
                        <span className="text-slate-300 line-clamp-1">{ver.changelog}</span>
                      </div>

                      <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400 shrink-0">
                        <span>{ver.uploadedByName}</span>
                        <span>{formatBytes(ver.fileSizeBytes)}</span>
                        <span>{formatDateHungarian(ver.uploadedAt)}</span>
                        <button
                          onClick={() => handleDownload(file.name, ver.version)}
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
      {selectedFileForVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Upload className="w-4 h-4 text-rose-500 mr-2" />
                Új Verzió Regisztrálása
              </h3>
              <button
                onClick={() => setSelectedFileForVersion(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Állomány: <span className="font-bold text-white">{selectedFileForVersion.name}</span>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Új Verziószám (pl. v2.5 vagy v3.0)
              </label>
              <input
                type="text"
                value={newVersionInput}
                onChange={(e) => setNewVersionInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Verzió Módosítási Napló (Changelog)
              </label>
              <textarea
                rows={3}
                value={changelogInput}
                onChange={(e) => setChangelogInput(e.target.value)}
                placeholder="Részletezd, milyen paraméterek vagy fejezetek változtak ebben a revízióban..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Simulated file drop */}
            <div className="p-4 border border-dashed border-[#1E2230] rounded-xl text-center text-xs text-slate-400 bg-slate-900/30">
              <Upload className="w-5 h-5 mx-auto mb-1 text-slate-500" />
              <span>Fájl kiválasztása vagy idehúzása (szimulált tudományos feltöltés)</span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1E2230]">
              <button
                onClick={() => setSelectedFileForVersion(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Mégse
              </button>
              <button
                onClick={() => {
                  if (newVersionInput.trim()) {
                    uploadFileVersion(
                      selectedFileForVersion.id,
                      newVersionInput.trim(),
                      changelogInput.trim() || 'Verziófrissítés a kutatócsoport által.'
                    );
                    setSelectedFileForVersion(null);
                  }
                }}
                disabled={!newVersionInput.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 disabled:opacity-50"
              >
                Verzió Mentése & Commit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
