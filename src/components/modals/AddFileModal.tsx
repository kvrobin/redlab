'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { WorkstreamType } from '@/types';
import { X, Upload, FolderGit2 } from 'lucide-react';

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFileModal({ isOpen, onClose }: AddFileModalProps) {
  const { uploadFileVersion, milestones } = useStore();

  const [fileName, setFileName] = useState('');
  const [fileGroupKey, setFileGroupKey] = useState('');
  const [folderCategory, setFolderCategory] = useState<WorkstreamType>('dry_lab_code');
  const [milestoneId, setMilestoneId] = useState('');
  const [commitMessage, setCommitMessage] = useState('v1: Kezdeti verzió commitolása a repóba');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const groupKey =
      fileGroupKey.trim() ||
      fileName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

    uploadFileVersion(
      groupKey,
      fileName.trim(),
      folderCategory,
      commitMessage.trim() || 'v1: Kezdeti feltöltés',
      12500000,
      milestoneId || undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
          <h3 className="text-base font-bold text-white flex items-center">
            <FolderGit2 className="w-5 h-5 text-rose-500 mr-2" />
            Új Tudományos Állomány Regisztrálása
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Fájlnév (kiterjesztéssel együtt) *
            </label>
            <input
              type="text"
              required
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value);
                if (!fileGroupKey) {
                  setFileGroupKey(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, '-')
                      .replace(/-+/g, '-')
                  );
                }
              }}
              placeholder="pl. microchannel_flow_mesh.stl vagy solver.py"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              File Group Key (Azonos fájlok verzióinak összekapcsolására) *
            </label>
            <input
              type="text"
              required
              value={fileGroupKey}
              onChange={(e) => setFileGroupKey(e.target.value)}
              placeholder="pl. chip-cad-master vagy szakdoga-kezirat"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Kategória (Folder Category)
              </label>
              <select
                value={folderCategory}
                onChange={(e) => setFolderCategory(e.target.value as WorkstreamType)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="dry_lab_code">Dry Lab (Kód & Szimuláció)</option>
                <option value="cad_hardware">CAD & Hardware (.stl)</option>
                <option value="wet_lab">Wet Lab (Mérési Nyersadatok)</option>
                <option value="thesis_writing">Szakdolgozat Kéziratok</option>
                <option value="general">Általános állomány</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Kapcsolódó Mérföldkő
              </label>
              <select
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
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
              Kezdő Commit Üzenet *
            </label>
            <input
              type="text"
              required
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="pl. v1: Kezdeti geometriai paraméterek felvétele..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Simulated File selector */}
          <div className="p-4 border border-dashed border-[#1E2230] rounded-xl text-center text-slate-400 bg-slate-900/40">
            <Upload className="w-5 h-5 mx-auto mb-1 text-slate-500" />
            <p className="text-slate-300 font-medium">Húzd ide a fájlt vagy kattints a tallózáshoz</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Támogatott: .stl, .step, .csv, .py, .docx, .pdf (Supabase Storage)</p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1E2230]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-md shadow-rose-950/40"
            >
              Fájl Regisztrálása & Commit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
