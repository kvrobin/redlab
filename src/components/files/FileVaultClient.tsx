'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { RepositoryFile, WorkstreamType } from '@/types';
import {
  FolderGit2,
  FileCode2,
  FileSpreadsheet,
  FileBox,
  FileText,
  Presentation,
  Upload,
  Download,
  History,
  Search,
  Filter,
  Plus,
  GitCommit,
  CheckCircle2,
  X,
  Clock,
  User,
  ArrowRight,
  HardDrive,
  FileCheck,
  ChevronRight,
  Layers,
  Sparkles,
  Trash2,
  AlertCircle,
  File,
  LineChart,
} from 'lucide-react';
import { RedLabLogo } from '@/components/brand/RedLabLogo';
import { CsvDataPlotterModal } from '@/components/files/CsvDataPlotterModal';
import { formatBytes, formatDateHungarian, triggerFileDownload } from '@/lib/utils';
import { toast } from 'sonner';

type FolderFilter = 'all' | 'thesis_writing' | 'wet_lab' | 'cad_hardware' | 'dry_lab_code' | 'general';

interface FolderTab {
  id: FolderFilter;
  label: string;
  category?: WorkstreamType;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const FOLDER_TABS: FolderTab[] = [
  { id: 'all', label: 'Minden fájl', icon: FolderGit2, color: 'text-rose-400' },
  { id: 'thesis_writing', label: 'Szakdolgozat Fejezetek', category: 'thesis_writing', icon: FileText, color: 'text-rose-400' },
  { id: 'wet_lab', label: 'Labor & Mérési Adatok', category: 'wet_lab', icon: FileSpreadsheet, color: 'text-emerald-400' },
  { id: 'cad_hardware', label: 'CAD & Mikrofluidika', category: 'cad_hardware', icon: FileBox, color: 'text-purple-400' },
  { id: 'dry_lab_code', label: 'Kód & Szimuláció', category: 'dry_lab_code', icon: FileCode2, color: 'text-blue-400' },
  { id: 'general', label: 'Prezentációk', category: 'general', icon: Presentation, color: 'text-amber-400' },
];

export function FileVaultClient() {
  const {
    repositoryFiles,
    uploadFileVersion,
    deleteRepositoryFile,
    deleteRepositoryGroup,
    milestones,
    currentProfile,
  } = useStore();

  const [activeFolder, setActiveFolder] = useState<FolderFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer state for history
  const [historyDrawerGroupKey, setHistoryDrawerGroupKey] = useState<string | null>(null);
  const [plotterFile, setPlotterFile] = useState<string | null>(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'new_file' | 'new_version'>('new_file');
  
  // Form fields
  const [selectedExistingGroupKey, setSelectedExistingGroupKey] = useState<string>('');
  const [newFileName, setNewFileName] = useState('');
  const [newGroupKey, setNewGroupKey] = useState('');
  const [newFolderCategory, setNewFolderCategory] = useState<WorkstreamType>('thesis_writing');
  const [newMilestoneId, setNewMilestoneId] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedFileSimulatedSize, setSelectedFileSimulatedSize] = useState<number>(14200000);
  const [isDragging, setIsDragging] = useState(false);

  // Drawer quick commit
  const [drawerCommitMessage, setDrawerCommitMessage] = useState('');

  // Group files by file_group_key
  const fileGroups = useMemo(() => {
    const map = new Map<string, RepositoryFile[]>();
    for (const f of repositoryFiles) {
      const arr = map.get(f.file_group_key) || [];
      arr.push(f);
      map.set(f.file_group_key, arr);
    }
    // Sort each group's files descending by version_number
    map.forEach((files) => {
      files.sort((a, b) => b.version_number - a.version_number);
    });
    return map;
  }, [repositoryFiles]);

  // Unique group keys
  const allGroupKeys = useMemo(() => Array.from(fileGroups.keys()), [fileGroups]);

  // Calculate folder counts
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allGroupKeys.length };
    FOLDER_TABS.forEach((tab) => {
      if (tab.id !== 'all' && tab.category) {
        counts[tab.id] = allGroupKeys.filter((gk) => {
          const files = fileGroups.get(gk);
          const latest = files?.find((f) => f.is_latest) || files?.[0];
          return latest?.folder_category === tab.category;
        }).length;
      }
    });
    return counts;
  }, [allGroupKeys, fileGroups]);

  // Total stats
  const totalStorageBytes = useMemo(() => {
    return repositoryFiles.reduce((acc, f) => acc + (f.file_size_bytes || 0), 0);
  }, [repositoryFiles]);

  // Filtered group keys based on active tab and search
  const filteredGroupKeys = useMemo(() => {
    return allGroupKeys.filter((groupKey) => {
      const files = fileGroups.get(groupKey) || [];
      const latest = files.find((f) => f.is_latest) || files[0];
      if (!latest) return false;

      // Filter by folder category
      if (activeFolder !== 'all') {
        const targetTab = FOLDER_TABS.find((t) => t.id === activeFolder);
        if (targetTab?.category && latest.folder_category !== targetTab.category) {
          return false;
        }
      }

      // Filter by search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = latest.file_name.toLowerCase().includes(q);
        const matchesGroup = latest.file_group_key.toLowerCase().includes(q);
        const matchesAnyCommit = files.some((f) => f.commit_message.toLowerCase().includes(q));
        const matchesAuthor = files.some((f) => (f.uploaded_by_name || '').toLowerCase().includes(q));
        if (!matchesName && !matchesGroup && !matchesAnyCommit && !matchesAuthor) {
          return false;
        }
      }

      return true;
    });
  }, [allGroupKeys, fileGroups, activeFolder, searchQuery]);

  // Helper for icons based on extension
  const getFileIcon = (fileName: string, category: WorkstreamType) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.stl') || lower.endsWith('.step') || lower.endsWith('.obj')) {
      return <FileBox className="w-5 h-5 text-purple-400" />;
    }
    if (lower.endsWith('.py') || lower.endsWith('.m') || lower.endsWith('.cpp') || lower.endsWith('.sh')) {
      return <FileCode2 className="w-5 h-5 text-blue-400" />;
    }
    if (lower.endsWith('.csv') || lower.endsWith('.xlsx') || lower.endsWith('.dat')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (lower.endsWith('.pptx') || lower.endsWith('.ppt') || lower.endsWith('.key')) {
      return <Presentation className="w-5 h-5 text-amber-400" />;
    }
    if (lower.endsWith('.docx') || lower.endsWith('.doc') || lower.endsWith('.tex') || category === 'thesis_writing') {
      return <FileText className="w-5 h-5 text-rose-400" />;
    }
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const getFolderLabel = (category: WorkstreamType) => {
    switch (category) {
      case 'thesis_writing':
        return 'Szakdolgozat Fejezetek';
      case 'wet_lab':
        return 'Labor & Mérési Adatok';
      case 'cad_hardware':
        return 'CAD & Mikrofluidika';
      case 'dry_lab_code':
        return 'Kód & Szimuláció';
      case 'general':
      default:
        return 'Prezentációk & Általános';
    }
  };

  const handleDownloadFile = (file: RepositoryFile) => {
    triggerFileDownload(
      file.file_name,
      `# RED Lab Scientific File Repository\n# File: ${file.file_name}\n# Version: v${file.version_number}\n# Category: ${file.folder_category}\n# Commit: ${file.commit_message}\n# Uploader: ${file.uploaded_by_name || 'Kutató'}\n# Date: ${file.created_at}\n\n[Valós adattartalom szimuláció a RED Lab repozitóriumból]`
    );
    toast.success(`Fájl letöltve: ${file.file_name} (v${file.version_number})`, {
      description: `Commit: "${file.commit_message}"`,
    });
  };

  const handleOpenUploadNewVersion = (groupKey: string) => {
    const files = fileGroups.get(groupKey);
    const latest = files?.find((f) => f.is_latest) || files?.[0];
    if (!latest) return;

    setSelectedExistingGroupKey(groupKey);
    setUploadMode('new_version');
    setCommitMessage(`v${latest.version_number + 1}: Emma mérési grafikonjai beillesztve + Professzor úr javításai a 4. oldalon`);
    setIsUploadModalOpen(true);
  };

  const handleOpenUploadNewFile = () => {
    setUploadMode('new_file');
    setSelectedExistingGroupKey('');
    setNewFileName('');
    setNewGroupKey('');
    setCommitMessage('v1: Kezdeti verzió commitolása a RED Lab tudományos tárhelyre');
    setIsUploadModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadMode === 'new_file') {
      if (!newFileName.trim()) {
        toast.error('Kérlek add meg a fájl nevét!');
        return;
      }
      if (!commitMessage.trim()) {
        toast.error('A commit üzenet megadása kötelező!');
        return;
      }

      const generatedGroupKey =
        newGroupKey.trim() ||
        newFileName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-');

      uploadFileVersion(
        generatedGroupKey,
        newFileName.trim(),
        newFolderCategory,
        commitMessage.trim(),
        selectedFileSimulatedSize,
        newMilestoneId || undefined
      );

      setIsUploadModalOpen(false);
    } else {
      // New version to existing file
      if (!selectedExistingGroupKey) {
        toast.error('Kérlek válaszd ki a frissítendő fájlt!');
        return;
      }
      if (!commitMessage.trim()) {
        toast.error('A változás / commit üzenet megadása kötelező!');
        return;
      }

      const files = fileGroups.get(selectedExistingGroupKey);
      const latest = files?.find((f) => f.is_latest) || files?.[0];
      if (!latest) return;

      uploadFileVersion(
        selectedExistingGroupKey,
        latest.file_name,
        latest.folder_category,
        commitMessage.trim(),
        selectedFileSimulatedSize,
        latest.milestone_id || undefined
      );

      setIsUploadModalOpen(false);
    }
  };

  const handleDrawerQuickCommit = () => {
    if (!historyDrawerGroupKey || !drawerCommitMessage.trim()) return;
    const files = fileGroups.get(historyDrawerGroupKey);
    const latest = files?.find((f) => f.is_latest) || files?.[0];
    if (!latest) return;

    uploadFileVersion(
      historyDrawerGroupKey,
      latest.file_name,
      latest.folder_category,
      drawerCommitMessage.trim(),
      latest.file_size_bytes + 250000,
      latest.milestone_id || undefined
    );
    setDrawerCommitMessage('');
  };

  // Currently opened group for history drawer
  const drawerFiles = historyDrawerGroupKey ? fileGroups.get(historyDrawerGroupKey) || [] : [];
  const drawerLatest = drawerFiles.find((f) => f.is_latest) || drawerFiles[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/40 flex items-center">
              <FolderGit2 className="w-3.5 h-3.5 mr-1 text-rose-400" />
              RED LAB FILE VAULT
            </span>
            <span className="text-[11px] font-mono text-slate-400 flex items-center">
              <GitCommit className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Trigger-vezérelt Okos Verziózás (Git nélkül)
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            GitHub-stílusú Tudományos Fájltár & Verziókezelő
          </h1>

          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Szakdolgozat-fejezetek, laboratóriumi mérési adatok, mikrofluidikai CAD tervek (.stl) és szimulációs forráskódok
            központi, automatikusan verziózott tárolója. A fájlokhoz tartozó revíziók (`v1`, `v2`, `v3`) tetszőlegesen
            visszakövethetők és közvetlenül letölthetők.
          </p>
        </div>

        {/* Quick Stats & Action */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <div className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-[#1E2230]">
            <HardDrive className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase text-slate-400">Tárhelyméret</div>
              <div className="text-xs font-mono font-bold text-white">{formatBytes(totalStorageBytes)}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-[#1E2230]">
            <Layers className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase text-slate-400">Összes Állomány</div>
              <div className="text-xs font-mono font-bold text-white">{allGroupKeys.length} db ({repositoryFiles.length} verzió)</div>
            </div>
          </div>

          <button
            onClick={handleOpenUploadNewFile}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-xs shadow-lg shadow-rose-950/50 flex items-center space-x-2 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Fájl Feltöltése / Új Verzió</span>
          </button>
        </div>
      </div>

      {/* Folder / Workstream Tab Switcher */}
      <div className="p-2 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {FOLDER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFolder === tab.id;
            const count = folderCounts[tab.id] ?? 0;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveFolder(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-md font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-rose-900/60 text-rose-200'
                      : 'bg-slate-800/70 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#12141D] border border-[#1E2230]">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>
            Megjelenítve:{' '}
            <strong className="text-white">
              {filteredGroupKeys.length} / {allGroupKeys.length}
            </strong>{' '}
            fájlcsoport
          </span>
        </div>

        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Keresés fájlnév, commit üzenet vagy feltöltő alapján..."
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

      {/* Files Grid / Cards */}
      {filteredGroupKeys.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#12141D] border border-dashed border-[#1E2230] space-y-3">
          <RedLabLogo variant="icon" size="md" className="mx-auto opacity-75" />
          <h3 className="text-sm font-semibold text-white">Nincs találat ebben a mappában</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Próbálj meg más keresési kifejezést beírni, vagy tölts fel egy új fájlt a jobb felső gombbal.
          </p>
          <button
            onClick={handleOpenUploadNewFile}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/40 text-xs font-medium"
          >
            Új Fájl Feltöltése
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGroupKeys.map((groupKey) => {
            const files = fileGroups.get(groupKey) || [];
            const latest = files.find((f) => f.is_latest) || files[0];
            if (!latest) return null;

            const relatedMilestone = latest.milestone_id
              ? milestones.find((m) => m.id === latest.milestone_id)
              : null;

            return (
              <div
                key={groupKey}
                className="p-5 rounded-2xl bg-[#12141D] border border-[#1E2230] hover:border-slate-700 transition-all shadow-sm space-y-4"
              >
                {/* File Card Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Icon & Meta */}
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-[#1E2230] shrink-0 shadow-inner">
                      {getFileIcon(latest.file_name, latest.folder_category)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-white hover:text-rose-400 transition-colors">
                          {latest.file_name}
                        </h2>

                        {/* Large v(N) Legfrissebb Badge */}
                        <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/60 shadow-sm flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                          v{latest.version_number} (Legfrissebb)
                        </span>

                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
                          {getFolderLabel(latest.folder_category)}
                        </span>

                        {relatedMilestone && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 truncate max-w-xs">
                            🎯 {relatedMilestone.phase_number}. Fázis
                          </span>
                        )}
                      </div>

                      {/* Latest Commit Message Highlight */}
                      <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-800/80 mt-1.5">
                        <GitCommit className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="font-mono text-slate-400 text-[11px]">Legfrissebb commit:</span>
                        <span className="font-medium text-slate-200">{latest.commit_message}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 lg:self-center shrink-0">
                    {/* Interactive Plotter Button for CSV / JSON files */}
                    {(latest.file_name.endsWith('.csv') || latest.file_name.endsWith('.json')) && (
                      <button
                        onClick={() => setPlotterFile(latest.file_name)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 flex items-center space-x-1.5 transition-all"
                        title="Interaktív görbeelemzés és statisztika megjelenítése"
                      >
                        <LineChart className="w-4 h-4" />
                        <span>📊 Interaktív Grafikon</span>
                      </button>
                    )}

                    {/* Direct Download Button */}
                    <button
                      onClick={() => handleDownloadFile(latest)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 flex items-center space-x-1.5 transition-all"
                      title="Legfrissebb verzió azonnali letöltése"
                    >
                      <Download className="w-4 h-4" />
                      <span>Letöltés (v{latest.version_number})</span>
                    </button>

                    {/* New Version Commit Button */}
                    <button
                      onClick={() => handleOpenUploadNewVersion(groupKey)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-medium border border-rose-900/40 flex items-center space-x-1.5 transition-colors"
                      title="Új verzió feltöltése ehhez a fájlhoz"
                    >
                      <Upload className="w-3.5 h-3.5 text-rose-400" />
                      <span>Új Verzió (v{latest.version_number + 1})</span>
                    </button>

                    {/* History Button */}
                    <button
                      onClick={() => setHistoryDrawerGroupKey(groupKey)}
                      className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Verziótörténet</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300">
                        {files.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Subline Meta */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-[#1E2230] gap-2">
                  <div className="flex items-center space-x-3 text-[11px] font-mono">
                    <span className="flex items-center text-slate-300">
                      <User className="w-3 h-3 mr-1 text-slate-400" />
                      Feltöltő: <strong className="ml-1 text-white">{latest.uploaded_by_name || 'Robin'}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">Méret: {formatBytes(latest.file_size_bytes)}</span>
                    <span>•</span>
                    <span className="text-slate-400" suppressHydrationWarning>
                      {formatDateHungarian(latest.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                    <span className="text-slate-500">Group Key:</span>
                    <code className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded text-[10px] border border-slate-800">
                      {latest.file_group_key}
                    </code>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VERSION HISTORY DRAWER (Slide-over Sheet) */}
      {/* ========================================================================= */}
      {historyDrawerGroupKey && drawerLatest && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-[#12141D] border-l border-[#1E2230] h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#1E2230] flex items-center justify-between bg-slate-900/40">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/40">
                    VERZIÓTÖRTÉNET
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {drawerFiles.length} revízió rögzítve
                  </span>
                </div>
                <h3 className="text-base font-bold text-white truncate max-w-md">
                  {drawerLatest.file_name}
                </h3>
              </div>

              <button
                onClick={() => setHistoryDrawerGroupKey(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body - Timeline */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1E2230]">
                {drawerFiles.map((file, idx) => (
                  <div key={file.id} className="relative group">
                    {/* Dot on timeline */}
                    <div
                      className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        file.is_latest
                          ? 'border-emerald-500 bg-emerald-950'
                          : 'border-slate-600 bg-slate-900'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          file.is_latest ? 'bg-emerald-400' : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    {/* Revision Card */}
                    <div
                      className={`p-4 rounded-xl border transition-all ${
                        file.is_latest
                          ? 'bg-slate-900/80 border-emerald-800/60 shadow-md'
                          : 'bg-slate-900/40 border-[#1E2230]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              file.is_latest
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            v{file.version_number}
                          </span>

                          {file.is_latest && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                              LATEST
                            </span>
                          )}

                          <span className="text-xs text-slate-400 flex items-center">
                            <User className="w-3 h-3 mr-1 text-slate-500" />
                            {file.uploaded_by_name || 'Kutató'}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-slate-400" suppressHydrationWarning>
                          {formatDateHungarian(file.created_at)}
                        </span>
                      </div>

                      {/* Commit Message */}
                      <p className="text-xs text-slate-200 leading-relaxed font-sans mb-3 pl-2 border-l-2 border-rose-500/50">
                        {file.commit_message}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1E2230]/60">
                        <span className="font-mono text-[11px]">{formatBytes(file.file_size_bytes)}</span>

                        <div className="flex items-center space-x-2">
                          {drawerFiles.length > 1 && (
                            <button
                              onClick={() => deleteRepositoryFile(file.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                              title="Revízió törlése"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 border border-slate-700"
                          >
                            <Download className="w-3 h-3 text-rose-400" />
                            <span>Letöltés (v{file.version_number})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Footer - Quick Commit New Version */}
            <div className="p-5 border-t border-[#1E2230] bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center">
                  <Upload className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                  Új verzió rögzítése ehhez a fájlhoz (v{drawerLatest.version_number + 1})
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentProfile.full_name} nevében
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Commit üzenet (pl. Javítások a témavezető javaslata alapján)..."
                  value={drawerCommitMessage}
                  onChange={(e) => setDrawerCommitMessage(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 font-sans"
                />
                <button
                  onClick={handleDrawerQuickCommit}
                  disabled={!drawerCommitMessage.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-950/40 disabled:opacity-50 shrink-0"
                >
                  Commit v{drawerLatest.version_number + 1}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPLOAD MODAL - DUAL MODE WIZARD */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center space-x-2">
                <FolderGit2 className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">
                  Tudományos Fájl Regisztráció & Okos Verziózás
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-xl border border-[#1E2230]">
              <button
                type="button"
                onClick={() => setUploadMode('new_file')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  uploadMode === 'new_file'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Új fájl feltöltése</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUploadMode('new_version');
                  if (!selectedExistingGroupKey && allGroupKeys.length > 0) {
                    setSelectedExistingGroupKey(allGroupKeys[0]);
                  }
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  uploadMode === 'new_version'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>Új verzió meglévő fájlhoz</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {uploadMode === 'new_file' ? (
                <>
                  <div>
                    <label className="text-slate-400 font-mono uppercase block mb-1">
                      Fájlnév (kiterjesztéssel) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newFileName}
                      onChange={(e) => {
                        setNewFileName(e.target.value);
                        if (!newGroupKey) {
                          setNewGroupKey(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, '-')
                              .replace(/-+/g, '-')
                          );
                        }
                      }}
                      placeholder="pl. REDLab_Szakdolgozat_5_Fejezet.docx vagy microfluidic_mesh.stl"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-mono uppercase block mb-1">
                        Mappa / Workstream *
                      </label>
                      <select
                        value={newFolderCategory}
                        onChange={(e) => setNewFolderCategory(e.target.value as WorkstreamType)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
                      >
                        <option value="thesis_writing">Szakdolgozat Fejezetek</option>
                        <option value="wet_lab">Labor & Mérési Adatok</option>
                        <option value="cad_hardware">CAD & Mikrofluidika</option>
                        <option value="dry_lab_code">Kód & Szimuláció</option>
                        <option value="general">Prezentációk & Egyéb</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 font-mono uppercase block mb-1">
                        Kapcsolódó Mérföldkő
                      </label>
                      <select
                        value={newMilestoneId}
                        onChange={(e) => setNewMilestoneId(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
                      >
                        <option value="">Nincs hozzárendelve</option>
                        {milestones.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.phase_number}. Fázis: {m.title.substring(0, 24)}...
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono uppercase block mb-1">
                      File Group Key (Azonosító kulcs az automatikus verziózáshoz)
                    </label>
                    <input
                      type="text"
                      value={newGroupKey}
                      onChange={(e) => setNewGroupKey(e.target.value)}
                      placeholder="pl. szakdoga-5-fejezet"
                      className="w-full p-2 rounded-xl bg-slate-900/60 border border-[#1E2230] text-slate-300 font-mono text-[11px] focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </>
              ) : (
                /* Mode 2: New version for existing file */
                <>
                  <div>
                    <label className="text-slate-400 font-mono uppercase block mb-1">
                      Válassz meglévő fájlt a tárhelyből *
                    </label>
                    <select
                      value={selectedExistingGroupKey}
                      onChange={(e) => setSelectedExistingGroupKey(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                    >
                      {allGroupKeys.map((gk) => {
                        const files = fileGroups.get(gk);
                        const latest = files?.find((f) => f.is_latest) || files?.[0];
                        return (
                          <option key={gk} value={gk}>
                            {latest?.file_name} — (Jelenlegi: v{latest?.version_number}, {getFolderLabel(latest?.folder_category || 'general')})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Existing file preview */}
                  {selectedExistingGroupKey && (() => {
                    const files = fileGroups.get(selectedExistingGroupKey);
                    const latest = files?.find((f) => f.is_latest) || files?.[0];
                    if (!latest) return null;
                    return (
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-900/40 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">Célfájl adatai:</span>
                          <div className="font-bold text-white text-xs">{latest.file_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Jelenlegi verzió: <span className="text-slate-200 font-bold">v{latest.version_number}</span> ({latest.uploaded_by_name || 'Kutató'})
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Generált új verzió:</span>
                          <div className="text-base font-mono font-extrabold text-emerald-300">
                            v{latest.version_number + 1}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* Commit Message - Mandatory */}
              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Commit / Változás Üzenet *
                </label>
                <textarea
                  rows={3}
                  required
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="pl.: Emma mérési grafikonjai beillesztve + Professzor úr javításai a 4. oldalon..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
                />
              </div>

              {/* Simulated Storage Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    if (uploadMode === 'new_file') {
                      setNewFileName(file.name);
                    }
                    setSelectedFileSimulatedSize(file.size || 14200000);
                    toast.info(`Fájl kiválasztva: ${file.name}`);
                  }
                }}
                className={`p-5 border-2 border-dashed rounded-xl text-center transition-all ${
                  isDragging
                    ? 'border-rose-500 bg-rose-950/20'
                    : 'border-[#1E2230] bg-slate-900/30 hover:border-slate-700'
                }`}
              >
                <Upload className="w-6 h-6 mx-auto mb-1.5 text-rose-500" />
                <p className="text-slate-200 font-medium">Húzd ide az új fájlverziót vagy kattints a feltöltéshez</p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Supabase Storage Bucket: `redlab-repository` (.stl, .step, .csv, .py, .docx, .pdf)
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1E2230]">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center space-x-1.5"
                >
                  <GitCommit className="w-4 h-4" />
                  <span>
                    {uploadMode === 'new_file' ? 'Fájl Regisztrálása (v1)' : 'Új Verzió Commit & Frissítés'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive CSV / JSON Data Plotter Modal */}
      {plotterFile && (
        <CsvDataPlotterModal
          isOpen={Boolean(plotterFile)}
          onClose={() => setPlotterFile(null)}
          fileName={plotterFile}
        />
      )}
    </div>
  );
}
