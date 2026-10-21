'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  Search,
  LayoutDashboard,
  Milestone,
  KanbanSquare,
  CalendarDays,
  FolderGit2,
  BookOpen,
  FlaskConical,
  Settings,
  ShieldCheck,
  Plus,
  Clock,
  Eye,
  Sparkles,
  FileSpreadsheet,
  FileCode2,
  FileBox,
  FileText,
  Download,
  Upload,
  ArrowRight,
  CheckCircle2,
  X,
  Command,
  FileDown,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLiveTimer?: () => void;
  onOpenAiBriefing?: () => void;
}

type CategoryFilter = 'all' | 'navigation' | 'actions' | 'data';

// Helper for accent-insensitive search
function normalizeHungarian(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenLiveTimer,
  onOpenAiBriefing,
}: CommandPaletteProps) {
  const router = useRouter();
  const {
    tasks,
    milestones,
    repositoryFiles,
    literatureItems,
    meetings,
    researchLogs,
    currentProfile,
    updateCurrentProfile,
    isSupervisorMode,
    toggleSupervisorMode,
  } = useStore();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global Keyboard Listener for Ctrl+K / Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 1. Navigation items with rich synonyms
  const navigationItems = useMemo(
    () => [
      {
        id: 'nav-dashboard',
        category: 'navigation',
        title: 'Központ / Vezérlőpult',
        subtitle: 'Főoldal, KPI statisztikák, gyors elérés',
        keywords: 'fooldal dashboard attekintes statisztika kpi home vezérlőpult',
        icon: LayoutDashboard,
        action: () => {
          router.push('/dashboard');
          onClose();
        },
      },
      {
        id: 'nav-thesis',
        category: 'navigation',
        title: 'Thesis & TDK Studio',
        subtitle: 'Fejezet-építő, ábra/cikk mátrix és LaTeX exportáló',
        keywords: 'thesis tdk studio fejezetek abra latex bibtex overleaf szakdolgozat kézirat export',
        icon: GraduationCap,
        action: () => {
          router.push('/thesis');
          onClose();
        },
      },
      {
        id: 'nav-milestones',
        category: 'navigation',
        title: 'Haladási Terv & Mérföldkövek',
        subtitle: 'Szakdolgozat fejezetek, professzori jóváhagyás',
        keywords: 'roadmap utemterv fazisok hatarido professzori jovahagyas sign-off szakdoga allas merfoldko',
        icon: Milestone,
        action: () => {
          router.push('/milestones');
          onClose();
        },
      },
      {
        id: 'nav-kanban',
        category: 'navigation',
        title: 'Kanban Tábla & Feladatok',
        subtitle: 'Sprint feladatok, checklist, wet-lab & dry-lab kártyák',
        keywords: 'teendok kartyak sprint todo backlog wet-lab dry-lab munkafolyamat checklist feladatok',
        icon: KanbanSquare,
        action: () => {
          router.push('/kanban');
          onClose();
        },
      },
      {
        id: 'nav-scheduler',
        category: 'navigation',
        title: 'Időpont-egyeztető & Szavazás',
        subtitle: 'Konzultációk, Doodle szavazás, jegyzőkönyvek, Google Naptár',
        keywords: 'meeting konzultacio naptar upvote downvote reschedule ujrautemezes jegyzokonyv ics idopont',
        icon: CalendarDays,
        action: () => {
          router.push('/scheduler');
          onClose();
        },
      },
      {
        id: 'nav-files',
        category: 'navigation',
        title: 'Fájltár & Verziókezelő',
        subtitle: 'CAD modellek, mérési adatok, kézirat verziók (Git-stílusban)',
        keywords: 'feltoltes letoltes github verzio v1 v2 cad csv grafikon diagram adatok dokumentumok fajltar',
        icon: FolderGit2,
        action: () => {
          router.push('/files');
          onClose();
        },
      },
      {
        id: 'nav-literature',
        category: 'navigation',
        title: 'Szakirodalom & DOI Tudástár',
        subtitle: 'Cikkek, BibTeX export, PDF olvasó és AI szintézis',
        keywords: 'cikkek paper folyoirat doi bibtex latex hivatkozas irodalomjegyzek pdf olvaso szakirodalom',
        icon: BookOpen,
        action: () => {
          router.push('/literature');
          onClose();
        },
      },
      {
        id: 'nav-logs',
        category: 'navigation',
        title: 'Kutatási & Labor Napló',
        subtitle: 'Mérések, kísérleti jegyzőkönyvek, élő stopper és paraméterek',
        keywords: 'jegyzokonyv meres kiserlet parameterek stopper timer markdown laborkonyv kutatasi naplo',
        icon: FlaskConical,
        action: () => {
          router.push('/logs');
          onClose();
        },
      },
      {
        id: 'nav-settings',
        category: 'navigation',
        title: 'Beállítások & Csapat',
        subtitle: 'Profil, szerepkör-váltás, Discord webhook, értesítések',
        keywords: 'profil szerepkor role meghivo discord webhook email ertesitesek tema beallitasok',
        icon: Settings,
        action: () => {
          router.push('/settings');
          onClose();
        },
      },
      {
        id: 'nav-privacy',
        category: 'navigation',
        title: 'Adatkezelési Tájékoztató (GDPR)',
        subtitle: 'Hivatalos jogi nyilatkozat, adatkezelő adatai és jogorvoslat',
        keywords: 'gdpr adatvedelem jogi uzemelteto tarhely sutik torles privacy tajekoztato',
        icon: ShieldCheck,
        action: () => {
          router.push('/privacy');
          onClose();
        },
      },
    ],
    [router, onClose]
  );

  // 2. Built-in actions and quick tools
  const actionItems = useMemo(
    () => [
      {
        id: 'act-new-task',
        category: 'actions',
        title: '➕ Új Kanban feladat létrehozása',
        subtitle: 'Teendő kiosztása Robin, Emma vagy Domi számára',
        keywords: 'uj feladat hozzaadas kanban add task create',
        icon: Plus,
        action: () => {
          router.push('/kanban?new=true');
          onClose();
        },
      },
      {
        id: 'act-new-meeting',
        category: 'actions',
        title: '📅 Új konzultációs időpont-szavazás kiírása',
        subtitle: 'Doodle-stílusú upvote/downvote sávok professzorral',
        keywords: 'uj megbeszeles konzultacio idopont meeting szavazas kiiras',
        icon: CalendarDays,
        action: () => {
          router.push('/scheduler?new=true');
          onClose();
        },
      },
      {
        id: 'act-new-file',
        category: 'actions',
        title: '📤 Új fájl vagy revízió feltöltése a Fájltárba',
        subtitle: 'CAD modell, Python script vagy szakdolgozat fejezet',
        keywords: 'feltoltes uj fajl verzio commit upload file',
        icon: Upload,
        action: () => {
          router.push('/files?upload=true');
          onClose();
        },
      },
      {
        id: 'act-import-doi',
        category: 'actions',
        title: '🔬 Cikk automatikus importálása DOI alapján',
        subtitle: 'Metaadatok és absztrakt automatikus lekérése CrossRef-ből',
        keywords: 'doi import cikk paper crossref kereso szakirodalom',
        icon: BookOpen,
        action: () => {
          router.push('/literature?import=doi');
          onClose();
        },
      },
      {
        id: 'act-csv-plotter',
        category: 'actions',
        title: '📊 Interaktív CSV / Mérési Grafikon Rajzoló megnyitása',
        subtitle: 'Többcsatornás áramlási és laboradat-vizualizáció',
        keywords: 'csv grafikon diagram plotter recharts gorbe abra szimulacio',
        icon: FileSpreadsheet,
        action: () => {
          router.push('/files?tool=plotter');
          onClose();
        },
      },
      {
        id: 'act-bibtex-export',
        category: 'actions',
        title: '📚 BibTeX (.bib) Irodalomjegyzék Exportálása',
        subtitle: 'Overleaf és LaTeX kompatibilis hivatkozási adatbázis',
        keywords: 'bibtex bib export latex overleaf irodalomjegyzek hivatkozasok',
        icon: FileDown,
        action: () => {
          router.push('/literature?export=bib');
          onClose();
        },
      },
      {
        id: 'act-live-timer',
        category: 'actions',
        title: '⏱️ Élő Kísérleti Stopper (Live Lab Timer) indítása',
        subtitle: 'Ezredmásodperces részidők és protokoll futtatás',
        keywords: 'stopper timer ora reszido lap kiserlet meres start live lab timer',
        icon: Clock,
        action: () => {
          if (onOpenLiveTimer) {
            onOpenLiveTimer();
            onClose();
          } else {
            router.push('/logs?timer=start');
            onClose();
          }
        },
      },
      {
        id: 'act-toggle-supervisor',
        category: 'actions',
        title: `👁️ Témavezetői Vezetői Nézet (Supervisor View): ${
          isSupervisorMode ? 'KIKAPCSOLÁS' : 'BEKAPCSOLÁS'
        }`,
        subtitle: 'Executive jóváhagyási pult és kiemelt szakmai fókusz',
        keywords: 'temavezeto supervisor prof professor executive nezett valtasa',
        icon: Eye,
        action: () => {
          toggleSupervisorMode();
          toast.success(
            `Témavezetői Nézet ${!isSupervisorMode ? 'bekapcsolva' : 'kikapcsolva'}!`
          );
          onClose();
        },
      },
      {
        id: 'act-ai-briefing',
        category: 'actions',
        title: '✨ AI Co-Pilot: Heti Témavezetői Státuszjelentés Generálása',
        subtitle: 'Összegzés az elért eredményekről, laborhaladásról és döntésekről',
        keywords: 'ai copilot gemini heti jelentes briefing statusz osszefoglalo',
        icon: Sparkles,
        action: () => {
          if (onOpenAiBriefing) {
            onOpenAiBriefing();
            onClose();
          } else {
            router.push('/dashboard?ai=briefing');
            onClose();
          }
        },
      },
      {
        id: 'act-switch-role',
        category: 'actions',
        title: `🔄 Saját szerepkör váltása (${
          currentProfile.role === 'supervisor' ? 'Kutatóvá' : 'Témavezetővé'
        })`,
        subtitle: `Jelenlegi: ${
          currentProfile.role === 'supervisor' ? 'Témavezető Professzor' : 'Kutató'
        }`,
        keywords: 'szerepkor role valtas kutato temavezeto profil',
        icon: UserCheck,
        action: () => {
          const nextRole = currentProfile.role === 'supervisor' ? 'researcher' : 'supervisor';
          updateCurrentProfile({ role: nextRole });
          toast.success(`Szerepkör átállítva: ${nextRole === 'supervisor' ? 'Témavezető' : 'Kutató'}`);
          onClose();
        },
      },
    ],
    [
      router,
      onClose,
      isSupervisorMode,
      toggleSupervisorMode,
      currentProfile.role,
      updateCurrentProfile,
      onOpenLiveTimer,
      onOpenAiBriefing,
    ]
  );

  // 3. Live Supabase database search results (when query length >= 2)
  const databaseItems = useMemo(() => {
    if (query.trim().length < 2) return [];

    const normalizedQ = normalizeHungarian(query.trim());
    const results: any[] = [];

    // Tasks search
    tasks.forEach((t) => {
      const matchTitle = normalizeHungarian(t.title).includes(normalizedQ);
      const matchDesc = normalizeHungarian(t.description || '').includes(normalizedQ);
      if (matchTitle || matchDesc) {
        results.push({
          id: `db-task-${t.id}`,
          category: 'data',
          typeLabel: 'Feladat',
          title: t.title,
          subtitle: `Kanban • Felelős: ${t.assigned_to || 'Csapat'} • Prioritás: ${t.priority}`,
          icon: KanbanSquare,
          action: () => {
            router.push(`/kanban?task=${t.id}`);
            onClose();
          },
        });
      }
    });

    // Literature search
    literatureItems.forEach((l) => {
      const matchTitle = normalizeHungarian(l.title).includes(normalizedQ);
      const matchAuth = normalizeHungarian(l.authors || '').includes(normalizedQ);
      const matchDoi = (l.doi || '').toLowerCase().includes(normalizedQ);
      if (matchTitle || matchAuth || matchDoi) {
        results.push({
          id: `db-lit-${l.id}`,
          category: 'data',
          typeLabel: 'Szakirodalom',
          title: l.title,
          subtitle: `${l.authors} (${l.publication_year || 'N/A'}) • ${l.journal || 'Cikk'}`,
          icon: BookOpen,
          action: () => {
            router.push(`/literature?item=${l.id}`);
            onClose();
          },
        });
      }
    });

    // Files search
    repositoryFiles.forEach((f) => {
      const matchName = normalizeHungarian(f.file_name).includes(normalizedQ);
      const matchCommit = normalizeHungarian(f.commit_message || '').includes(normalizedQ);
      if (matchName || matchCommit) {
        results.push({
          id: `db-file-${f.id}`,
          category: 'data',
          typeLabel: 'Fájl',
          title: f.file_name,
          subtitle: `v${f.version_number} • ${f.commit_message} • Feltöltő: ${f.uploaded_by_name || 'Kutató'}`,
          icon: FolderGit2,
          action: () => {
            router.push('/files');
            onClose();
          },
        });
      }
    });

    // Meetings search
    meetings.forEach((m) => {
      const matchTitle = normalizeHungarian(m.title).includes(normalizedQ);
      const matchDesc = normalizeHungarian(m.description || '').includes(normalizedQ);
      if (matchTitle || matchDesc) {
        results.push({
          id: `db-meet-${m.id}`,
          category: 'data',
          typeLabel: 'Konzultáció',
          title: m.title,
          subtitle: `Státusz: ${m.status} • Időtartam: ${m.duration_minutes} perc`,
          icon: CalendarDays,
          action: () => {
            router.push('/scheduler');
            onClose();
          },
        });
      }
    });

    // Research Logs search
    researchLogs.forEach((log) => {
      const matchTitle = normalizeHungarian(log.title).includes(normalizedQ);
      const matchAuthor = normalizeHungarian(log.author_name || '').includes(normalizedQ);
      if (matchTitle || matchAuthor) {
        results.push({
          id: `db-log-${log.id}`,
          category: 'data',
          typeLabel: 'Kutatási Napló',
          title: log.title,
          subtitle: `${log.log_date} • Szerző: ${log.author_name} • ${log.workstream}`,
          icon: FlaskConical,
          action: () => {
            router.push('/logs');
            onClose();
          },
        });
      }
    });

    return results;
  }, [query, tasks, literatureItems, repositoryFiles, meetings, researchLogs, router, onClose]);

  // Combine and filter items
  const filteredItems = useMemo(() => {
    let pool = [...navigationItems, ...actionItems, ...databaseItems];

    if (activeCategory === 'navigation') {
      pool = pool.filter((i) => i.category === 'navigation');
    } else if (activeCategory === 'actions') {
      pool = pool.filter((i) => i.category === 'actions');
    } else if (activeCategory === 'data') {
      pool = pool.filter((i) => i.category === 'data');
    }

    if (!query.trim()) {
      return pool.filter((i) => i.category !== 'data');
    }

    const normalizedQ = normalizeHungarian(query.trim());

    return pool.filter((item) => {
      if (item.category === 'data') return true; // already filtered by query in databaseItems
      const titleMatch = normalizeHungarian(item.title).includes(normalizedQ);
      const subtitleMatch = normalizeHungarian(item.subtitle).includes(normalizedQ);
      const keywordMatch = (item as any).keywords
        ? normalizeHungarian((item as any).keywords).includes(normalizedQ)
        : false;
      return titleMatch || subtitleMatch || keywordMatch;
    });
  }, [navigationItems, actionItems, databaseItems, activeCategory, query]);

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0E1017] border border-rose-500/40 rounded-2xl shadow-2xl shadow-rose-950/30 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="p-4 border-b border-[#1E2230] flex items-center space-x-3 bg-slate-900/60">
          <Search className="w-5 h-5 text-rose-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Keresés menüpontokra, funkciókra, élő Supabase adatokra..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-[#090A0F] border-b border-[#1E2230] flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => {
              setActiveCategory('all');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeCategory === 'all'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Minden ({filteredItems.length})
          </button>
          <button
            onClick={() => {
              setActiveCategory('navigation');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeCategory === 'navigation'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Menüpontok
          </button>
          <button
            onClick={() => {
              setActiveCategory('actions');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeCategory === 'actions'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Funkciók & Eszközök
          </button>
          <button
            onClick={() => {
              setActiveCategory('data');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeCategory === 'data'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Élő Adatbázis ({databaseItems.length})
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[55vh] custom-scroll"
        >
          {filteredItems.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Nincs találat a keresésre</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Próbálj más kulcsszót (pl. „feladat”, „chip”, „stopper”, „cikk”, „meeting” vagy szerző neve).
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? 'bg-rose-950/60 border border-rose-600/70 shadow-md shadow-rose-950/30'
                      : 'hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1 truncate">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isSelected ? 'text-white' : 'text-slate-200'
                          }`}
                        >
                          {item.title}
                        </span>
                        {(item as any).typeLabel && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                            {(item as any).typeLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center text-xs font-mono text-slate-500">
                    {isSelected && (
                      <span className="hidden sm:flex items-center text-rose-400 text-xs font-semibold gap-1">
                        Megnyitás <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-[#090A0F] border-t border-[#1E2230] flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center space-x-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 mr-1">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 mr-1">
                ↓
              </kbd>
              Navigáció
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 mr-1">
                ENTER
              </kbd>
              Kiválasztás
            </span>
          </div>

          <div className="flex items-center space-x-2 text-rose-400 font-semibold">
            <span>RED Lab Omnisearch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
