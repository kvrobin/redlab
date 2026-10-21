'use client';

import React, { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { WorkstreamType } from '@/types/database';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  FileText,
  FlaskConical,
  Layers,
  ArrowRight,
  Maximize2,
  RotateCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface MobileLabCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileLabCameraModal({ isOpen, onClose }: MobileLabCameraModalProps) {
  const { uploadFileVersion, addResearchLog, currentProfile } = useStore();

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [category, setCategory] = useState<WorkstreamType>('wet_lab');
  const [commitMessage, setCommitMessage] = useState('Kísérleti fotódokumentáció a laborból (PWA Kamera)');
  const [alsoLogExperiment, setAlsoLogExperiment] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCaptureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCapturedFile(file);

    // Generate local preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-generate a title with timestamp
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];
    const generatedName = `Labor_Fotó_${dateStr}_${timeStr}.jpg`;

    if (!photoTitle) {
      setPhotoTitle(generatedName);
    }
  };

  const handleTriggerCamera = () => {
    fileInputRef.current?.click();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveAndUpload = async () => {
    if (!capturedImage) {
      toast.error('Kérlek készíts vagy válassz egy fotót a feltöltés előtt!');
      return;
    }

    const finalTitle = photoTitle.trim() || `labor_foto_${Date.now()}.jpg`;
    const cleanGroupKey = finalTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40);

    setIsUploading(true);

    try {
      // 1. Upload to repository_files (Supabase)
      const simulatedBytes = capturedFile?.size || 1450000;
      await uploadFileVersion(
        cleanGroupKey,
        finalTitle,
        category,
        commitMessage.trim() || 'Laboratóriumi mikroszkópos / kísérleti fotó',
        simulatedBytes
      );

      // 2. Optionally create research_logs entry
      if (alsoLogExperiment) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const markdown = `## 📷 Laboratóriumi Képi Dokumentáció\n\n**Rögzítette:** ${
          currentProfile?.full_name || 'Kutató'
        } • ${currentProfile?.short_code || 'R'}\n**Időpont:** ${now.toLocaleTimeString(
          'hu-HU'
        )}\n**Munkaterület:** \`${category}\`\n\n### Felvétel Részletei\n- **Fájlnév:** \`${finalTitle}\`\n- **Megjegyzés:** ${commitMessage}\n\n*A nagyfelbontású kép archiválva és verziózva a RED Lab Fájltárban.*`;

        await addResearchLog({
          title: `📷 Fotó: ${finalTitle.replace(/\.[^/.]+$/, '')}`,
          log_date: dateStr,
          workstream: category,
          content_markdown: markdown,
          parameters_json: {
            is_mobile_camera_photo: true,
            photo_file_name: finalTitle,
            category: category,
            author_code: currentProfile?.short_code || 'R',
          },
          linked_file_ids: [],
        });
      }

      toast.success('Labor fotó sikeresen feltöltve és rögzítve! 🔬', {
        description: `${finalTitle} bekerült a Fájltárba${
          alsoLogExperiment ? ' és a Kutatási Naplóba' : ''
        }.`,
      });

      onClose();
    } catch (err: any) {
      console.error('[MobileLabCamera] Upload error:', err);
      toast.error('Hiba a fotó feltöltése során!', {
        description: err.message || 'Kérlek próbáld újra.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Hidden Mobile Camera Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCaptureChange}
        className="hidden"
      />

      {/* Modal Dialog Card */}
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#0F121C] border border-[#1E2230] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2230] flex items-center justify-between bg-gradient-to-r from-red-950/40 via-slate-900/40 to-transparent">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-md shadow-rose-950/50">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Mobil Labor Kamera Mód
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold uppercase">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mikroszkópos & kísérleti fotók azonnali archiválása
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors touch-target flex items-center justify-center"
            aria-label="Bezárás"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Photo Capture Preview Area */}
          {!capturedImage ? (
            <div
              onClick={handleTriggerCamera}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-rose-600/40 hover:border-rose-500 bg-gradient-to-b from-rose-950/20 to-slate-950/60 p-8 text-center transition-all flex flex-col items-center justify-center space-y-3 min-h-[220px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-600/20 group-hover:bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-all shadow-lg shadow-rose-950/40">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                  Kattints a kamera megnyitásához
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Mobilon a telefon hátlapi kamerája nyílik meg mikroszkóp vagy chip fotózásához.
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-[#1E2230] text-[11px] font-mono text-slate-300">
                📸 Fotó készítése vagy Fájl kiválasztása
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-[#1E2230] bg-black max-h-64 flex items-center justify-center">
                <img
                  src={capturedImage}
                  alt="Labor Fotó Előnézet"
                  className="w-full h-auto max-h-64 object-contain"
                />
                <button
                  type="button"
                  onClick={handleRetake}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-rose-300 border border-rose-600/50 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Újrafotózás</span>
                </button>
              </div>

              {/* Title & Metadata Inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fotó Címe / Fájlnév:
                </label>
                <input
                  type="text"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="pl. Mikrofluidikai_Chip_Mikroszkop_v1.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Workstream selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kutatási Terület (Workstream):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('wet_lab')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      category === 'wet_lab'
                        ? 'bg-rose-950/80 text-rose-200 border-rose-700 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-[#1E2230] hover:text-white'
                    }`}
                  >
                    Wet Lab (Labor)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('cad_hardware')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      category === 'cad_hardware'
                        ? 'bg-purple-950/80 text-purple-200 border-purple-700 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-[#1E2230] hover:text-white'
                    }`}
                  >
                    CAD & Hardver
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('thesis_writing')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      category === 'thesis_writing'
                        ? 'bg-emerald-950/80 text-emerald-200 border-emerald-700 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-[#1E2230] hover:text-white'
                    }`}
                  >
                    Szakdolgozat
                  </button>
                </div>
              </div>

              {/* Commit Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kísérleti Jegyzet / Commit Leírás:
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="pl. 15 µL/min folyadékáramlás és cseppképződés mikroszkópos felvétele"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Also log to research_logs checkbox */}
              <div className="flex items-start space-x-2.5 pt-1">
                <input
                  type="checkbox"
                  id="alsoLogExp"
                  checked={alsoLogExperiment}
                  onChange={(e) => setAlsoLogExperiment(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-rose-600 accent-rose-600 shrink-0 cursor-pointer"
                />
                <label
                  htmlFor="alsoLogExp"
                  className="text-xs text-slate-300 leading-snug cursor-pointer select-none"
                >
                  <strong className="text-white">Bejegyzés létrehozása a Kutatási Naplóban is:</strong>{' '}
                  A fotó automatikusan megjelenik az ELN (Electronic Lab Notebook) idővonalán dátummal és leírással.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1E2230] bg-[#0A0C13] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-[#1E2230] touch-target"
          >
            Mégse
          </button>

          {capturedImage ? (
            <button
              type="button"
              onClick={handleSaveAndUpload}
              disabled={isUploading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-950/60 flex items-center justify-center space-x-2 touch-target disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Mentés a Fájltárba</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTriggerCamera}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/60 flex items-center justify-center space-x-2 touch-target"
            >
              <Camera className="w-4 h-4" />
              <span>Kamera Indítása</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
