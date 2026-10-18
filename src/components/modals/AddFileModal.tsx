'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { FileCategory, WorkstreamId } from '@/types';
import { X, Upload, FolderGit2 } from 'lucide-react';

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFileModal({ isOpen, onClose }: AddFileModalProps) {
  const { addNewFile } = useStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<FileCategory>('code');
  const [workstream, setWorkstream] = useState<WorkstreamId>('domi');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [changelog, setChangelog] = useState('Kezdeti verzió feltöltése a repóba.');
  const [tagInput, setTagInput] = useState('Python, Simulation');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const extension = name.split('.').pop() || 'dat';
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addNewFile(
      {
        name: name.trim(),
        category,
        workstream,
        description: description.trim(),
        extension,
        currentVersion: version.trim() || 'v1.0',
        tags,
      },
      version.trim() || 'v1.0',
      changelog.trim() || 'Kezdeti feltöltés.'
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
          <h3 className="text-base font-bold text-white flex items-center">
            <FolderGit2 className="w-5 h-5 text-rose-500 mr-2" />
            Új Tudományos Fájl Regisztrálása a Repóba
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="pl. microchannel_flow_mesh.stl vagy solver.py"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Fájl Kategória
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FileCategory)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="code">Forráskód / Szkript (.py, .cpp, .m)</option>
                <option value="cad">CAD / 3D Modell (.stl, .step)</option>
                <option value="data">Kísérleti Nyersadat (.csv, .xlsx)</option>
                <option value="thesis">Szakdolgozat Kézirat (.docx, .pdf)</option>
                <option value="microscopy">Mikroszkópos Képcsomag (.tiff)</option>
                <option value="presentation">Prezentáció (.pdf, .pptx)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Kapcsolódó Workstream
              </label>
              <select
                value={workstream}
                onChange={(e) => setWorkstream(e.target.value as WorkstreamId)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="robin">Robin (Architektúra & Rendszer)</option>
                <option value="emma">Emma (Labor & Biomikrofluidika)</option>
                <option value="domi">Domi (Szimuláció & Gépi Tanulás)</option>
                <option value="general">Közös RED Lab állomány</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Állomány Leírása & Rendeltetése
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A fájl szerepe a kutatási folyamatban és a szakdolgozatban..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Kezdő Verzió
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1">
                Címkék
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="pl. OpenFOAM, Mesh, CAD"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">
              Kezdő Commit Üzenet (Changelog)
            </label>
            <input
              type="text"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="pl. Kezdeti geometriai paraméterek felvétele..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Simulated File selector */}
          <div className="p-4 border border-dashed border-[#1E2230] rounded-xl text-center text-slate-400 bg-slate-900/40">
            <Upload className="w-5 h-5 mx-auto mb-1 text-slate-500" />
            <p className="text-slate-300 font-medium">Húzd ide a fájlt vagy kattints a tallózáshoz</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Támogatott: .stl, .step, .csv, .py, .docx, .pdf (max 100 MB)</p>
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
              Fájl Hozzáadása & Commit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
