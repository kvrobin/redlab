'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { WorkstreamType } from '@/types';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Save,
  CheckCircle2,
  Sliders,
  FileText,
  Clock,
  Sparkles,
  FlaskConical,
  Plus,
  Trash2,
  ChevronDown,
  Layers,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ProtocolStep {
  id: string;
  title: string;
  targetDurationSeconds?: number;
  completedAtSeconds?: number;
  stepNotes?: string;
  parameters?: Record<string, string>;
}

export interface ProtocolTemplate {
  id: string;
  name: string;
  workstream: WorkstreamType;
  defaultParameters: Record<string, string>;
  steps: { title: string; targetMinutes?: number }[];
}

export const PROTOCOL_TEMPLATES: ProtocolTemplate[] = [
  {
    id: 'microfluidic_chip_flow',
    name: 'Mikrofluidikai Chip Áramlási Mérés & Kalibráció',
    workstream: 'wet_lab',
    defaultParameters: {
      'Folytonos fázis sebesség': '15.0 µL/min',
      'Diszpergált fázis sebesség': '2.5 µL/min',
      'Hőmérséklet': '37.0 °C',
      'Kamranyomás': '0.3 mbar',
      'Chip Revízió': 'v3.2 PDMS-Glass',
    },
    steps: [
      { title: '1. Chip átmosás, degasszálás (IPA / ioncserélt víz)', targetMinutes: 5 },
      { title: '2. Folyadékcsatlakozók és PTFE kapillárisok szivárgástesztje', targetMinutes: 3 },
      { title: '3. Folytonos olajfázis indítása fecskendőpumpával (15.0 µL/min)', targetMinutes: 4 },
      { title: '4. Diszpergált mintafázis injektálása és cseppképződés beállítása', targetMinutes: 6 },
      { title: '5. Optikai mikroszkópos nagysebességű rögzítés és adatgyűjtés', targetMinutes: 10 },
      { title: '6. Rendszer leállítása, elzárószelepek és zárómosás', targetMinutes: 4 },
    ],
  },
  {
    id: 'cell_suspension_viability',
    name: 'Sejtszuszpenzió & Fluoreszcens Viabilitási Teszt',
    workstream: 'wet_lab',
    defaultParameters: {
      'Sejttípus': 'HeLa / MCF-7',
      'Kezdő koncentráció': '1.25 × 10⁶ sejt/mL',
      'Inkubációs hőmérséklet': '37.0 °C',
      'Festék': 'Calcein-AM & Propidium Iodide',
    },
    steps: [
      { title: '1. Sejtszuszpenzió előkészítése & centrifugálás (1200 rpm)', targetMinutes: 6 },
      { title: '2. Festékoldat pipettázása és homogenizálás', targetMinutes: 3 },
      { title: '3. Inkubáció sötét termosztátban (37.0 °C)', targetMinutes: 15 },
      { title: '4. Mintabevitel a mikrofluidikai mérőkamrába', targetMinutes: 4 },
      { title: '5. Fluoreszcens mikroszkópos viabilitási képek rögzítése', targetMinutes: 8 },
    ],
  },
  {
    id: 'comsol_cfd_simulation',
    name: 'COMSOL CFD Áramlási Szimuláció Futtatása',
    workstream: 'dry_lab_code',
    defaultParameters: {
      'Szoftver': 'COMSOL Multiphysics 6.2',
      'Hálóméret (Elements)': '1 480 000 elem',
      'Navier-Stokes Modell': 'Lamináris, Inkompresszibilis',
      'Relatív Tolerancia': '1e-5',
    },
    steps: [
      { title: '1. STEP geometria importálás és hálósűrítés ellenőrzése', targetMinutes: 5 },
      { title: '2. Folyadéktulajdonságok és peremfeltételek beállítása', targetMinutes: 4 },
      { title: '3. Nem-stacionárius számítás indítása & konvergencia-figyelés', targetMinutes: 20 },
      { title: '4. Sebesség-vektormezők és nyomásesés exportálása CSV-be', targetMinutes: 5 },
    ],
  },
  {
    id: 'custom_protocol',
    name: 'Egyedi Kísérleti / Mérési Protokoll',
    workstream: 'general',
    defaultParameters: {
      'Környezeti hőmérséklet': '23.5 °C',
      'Eszköz': 'Laboratóriumi mérőállomás',
    },
    steps: [
      { title: '1. Előkészítés és eszközök kalibrálása', targetMinutes: 5 },
      { title: '2. Kísérleti mérés végrehajtása', targetMinutes: 15 },
      { title: '3. Eredmények ellenőrzése és dokumentálás', targetMinutes: 5 },
    ],
  },
];

