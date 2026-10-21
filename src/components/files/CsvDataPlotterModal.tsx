'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  X,
  LineChart as LineChartIcon,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Layers,
  Sparkles,
  Calculator,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

interface CsvDataPlotterModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  rawContent?: string;
}

const PALETTE = ['#E11D48', '#10B981', '#0EA5E9', '#F59E0B', '#8B5CF6', '#EC4899'];

// Default sample measurement dataset if empty
const SAMPLE_CSV = `time_sec,flow_rate_uL_min,pressure_kPa,cell_count,temp_celsius
0,0.0,0.0,12,36.8
5,3.2,0.8,45,36.9
10,7.5,1.9,98,37.0
15,12.1,3.4,180,37.0
20,15.0,4.8,245,37.1
25,15.2,5.1,280,37.1
30,14.9,5.0,295,37.0
35,15.1,5.2,310,37.2
40,15.0,5.1,325,37.1
45,15.3,5.3,340,37.0
50,14.8,4.9,350,37.1
55,10.2,3.1,355,37.0
60,5.0,1.2,358,36.9`;

export function CsvDataPlotterModal({
  isOpen,
  onClose,
  fileName,
  rawContent,
}: CsvDataPlotterModalProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [mobileTab, setMobileTab] = useState<'chart' | 'data'>('chart');

  // Parse CSV or JSON content
  const { data, columns, numericColumns } = useMemo(() => {
    const text = (rawContent && rawContent.trim().length > 10) ? rawContent : SAMPLE_CSV;

    // Check if JSON
    if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(text);
        const rows = Array.isArray(parsed) ? parsed : [parsed];
        const cols = Object.keys(rows[0] || {});
        const numCols = cols.filter((c) => typeof rows[0][c] === 'number');
        return { data: rows, columns: cols, numericColumns: numCols };
      } catch {
        // Fall back to CSV parsing
      }
    }

    // CSV parsing
    const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return { data: [], columns: [], numericColumns: [] };
    }

    const separator = lines[0].includes(';') ? ';' : ',';
    const cols = lines[0].split(separator).map((c) => c.trim().replace(/^["']|["']$/g, ''));

    const rows = lines.slice(1).map((line) => {
      const values = line.split(separator);
      const rowObj: Record<string, any> = {};
      cols.forEach((col, idx) => {
        const val = values[idx]?.trim().replace(/^["']|["']$/g, '');
        const num = Number(val);
        rowObj[col] = !isNaN(num) && val !== '' ? num : val;
      });
      return rowObj;
    });

    const numCols = cols.filter((col) => rows.some((r) => typeof r[col] === 'number'));

    return { data: rows, columns: cols, numericColumns: numCols };
  }, [rawContent]);

  // Selected X and Y axes
  const [xAxisKey, setXAxisKey] = useState<string>(() => columns[0] || 'time_sec');
  const [selectedYKeys, setSelectedYKeys] = useState<string[]>(() => {
    const candidate = numericColumns.filter((c) => c !== columns[0]);
    return candidate.slice(0, 2);
  });

  // Calculate statistics for selected Y columns
  const stats = useMemo(() => {
    return selectedYKeys.map((key) => {
      const values = data
        .map((r) => Number(r[key]))
        .filter((v) => !isNaN(v) && v !== null && v !== undefined);

      if (values.length === 0) {
        return { key, min: 0, max: 0, mean: 0, sd: 0, count: 0 };
      }

      const min = Math.min(...values);
      const max = Math.max(...values);
      const sum = values.reduce((acc, curr) => acc + curr, 0);
      const mean = sum / values.length;
      const variance = values.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / values.length;
      const sd = Math.sqrt(variance);

      return {
        key,
        min: Number(min.toFixed(3)),
        max: Number(max.toFixed(3)),
        mean: Number(mean.toFixed(3)),
        sd: Number(sd.toFixed(3)),
        count: values.length,
      };
    });
  }, [data, selectedYKeys]);

  const toggleYAxis = (key: string) => {
    if (selectedYKeys.includes(key)) {
      if (selectedYKeys.length > 1) {
        setSelectedYKeys((prev) => prev.filter((k) => k !== key));
      } else {
        toast.warning('Legalább egy Y tengely kiválasztása kötelező.');
      }
    } else {
      setSelectedYKeys((prev) => [...prev, key]);
    }
  };

  const handleExportCsv = () => {
    const blob = new Blob([rawContent || SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Mérési adatok letöltve.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0A0D15] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-900/40 ring-1 ring-white/20">
              <LineChartIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Laboratóriumi & Szimulációs Adat-Vizualizáló
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {fileName}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interaktív görbeelemzés, többdimenziós összehasonlítás és statisztika
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Nyers CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile View Tab Selector (< md:) */}
        <div className="md:hidden flex items-center border-b border-slate-800 bg-slate-950 px-3 py-1.5 shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setMobileTab('chart')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 touch-target transition-all ${
              mobileTab === 'chart'
                ? 'bg-rose-950 text-rose-200 border border-rose-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChartIcon className="w-4 h-4 text-rose-400" />
            <span>📈 Grafikon</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('data')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 touch-target transition-all ${
              mobileTab === 'data'
                ? 'bg-rose-950 text-rose-200 border border-rose-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4 text-rose-400" />
            <span>📊 Adatok & Statisztika</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Chart Section (Visible on desktop and mobile 'chart' tab) */}
          <div className={mobileTab === 'chart' ? 'space-y-4' : 'hidden md:block space-y-4'}>
            {/* Controls Bar */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {/* Chart Type Toggle */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  chartType === 'line'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                <span>Vonaldiagram</span>
              </button>

              <button
                type="button"
                onClick={() => setChartType('area')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  chartType === 'area'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Területdiagram</span>
              </button>

              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  chartType === 'bar'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Oszlopdiagram</span>
              </button>
            </div>

            {/* X Axis Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                X Tengely:
              </span>
              <select
                value={xAxisKey}
                onChange={(e) => setXAxisKey(e.target.value)}
                className="bg-[#141A29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Y Axes Checkboxes */}
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                Y Tengelyek:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {numericColumns
                  .filter((col) => col !== xAxisKey)
                  .map((col, idx) => {
                    const isSelected = selectedYKeys.includes(col);
                    const color = PALETTE[idx % PALETTE.length];
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => toggleYAxis(col)}
                        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                          isSelected
                            ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 opacity-60'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span>{col}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="w-full h-80 sm:h-96 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            {data.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                Nincs megjeleníthető numerikus adat.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey={xAxisKey} stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    {selectedYKeys.map((key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={PALETTE[i % PALETTE.length]}
                        strokeWidth={2.4}
                        dot={{ r: 3, fill: PALETTE[i % PALETTE.length] }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      {selectedYKeys.map((key, i) => (
                        <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.6} />
                          <stop offset="95%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey={xAxisKey} stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    {selectedYKeys.map((key, i) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={PALETTE[i % PALETTE.length]}
                        fillOpacity={1}
                        fill={`url(#grad_${key})`}
                      />
                    ))}
                  </AreaChart>
                ) : (
                  <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey={xAxisKey} stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    {selectedYKeys.map((key, i) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={PALETTE[i % PALETTE.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
          </div>

          {/* Statistical Quick Analysis Cards (Visible on desktop and mobile 'data' tab) */}
          <div className={mobileTab === 'data' ? 'space-y-3' : 'hidden md:block space-y-3'}>
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Statisztikai Gyorselemzés (Kiválasztott Paraméterek)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {stats.map((s, idx) => {
                const color = PALETTE[idx % PALETTE.length];
                return (
                  <div
                    key={s.key}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: color }}
                    />

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{s.key}</span>
                      <span className="text-[10px] font-mono text-slate-400">N = {s.count}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 block text-[9px] uppercase">Min</span>
                        <span className="text-slate-200 font-bold">{s.min}</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 block text-[9px] uppercase">Max</span>
                        <span className="text-slate-200 font-bold">{s.max}</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 block text-[9px] uppercase">Átlag (Mean)</span>
                        <span className="text-rose-300 font-bold">{s.mean}</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 block text-[9px] uppercase">Szórás (SD)</span>
                        <span className="text-amber-300 font-bold">±{s.sd}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            {data.length} adatsor feldolgozva • RED Lab Visualization Engine
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}
