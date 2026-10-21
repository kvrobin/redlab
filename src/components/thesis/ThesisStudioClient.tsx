'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/store';
import {
  ResearchLog,
  ThesisFigureMapping,
  ThesisChapterMetadata,
  ThesisChapterStatus,
  RepositoryFile,
  LiteratureItem,
} from '@/types/database';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Quote,
  Sparkles,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Eye,
  Edit3,
  Columns,
  Table,
  CheckCircle2,
  Clock,
  User,
  ChevronRight,
  Layers,
  ArrowRight,
  Send,
  X,
  FileCode2,
} from 'lucide-react';
import {
  generateLatexThesis,
  generateBibtex,
  generateMarkdownThesis,
  downloadFile,
} from '@/lib/thesis-exporter';
import { toast } from 'sonner';

export function ThesisStudioClient() {
  const {
    researchLogs,
    addResearchLog,
    updateResearchLog,
    deleteResearchLog,
    repositoryFiles,
    literatureItems,
    updateLiteratureStatus,
    currentProfile,
  } = useStore();

  // Filter research logs for thesis writing chapters
  const chapters = useMemo(() => {
    return researchLogs.filter(
      (log) =>
        log.workstream === 'thesis_writing' &&
        (log.parameters_json?.is_thesis_chapter === true ||
          log.parameters_json?.chapter_number !== undefined)
    ).sort((a, b) => {
      const numA = (a.parameters_json?.chapter_number as number) ?? 99;
      const numB = (b.parameters_json?.chapter_number as number) ?? 99;
      return numA - numB;
    });
  }, [researchLogs]);

  // Active selected chapter ID
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  useEffect(() => {
    if (chapters.length > 0 && (!selectedChapterId || !chapters.some((c) => c.id === selectedChapterId))) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  const activeChapter = useMemo(() => {
    return chapters.find((c) => c.id === selectedChapterId) || chapters[0] || null;
  }, [chapters, selectedChapterId]);

  // Main UI Mode: 'editor' (Chapter Studio) | 'matrix' (Global Table)
  const [mainView, setMainView] = useState<'editor' | 'matrix'>('editor');

  // Sub-tabs in Chapter Studio: 'content' | 'figures' | 'literature'
  const [chapterTab, setChapterTab] = useState<'content' | 'figures' | 'literature'>('content');

  // Content Editor view mode: 'edit' | 'preview' | 'split'
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('edit');

  // Local draft state for the active chapter content to allow smooth editing
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync local draft when selected chapter changes
  useEffect(() => {
    if (activeChapter) {
      setLocalTitle(activeChapter.title);
      setLocalContent(activeChapter.content_markdown || '');
      setHasUnsavedChanges(false);
    }
  }, [activeChapter?.id]);

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'latex' | 'bibtex' | 'markdown'>('latex');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Chapter Modal state
  const [isNewChapterModalOpen, setIsNewChapterModalOpen] = useState(false);
  const [newChapterNumber, setNewChapterNumber] = useState<number>(chapters.length + 1);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterAssignee, setNewChapterAssignee] = useState<'R' | 'E' | 'D' | 'P'>('R');
  const [newChapterWords, setNewChapterWords] = useState<number>(2000);

  // Attach Figure Modal state
  const [isAttachFigureOpen, setIsAttachFigureOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState('');
  const [figNumberInput, setFigNumberInput] = useState('');
  const [figCaptionInput, setFigCaptionInput] = useState('');
  const [figLatexLabelInput, setFigLatexLabelInput] = useState('');

  // Attach Paper Modal state
  const [isAttachPaperOpen, setIsAttachPaperOpen] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState('');

  // Helper metrics
  const totalWords = useMemo(() => {
    return chapters.reduce((sum, ch) => {
      const text = ch.content_markdown?.trim() || '';
      const count = text ? text.split(/\s+/).filter(Boolean).length : 0;
      return sum + count;
    }, 0);
  }, [chapters]);

  const targetWords = useMemo(() => {
    return chapters.reduce((sum, ch) => {
      const target = (ch.parameters_json?.target_word_count as number) || 2000;
      return sum + target;
    }, 0);
  }, [chapters]);

  const progressPercent = targetWords > 0 ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0;
  const estimatedPages = Math.max(1, Math.ceil(totalWords / 250));

  const totalFiguresCount = useMemo(() => {
    return chapters.reduce((sum, ch) => {
      const figs = (ch.parameters_json?.figure_mappings as any[]) || [];
      return sum + figs.length;
    }, 0);
  }, [chapters]);

  const totalCitationsCount = useMemo(() => {
    const allLit = new Set<string>();
    chapters.forEach((ch) => {
      const lit = (ch.parameters_json?.linked_literature_ids as string[]) || [];
      lit.forEach((id) => allLit.add(id));
    });
    return allLit.size;
  }, [chapters]);

  // Current chapter metrics
  const activeChapterWords = useMemo(() => {
    const text = localContent.trim();
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  }, [localContent]);

  const activeChapterTarget = (activeChapter?.parameters_json?.target_word_count as number) || 2000;
  const activeChapterProgress = Math.min(100, Math.round((activeChapterWords / activeChapterTarget) * 100));

  // 1-Click 5-Chapter Template Initializer
  const handleInitializeTemplate = async () => {
    setIsSaving(true);
    try {
      const defaultChapters = [
        {
          num: 1,
          title: '1. Bevezetés és Célkitűzések',
          assigned: 'R',
          words: 1500,
          content: `## 1.1 A kutatás háttere és motivációja\n\nA modern mikrobiológiai és farmakológiai kutatásokban egyre sürgetőbb igény mutatkozik olyan *in vitro* fiziológiai modellek kidolgozására, amelyek képesek hitelesen reprodukálni az emberi szervezet komplex szervi mikrokörnyezetét. A gyógyszerfejlesztés egyik legkritikusabb szűk keresztmetszete a vér-agy gát (Blood-Brain Barrier, BBB) célzott átjárhatósága.\n\n## 1.2 Kutatási célkitűzések\n\nJelen kutatómunka célja egy biomimetikus, többcsatornás mikrofluidikai chip tervezése, mikroszkópos karakterizálása és numerikus áramlástani modellezése, amely alkalmas endothel- és asztrocita ko-kultúrák dinamikus folyadékáramlás melletti vizsgálatára.\n\n- Újszerű PDMS/PMMA hibrid mikrofluidikai chip tervezése és gyártása\n- Mikrocsatorna-áramlások numerikus szimulációja (COMSOL Multiphysics / OpenFOAM)\n- In vitro TEER (Transepithelial Electrical Resistance) mérések validálása\n- Automatizált mikroszkópos képfeldolgozó algoritmus kifejlesztése`,
        },
        {
          num: 2,
          title: '2. Irodalmi Áttekintés – Vér-agy gát és Biomikrofluidika',
          assigned: 'E',
          words: 3500,
          content: `## 2.1 A vér-agy gát anatómiai és funkcionális felépítése\n\nA vér-agy gát a központi idegrendszer (KIR) homeosztázisának legfontosabb védelmi vonala. A kapilláris endothel sejtek közötti szoros kapcsolatok (tight junctions: claudin-5, occludin, ZO-1) megakadályozzák a hidrofil és nagymolekulájú anyagok paracelluláris transzportját.\n\n## 2.2 Mikrofluidikai Organ-on-a-Chip rendszerek fejlettsége\n\nA hagyományos statikus Transwell® rendszerekkel szemben a mikrofluidikai chip modellek legfőbb előnye a fiziológiás lamináris nyírófeszültség (shear stress: 0.1–1.5 Pa) folyamatos biztosítása. A hidrodinamikai hatások elősegítik az endothel sejtek elongációját és a szoros kapcsolatok megerősödését.\n\n## 2.3 Szakirodalmi összehasonlító elemzés\n\nA közelmúltban publikált mikrofluidikai BBB modellek architektúráinak és membrántulajdonságainak szisztematikus összehasonlítása.`,
        },
        {
          num: 3,
          title: '3. Anyagok és Módszerek – Chip tervezés, Wet-Lab és Szimuláció',
          assigned: 'E',
          words: 3000,
          content: `## 3.1 A mikrofluidikai chip CAD tervezése és gyártástechnológiája\n\nA kétcsatornás geometriát Autodesk Fusion és SolidWorks szoftverekben parametrizáltuk. A felső (véráram) és alsó (agyi parenchima) csatornákat 10 µm vastagságú, 0.4 µm pórusméretű porózus poliészter (PET) membrán választja el egymástól.\n\n## 3.2 Sejttenyésztés és seeder protokollok\n\nHumán agyi mikrovaszkuláris endothel sejtek (hBMEC) és primer asztrociták ko-kultúrájának fenntartása. ECM (Extracellular Matrix) bevonatként kollagén I és fibronektin keverékét alkalmaztuk.\n\n## 3.3 Számítási mechanika és CFD peremfeltételek\n\nA Navier-Stokes egyenletek diszkretizációja végeselem-módszerrel történt. A folyadékot newtoni, inkompresszibilis kontinuumként modelleztük $\\rho = 1000\\text{ kg/m}^3$ és $\\mu = 1.0\\times 10^{-3}\\text{ Pa}\\cdot\\text{s}$ viszkozitási paraméterekkel.`,
        },
        {
          num: 4,
          title: '4. Kísérleti és Szimulációs Eredmények',
          assigned: 'D',
          words: 3500,
          content: `## 4.1 Sebességmező és nyírófeszültség eloszlás a csatornában\n\nA numerikus szimulációk igazolták, hogy $15\\;\\mu\\text{L/min}$ bemeneti térfogatáram mellett a porózus membrán felületén a nyírófeszültség átlaga $0.42\\;\\text{Pa}$, ami tökéletesen egybeesik a kapillárisok fiziológiás értéktartományával.\n\n## 4.2 Mikroszkópos képalkotás és áramlási validáció\n\nFluoreszcens mikrogolyók (1 µm polisztirol) segítségével végzett Particle Image Velocimetry (PIV) mérések $96.8\\%$-os egyezést mutattak a szimulált sebességprofilokkal.\n\n## 4.3 Gátintegritás és permeabilitási vizsgálatok\n\nFITC-dextrán (4 kDa és 70 kDa) permeabilitási koefficiensének mérése a perfúziós idő függvényében.`,
        },
        {
          num: 5,
          title: '5. Értékelés, Konklúzió és Jövőbeli Irányok',
          assigned: 'R',
          words: 1500,
          content: `## 5.1 Eredmények összegzése\n\nA kidolgozott RED Lab mikrofluidikai platform sikeresen integrálta a precíziós CAD csatornatervezést, a numerikus áramlástani modellezést és az in vitro wet-lab kísérleteket.\n\n## 5.2 A kutatás korlátai és gyakorlati alkalmazhatósága\n\nA modell lehetőséget teremt neurodegeneratív gyógyszerjelöltek preklinikai szűrésére állatkísérletek kiváltásával (3R elv: Replacement, Reduction, Refinement).\n\n## 5.3 Jövőbeli fejlesztési irányok\n\nValós idejű optikai impedancia-szenzorok és mikroszkópos AI sejtmozgás-követő algoritmusok integrálása a chipbe.`,
        },
      ];

      for (const ch of defaultChapters) {
        await addResearchLog({
          title: ch.title,
          log_date: new Date().toISOString().split('T')[0],
          workstream: 'thesis_writing',
          content_markdown: ch.content,
          parameters_json: {
            is_thesis_chapter: true,
            chapter_number: ch.num,
            section_code: `${ch.num}`,
            status: 'in_progress',
            assigned_to_code: ch.assigned,
            target_word_count: ch.words,
            linked_literature_ids: [],
            figure_mappings: [],
          },
          linked_file_ids: [],
        });
      }

      toast.success('🎓 5 fejezetes szakdolgozat gerinc sikeresen létrehozva a Supabase-ben!');
    } catch (err: any) {
      console.error(err);
      toast.error('Hiba az alapstruktúra létrehozásakor!');
    } finally {
      setIsSaving(false);
    }
  };

  // Save changes to current chapter
  const handleSaveActiveChapter = async () => {
    if (!activeChapter) return;
    setIsSaving(true);
    try {
      const currentParams = activeChapter.parameters_json || {};
      await updateResearchLog(activeChapter.id, {
        title: localTitle.trim() || activeChapter.title,
        content_markdown: localContent,
        parameters_json: {
          ...currentParams,
          is_thesis_chapter: true,
        },
      });
      setHasUnsavedChanges(false);
      toast.success('Fejezet elmentve a felhőbe! 💾');
    } catch (err: any) {
      console.error(err);
      toast.error('Hiba a mentés során!');
    } finally {
      setIsSaving(false);
    }
  };

  // Update chapter status
  const handleUpdateStatus = async (newStatus: ThesisChapterStatus) => {
    if (!activeChapter) return;
    const currentParams = activeChapter.parameters_json || {};
    await updateResearchLog(activeChapter.id, {
      parameters_json: {
        ...currentParams,
        status: newStatus,
      },
    });
    toast.success(`Fejezet státusza módosítva: ${newStatus}`);
  };

  // Update chapter assignee
  const handleUpdateAssignee = async (newAssignee: string) => {
    if (!activeChapter) return;
    const currentParams = activeChapter.parameters_json || {};
    await updateResearchLog(activeChapter.id, {
      parameters_json: {
        ...currentParams,
        assigned_to_code: newAssignee,
      },
    });
    toast.success(`Felelős átállítva: ${newAssignee}`);
  };

  // Update target words
  const handleUpdateTargetWords = async (newTarget: number) => {
    if (!activeChapter || isNaN(newTarget) || newTarget <= 0) return;
    const currentParams = activeChapter.parameters_json || {};
    await updateResearchLog(activeChapter.id, {
      parameters_json: {
        ...currentParams,
        target_word_count: newTarget,
      },
    });
    toast.success(`Cél-szószám beállítva: ${newTarget} szó`);
  };

  // Attach a figure to active chapter
  const handleAttachFigure = async () => {
    if (!activeChapter || !selectedFileId) {
      toast.error('Kérlek válassz ki egy fájlt a Fájltárból!');
      return;
    }

    const file = repositoryFiles.find((f) => f.id === selectedFileId);
    if (!file) return;

    const currentParams = activeChapter.parameters_json || {};
    const existingFigures: ThesisFigureMapping[] = currentParams.figure_mappings || [];

    const figNum =
      figNumberInput.trim() ||
      `${currentParams.chapter_number || 1}.${existingFigures.length + 1}`;
    const cleanLabel =
      figLatexLabelInput.trim() ||
      `fig:${file.file_group_key.replace(/[^a-zA-Z0-9]/g, '_')}_${figNum.replace(/\./g, '_')}`;

    const newFigureMapping: ThesisFigureMapping = {
      figure_number: figNum,
      file_id: file.id,
      file_group_key: file.file_group_key,
      pinned_version: file.version_number,
      caption: figCaptionInput.trim() || `${file.file_name} ábrázolása.`,
      latex_label: cleanLabel,
    };

    const updatedFigures = [...existingFigures, newFigureMapping];
    const updatedLinkedFiles = Array.from(new Set([...(activeChapter.linked_file_ids || []), file.id]));

    await updateResearchLog(activeChapter.id, {
      linked_file_ids: updatedLinkedFiles,
      parameters_json: {
        ...currentParams,
        figure_mappings: updatedFigures,
      },
    });

    setIsAttachFigureOpen(false);
    setSelectedFileId('');
    setFigCaptionInput('');
    setFigNumberInput('');
    setFigLatexLabelInput('');
    toast.success(`Ábra (${figNum}) csatolva a fejezethez! 🖼️`);
  };

  // Remove a figure from active chapter
  const handleRemoveFigure = async (indexToRemove: number) => {
    if (!activeChapter) return;
    const currentParams = activeChapter.parameters_json || {};
    const existingFigures: ThesisFigureMapping[] = currentParams.figure_mappings || [];
    const updatedFigures = existingFigures.filter((_, idx) => idx !== indexToRemove);

    await updateResearchLog(activeChapter.id, {
      parameters_json: {
        ...currentParams,
        figure_mappings: updatedFigures,
      },
    });
    toast.success('Ábra eltávolítva a fejezetből.');
  };

  // Version Drift Fix: Upgrade pinned version of figure
  const handleUpgradeFigureVersion = async (figIndex: number, latestFile: RepositoryFile) => {
    if (!activeChapter) return;
    const currentParams = activeChapter.parameters_json || {};
    const existingFigures: ThesisFigureMapping[] = [...(currentParams.figure_mappings || [])];

    if (!existingFigures[figIndex]) return;

    existingFigures[figIndex] = {
      ...existingFigures[figIndex],
      file_id: latestFile.id,
      pinned_version: latestFile.version_number,
    };

    const updatedLinkedFiles = Array.from(
      new Set([...(activeChapter.linked_file_ids || []), latestFile.id])
    );

    await updateResearchLog(activeChapter.id, {
      linked_file_ids: updatedLinkedFiles,
      parameters_json: {
        ...currentParams,
        figure_mappings: existingFigures,
      },
    });
    toast.success(`Ábra verziója frissítve v${latestFile.version_number}-re! 🚀`);
  };

  // Attach a literature paper to active chapter
  const handleAttachPaper = async () => {
    if (!activeChapter || !selectedPaperId) {
      toast.error('Kérlek válassz ki egy cikket a Szakirodalom Tárból!');
      return;
    }

    const currentParams = activeChapter.parameters_json || {};
    const existingLit: string[] = currentParams.linked_literature_ids || [];

    if (existingLit.includes(selectedPaperId)) {
      toast.info('Ez a cikk már hozzá van rendelve a fejezethez.');
      return;
    }

    const updatedLit = [...existingLit, selectedPaperId];

    await updateResearchLog(activeChapter.id, {
      parameters_json: {
        ...currentParams,
        linked_literature_ids: updatedLit,
      },
    });

    // Mark literature status as cited_in_thesis in Supabase
    await updateLiteratureStatus(selectedPaperId, 'cited_in_thesis');

    setIsAttachPaperOpen(false);
    setSelectedPaperId('');
    toast.success('Szakirodalmi hivatkozás csatolva a fejezethez! 📚');
  };

  // Detach paper from chapter
  const handleDetachPaper = async (paperId: string) => {
    if (!activeChapter) return;
    const currentParams = activeChapter.parameters_json || {};
    const existingLit: string[] = currentParams.linked_literature_ids || [];
    const updatedLit = existingLit.filter((id) => id !== paperId);

    await updateResearchLog(activeChapter.id, {
      parameters_json: {
        ...currentParams,
        linked_literature_ids: updatedLit,
      },
    });
    toast.success('Hivatkozás eltávolítva a fejezetből.');
  };

  // Create new chapter
  const handleCreateNewChapter = async () => {
    if (!newChapterTitle.trim()) {
      toast.error('Kérlek adj meg egy fejezetcímet!');
      return;
    }

    await addResearchLog({
      title: `${newChapterNumber}. ${newChapterTitle.trim()}`,
      log_date: new Date().toISOString().split('T')[0],
      workstream: 'thesis_writing',
      content_markdown: `## ${newChapterNumber}.1 Bevezetés\n\nÍrd ide a fejezet kidolgozandó tartalmát...`,
      parameters_json: {
        is_thesis_chapter: true,
        chapter_number: newChapterNumber,
        section_code: `${newChapterNumber}`,
        status: 'draft',
        assigned_to_code: newChapterAssignee,
        target_word_count: newChapterWords,
        linked_literature_ids: [],
        figure_mappings: [],
      },
      linked_file_ids: [],
    });

    setIsNewChapterModalOpen(false);
    setNewChapterTitle('');
    setNewChapterNumber(chapters.length + 2);
    toast.success('Új fejezet hozzáadva a szakdolgozathoz! ✨');
  };

  // Delete chapter
  const handleDeleteChapter = async (chapterId: string, title: string) => {
    if (confirm(`Biztosan törölni szeretnéd a(z) "${title}" fejezetet?`)) {
      await deleteResearchLog(chapterId);
      toast.success('Fejezet törölve.');
    }
  };

  // Copy to clipboard helper
  const handleCopyText = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} vágólapra másolva! 📋`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* 1. TOP HEADER & METRICS DASHBOARD */}
      <div className="relative rounded-3xl bg-[#0D101A] border border-[#1E2230] p-4 sm:p-6 shadow-xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-36 bg-gradient-to-bl from-rose-600/15 via-red-900/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#1E2230]/70">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-rose-500 text-white shadow-lg shadow-rose-950/60">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Thesis & TDK Studio
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold uppercase">
                    Kézirat & Mátrix
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Interaktív fejezet-építő, ábra/cikk mátrix és LaTeX/Overleaf exportáló
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Template Init + View Switch + Export */}
          <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto">
            {chapters.length === 0 && (
              <button
                onClick={handleInitializeTemplate}
                disabled={isSaving}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-950/60 flex items-center justify-center gap-2 touch-target disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Alapstruktúra Létrehozása (5 Fejezet)</span>
              </button>
            )}

            {/* View Switcher: Editor vs Matrix */}
            <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-[#1E2230]">
              <button
                onClick={() => setMainView('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all touch-target ${
                  mainView === 'editor'
                    ? 'bg-rose-950 text-rose-200 border border-rose-800/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Műhely</span>
              </button>
              <button
                onClick={() => setMainView('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all touch-target ${
                  mainView === 'matrix'
                    ? 'bg-rose-950 text-rose-200 border border-rose-800/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Dolgozat Mátrix</span>
              </button>
            </div>

            {/* Export Package Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1a1f30] text-slate-200 hover:text-white border border-[#23283c] hover:border-rose-500/50 text-xs font-bold flex items-center justify-center gap-2 transition-all touch-target shadow-sm"
            >
              <Download className="w-4 h-4 text-rose-400" />
              <span>LaTeX & Export</span>
            </button>
          </div>
        </div>

        {/* METRICS BAR: Word count, Progress, Pages, Figures, Citations */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
          {/* 1. Összes Szószám */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-[#1E2230]">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-medium">Kézirat Szószám</span>
              <span className="font-mono text-rose-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-white font-mono">
              {totalWords.toLocaleString('hu-HU')}{' '}
              <span className="text-xs text-slate-400 font-normal">
                / {targetWords.toLocaleString('hu-HU')} szó
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-rose-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 2. Becsült Oldalszám */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-[#1E2230]">
            <span className="text-slate-400 text-xs block mb-1 font-medium">
              Becsült Terjedelem
            </span>
            <div className="text-lg sm:text-xl font-bold text-slate-100 font-mono">
              ~{estimatedPages}{' '}
              <span className="text-xs text-slate-400 font-normal">oldal (A4)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-2 block">
              250 szó / szabvány oldal
            </span>
          </div>

          {/* 3. Csatolt Ábrák */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-[#1E2230]">
            <span className="text-slate-400 text-xs block mb-1 font-medium">
              Csatolt Kísérleti Ábrák
            </span>
            <div className="text-lg sm:text-xl font-bold text-rose-300 font-mono flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-rose-500" />
              <span>{totalFiguresCount} db</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-2 block">
              CAD, fotó és plot mátrix
            </span>
          </div>

          {/* 4. Szakirodalmi Hivatkozások */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-[#1E2230]">
            <span className="text-slate-400 text-xs block mb-1 font-medium">
              Idézett Szakirodalom
            </span>
            <div className="text-lg sm:text-xl font-bold text-blue-300 font-mono flex items-center gap-1.5">
              <Quote className="w-4 h-4 text-blue-400" />
              <span>{totalCitationsCount} forrás</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-2 block">
              BibTeX automatikus export
            </span>
          </div>
        </div>
      </div>

      {/* 2. GLOBAL THESIS MATRIX VIEW */}
      {mainView === 'matrix' && (
        <div className="rounded-3xl bg-[#0D101A] border border-[#1E2230] p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Globális Szakdolgozat & TDK Fejezet Mátrix
              </h2>
              <p className="text-xs text-slate-400">
                A fejezetek előrehaladása, felelősei, csatolt kísérleti ábrái és bibliográfiája egyetlen táblázatban
              </p>
            </div>
            <button
              onClick={() => setIsNewChapterModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 text-xs font-semibold flex items-center gap-1.5 touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Új Fejezet</span>
            </button>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2230] text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-3">Szám</th>
                  <th className="py-3 px-3">Fejezet Címe</th>
                  <th className="py-3 px-3">Felelős</th>
                  <th className="py-3 px-3">Státusz</th>
                  <th className="py-3 px-3">Szószám</th>
                  <th className="py-3 px-3">Ábrák</th>
                  <th className="py-3 px-3">Hivatkozások</th>
                  <th className="py-3 px-3 text-right">Művelet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2230]/60">
                {chapters.map((ch) => {
                  const meta = ch.parameters_json || {};
                  const words = ch.content_markdown?.trim()
                    ? ch.content_markdown.trim().split(/\s+/).filter(Boolean).length
                    : 0;
                  const target = (meta.target_word_count as number) || 2000;
                  const pct = Math.min(100, Math.round((words / target) * 100));
                  const figs: any[] = meta.figure_mappings || [];
                  const lits: any[] = meta.linked_literature_ids || [];

                  return (
                    <tr
                      key={ch.id}
                      onClick={() => {
                        setSelectedChapterId(ch.id);
                        setMainView('editor');
                      }}
                      className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-rose-400">
                        {meta.chapter_number || '•'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200 group-hover:text-white">
                        {ch.title}
                      </td>
                      <td className="py-3 px-3">
                        <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-bold text-white bg-rose-600 shadow-sm">
                          {meta.assigned_to_code || 'R'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            meta.status === 'approved'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                              : meta.status === 'ready_for_review'
                              ? 'bg-purple-950/80 text-purple-300 border-purple-700'
                              : meta.status === 'in_progress'
                              ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          {meta.status === 'approved'
                            ? 'Jóváhagyva'
                            : meta.status === 'ready_for_review'
                            ? 'Ellenőrzésre kész'
                            : meta.status === 'in_progress'
                            ? 'Írás alatt'
                            : 'Vázlat'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        <div>
                          <span>
                            {words} / {target} ({pct}%)
                          </span>
                          <div className="w-20 bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                            <div
                              className="bg-rose-500 h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                          <span>{figs.length} db</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Quote className="w-3.5 h-3.5 text-blue-400" />
                          <span>{lits.length} db</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChapterId(ch.id);
                            setMainView('editor');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-semibold transition-colors"
                        >
                          Szerkesztés ➔
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CHAPTER STUDIO (EDITOR VIEW) */}
      {mainView === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Chapter List Navigation */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Fejezetek ({chapters.length})
              </span>
              <button
                onClick={() => setIsNewChapterModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center gap-1 touch-target"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Új fejezet</span>
              </button>
            </div>

            {/* List of Chapter Cards */}
            <div className="space-y-2">
              {chapters.map((ch) => {
                const isSelected = ch.id === selectedChapterId;
                const meta = ch.parameters_json || {};
                const words = ch.content_markdown?.trim()
                  ? ch.content_markdown.trim().split(/\s+/).filter(Boolean).length
                  : 0;
                const target = (meta.target_word_count as number) || 2000;
                const pct = Math.min(100, Math.round((words / target) * 100));

                return (
                  <div
                    key={ch.id}
                    onClick={() => setSelectedChapterId(ch.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-600/70 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/30'
                        : 'bg-[#0E111C] border-[#1E2230] hover:border-slate-700 hover:bg-[#121624]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-[10px] font-mono font-bold text-rose-300">
                          {meta.chapter_number || '•'}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                          {meta.assigned_to_code || 'R'}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${
                          meta.status === 'approved'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                            : meta.status === 'ready_for_review'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-700'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {meta.status === 'approved'
                          ? 'Jóváhagyva'
                          : meta.status === 'ready_for_review'
                          ? 'Review'
                          : meta.status === 'in_progress'
                          ? 'Írás alatt'
                          : 'Vázlat'}
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-bold leading-snug line-clamp-2 ${
                        isSelected ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {ch.title}
                    </h4>

                    {/* Word progress */}
                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>
                        {words} / {target} szó
                      </span>
                      <span className="font-semibold text-rose-400">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Chapter Workshop */}
          <div className="lg:col-span-8 space-y-4">
            {activeChapter ? (
              <div className="rounded-3xl bg-[#0D101A] border border-[#1E2230] p-4 sm:p-6 shadow-xl space-y-5">
                {/* Chapter Header Controls */}
                <div className="space-y-3 pb-4 border-b border-[#1E2230]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={localTitle}
                        onChange={(e) => {
                          setLocalTitle(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full text-base sm:text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-rose-500 focus:outline-none transition-colors"
                        placeholder="Fejezet címe..."
                      />
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveActiveChapter}
                        disabled={isSaving}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all touch-target ${
                          hasUnsavedChanges
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-rose-950/60 animate-pulse'
                            : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                        }`}
                      >
                        {isSaving ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{hasUnsavedChanges ? 'Mentés Most' : 'Elmentve'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteChapter(activeChapter.id, activeChapter.title)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 touch-target"
                        title="Fejezet törlése"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips: Assignee, Status, Target Words */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Assignee */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-[#1E2230]">
                      <span className="text-[10px] font-mono text-slate-400">Felelős:</span>
                      <select
                        value={activeChapter.parameters_json?.assigned_to_code || 'R'}
                        onChange={(e) => handleUpdateAssignee(e.target.value)}
                        className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="R" className="bg-slate-900">
                          Robin (R)
                        </option>
                        <option value="E" className="bg-slate-900">
                          Emma (E)
                        </option>
                        <option value="D" className="bg-slate-900">
                          Domi (D)
                        </option>
                        <option value="P" className="bg-slate-900">
                          Prof. Kovács (P)
                        </option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-[#1E2230]">
                      <span className="text-[10px] font-mono text-slate-400">Státusz:</span>
                      <select
                        value={activeChapter.parameters_json?.status || 'draft'}
                        onChange={(e) => handleUpdateStatus(e.target.value as ThesisChapterStatus)}
                        className="bg-transparent text-rose-300 font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="draft" className="bg-slate-900">
                          Vázlat
                        </option>
                        <option value="in_progress" className="bg-slate-900">
                          Írás alatt
                        </option>
                        <option value="ready_for_review" className="bg-slate-900">
                          Ellenőrzésre kész
                        </option>
                        <option value="approved" className="bg-slate-900">
                          Jóváhagyva
                        </option>
                      </select>
                    </div>

                    {/* Target Words */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-[#1E2230]">
                      <span className="text-[10px] font-mono text-slate-400">Cél:</span>
                      <input
                        type="number"
                        defaultValue={activeChapterTarget}
                        onBlur={(e) => handleUpdateTargetWords(parseInt(e.target.value, 10))}
                        className="w-16 bg-transparent text-white font-mono focus:outline-none text-right"
                      />
                      <span className="text-slate-500 font-mono text-[10px]">szó</span>
                    </div>

                    {/* Current stats */}
                    <div className="ml-auto text-[11px] font-mono text-slate-400">
                      <span className="font-bold text-white">{activeChapterWords}</span> szó •{' '}
                      <span className="text-rose-400 font-bold">{activeChapterProgress}%</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs: Content Editor | Figure Matrix | Literature Linker */}
                <div className="flex items-center justify-between border-b border-[#1E2230] pb-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setChapterTab('content')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all touch-target ${
                        chapterTab === 'content'
                          ? 'bg-rose-950 text-rose-200 border border-rose-800'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Kézirat & Vázlat</span>
                    </button>

                    <button
                      onClick={() => setChapterTab('figures')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all touch-target relative ${
                        chapterTab === 'figures'
                          ? 'bg-rose-950 text-rose-200 border border-rose-800'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Ábra-Mátrix</span>
                      {(activeChapter.parameters_json?.figure_mappings?.length || 0) > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-[10px] font-mono text-white">
                          {activeChapter.parameters_json?.figure_mappings?.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setChapterTab('literature')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all touch-target relative ${
                        chapterTab === 'literature'
                          ? 'bg-rose-950 text-rose-200 border border-rose-800'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Quote className="w-3.5 h-3.5" />
                      <span>Szakirodalom</span>
                      {(activeChapter.parameters_json?.linked_literature_ids?.length || 0) > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-[10px] font-mono text-white">
                          {activeChapter.parameters_json?.linked_literature_ids?.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Mode toggle for Content tab */}
                  {chapterTab === 'content' && (
                    <div className="hidden sm:flex items-center rounded-lg bg-slate-900 p-0.5 border border-[#1E2230] text-[11px]">
                      <button
                        onClick={() => setEditorMode('edit')}
                        className={`px-2 py-1 rounded ${
                          editorMode === 'edit' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                        }`}
                      >
                        Szerkesztő
                      </button>
                      <button
                        onClick={() => setEditorMode('preview')}
                        className={`px-2 py-1 rounded ${
                          editorMode === 'preview' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                        }`}
                      >
                        Előnézet
                      </button>
                      <button
                        onClick={() => setEditorMode('split')}
                        className={`px-2 py-1 rounded ${
                          editorMode === 'split' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                        }`}
                      >
                        Osztott
                      </button>
                    </div>
                  )}
                </div>

                {/* TAB 1: KÉZIRAT & VÁZLAT SZERKESZTŐ */}
                {chapterTab === 'content' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Editor View */}
                      {(editorMode === 'edit' || editorMode === 'split') && (
                        <div className="space-y-2">
                          <textarea
                            value={localContent}
                            onChange={(e) => {
                              setLocalContent(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="Írd be a fejezet tartalmát Markdown formátumban és LaTeX képletekkel (pl. $E = mc^2$)..."
                            className="w-full min-h-[350px] sm:min-h-[420px] p-4 rounded-2xl bg-[#090C14] border border-[#1E2230] focus:border-rose-500 text-slate-100 font-mono text-base sm:text-sm leading-relaxed focus:outline-none resize-y placeholder-slate-600"
                          />
                        </div>
                      )}

                      {/* Preview View */}
                      {(editorMode === 'preview' || editorMode === 'split') && (
                        <div className="p-5 rounded-2xl bg-[#090C14] border border-[#1E2230] min-h-[350px] overflow-y-auto space-y-3">
                          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 border-b border-[#1E2230] pb-1">
                            Előnézet
                          </div>
                          <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3">
                            {localContent.split('\n\n').map((para, idx) => {
                              const trimmed = para.trim();
                              if (!trimmed) return null;
                              if (trimmed.startsWith('### ')) {
                                return (
                                  <h4 key={idx} className="text-sm font-bold text-rose-300 pt-2">
                                    {trimmed.replace(/^###\s+/, '')}
                                  </h4>
                                );
                              }
                              if (trimmed.startsWith('## ')) {
                                return (
                                  <h3 key={idx} className="text-base font-bold text-white pt-2 border-b border-[#1E2230] pb-1">
                                    {trimmed.replace(/^##\s+/, '')}
                                  </h3>
                                );
                              }
                              if (trimmed.startsWith('# ')) {
                                return (
                                  <h2 key={idx} className="text-lg font-bold text-white pt-2">
                                    {trimmed.replace(/^#\s+/, '')}
                                  </h2>
                                );
                              }
                              if (trimmed.startsWith('- ')) {
                                return (
                                  <ul key={idx} className="list-disc pl-5 space-y-1 text-slate-300">
                                    {trimmed.split('\n').map((li, lidx) => (
                                      <li key={lidx}>{li.replace(/^-\s+/, '')}</li>
                                    ))}
                                  </ul>
                                );
                              }
                              return (
                                <p key={idx} className="text-slate-300 leading-relaxed">
                                  {trimmed}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: ÁBRA-MÁTRIX & VERZIÓCSÚSZÁS DETEKTOR */}
                {chapterTab === 'figures' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Csatolt Kísérleti Ábrák
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          A Fájltárban verziózott CAD modellek, mikroszkópos felvételek és grafikonok
                        </p>
                      </div>

                      <button
                        onClick={() => setIsAttachFigureOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/60 flex items-center gap-1.5 touch-target"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Új Ábra Csatolása</span>
                      </button>
                    </div>

                    {/* Figures List */}
                    {(!activeChapter.parameters_json?.figure_mappings ||
                      activeChapter.parameters_json.figure_mappings.length === 0) ? (
                      <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-[#1E2230] text-center space-y-2">
                        <ImageIcon className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-400">
                          Ehhez a fejezethez még nincs csatolva kísérleti ábra.
                        </p>
                        <button
                          onClick={() => setIsAttachFigureOpen(true)}
                          className="text-xs font-semibold text-rose-400 hover:underline"
                        >
                          Kattints ide egy fájl kiválasztásához a Fájltárból ➔
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeChapter.parameters_json.figure_mappings.map(
                          (fig: ThesisFigureMapping, idx: number) => {
                            // Version Drift Check: find latest in repository_files
                            const allGroupFiles = repositoryFiles.filter(
                              (f) => f.file_group_key === fig.file_group_key
                            );
                            const latestFile =
                              allGroupFiles.find((f) => f.is_latest) ||
                              [...allGroupFiles].sort(
                                (a, b) => b.version_number - a.version_number
                              )[0];

                            const hasDrift = latestFile && latestFile.version_number > fig.pinned_version;

                            return (
                              <div
                                key={idx}
                                className="p-4 rounded-2xl bg-[#090C14] border border-[#1E2230] space-y-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-mono font-bold text-xs shrink-0">
                                      {fig.figure_number}
                                    </div>
                                    <div>
                                      <h5 className="text-xs font-bold text-white">
                                        {fig.figure_number}. Ábra – {fig.caption}
                                      </h5>
                                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-400">
                                        <span>Fájl: <strong className="text-slate-300">{fig.file_group_key}</strong></span>
                                        <span>•</span>
                                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                                          Rögzítve: v{fig.pinned_version}
                                        </span>
                                        <span>•</span>
                                        <span className="text-rose-400">\label&#123;{fig.latex_label}&#125;</span>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleRemoveFigure(idx)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                    title="Ábra eltávolítása a fejezetből"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* VERSION DRIFT ALERT */}
                                {hasDrift && latestFile && (
                                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/60 flex items-center justify-between gap-3 animate-in fade-in">
                                    <div className="flex items-center gap-2 text-xs text-amber-200">
                                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                                      <span>
                                        <strong>Verziócsúszás Detektálva!</strong> Ebben a fejezetben{' '}
                                        <code className="text-amber-300">v{fig.pinned_version}</code> van rögzítve, de a Fájltárban már elérhető az újabb{' '}
                                        <code className="text-emerald-300">v{latestFile.version_number}</code>!
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => handleUpgradeFigureVersion(idx, latestFile)}
                                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm shrink-0 touch-target"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      <span>Frissítés v{latestFile.version_number}-re</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: SZAKIRODALMI HIVATKOZÁSOK & DOI CSATOLÓ */}
                {chapterTab === 'literature' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Fejezethez Rendelt Szakirodalom
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Hivatkozott cikkek, BibTeX kulcsok és automatikus hivatkozás-státusz
                        </p>
                      </div>

                      <button
                        onClick={() => setIsAttachPaperOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800 text-xs font-bold flex items-center gap-1.5 touch-target"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Cikk Csatolása Fejezethez</span>
                      </button>
                    </div>

                    {/* Literature list */}
                    {(!activeChapter.parameters_json?.linked_literature_ids ||
                      activeChapter.parameters_json.linked_literature_ids.length === 0) ? (
                      <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-[#1E2230] text-center space-y-2">
                        <Quote className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-400">
                          Ehhez a fejezethez még nincs csatolva szakirodalmi hivatkozás.
                        </p>
                        <button
                          onClick={() => setIsAttachPaperOpen(true)}
                          className="text-xs font-semibold text-blue-400 hover:underline"
                        >
                          Kattints ide egy cikk kiválasztásához a Szakirodalom Tárból ➔
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeChapter.parameters_json.linked_literature_ids.map(
                          (litId: string) => {
                            const paper = literatureItems.find((l) => l.id === litId);
                            if (!paper) return null;

                            const firstAuthor = (paper.authors || 'ref')
                              .split(',')[0]
                              .split(' ')[0]
                              .toLowerCase()
                              .replace(/[^a-z]/g, '');
                            const year = paper.publication_year || 2024;
                            const citeKey = `${firstAuthor}${year}`;

                            return (
                              <div
                                key={paper.id}
                                className="p-4 rounded-2xl bg-[#090C14] border border-[#1E2230] space-y-2"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-white">
                                        {paper.title}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      {paper.authors} • <em>{paper.journal || 'RED Lab'}</em> (
                                      {paper.publication_year || 'é.n.'})
                                    </p>
                                  </div>

                                  <button
                                    onClick={() => handleDetachPaper(paper.id)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                    title="Hivatkozás leválasztása"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1E2230]/70 text-[10px] font-mono">
                                  <span className="text-slate-400">In-Text LaTeX hivatkozás:</span>
                                  <code className="px-2 py-0.5 rounded bg-slate-900 border border-[#1E2230] text-blue-300 font-bold">
                                    \cite&#123;{citeKey}&#125;
                                  </code>
                                  <button
                                    onClick={() =>
                                      handleCopyText(
                                        `\\cite{${citeKey}}`,
                                        `cite-${paper.id}`,
                                        'LaTeX idézés'
                                      )
                                    }
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>{copiedKey === `cite-${paper.id}` ? 'Másolva!' : 'Másolás'}</span>
                                  </button>

                                  {paper.doi && (
                                    <a
                                      href={`https://doi.org/${paper.doi}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-rose-400 hover:underline flex items-center gap-1 ml-auto"
                                    >
                                      <span>DOI: {paper.doi}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-[#0D101A] border border-[#1E2230] text-center space-y-3">
                <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">
                  Nincs kiválasztva fejezet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Válassz ki egy fejezetet a bal oldali listából vagy hozz létre egy újat a gombbal.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ATTACH FIGURE MODAL */}
      {isAttachFigureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0F121C] border border-[#1E2230] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-white">
                  Kísérleti Ábra Csatolása Fejezethez
                </h3>
              </div>
              <button
                onClick={() => setIsAttachFigureOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Válassz fájlt a Fájltárból:
                </label>
                <select
                  value={selectedFileId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedFileId(id);
                    const f = repositoryFiles.find((x) => x.id === id);
                    if (f && !figCaptionInput) {
                      setFigCaptionInput(`A(z) ${f.file_name} mikroszkópos / CAD felvétele.`);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Válassz egy verziózott fájlt --</option>
                  {repositoryFiles.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.file_name} (v{file.version_number} • {file.folder_category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ábra Száma:
                  </label>
                  <input
                    type="text"
                    value={figNumberInput}
                    onChange={(e) => setFigNumberInput(e.target.value)}
                    placeholder="pl. 1.1 vagy 2.3"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    LaTeX Label:
                  </label>
                  <input
                    type="text"
                    value={figLatexLabelInput}
                    onChange={(e) => setFigLatexLabelInput(e.target.value)}
                    placeholder="pl. fig:chip_cad"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Képaláírás (Caption):
                </label>
                <textarea
                  value={figCaptionInput}
                  onChange={(e) => setFigCaptionInput(e.target.value)}
                  placeholder="pl. A vér-agy gát mikrofluidikai chip 3D modellje és a lamináris áramlási csatornák elrendezése..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E2230]">
              <button
                onClick={() => setIsAttachFigureOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold touch-target"
              >
                Mégse
              </button>
              <button
                onClick={handleAttachFigure}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/60 touch-target"
              >
                Ábra Rögzítése
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ATTACH LITERATURE MODAL */}
      {isAttachPaperOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0F121C] border border-[#1E2230] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-white">
                  Szakirodalom Hivatkozása Fejezethez
                </h3>
              </div>
              <button
                onClick={() => setIsAttachPaperOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Válassz cikket a gyűjteményből:
                </label>
                <select
                  value={selectedPaperId}
                  onChange={(e) => setSelectedPaperId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Válassz egy tudományos cikket --</option>
                  {literatureItems.map((paper) => (
                    <option key={paper.id} value={paper.id}>
                      {paper.authors} ({paper.publication_year || 'é.n.'}): {paper.title.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/50 text-[11px] text-blue-200 space-y-1">
                <p>
                  💡 <strong>Automatikus hivatkozás-követés:</strong>
                </p>
                <p className="text-slate-400">
                  A csatolással a cikk státusza a Szakirodalom modulban automatikusan átvált{' '}
                  <strong className="text-blue-300">„Idézve a dolgozatban”</strong> állapotra, és bekerül a generált BibTeX bibliográfiába.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E2230]">
              <button
                onClick={() => setIsAttachPaperOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold touch-target"
              >
                Mégse
              </button>
              <button
                onClick={handleAttachPaper}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-950/60 touch-target"
              >
                Hivatkozás Csatolása
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. NEW CHAPTER MODAL */}
      {isNewChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0F121C] border border-[#1E2230] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-white">
                  Új Fejezet Hozzáadása
                </h3>
              </div>
              <button
                onClick={() => setIsNewChapterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fejezetszám:
                  </label>
                  <input
                    type="number"
                    value={newChapterNumber}
                    onChange={(e) => setNewChapterNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-white focus:outline-none focus:border-rose-500 text-center font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Felelős Kutató:
                  </label>
                  <select
                    value={newChapterAssignee}
                    onChange={(e) => setNewChapterAssignee(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="R">Robin (Dry Lab / Kód)</option>
                    <option value="E">Emma (Wet Lab / Reagensek)</option>
                    <option value="D">Domi (CAD / Hardver)</option>
                    <option value="P">Prof. Kovács (Témavezető)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Fejezet Címe:
                </label>
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="pl. 6. Eredmények Statisztikai Kiértékelése"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cél Szószám:
                </label>
                <input
                  type="number"
                  value={newChapterWords}
                  onChange={(e) => setNewChapterWords(parseInt(e.target.value, 10) || 2000)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-[#1E2230] text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E2230]">
              <button
                onClick={() => setIsNewChapterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold touch-target"
              >
                Mégse
              </button>
              <button
                onClick={handleCreateNewChapter}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/60 touch-target"
              >
                Fejezet Létrehozása
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. LATEX / BIBTEX / MARKDOWN EXPORT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0F121C] border border-[#1E2230] p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90dvh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2230]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Szakdolgozat & TDK Kézirat Exportáló
                  </h3>
                  <p className="text-xs text-slate-400">
                    Overleaf / TeXLive csomag, BibTeX hivatkozások és Word / Markdown vázlat
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white touch-target flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format Selector Pills */}
            <div className="flex items-center gap-2 pt-4">
              <button
                onClick={() => setExportFormat('latex')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all touch-target ${
                  exportFormat === 'latex'
                    ? 'bg-rose-950 text-rose-200 border border-rose-800 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <FileCode2 className="w-4 h-4 text-rose-400" />
                <span>LaTeX (main.tex)</span>
              </button>

              <button
                onClick={() => setExportFormat('bibtex')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all touch-target ${
                  exportFormat === 'bibtex'
                    ? 'bg-blue-950 text-blue-200 border border-blue-800 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <Quote className="w-4 h-4 text-blue-400" />
                <span>BibTeX (references.bib)</span>
              </button>

              <button
                onClick={() => setExportFormat('markdown')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all touch-target ${
                  exportFormat === 'markdown'
                    ? 'bg-emerald-950 text-emerald-200 border border-emerald-800 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Markdown (Word)</span>
              </button>
            </div>

            {/* Export Code Preview Box */}
            <div className="mt-3 flex-1 overflow-y-auto rounded-2xl bg-[#080A10] border border-[#1E2230] p-4 text-xs font-mono text-slate-300 min-h-[220px]">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {exportFormat === 'latex' &&
                  generateLatexThesis(chapters, repositoryFiles, literatureItems, {
                    author: currentProfile.full_name,
                  })}
                {exportFormat === 'bibtex' &&
                  generateBibtex(
                    Array.from(
                      new Set(
                        chapters.flatMap(
                          (c) => (c.parameters_json?.linked_literature_ids as string[]) || []
                        )
                      )
                    ),
                    literatureItems
                  )}
                {exportFormat === 'markdown' &&
                  generateMarkdownThesis(chapters, repositoryFiles, literatureItems, {
                    author: currentProfile.full_name,
                  })}
              </pre>
            </div>

            {/* Action Bar: Copy & Download */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#1E2230] mt-3">
              <div className="text-[11px] text-slate-400">
                {exportFormat === 'latex' && (
                  <span>🚀 Overleaf tipp: Hozz létre egy új projektet és másold be a kódot!</span>
                )}
                {exportFormat === 'bibtex' && (
                  <span>📚 A LaTeX fájlban használt \cite&#123;...&#125; hivatkozások forráskódja.</span>
                )}
                {exportFormat === 'markdown' && (
                  <span>📄 Kompatibilis Pandoc, MS Word és Typora importálókkal.</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    let content = '';
                    if (exportFormat === 'latex') {
                      content = generateLatexThesis(chapters, repositoryFiles, literatureItems, {
                        author: currentProfile.full_name,
                      });
                    } else if (exportFormat === 'bibtex') {
                      const allIds = Array.from(
                        new Set(
                          chapters.flatMap(
                            (c) => (c.parameters_json?.linked_literature_ids as string[]) || []
                          )
                        )
                      );
                      content = generateBibtex(allIds, literatureItems);
                    } else {
                      content = generateMarkdownThesis(chapters, repositoryFiles, literatureItems, {
                        author: currentProfile.full_name,
                      });
                    }
                    handleCopyText(content, 'export-modal-copy', 'Kód');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-[#1E2230] text-xs font-semibold flex items-center justify-center gap-1.5 touch-target"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedKey === 'export-modal-copy' ? 'Másolva!' : 'Másolás Vágólapra'}</span>
                </button>

                <button
                  onClick={() => {
                    if (exportFormat === 'latex') {
                      const content = generateLatexThesis(chapters, repositoryFiles, literatureItems, {
                        author: currentProfile.full_name,
                      });
                      downloadFile('redlab_thesis_main.tex', content, 'application/x-tex');
                    } else if (exportFormat === 'bibtex') {
                      const allIds = Array.from(
                        new Set(
                          chapters.flatMap(
                            (c) => (c.parameters_json?.linked_literature_ids as string[]) || []
                          )
                        )
                      );
                      const content = generateBibtex(allIds, literatureItems);
                      downloadFile('references.bib', content, 'application/x-bibtex');
                    } else {
                      const content = generateMarkdownThesis(chapters, repositoryFiles, literatureItems, {
                        author: currentProfile.full_name,
                      });
                      downloadFile('thesis_draft.md', content, 'text/markdown');
                    }
                    toast.success('Fájl letöltése megkezdődött! 📥');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/60 flex items-center justify-center gap-1.5 touch-target"
                >
                  <Download className="w-4 h-4" />
                  <span>Letöltés Fájlként</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
