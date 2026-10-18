'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Task,
  ThesisChapter,
  LabFile,
  Paper,
  ConsultationPoll,
  ActivityItem,
  TaskStatus,
  ChapterStatus,
  PaperReadStatus,
  VoteChoice,
} from '@/types';
import {
  initialUsers,
  initialTasks,
  initialThesisChapters,
  initialLabFiles,
  initialPapers,
  initialConsultationPolls,
  initialActivities,
} from './mockData';
import { toast } from 'sonner';

interface StoreContextType {
  currentUser: User;
  users: User[];
  setCurrentUserById: (userId: string) => void;
  isSupervisorMode: boolean;
  toggleSupervisorMode: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  toggleChecklistItem: (taskId: string, checklistId: string) => void;
  addTaskComment: (taskId: string, text: string) => void;
  deleteTask: (taskId: string) => void;

  // Thesis
  thesisChapters: ThesisChapter[];
  updateChapterContent: (chapterId: string, content: string, newWords?: number) => void;
  submitChapterForReview: (chapterId: string) => void;
  supervisorApproveChapter: (chapterId: string, feedbackComment: string) => void;
  supervisorRequestRevision: (chapterId: string, feedbackComment: string) => void;

  // Files
  labFiles: LabFile[];
  uploadFileVersion: (fileId: string, newVersion: string, changelog: string, fileSizeBytes?: number) => void;
  addNewFile: (file: Omit<LabFile, 'id' | 'versions'>, initialVersion: string, changelog: string) => void;

  // Literature
  papers: Paper[];
  addPaper: (paper: Omit<Paper, 'id' | 'addedById' | 'addedByName' | 'addedAt' | 'upvotes'>) => void;
  updatePaperReadStatus: (paperId: string, status: PaperReadStatus) => void;
  togglePaperUpvote: (paperId: string) => void;

  // Consultations
  consultationPolls: ConsultationPoll[];
  voteConsultationSlot: (pollId: string, slotId: string, choice: VoteChoice) => void;
  createConsultationPoll: (poll: Omit<ConsultationPoll, 'id' | 'createdAt' | 'status' | 'createdById' | 'createdByName'>) => void;
  confirmConsultationSlot: (pollId: string, slotId: string, meetingLink?: string) => void;

  // Activity
  activities: ActivityItem[];
  logActivity: (actionType: ActivityItem['actionType'], description: string, targetTitle: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'redlab_v1_';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // Robin
  const [isSupervisorMode, setIsSupervisorMode] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [thesisChapters, setThesisChapters] = useState<ThesisChapter[]>(initialThesisChapters);
  const [labFiles, setLabFiles] = useState<LabFile[]>(initialLabFiles);
  const [papers, setPapers] = useState<Paper[]>(initialPapers);
  const [consultationPolls, setConsultationPolls] = useState<ConsultationPoll[]>(initialConsultationPolls);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);