interface LiveLabTimerWidgetProps {
  onSaved?: () => void;
  className?: string;
  isCompact?: boolean;
}

export function LiveLabTimerWidget({
  onSaved,
  className = '',
  isCompact = false,
}: LiveLabTimerWidgetProps) {
  const { currentProfile, addResearchLog } = useStore();

  // Selected Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('microfluidic_chip_flow');
  const [experimentTitle, setExperimentTitle] = useState('Mikrofluidikai Chip Áramlási Mérés #1');
  const [workstream, setWorkstream] = useState<WorkstreamType>('wet_lab');

  // Parameters
  const [parameters, setParameters] = useState<Record<string, string>>({
    'Folytonos fázis sebesség': '15.0 µL/min',
    'Diszpergált fázis sebesség': '2.5 µL/min',
    'Hőmérséklet': '37.0 °C',
    'Kamranyomás': '0.3 mbar',
  });
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamVal, setNewParamVal] = useState('');

  // Steps
  const [steps, setSteps] = useState<ProtocolStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Timer State
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize steps from selected template
  useEffect(() => {
    const template = PROTOCOL_TEMPLATES.find((t) => t.id === selectedTemplateId) || PROTOCOL_TEMPLATES[0];
    setExperimentTitle(`${template.name} — ${new Date().toLocaleDateString('hu-HU')}`);
    setWorkstream(template.workstream);
    setParameters({ ...template.defaultParameters });

    const initialSteps: ProtocolStep[] = template.steps.map((s, idx) => ({
      id: `step-${idx + 1}`,
      title: s.title,
      targetDurationSeconds: (s.targetMinutes || 5) * 60,
      stepNotes: '',
      parameters: {},
    }));

    setSteps(initialSteps);
    setCurrentStepIndex(0);
    setElapsedSeconds(0);
    setIsRunning(false);
  }, [selectedTemplateId]);

  // Timer Interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Format Helpers
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
    if (!isRunning && elapsedSeconds === 0) {
      toast.info('⏱️ Stopper elindítva!', {
        description: `Mérés folyamatban: ${experimentTitle}`,
      });
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setCurrentStepIndex(0);
    setSteps((prev) =>
      prev.map((s) => ({ ...s, completedAtSeconds: undefined, stepNotes: '' }))
    );
    toast.info('Stopper visszaállítva alaphelyzetbe.');
  };

  // Complete current step (Lap)
  const handleCompleteCurrentStep = () => {
    if (currentStepIndex >= steps.length) return;

    setSteps((prev) =>
      prev.map((s, idx) =>
        idx === currentStepIndex
          ? { ...s, completedAtSeconds: elapsedSeconds }
          : s
      )
    );

    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);

    const completedStep = steps[currentStepIndex];
    toast.success(`Lépés kész: ${completedStep?.title}`, {
      description: `Részidő: ${formatTime(elapsedSeconds)}`,
    });
  };

  const handleAddCustomStep = () => {
    const newStepNum = steps.length + 1;
    setSteps((prev) => [
      ...prev,
      {
        id: `step-${Date.now()}`,
        title: `${newStepNum}. Új kísérleti fázis`,
        targetDurationSeconds: 300,
        stepNotes: '',
      },
    ]);
  };

  const handleUpdateStepNote = (index: number, note: string) => {
    setSteps((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, stepNotes: note } : s))
    );
  };

  const handleAddParameter = () => {
    if (!newParamKey.trim() || !newParamVal.trim()) return;
    setParameters((prev) => ({
      ...prev,
      [newParamKey.trim()]: newParamVal.trim(),
    }));
    setNewParamKey('');
    setNewParamVal('');
  };

  const handleRemoveParameter = (key: string) => {
    setParameters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Finish Experiment & Save to Supabase public.research_logs
  const handleSaveToResearchLog = async () => {
    if (elapsedSeconds < 2) {
      toast.warning('A kísérlet ideje túl rövid a mentéshez!');
      return;
    }

    setIsSaving(true);
    setIsRunning(false);

    try {
      // 1. Generate clean markdown protocol
      const now = new Date();
      const dateStr = now.toLocaleDateString('hu-HU');
      const timeStr = now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });

      let markdown = `# Kísérleti Jegyzőkönyv: ${experimentTitle}\n\n`;
      markdown += `**Időpont:** ${dateStr} ${timeStr}  \n`;
      markdown += `**Végrehajtó kutató:** ${currentProfile.full_name} (${currentProfile.short_code})  \n`;
      markdown += `**Teljes mért kísérleti idő:** \`${formatTime(elapsedSeconds)}\` (${elapsedSeconds} mp)  \n`;
      markdown += `**Szakterület:** ${workstream}  \n\n`;

      markdown += `## 1. Rögzített Kísérleti Paraméterek\n\n`;
      markdown += `| Paraméter megnevezése | Beállított / Mért Érték |\n`;
      markdown += `| :--- | :--- |\n`;
      Object.entries(parameters).forEach(([k, v]) => {
        markdown += `| **${k}** | \`${v}\` |\n`;
      });
      markdown += `\n`;

      markdown += `## 2. Végrehajtott Protokoll Lépések és Részidők\n\n`;
      markdown += `| # | Fázis / Lépés megnevezése | Részidő (Lap) | Kutatói Megjegyzés |\n`;
      markdown += `| :--- | :--- | :---: | :--- |\n`;
      steps.forEach((s, idx) => {
        const lap = s.completedAtSeconds !== undefined ? formatTime(s.completedAtSeconds) : 'Folyamatban';
        const note = s.stepNotes?.trim() || 'Nincs külön megjegyzés';
        markdown += `| ${idx + 1}. | ${s.title} | **${lap}** | ${note} |\n`;
      });
      markdown += `\n`;

      markdown += `## 3. Összegzés & Következő Lépés\n\n`;
      markdown += `A kísérlet a RED Lab Live Lab Timer automatizált protokoll-futtatójával került rögzítésre. A kapott mérési pontok és adatsorok illeszkednek a szakdolgozati kutatási tervhez.\n`;

      // 2. Call store method to persist in public.research_logs
      await addResearchLog({
        title: experimentTitle,
        log_date: now.toISOString().split('T')[0],
        workstream: workstream,
        content_markdown: markdown,
        parameters_json: parameters,
        linked_file_ids: [],
      });

      toast.success('Kísérlet sikeresen elmentve a Kutatási Naplóba! 🧪', {
        description: `Teljes időtartam: ${formatTime(elapsedSeconds)}. A jegyzőkönyv megtekinthető a Napló fülön.`,
      });

      if (onSaved) onSaved();
    } catch (err: any) {
      console.error('[LiveLabTimer] Error saving experiment:', err);
      toast.error('Hiba a napló mentése során!', {
        description: err.message || 'Kérjük próbáld újra.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`red-glass-card p-5 sm:p-7 border border-[#1E2230] shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2230]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-lg shadow-rose-950/40">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Lab Timer & Protokoll Futtató
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                ÉLŐ MÉRÉS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ezredmásodperces részidők, paraméterrögzítés és 1-kattintásos jegyzőkönyv generálás
            </p>
          </div>
        </div>

        {/* Template Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400 font-semibold">Sablon:</span>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
          >
            {PROTOCOL_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Large Digital Stopwatch Display & Action Bar */}
      <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#1E2230]">
        <div className="flex items-center space-x-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0D14] border border-slate-800 shadow-inner">
            <div className="font-mono text-4xl sm:text-5xl font-black tracking-widest bg-gradient-to-r from-red-400 via-rose-300 to-red-200 bg-clip-text text-transparent">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 mt-1">
              <span>ÓRA</span>
              <span>PERC</span>
              <span>MÁSODPERC</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                {isRunning ? 'Mérés Fut...' : elapsedSeconds > 0 ? 'Megállítva' : 'Készenlét'}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Aktív lépés: <strong className="text-white">{currentStepIndex + 1} / {steps.length}</strong>
            </div>
            <div className="text-[11px] font-mono text-slate-500 truncate max-w-[200px] sm:max-w-xs">
              {steps[currentStepIndex]?.title || 'Összes lépés teljesítve'}
            </div>
          </div>
        </div>

        {/* Stopwatch Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleStartPause}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
                : 'red-glow-button'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Szünet</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{elapsedSeconds > 0 ? 'Folytatás' : 'Indítás'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleCompleteCurrentStep}
            disabled={!isRunning || currentStepIndex >= steps.length}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition-all shadow-sm"
          >
            <Flag className="w-4 h-4 text-rose-400" />
            <span>Lépés Részidő (Lap)</span>
          </button>

          <button
            onClick={handleReset}
            disabled={elapsedSeconds === 0 && !isRunning}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-400 hover:text-white border border-slate-800 transition-all"
            title="Stopper alaphelyzetbe"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSaveToResearchLog}
            disabled={isSaving || elapsedSeconds < 2}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-950/40 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Mentés...' : 'Befejezés & Mentés'}</span>
          </button>
        </div>
      </div>

      {/* Protocol Steps Checklist & Lap Times */}
      <div className="py-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-slate-400 font-bold">
            <Layers className="w-4 h-4 text-rose-400" />
            <span>Protokoll Lépések és Mért Részidők</span>
          </div>

          <button
            onClick={handleAddCustomStep}
            className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> + Lépés hozzáadása
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {steps.map((step, idx) => {
            const isCompleted = step.completedAtSeconds !== undefined;
            const isCurrent = idx === currentStepIndex && !isCompleted;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                    : isCurrent
                    ? 'bg-rose-950/30 border-rose-800/60 ring-1 ring-rose-500/30 text-white'
                    : 'bg-slate-900/20 border-slate-800/40 text-slate-400 opacity-70'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isCurrent
                        ? 'bg-rose-600 text-white shadow-sm shadow-rose-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="font-semibold block truncate">{step.title}</span>
                    <input
                      type="text"
                      placeholder="Megjegyzés a lépéshez (opcionális)..."
                      value={step.stepNotes || ''}
                      onChange={(e) => handleUpdateStepNote(idx, e.target.value)}
                      className="mt-1 w-full max-w-md px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-rose-500 font-sans"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-slate-200">
                      {isCompleted ? (
                        <span className="text-emerald-400 font-mono">
                          {formatTime(step.completedAtSeconds!)}
                        </span>
                      ) : isCurrent ? (
                        <span className="text-rose-400 font-mono animate-pulse">
                          {formatTime(elapsedSeconds)}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">--:--:--</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {isCompleted ? 'LEFUTOTT' : isCurrent ? 'FOLYAMATBAN' : 'VÁRAKOZIK'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Parameters Panel */}
      <div className="pt-4 border-t border-[#1E2230]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-slate-400 font-bold">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Kísérleti Paraméterek ({Object.keys(parameters).length})</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs mb-3">
          {Object.entries(parameters).map(([key, val]) => (
            <div
              key={key}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between group"
            >
              <div className="truncate pr-1">
                <span className="text-[10px] font-mono text-slate-500 block truncate">{key}</span>
                <span className="font-mono text-white font-bold truncate block">{val}</span>
              </div>
              <button
                onClick={() => handleRemoveParameter(key)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1"
                title="Törlés"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Parameter Row */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Új paraméter neve (pl. Áramlás)"
            value={newParamKey}
            onChange={(e) => setNewParamKey(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono flex-1 min-w-[140px]"
          />
          <input
            type="text"
            placeholder="Érték (pl. 15 µL/min)"
            value={newParamVal}
            onChange={(e) => setNewParamVal(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono flex-1 min-w-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddParameter();
            }}
          />
          <button
            onClick={handleAddParameter}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
          >
            <Plus className="w-3 h-3" /> Hozzáadás
          </button>
        </div>
      </div>
    </div>
  );
}
