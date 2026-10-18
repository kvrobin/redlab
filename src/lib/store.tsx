'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Profile,
  Milestone,
  KanbanTask,
  TaskComment,
  Meeting,
  LiteratureItem,
  RepositoryFile,
  ResearchLog,
  ActivityLog,
  NotificationItem,
  TaskStatus,
  TaskPriority,
  WorkstreamType,
  VoteType,
  LiteratureStatus,
  MilestoneStatus,
} from '@/types';
import {
  initialProfiles,
  initialMilestones,
  initialKanbanTasks,
  initialTaskComments,
  initialMeetings,
  initialLiteratureItems,
  initialRepositoryFiles,
  initialResearchLogs,
  initialNotifications,
  initialActivityLogs,
} from './mockData';
import { toast } from 'sonner';

interface StoreContextType {
  currentProfile: Profile;
  profiles: Profile[];
  setCurrentProfileById: (profileId: string) => void;
  isSupervisorMode: boolean;
  toggleSupervisorMode: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Kanban Tasks
  tasks: KanbanTask[];
  addTask: (task: Omit<KanbanTask, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTask: (taskId: string, updates: Partial<KanbanTask>) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  toggleChecklistItem: (taskId: string, checklistId: string) => void;
  deleteTask: (taskId: string) => void;

  // Task & Milestone Comments
  taskComments: TaskComment[];
  addComment: (taskId?: string, milestoneId?: string, content?: string) => void;

  // Milestones (Thesis chapters & progress)
  milestones: Milestone[];
  updateMilestoneContent: (milestoneId: string, content: string, newWords?: number) => void;
  submitMilestoneForReview: (milestoneId: string) => void;
  supervisorApproveMilestone: (milestoneId: string, feedback: string) => void;
  supervisorRequestRevision: (milestoneId: string, feedback: string) => void;

  // Repository Files (GitHub-style versioning)
  repositoryFiles: RepositoryFile[];
  uploadFileVersion: (
    fileGroupKey: string,
    fileName: string,
    folderCategory: WorkstreamType,
    commitMessage: string,
    fileSizeBytes?: number,
    milestoneId?: string
  ) => void;

  // Research Logs (Digital Lab Notebook)
  researchLogs: ResearchLog[];
  addResearchLog: (log: Omit<ResearchLog, 'id' | 'created_at' | 'author_id' | 'author_name'>) => void;
  deleteResearchLog: (logId: string) => void;

  // Literature Items
  literatureItems: LiteratureItem[];
  addLiteratureItem: (item: Omit<LiteratureItem, 'id' | 'created_at' | 'updated_at' | 'added_by' | 'upvotes'>) => void;
  updateLiteratureStatus: (itemId: string, status: LiteratureStatus) => void;
  toggleLiteratureUpvote: (itemId: string) => void;

  // Meetings & Voting Automation Engine
  meetings: Meeting[];
  voteMeetingSlot: (meetingId: string, slotId: string, vote: VoteType, comment?: string) => void;
  createMeeting: (meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'status'>) => void;
  confirmMeetingSlot: (meetingId: string, slotId: string, meetingLink?: string) => void;

  // Notifications & Activity Feed
  notifications: NotificationItem[];
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  activityLogs: ActivityLog[];
  logActivity: (actionType: string, entityTitle: string, details?: string, targetUrl?: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'redlab_db_v2_';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profiles] = useState<Profile[]>(initialProfiles);
  const [currentProfile, setCurrentProfile] = useState<Profile>(initialProfiles[0]); // Robin
  const [isSupervisorMode, setIsSupervisorMode] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [tasks, setTasks] = useState<KanbanTask[]>(initialKanbanTasks);
  const [taskComments, setTaskComments] = useState<TaskComment[]>(initialTaskComments);
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [repositoryFiles, setRepositoryFiles] = useState<RepositoryFile[]>(initialRepositoryFiles);
  const [researchLogs, setResearchLogs] = useState<ResearchLog[]>(initialResearchLogs);
  const [literatureItems, setLiteratureItems] = useState<LiteratureItem[]>(initialLiteratureItems);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);

  // Load from localStorage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(`${STORAGE_KEY_PREFIX}theme`) as 'dark' | 'light' | null;
      if (storedTheme) setTheme(storedTheme);