  // Load from local storage on client mount
  useEffect(() => {
    setIsClient(true);
    try {
      const storedTheme = localStorage.getItem(`${STORAGE_KEY_PREFIX}theme`) as 'dark' | 'light' | null;
      if (storedTheme) setTheme(storedTheme);

      const storedUserId = localStorage.getItem(`${STORAGE_KEY_PREFIX}user_id`);
      if (storedUserId) {
        const found = initialUsers.find((u) => u.id === storedUserId);
        if (found) {
          setCurrentUser(found);
          if (found.role === 'supervisor') setIsSupervisorMode(true);
        }
      }

      const storedTasks = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
      if (storedTasks) setTasks(JSON.parse(storedTasks));

      const storedChapters = localStorage.getItem(`${STORAGE_KEY_PREFIX}chapters`);
      if (storedChapters) setThesisChapters(JSON.parse(storedChapters));

      const storedFiles = localStorage.getItem(`${STORAGE_KEY_PREFIX}files`);
      if (storedFiles) setLabFiles(JSON.parse(storedFiles));

      const storedPapers = localStorage.getItem(`${STORAGE_KEY_PREFIX}papers`);
      if (storedPapers) setPapers(JSON.parse(storedPapers));

      const storedPolls = localStorage.getItem(`${STORAGE_KEY_PREFIX}polls`);
      if (storedPolls) setConsultationPolls(JSON.parse(storedPolls));

      const storedActivities = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities`);
      if (storedActivities) setActivities(JSON.parse(storedActivities));
    } catch (e) {
      console.error('[RED Lab] Error loading state from localStorage:', e);
    }
  }, []);

  // Save to localStorage helpers
  const saveState = (key: string, data: unknown) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(data));
      } catch (err) {
        console.error(`[RED Lab] Error saving ${key}:`, err);
      }
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}theme`, next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const setCurrentUserById = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      if (found.role === 'supervisor') {
        setIsSupervisorMode(true);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}user_id`, userId);
      }
      toast.success(`Felhasználó váltva: ${found.name}`, {
        description: `${found.title} (${found.role === 'supervisor' ? 'Témavezető' : 'Kutató'})`,
      });
    }
  };

  const toggleSupervisorMode = () => {
    setIsSupervisorMode((prev) => !prev);
    toast.info(!isSupervisorMode ? 'Témavezetői Vezetői Nézet bekapcsolva' : 'Standard Kutatói Nézet visszaállítva');
  };

  const logActivity = (actionType: ActivityItem['actionType'], description: string, targetTitle: string) => {
    const newItem: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      actionType,
      description,
      targetTitle,
    };
    setActivities((prev) => {
      const updated = [newItem, ...prev.slice(0, 49)];
      saveState('activities', updated);
      return updated;
    });
  };

  // Task Actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      saveState('tasks', updated);
      return updated;
    });
    logActivity('task', 'új kutatási feladatot hozott létre:', newTask.title);
    toast.success('Feladat sikeresen létrehozva!', { description: newTask.title });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
      saveState('tasks', updated);
      return updated;
    });
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const statusHungarian = {
      todo: 'Teendőkhöz',
      in_progress: 'Folyamatban lévőkhöz',
      review: 'Felülvizsgálathoz',
      done: 'Befejezettekhez',
    }[newStatus];

    updateTask(taskId, { status: newStatus });
    logActivity('task', `áthelyezte a feladatot a ${statusHungarian}:`, task.title);
    toast.success(`Feladat mozgatva: ${statusHungarian}`);
  };

  const toggleChecklistItem = (taskId: string, checklistId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map((item) =>
          item.id === checklistId ? { ...item, completed: !item.completed } : item
        );
        return { ...t, checklist: updatedChecklist, updatedAt: new Date().toISOString() };
      });
      saveState('tasks', updated);
      return updated;
    });
  };

  const addTaskComment = (taskId: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      text,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t));
      saveState('tasks', updated);
      return updated;
    });
    toast.success('Megjegyzés hozzáadva');
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      saveState('tasks', updated);
      return updated;
    });
    if (task) {
      logActivity('task', 'törölte a feladatot:', task.title);
      toast.info('Feladat törölve');
    }
  };

  // Thesis Actions
  const updateChapterContent = (chapterId: string, content: string, newWords?: number) => {
    setThesisChapters((prev) => {
      const updated = prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const wordCount = newWords !== undefined ? newWords : content.trim().split(/\s+/).filter(Boolean).length;
        return {
          ...ch,
          contentDraft: content,
          currentWords: wordCount,
          lastModified: new Date().toISOString(),
        };
      });
      saveState('chapters', updated);
      return updated;
    });
    toast.success('Fejezet piszkozat mentve');
  };

  const submitChapterForReview = (chapterId: string) => {
    const chapter = thesisChapters.find((ch) => ch.id === chapterId);
    if (!chapter) return;
    setThesisChapters((prev) => {
      const updated = prev.map((ch) =>
        ch.id === chapterId ? { ...ch, status: 'felulvizsgalatra_var' as ChapterStatus, lastModified: new Date().toISOString() } : ch
      );
      saveState('chapters', updated);
      return updated;
    });
    logActivity('thesis', 'felülvizsgálatra beküldte a fejezetet a témavezetőknek:', `${chapter.chapterNumber}. ${chapter.title}`);
    toast.success('Fejezet beküldve témavezetői felülvizsgálatra!', {
      description: 'A professzorok értesítést kaptak a jóváhagyási listán.',
    });
  };

  const supervisorApproveChapter = (chapterId: string, feedbackComment: string) => {
    const chapter = thesisChapters.find((ch) => ch.id === chapterId);
    if (!chapter) return;
    const feedback = {
      id: `fb-${Date.now()}`,
      supervisorId: currentUser.id,
      supervisorName: currentUser.name,
      comment: feedbackComment || 'A fejezet elméleti és formai szempontból kifogástalan, hivatalosan jóváhagyva.',
      createdAt: new Date().toISOString(),
      statusChange: 'jovahagyva' as ChapterStatus,
    };
    setThesisChapters((prev) => {
      const updated = prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          status: 'jovahagyva' as ChapterStatus,
          supervisorApprovedAt: new Date().toISOString(),
          supervisorApprovedBy: currentUser.name,
          feedbackHistory: [feedback, ...ch.feedbackHistory],
          lastModified: new Date().toISOString(),
        };
      });
      saveState('chapters', updated);
      return updated;
    });
    logActivity('approval', 'hivatalosan jóváhagyta és ellátta pecséttel a fejezetet:', `${chapter.chapterNumber}. ${chapter.title}`);
    toast.success('Fejezet sikeresen jóváhagyva (Sign-Off)', {
      description: `${chapter.title} státusza: Jóváhagyva.`,
    });
  };

  const supervisorRequestRevision = (chapterId: string, feedbackComment: string) => {
    const chapter = thesisChapters.find((ch) => ch.id === chapterId);
    if (!chapter) return;
    const feedback = {
      id: `fb-${Date.now()}`,
      supervisorId: currentUser.id,
      supervisorName: currentUser.name,
      comment: feedbackComment || 'Kérjük az adatok és ábrák kiegészítését a megadott megjegyzések alapján.',
      createdAt: new Date().toISOString(),
      statusChange: 'tervezet' as ChapterStatus,
    };
    setThesisChapters((prev) => {
      const updated = prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          status: 'tervezet' as ChapterStatus,
          feedbackHistory: [feedback, ...ch.feedbackHistory],
          lastModified: new Date().toISOString(),
        };
      });
      saveState('chapters', updated);
      return updated;
    });
    logActivity('thesis', 'átdolgozást és korrekciót kért a fejezethez:', `${chapter.chapterNumber}. ${chapter.title}`);
    toast.info('Átdolgozási kérelem elküldve a kutatóknak', {
      description: feedbackComment,
    });
  };

  // Files Actions
  const uploadFileVersion = (fileId: string, newVersion: string, changelog: string, fileSizeBytes = 12500000) => {
    const file = labFiles.find((f) => f.id === fileId);
    if (!file) return;
    const hash = Math.random().toString(16).substring(2, 9);
    const newVer = {
      version: newVersion,
      changelog,
      uploadedById: currentUser.id,
      uploadedByName: currentUser.name,
      uploadedAt: new Date().toISOString(),
      commitHash: hash,
      fileSizeBytes,
    };
    setLabFiles((prev) => {
      const updated = prev.map((f) => {
        if (f.id !== fileId) return f;
        return {
          ...f,
          currentVersion: newVersion,
          versions: [newVer, ...f.versions],
        };
      });
      saveState('files', updated);
      return updated;
    });
    logActivity('file', `új verziót töltött fel (${newVersion}) a fájlhoz:`, file.name);
    toast.success(`Fájl verzió feltöltve: ${newVersion}`, { description: file.name });
  };

  const addNewFile = (fileData: Omit<LabFile, 'id' | 'versions'>, initialVersion: string, changelog: string) => {
    const hash = Math.random().toString(16).substring(2, 9);
    const newLabFile: LabFile = {
      ...fileData,
      id: `file-${Date.now()}`,
      currentVersion: initialVersion,
      versions: [
        {
          version: initialVersion,
          changelog: changelog || 'Kezdeti feltöltés a kutatócsoporti repóba.',
          uploadedById: currentUser.id,
          uploadedByName: currentUser.name,
          uploadedAt: new Date().toISOString(),
          commitHash: hash,
          fileSizeBytes: 8500000,
        },
      ],
    };
    setLabFiles((prev) => {
      const updated = [newLabFile, ...prev];
      saveState('files', updated);
      return updated;
    });
    logActivity('file', 'új tudományos állományt regisztrált:', newLabFile.name);
    toast.success('Új fájl hozzáadva a repóhoz!');
  };

  // Literature Actions
  const addPaper = (paperData: Omit<Paper, 'id' | 'addedById' | 'addedByName' | 'addedAt' | 'upvotes'>) => {
    const newPaper: Paper = {
      ...paperData,
      id: `paper-${Date.now()}`,
      addedById: currentUser.id,
      addedByName: currentUser.name,
      addedAt: new Date().toISOString(),
      upvotes: [currentUser.id],
    };
    setPapers((prev) => {
      const updated = [newPaper, ...prev];
      saveState('papers', updated);
      return updated;
    });
    logActivity('literature', 'új tudományos publikációt adott a repóhoz:', newPaper.title);
    toast.success('Publikáció sikeresen rögzítve!');
  };

  const updatePaperReadStatus = (paperId: string, status: PaperReadStatus) => {
    setPapers((prev) => {
      const updated = prev.map((p) => (p.id === paperId ? { ...p, readStatus: status } : p));
      saveState('papers', updated);
      return updated;
    });
    toast.success('Olvasási státusz frissítve');
  };

  const togglePaperUpvote = (paperId: string) => {
    setPapers((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== paperId) return p;
        const hasUpvoted = p.upvotes.includes(currentUser.id);
        const upvotes = hasUpvoted ? p.upvotes.filter((id) => id !== currentUser.id) : [...p.upvotes, currentUser.id];
        return { ...p, upvotes };
      });
      saveState('papers', updated);
      return updated;
    });
  };

  // Consultations Actions
  const voteConsultationSlot = (pollId: string, slotId: string, choice: VoteChoice) => {
    setConsultationPolls((prev) => {
      const updated = prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        const updatedSlots = poll.slots.map((slot) => {
          if (slot.id !== slotId) return slot;
          return {
            ...slot,
            votes: {
              ...slot.votes,
              [currentUser.id]: choice,
            },
          };
        });
        return { ...poll, slots: updatedSlots };
      });
      saveState('polls', updated);
      return updated;
    });
    const choiceLabel = { available: 'Elérhető', if_needed: 'Ha szükséges', unavailable: 'Nem megfelelő' }[choice];
    toast.success(`Szavazat leadva: ${choiceLabel}`);
  };

  const createConsultationPoll = (pollData: Omit<ConsultationPoll, 'id' | 'createdAt' | 'status' | 'createdById' | 'createdByName'>) => {
    const newPoll: ConsultationPoll = {
      ...pollData,
      id: `poll-${Date.now()}`,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    setConsultationPolls((prev) => {
      const updated = [newPoll, ...prev];
      saveState('polls', updated);
      return updated;
    });
    logActivity('consultation', 'új konzultációs időpont-szavazást írt ki:', newPoll.title);
    toast.success('Időpont-egyeztetés sikeresen kiírva!');
  };

  const confirmConsultationSlot = (pollId: string, slotId: string, meetingLink = 'https://meet.google.com/red-lab-thesis') => {
    const poll = consultationPolls.find((p) => p.id === pollId);
    if (!poll) return;
    setConsultationPolls((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== pollId) return p;
        return {
          ...p,
          status: 'confirmed' as const,
          confirmedSlotId: slotId,
          meetingLink,
        };
      });
      saveState('polls', updated);
      return updated;
    });
    logActivity('consultation', 'véglegesítette a konzultációs időpontot:', poll.title);
    toast.success('Konzultáció sikeresen véglegesítve és rögzítve!');
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUserById,
        isSupervisorMode,
        toggleSupervisorMode,
        theme,
        toggleTheme,
        tasks,
        addTask,
        updateTask,
        moveTask,
        toggleChecklistItem,
        addTaskComment,
        deleteTask,
        thesisChapters,
        updateChapterContent,
        submitChapterForReview,
        supervisorApproveChapter,
        supervisorRequestRevision,
        labFiles,
        uploadFileVersion,
        addNewFile,
        papers,
        addPaper,
        updatePaperReadStatus,
        togglePaperUpvote,
        consultationPolls,
        voteConsultationSlot,
        createConsultationPoll,
        confirmConsultationSlot,
        activities,
        logActivity,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