      const storedProfileId = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile_id`);
      if (storedProfileId) {
        const found = initialProfiles.find((p) => p.id === storedProfileId);
        if (found) {
          setCurrentProfile(found);
          if (found.role === 'supervisor') setIsSupervisorMode(true);
        }
      }

      const storedTasks = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
      if (storedTasks) setTasks(JSON.parse(storedTasks));

      const storedMilestones = localStorage.getItem(`${STORAGE_KEY_PREFIX}milestones`);
      if (storedMilestones) setMilestones(JSON.parse(storedMilestones));

      const storedFiles = localStorage.getItem(`${STORAGE_KEY_PREFIX}files`);
      if (storedFiles) setRepositoryFiles(JSON.parse(storedFiles));

      const storedLogs = localStorage.getItem(`${STORAGE_KEY_PREFIX}logs`);
      if (storedLogs) setResearchLogs(JSON.parse(storedLogs));

      const storedLit = localStorage.getItem(`${STORAGE_KEY_PREFIX}literature`);
      if (storedLit) setLiteratureItems(JSON.parse(storedLit));

      const storedMeetings = localStorage.getItem(`${STORAGE_KEY_PREFIX}meetings`);
      if (storedMeetings) setMeetings(JSON.parse(storedMeetings));

      const storedNotifs = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifs`);
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));

      const storedActs = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities`);
      if (storedActs) setActivityLogs(JSON.parse(storedActs));
    } catch (e) {
      console.warn('[RED Lab] Error hydrating store from localStorage:', e);
    }
  }, []);

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

  const setCurrentProfileById = (profileId: string) => {
    const found = profiles.find((p) => p.id === profileId);
    if (found) {
      setCurrentProfile(found);
      if (found.role === 'supervisor') {
        setIsSupervisorMode(true);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profile_id`, profileId);
      }
      toast.success(`Felhasználó váltva: ${found.full_name}`, {
        description: `${found.title} (${found.role === 'supervisor' ? 'Témavezető' : 'Kutató'})`,
      });
    }
  };

  const toggleSupervisorMode = () => {
    setIsSupervisorMode((prev) => !prev);
    toast.info(!isSupervisorMode ? 'Témavezetői Vezetői Nézet bekapcsolva' : 'Standard Kutatói Nézet visszaállítva');
  };

  // Activity Logger
  const logActivity = (actionType: string, entityTitle: string, details?: string, targetUrl?: string) => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actor_id: currentProfile.id,
      actor_name: currentProfile.full_name,
      action_type: actionType,
      entity_title: entityTitle,
      details,
      target_url: targetUrl,
      created_at: new Date().toISOString(),
    };
    setActivityLogs((prev) => {
      const updated = [newAct, ...prev.slice(0, 49)];
      saveState('activities', updated);
      return updated;
    });
  };

  // Push Notification Helper
  const pushNotification = (recipientId: string, title: string, message: string, severity: NotificationItem['severity'], linkUrl?: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipient_id: recipientId,
      title,
      message,
      link_url: linkUrl,
      is_read: false,
      severity,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      saveState('notifs', updated);
      return updated;
    });
  };

  // AUTOMATION TRIGGER 4.3: recalculate_milestone_progress
  const recalculateMilestone = (milestoneId: string, updatedTasks: KanbanTask[]) => {
    const msTasks = updatedTasks.filter((t) => t.milestone_id === milestoneId);
    if (msTasks.length === 0) return;
    const doneCount = msTasks.filter((t) => t.status === 'done').length;
    const progressPercent = Math.round((doneCount / msTasks.length) * 100);

    setMilestones((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== milestoneId) return m;
        let newStatus = m.status;
        if (progressPercent === 100 && m.status !== 'approved') {
          newStatus = 'awaiting_approval';
        } else if (progressPercent > 0 && m.status === 'upcoming') {
          newStatus = 'in_progress';
        }
        return {
          ...m,
          progress_percent: progressPercent,
          status: newStatus,
          updated_at: new Date().toISOString(),
        };
      });
      saveState('milestones', updated);
      return updated;
    });
  };

  // Kanban Tasks CRUD
  const addTask = (taskData: Omit<KanbanTask, 'id' | 'created_at' | 'updated_at'>) => {
    const newTask: KanbanTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      created_by: currentProfile.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveState('tasks', updated);

    if (newTask.milestone_id) {
      recalculateMilestone(newTask.milestone_id, updated);
    }
    logActivity('TASK_CREATED', newTask.title, 'új feladat rögzítve a Kanban táblán', '/kanban');
    toast.success('Feladat sikeresen létrehozva!');
  };

  const updateTask = (taskId: string, updates: Partial<KanbanTask>) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
    setTasks(updated);
    saveState('tasks', updated);

    const task = tasks.find((t) => t.id === taskId);
    if (task?.milestone_id) {
      recalculateMilestone(task.milestone_id, updated);
    }
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const statusHungarian = {
      backlog: 'Backlogba',
      todo: 'Teendőkhöz',
      in_progress: 'Folyamatban lévőkhöz',
      review_professor: 'Professzori felülvizsgálatra',
      done: 'Befejezettekhez',
    }[newStatus];

    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t));
    setTasks(updated);
    saveState('tasks', updated);

    if (task.milestone_id) {
      recalculateMilestone(task.milestone_id, updated);
    }

    if (newStatus === 'review_professor') {
      profiles.filter((p) => p.role === 'supervisor').forEach((sup) => {
        pushNotification(
          sup.id,
          'Feladat professzori bírálatra vár 📋',
          `"${task.title}" felülvizsgálatra került küldve.`,
          'warning',
          '/kanban'
        );
      });
    }

    logActivity('TASK_MOVED', task.title, `áthelyezve a következő oszlopba: ${statusHungarian}`, '/kanban');
    toast.success(`Feladat mozgatva: ${statusHungarian}`);
  };

  const toggleChecklistItem = (taskId: string, checklistId: string) => {
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const updatedChecklist = t.checklist.map((item) =>
        item.id === checklistId ? { ...item, done: !item.done } : item
      );
      return { ...t, checklist: updatedChecklist, updated_at: new Date().toISOString() };
    });
    setTasks(updated);
    saveState('tasks', updated);
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveState('tasks', updated);

    if (task?.milestone_id) {
      recalculateMilestone(task.milestone_id, updated);
    }
    if (task) {
      logActivity('TASK_DELETED', task.title, 'törölve a tábláról', '/kanban');
      toast.info('Feladat törölve');
    }
  };

  const addComment = (taskId?: string, milestoneId?: string, content = '') => {
    if (!content.trim()) return;
    const newComm: TaskComment = {
      id: `c-${Date.now()}`,
      task_id: taskId,
      milestone_id: milestoneId,
      author_id: currentProfile.id,
      author_name: currentProfile.full_name,
      content: content.trim(),
      is_professor_note: currentProfile.role === 'supervisor',
      created_at: new Date().toISOString(),
    };
    setTaskComments((prev) => [newComm, ...prev]);
    toast.success('Megjegyzés hozzáadva');
  };

  // Milestones CRUD & Approvals
  const updateMilestoneContent = (milestoneId: string, content: string, newWords?: number) => {
    setMilestones((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== milestoneId) return m;
        const words = newWords !== undefined ? newWords : content.trim().split(/\s+/).filter(Boolean).length;
        return {
          ...m,
          content_draft: content,
          current_words: words,
          updated_at: new Date().toISOString(),
        };
      });
      saveState('milestones', updated);
      return updated;
    });
    toast.success('Fejezet piszkozat mentve');
  };

  const submitMilestoneForReview = (milestoneId: string) => {
    const ms = milestones.find((m) => m.id === milestoneId);
    if (!ms) return;
    setMilestones((prev) => {
      const updated = prev.map((m) =>
        m.id === milestoneId ? { ...m, status: 'awaiting_approval' as MilestoneStatus, updated_at: new Date().toISOString() } : m
      );
      saveState('milestones', updated);
      return updated;
    });

    profiles.filter((p) => p.role === 'supervisor').forEach((sup) => {
      pushNotification(
        sup.id,
        'Mérföldkő jóváhagyásra vár 🎓',
        `A(z) "${ms.title}" fejezet készen áll a professzori szignóra.`,
        'urgent',
        '/thesis'
      );
    });

    logActivity('MILESTONE_SUBMITTED', ms.title, 'felülvizsgálatra beküldve a professzoroknak', '/thesis');
    toast.success('Fejezet beküldve témavezetői felülvizsgálatra!');
  };

  const supervisorApproveMilestone = (milestoneId: string, feedback: string) => {
    const ms = milestones.find((m) => m.id === milestoneId);
    if (!ms) return;

    setMilestones((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          status: 'approved' as MilestoneStatus,
          supervisor_feedback: feedback || 'Hivatalosan jóváhagyva a végleges disszertációhoz.',
          approved_by: currentProfile.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
      saveState('milestones', updated);
      return updated;
    });

    profiles.forEach((p) => {
      pushNotification(
        p.id,
        'Mérföldkő hivatalosan jóváhagyva! ✅',
        `A(z) "${ms.title}" fejezetet ${currentProfile.full_name} ellátta digitális szignóval.`,
        'success',
        '/thesis'
      );
    });

    logActivity('MILESTONE_APPROVED', ms.title, `Jóváhagyva ${currentProfile.full_name} által: "${feedback}"`, '/thesis');
    toast.success('Mérföldkő sikeresen jóváhagyva (Sign-Off)!');
  };

  const supervisorRequestRevision = (milestoneId: string, feedback: string) => {
    const ms = milestones.find((m) => m.id === milestoneId);
    if (!ms) return;

    setMilestones((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          status: 'revision_requested' as MilestoneStatus,
          supervisor_feedback: feedback || 'Átdolgozás és kiegészítés szükséges.',
          updated_at: new Date().toISOString(),
        };
      });
      saveState('milestones', updated);
      return updated;
    });

    profiles.filter((p) => p.role === 'researcher').forEach((r) => {
      pushNotification(
        r.id,
        'Átdolgozási észrevétel érkezett 📝',
        `A(z) "${ms.title}" fejezethez javítási kérelem érkezett: ${feedback}`,
        'warning',
        '/thesis'
      );
    });

    logActivity('MILESTONE_REVISION', ms.title, `Átdolgozás kérve: "${feedback}"`, '/thesis');
    toast.info('Átdolgozási kérelem elküldve a kutatóknak!');
  };

  // AUTOMATION TRIGGER 4.1: handle_file_versioning
  const uploadFileVersion = (
    fileGroupKey: string,
    fileName: string,
    folderCategory: WorkstreamType,
    commitMessage: string,
    fileSizeBytes = 12500000,
    milestoneId?: string
  ) => {
    const existing = repositoryFiles.filter((f) => f.file_group_key === fileGroupKey);
    const maxVer = existing.reduce((max, f) => Math.max(max, f.version_number), 0);
    const newVersionNumber = maxVer + 1;

    // Previous files set is_latest = false
    const previousUpdated = repositoryFiles.map((f) =>
      f.file_group_key === fileGroupKey ? { ...f, is_latest: false } : f
    );

    const newFile: RepositoryFile = {
      id: `repo-${Date.now()}`,
      folder_category: folderCategory,
      file_group_key: fileGroupKey,
      file_name: fileName,
      version_number: newVersionNumber,
      storage_path: `/${folderCategory}/${fileName}_v${newVersionNumber}`,
      file_size_bytes: fileSizeBytes,
      mime_type: fileName.endsWith('.stl')
        ? 'model/stl'
        : fileName.endsWith('.py')
        ? 'text/x-python'
        : fileName.endsWith('.csv')
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      commit_message: commitMessage || `v${newVersionNumber}: Verziófrissítés`,
      is_latest: true,
      milestone_id: milestoneId,
      uploaded_by: currentProfile.id,
      uploaded_by_name: currentProfile.full_name,
      created_at: new Date().toISOString(),
    };

    const finalFiles = [newFile, ...previousUpdated];
    setRepositoryFiles(finalFiles);
    saveState('files', finalFiles);

    logActivity('FILE_UPLOADED', fileName, `új verzió commitolva (v${newVersionNumber}): "${commitMessage}"`, '/files');
    toast.success(`Fájl verzió commitolva: v${newVersionNumber} (${fileName})`);
  };

  // Research Logs (Digital Lab Notebook)
  const addResearchLog = (logData: Omit<ResearchLog, 'id' | 'created_at' | 'author_id' | 'author_name'>) => {
    const newLog: ResearchLog = {
      ...logData,
      id: `log-${Date.now()}`,
      author_id: currentProfile.id,
      author_name: currentProfile.full_name,
      created_at: new Date().toISOString(),
    };
    const updated = [newLog, ...researchLogs];
    setResearchLogs(updated);
    saveState('logs', updated);
    logActivity('LOG_CREATED', newLog.title, 'új kutatási naplóbejegyzés rögzítve', '/labbook');
    toast.success('Kutatási naplóbejegyzés sikeresen mentve!');
  };

  const deleteResearchLog = (logId: string) => {
    const updated = researchLogs.filter((l) => l.id !== logId);
    setResearchLogs(updated);
    saveState('logs', updated);
    toast.info('Naplóbejegyzés törölve');
  };

  // Literature Items
  const addLiteratureItem = (itemData: Omit<LiteratureItem, 'id' | 'created_at' | 'updated_at' | 'added_by' | 'upvotes'>) => {
    const newItem: LiteratureItem = {
      ...itemData,
      id: `lit-${Date.now()}`,
      added_by: currentProfile.id,
      upvotes: [currentProfile.id],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newItem, ...literatureItems];
    setLiteratureItems(updated);
    saveState('literature', updated);
    logActivity('PAPER_ADDED', newItem.title, `új szakirodalom hozzáadva (${newItem.journal || 'DOI'})`, '/literature');
    toast.success('Szakirodalom sikeresen rögzítve!');
  };

  const updateLiteratureStatus = (itemId: string, status: LiteratureStatus) => {
    const updated = literatureItems.map((item) =>
      item.id === itemId ? { ...item, status, updated_at: new Date().toISOString() } : item
    );
    setLiteratureItems(updated);
    saveState('literature', updated);
    toast.success('Olvasottsági státusz frissítve');
  };

  const toggleLiteratureUpvote = (itemId: string) => {
    const updated = literatureItems.map((item) => {
      if (item.id !== itemId) return item;
      const votes = item.upvotes || [];
      const hasUpvoted = votes.includes(currentProfile.id);
      const newUpvotes = hasUpvoted
        ? votes.filter((id) => id !== currentProfile.id)
        : [...votes, currentProfile.id];
      return { ...item, upvotes: newUpvotes };
    });
    setLiteratureItems(updated);
    saveState('literature', updated);
  };

  // AUTOMATION TRIGGER 4.2: evaluate_meeting_consensus
  const voteMeetingSlot = (meetingId: string, slotId: string, vote: VoteType, comment?: string) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) return;

    const updatedSlots = meeting.slots.map((slot) => {
      if (slot.id !== slotId) return slot;
      const votes = slot.votes || {};
      const newVote = {
        id: `vote-${Date.now()}`,
        slot_id: slotId,
        meeting_id: meetingId,
        voter_id: currentProfile.id,
        vote,
        comment,
        updated_at: new Date().toISOString(),
      };
      return {
        ...slot,
        votes: {
          ...votes,
          [currentProfile.id]: newVote,
        },
      };
    });

    let newStatus = meeting.status;
    let confirmedSlotId = meeting.confirmed_slot_id;

    // Evaluate consensus rules:
    // 1. Total slots vs blocked slots (slots having at least one downvote)
    const totalSlots = updatedSlots.length;
    const blockedSlots = updatedSlots.filter((slot) => {
      const votesArr = Object.values(slot.votes || {});
      return votesArr.some((v) => v.vote === 'downvote');
    }).length;

    // CASE 1: ALL slots blocked by downvote -> AUTO-RESCHEDULE TRIGGER
    if (totalSlots > 0 && blockedSlots === totalSlots) {
      newStatus = 'reschedule_needed';
      // Automated notification to all profiles
      profiles.forEach((p) => {
        pushNotification(
          p.id,
          'Új időpont-javaslat szükséges! 🔄',
          `A(z) "${meeting.title}" megbeszélés minden javasolt idősávja ütközik valakinek. Kérlek javasoljatok új sávot!`,
          'urgent',
          `/scheduler?meeting=${meeting.id}`
        );
      });
      logActivity(
        'MEETING_RESCHEDULE',
        meeting.title,
        'Minden idősáv leszavazva -> Automatikus újütemezés kérve',
        '/scheduler'
      );
      toast.error('Minden javasolt idősáv ütközik! Automatikus újütemezés (Reschedule Needed) bekapcsolva.', {
        duration: 5000,
      });
    } else {
      // CASE 2: Is there a winning slot with 0 downvotes and >= 3 upvotes?
      const winningSlot = updatedSlots.find((slot) => {
        const votesArr = Object.values(slot.votes || {});
        const hasDownvote = votesArr.some((v) => v.vote === 'downvote');
        const upvoteCount = votesArr.filter((v) => v.vote === 'upvote').length;
        return !hasDownvote && upvoteCount >= 3;
      });

      if (winningSlot && newStatus !== 'confirmed') {
        newStatus = 'confirmed';
        confirmedSlotId = winningSlot.id;
        profiles.forEach((p) => {
          pushNotification(
            p.id,
            'Megbeszélés időpontja véglegesítve! ✅',
            `A(z) "${meeting.title}" időpontja egyhangú szavazással elfogadva.`,
            'success',
            `/scheduler?meeting=${meeting.id}`
          );
        });
        logActivity('MEETING_CONFIRMED', meeting.title, 'Egyhangú konszenzus alapján véglegesítve', '/scheduler');
        toast.success('Megbeszélés időpontja egyhangú konszenzussal elfogadva és véglegesítve!');
      }
    }

    const updatedMeetings = meetings.map((m) =>
      m.id === meetingId
        ? {
            ...m,
            slots: updatedSlots,
            status: newStatus,
            confirmed_slot_id: confirmedSlotId,
            updated_at: new Date().toISOString(),
          }
        : m
    );

    setMeetings(updatedMeetings);
    saveState('meetings', updatedMeetings);

    const voteLabel = { upvote: 'Elfogadva (Upvote)', downvote: 'Ütközik (Downvote)', if_needed: 'Ha szükséges' }[vote];
    toast.info(`Szavazat rögzítve: ${voteLabel}`);
  };

  const createMeeting = (meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'status'>) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: `meet-${Date.now()}`,
      created_by: currentProfile.id,
      status: 'voting',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newMeeting, ...meetings];
    setMeetings(updated);
    saveState('meetings', updated);
    logActivity('MEETING_CREATED', newMeeting.title, 'új időpont-szavazás kiírva a csapatnak', '/scheduler');
    toast.success('Időpont-egyeztetés kiírva a kutatócsoportnak!');
  };

  const confirmMeetingSlot = (meetingId: string, slotId: string, meetingLink = 'https://meet.google.com/red-lab-thesis') => {
    const updated = meetings.map((m) =>
      m.id === meetingId
        ? {
            ...m,
            status: 'confirmed' as const,
            confirmed_slot_id: slotId,
            location_or_link: meetingLink,
            updated_at: new Date().toISOString(),
          }
        : m
    );
    setMeetings(updated);
    saveState('meetings', updated);
    toast.success('Megbeszélés véglegesítve!');
  };

  // Notifications
  const markNotificationRead = (notifId: string) => {
    const updated = notifications.map((n) => (n.id === notifId ? { ...n, is_read: true } : n));
    setNotifications(updated);
    saveState('notifs', updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    setNotifications(updated);
    saveState('notifs', updated);
    toast.success('Minden értesítés olvasottnak jelölve');
  };

  return (
    <StoreContext.Provider
      value={{
        currentProfile,
        profiles,
        setCurrentProfileById,
        isSupervisorMode,
        toggleSupervisorMode,
        theme,
        toggleTheme,
        tasks,
        addTask,
        updateTask,
        moveTask,
        toggleChecklistItem,
        deleteTask,
        taskComments,
        addComment,
        milestones,
        updateMilestoneContent,
        submitMilestoneForReview,
        supervisorApproveMilestone,
        supervisorRequestRevision,
        repositoryFiles,
        uploadFileVersion,
        researchLogs,
        addResearchLog,
        deleteResearchLog,
        literatureItems,
        addLiteratureItem,
        updateLiteratureStatus,
        toggleLiteratureUpvote,
        meetings,
        voteMeetingSlot,
        createMeeting,
        confirmMeetingSlot,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        activityLogs,
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
