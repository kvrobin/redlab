'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
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
  MeetingSlot,
  MeetingVote,
} from '@/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
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

export interface StoreContextType {
  currentProfile: Profile;
  profiles: Profile[];
  setCurrentProfileById: (profileId: string) => void;
  updateCurrentProfile: (updates: Partial<Profile>) => Promise<void>;
  addNewMember: (member: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => void;
  isSupervisorMode: boolean;
  toggleSupervisorMode: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  realtimeStatus: 'connected' | 'connecting' | 'offline';
  isSupabaseLive: boolean;
  signOut: () => Promise<void>;
  seedDatabase: (force?: boolean) => Promise<void>;

  // Kanban Tasks
  tasks: KanbanTask[];
  addTask: (task: Omit<KanbanTask, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<KanbanTask>) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  toggleChecklistItem: (taskId: string, checklistId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Task & Milestone Comments
  taskComments: TaskComment[];
  addComment: (taskId?: string, milestoneId?: string, content?: string) => Promise<void>;

  // Milestones (Thesis chapters & progress)
  milestones: Milestone[];
  addMilestone: (ms: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
  updateMilestoneContent: (milestoneId: string, content: string, newWords?: number) => Promise<void>;
  submitMilestoneForReview: (milestoneId: string) => Promise<void>;
  supervisorApproveMilestone: (milestoneId: string, feedback: string) => Promise<void>;
  supervisorRequestRevision: (milestoneId: string, feedback: string) => Promise<void>;

  // Repository Files (GitHub-style versioning)
  repositoryFiles: RepositoryFile[];
  uploadFileVersion: (
    fileGroupKey: string,
    fileName: string,
    folderCategory: WorkstreamType,
    commitMessage: string,
    fileSizeBytes?: number,
    milestoneId?: string
  ) => Promise<void>;
  deleteRepositoryFile: (fileId: string) => Promise<void>;
  deleteRepositoryGroup: (fileGroupKey: string) => Promise<void>;

  // Research Logs (Digital Lab Notebook & Thesis Chapters)
  researchLogs: ResearchLog[];
  addResearchLog: (
    log: Omit<ResearchLog, 'id' | 'created_at' | 'author_id' | 'author_name'>
  ) => Promise<void>;
  updateResearchLog: (logId: string, updates: Partial<ResearchLog>) => Promise<void>;
  deleteResearchLog: (logId: string) => Promise<void>;

  // Literature Items
  literatureItems: LiteratureItem[];
  addLiteratureItem: (
    item: Omit<LiteratureItem, 'id' | 'created_at' | 'updated_at' | 'added_by' | 'upvotes'>
  ) => Promise<void>;
  updateLiteratureItem: (itemId: string, updates: Partial<LiteratureItem>) => Promise<void>;
  updateLiteratureStatus: (itemId: string, status: LiteratureStatus) => Promise<void>;
  toggleLiteratureUpvote: (itemId: string) => Promise<void>;
  toggleLiteraturePin: (itemId: string) => Promise<void>;
  deleteLiteratureItem: (itemId: string) => Promise<void>;

  // Meetings & Voting Automation Engine
  meetings: Meeting[];
  voteMeetingSlot: (
    meetingId: string,
    slotId: string,
    vote: VoteType,
    comment?: string
  ) => Promise<void>;
  createMeeting: (
    meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'status'>
  ) => Promise<void>;
  confirmMeetingSlot: (meetingId: string, slotId: string, meetingLink?: string) => Promise<void>;
  addMeetingSlot: (meetingId: string, startTime: string) => Promise<void>;
  updateMeetingNotes: (meetingId: string, notes: string) => Promise<void>;
  deleteMeeting: (meetingId: string) => Promise<void>;

  // Notifications & Activity Feed
  notifications: NotificationItem[];
  markNotificationRead: (notifId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addNotification: (
    notif: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>
  ) => Promise<void>;
  activityLogs: ActivityLog[];
  logActivity: (
    actionType: string,
    entityTitle: string,
    details?: string,
    targetUrl?: string
  ) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'redlab_db_v2_';

// Helper to notify external integrations (Discord, Email, Sonner)
async function dispatchAutomationEvent(payload: {
  eventType: string;
  title: string;
  message: string;
  actorName: string;
  workstream?: string;
  targetUrl?: string;
}) {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[RED Lab] Notifier call error:', err);
  }
}

// Transform raw Supabase joined meeting rows into application Meeting objects
function transformSupabaseMeetings(rawMeetings: any[]): Meeting[] {
  return rawMeetings.map((m) => {
    const rawSlots = m.meeting_slots || [];
    const slots: MeetingSlot[] = rawSlots.map((s: any) => {
      const rawVotes = s.meeting_votes || [];
      const votesMap: Record<string, MeetingVote> = {};
      rawVotes.forEach((v: any) => {
        votesMap[v.voter_id] = {
          id: v.id,
          slot_id: v.slot_id,
          meeting_id: v.meeting_id,
          voter_id: v.voter_id,
          vote: v.vote,
          comment: v.comment,
          updated_at: v.updated_at,
        };
      });
      return {
        id: s.id,
        meeting_id: s.meeting_id,
        start_time: s.start_time,
        end_time: s.end_time,
        proposed_by: s.proposed_by,
        created_at: s.created_at,
        votes: votesMap,
      };
    });

    return {
      id: m.id,
      title: m.title,
      description: m.description || '',
      agenda_items: Array.isArray(m.agenda_items) ? m.agenda_items : [],
      duration_minutes: m.duration_minutes || 60,
      location_or_link: m.location_or_link || 'Google Meet / Labor',
      status: m.status || 'voting',
      requires_supervisor: Boolean(m.requires_supervisor),
      confirmed_slot_id: m.confirmed_slot_id,
      meeting_notes: m.meeting_notes,
      created_by: m.created_by,
      created_at: m.created_at,
      updated_at: m.updated_at,
      slots,
    };
  });
}

export interface StoreProviderProps {
  initialUser?: any;
  initialProfile?: Profile | null;
  initialProfiles?: Profile[];
  children: ReactNode;
}

export function StoreProvider({
  initialUser,
  initialProfile,
  initialProfiles = initialProfilesFallback,
  children,
}: StoreProviderProps) {
  const supabase = createClient();

  const [profiles, setProfiles] = useState<Profile[]>(
    initialProfiles && initialProfiles.length > 0 ? initialProfiles : initialProfilesFallback
  );
  const [currentProfile, setCurrentProfile] = useState<Profile>(
    initialProfile || initialProfilesFallback[0]
  );
  const [isSupervisorMode, setIsSupervisorMode] = useState<boolean>(
    initialProfile?.role === 'supervisor'
  );
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'offline'>(
    isSupabaseConfigured ? 'connecting' : 'offline'
  );

  // Core Data States
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [taskComments, setTaskComments] = useState<TaskComment[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [repositoryFiles, setRepositoryFiles] = useState<RepositoryFile[]>([]);
  const [researchLogs, setResearchLogs] = useState<ResearchLog[]>([]);
  const [literatureItems, setLiteratureItems] = useState<LiteratureItem[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Update supervisor mode whenever current profile changes
  useEffect(() => {
    if (currentProfile) {
      setIsSupervisorMode(currentProfile.role === 'supervisor');
    }
  }, [currentProfile]);

  // Load state and listen to Realtime updates
  const fetchSupabaseMeetings = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*, meeting_slots(*, meeting_votes(*))')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setMeetings(transformSupabaseMeetings(data));
      }
    } catch (err) {
      console.warn('[RED Lab] Error fetching meetings:', err);
    }
  }, [supabase]);

  // Initial Data Fetch from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Local storage hydration for demo/offline resilience
      try {
        const storedTasks = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
        setTasks(storedTasks ? JSON.parse(storedTasks) : initialKanbanTasks);

        const storedMilestones = localStorage.getItem(`${STORAGE_KEY_PREFIX}milestones`);
        setMilestones(storedMilestones ? JSON.parse(storedMilestones) : initialMilestones);

        const storedFiles = localStorage.getItem(`${STORAGE_KEY_PREFIX}files`);
        setRepositoryFiles(storedFiles ? JSON.parse(storedFiles) : initialRepositoryFiles);

        const storedLogs = localStorage.getItem(`${STORAGE_KEY_PREFIX}logs`);
        setResearchLogs(storedLogs ? JSON.parse(storedLogs) : initialResearchLogs);

        const storedLit = localStorage.getItem(`${STORAGE_KEY_PREFIX}literature`);
        setLiteratureItems(storedLit ? JSON.parse(storedLit) : initialLiteratureItems);

        const storedMeetings = localStorage.getItem(`${STORAGE_KEY_PREFIX}meetings`);
        setMeetings(storedMeetings ? JSON.parse(storedMeetings) : initialMeetings);

        const storedNotifs = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifs`);
        setNotifications(storedNotifs ? JSON.parse(storedNotifs) : initialNotifications);

        const storedActs = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities`);
        setActivityLogs(storedActs ? JSON.parse(storedActs) : initialActivityLogs);
      } catch (e) {
        console.warn('[RED Lab] Offline hydration error:', e);
      }
      return;
    }

    let isCancelled = false;

    async function loadAllFromSupabase() {
      setRealtimeStatus('connecting');

      try {
        const [
          tasksRes,
          milestonesRes,
          commentsRes,
          filesRes,
          logsRes,
          litRes,
          notifsRes,
          actsRes,
          profilesRes,
        ] = await Promise.allSettled([
          supabase.from('kanban_tasks').select('*').order('position', { ascending: true }),
          supabase.from('milestones').select('*').order('phase_number', { ascending: true }),
          supabase.from('task_comments').select('*').order('created_at', { ascending: true }),
          supabase.from('repository_files').select('*').order('created_at', { ascending: false }),
          supabase.from('research_logs').select('*').order('log_date', { ascending: false }),
          supabase.from('literature_items').select('*').order('created_at', { ascending: false }),
          supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        ]);

        if (isCancelled) return;

        if (tasksRes.status === 'fulfilled' && tasksRes.value.data) {
          setTasks(tasksRes.value.data as KanbanTask[]);
        }
        if (milestonesRes.status === 'fulfilled' && milestonesRes.value.data) {
          setMilestones(milestonesRes.value.data as Milestone[]);
        }
        if (commentsRes.status === 'fulfilled' && commentsRes.value.data) {
          setTaskComments(commentsRes.value.data as TaskComment[]);
        }
        if (filesRes.status === 'fulfilled' && filesRes.value.data) {
          setRepositoryFiles(filesRes.value.data as RepositoryFile[]);
        }
        if (logsRes.status === 'fulfilled' && logsRes.value.data) {
          setResearchLogs(logsRes.value.data as ResearchLog[]);
        }
        if (litRes.status === 'fulfilled' && litRes.value.data) {
          setLiteratureItems(litRes.value.data as LiteratureItem[]);
        }
        if (notifsRes.status === 'fulfilled' && notifsRes.value.data) {
          setNotifications(notifsRes.value.data as NotificationItem[]);
        }
        if (actsRes.status === 'fulfilled' && actsRes.value.data) {
          setActivityLogs(actsRes.value.data as ActivityLog[]);
        }
        if (profilesRes.status === 'fulfilled' && profilesRes.value.data && profilesRes.value.data.length > 0) {
          setProfiles(profilesRes.value.data as Profile[]);
        }

        await fetchSupabaseMeetings();
      } catch (err) {
        console.warn('[RED Lab] Error fetching database tables:', err);
      }
    }

    loadAllFromSupabase();

    // 100% REALTIME CHANNEL SUBSCRIPTION
    const channel = supabase
      .channel('redlab-realtime-engine')
      // 1. Kanban Tasks
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kanban_tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as KanbanTask;
            setTasks((prev) => (prev.some((t) => t.id === newTask.id) ? prev : [...prev, newTask]));
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as KanbanTask;
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setTasks((prev) => prev.filter((t) => t.id !== oldId));
          }
        }
      )
      // 2. Milestones
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'milestones' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newM = payload.new as Milestone;
            setMilestones((prev) => (prev.some((m) => m.id === newM.id) ? prev : [...prev, newM]));
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Milestone;
            setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setMilestones((prev) => prev.filter((m) => m.id !== oldId));
          }
        }
      )
      // 3. Repository Files
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'repository_files' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newF = payload.new as RepositoryFile;
            setRepositoryFiles((prev) => [newF, ...prev.filter((f) => f.id !== newF.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as RepositoryFile;
            setRepositoryFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setRepositoryFiles((prev) => prev.filter((f) => f.id !== oldId));
          }
        }
      )
      // 4. Research Logs
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'research_logs' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newL = payload.new as ResearchLog;
            setResearchLogs((prev) => [newL, ...prev.filter((l) => l.id !== newL.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as ResearchLog;
            setResearchLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setResearchLogs((prev) => prev.filter((l) => l.id !== oldId));
          }
        }
      )
      // 5. Literature Items
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'literature_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newLit = payload.new as LiteratureItem;
            setLiteratureItems((prev) => [newLit, ...prev.filter((item) => item.id !== newLit.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as LiteratureItem;
            setLiteratureItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setLiteratureItems((prev) => prev.filter((item) => item.id !== oldId));
          }
        }
      )
      // 6. Meetings, Slots, and Consensus Votes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meetings' },
        () => {
          fetchSupabaseMeetings();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meeting_slots' },
        () => {
          fetchSupabaseMeetings();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meeting_votes' },
        () => {
          fetchSupabaseMeetings();
        }
      )
      // 7. In-App Notifications
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new as NotificationItem;
          if (!newNotif.recipient_id || newNotif.recipient_id === currentProfile.id) {
            setNotifications((prev) => [newNotif, ...prev]);
            toast.info(newNotif.title, { description: newNotif.message });
          }
        }
      )
      // 8. Activity Logs
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => {
          const newAct = payload.new as ActivityLog;
          setActivityLogs((prev) => [newAct, ...prev]);
        }
      )
      // 9. Profiles
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newP = payload.new as Profile;
            setProfiles((prev) => [...prev.filter((p) => p.id !== newP.id), newP]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Profile;
            setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            if (updated.id === currentProfile.id) {
              setCurrentProfile(updated);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('offline');
        }
      });

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchSupabaseMeetings, currentProfile.id]);

  // Profile Switching & Updates
  const setCurrentProfileById = (profileId: string) => {
    const found = profiles.find((p) => p.id === profileId);
    if (found) {
      setCurrentProfile(found);
      setIsSupervisorMode(found.role === 'supervisor');
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profile_id`, profileId);
        document.cookie = `redlab_demo_profile_id=${profileId}; path=/; max-age=604800; SameSite=Lax`;
      }
      toast.info(`Profil váltva: ${found.full_name}`, {
        description: `Szerepkör: ${found.role === 'supervisor' ? 'Témavezető Professzor' : 'Kutató'}`,
      });
    }
  };

  const updateCurrentProfile = async (updates: Partial<Profile>) => {
    const updated = { ...currentProfile, ...updates, updated_at: new Date().toISOString() };
    setCurrentProfile(updated);
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update(updates).eq('id', updated.id);
      } catch (err) {
        console.warn('[RED Lab] Error updating profile in Supabase:', err);
      }
    }
    toast.success('Profil sikeresen frissítve!');
  };

  const addNewMember = async (member: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    const newMember: Profile = {
      id: `user-${Date.now()}`,
      ...member,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProfiles((prev) => [...prev, newMember]);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').insert(newMember);
      } catch (e) {
        console.warn(e);
      }
    }
    toast.success(`Új kutató hozzáadva: ${newMember.full_name}`);
  };

  const toggleSupervisorMode = () => {
    setIsSupervisorMode((prev) => !prev);
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

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    document.cookie = 'redlab_demo_auth=; path=/; max-age=0';
    document.cookie = 'redlab_demo_profile_id=; path=/; max-age=0';
    toast.info('Kijelentkezve a munkatérből.');
    window.location.href = '/login';
  };

  // Seed initial demo data into Supabase if tables are empty
  const seedDatabase = async (force = false) => {
    if (!isSupabaseConfigured) {
      toast.info('Supabase nincs konfigurálva, offline mintatár aktív.');
      return;
    }

    try {
      toast.loading('Adatok feltöltése a Supabase adatbázisba...');

      // Seed milestones
      if (force || milestones.length === 0) {
        await supabase.from('milestones').upsert(initialMilestones);
        setMilestones(initialMilestones);
      }

      // Seed tasks
      if (force || tasks.length === 0) {
        await supabase.from('kanban_tasks').upsert(initialKanbanTasks);
        setTasks(initialKanbanTasks);
      }

      // Seed files
      if (force || repositoryFiles.length === 0) {
        await supabase.from('repository_files').upsert(initialRepositoryFiles);
        setRepositoryFiles(initialRepositoryFiles);
      }

      // Seed research logs
      if (force || researchLogs.length === 0) {
        await supabase.from('research_logs').upsert(initialResearchLogs);
        setResearchLogs(initialResearchLogs);
      }

      // Seed literature
      if (force || literatureItems.length === 0) {
        await supabase.from('literature_items').upsert(initialLiteratureItems);
        setLiteratureItems(initialLiteratureItems);
      }

      toast.dismiss();
      toast.success('Adatbázis sikeresen inicializálva a RED Lab mintatárral!');
    } catch (err: any) {
      toast.dismiss();
      toast.error('Hiba az adatok feltöltésekor: ' + err.message);
    }
  };

  // ============================================================================
  // KANBAN TASK OPERATIONS
  // ============================================================================
  const addTask = async (task: Omit<KanbanTask, 'id' | 'created_at' | 'updated_at'>) => {
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      ...task,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('kanban_tasks').insert(newTask);
      } catch (err) {
        console.warn('[RED Lab] Error adding task to Supabase:', err);
      }
    }

    logActivity('TASK_CREATED', newTask.title, `Hozzáadva a(z) ${newTask.status} oszlophoz`, '/kanban');
    toast.success(`Feladat hozzáadva: ${newTask.title}`);
  };

  const updateTask = async (taskId: string, updates: Partial<KanbanTask>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      )
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('kanban_tasks')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', taskId);
      } catch (err) {
        console.warn('[RED Lab] Error updating task:', err);
      }
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target || target.status === newStatus) return;

    const oldStatus = target.status;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
      )
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('kanban_tasks')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', taskId);
      } catch (err) {
        console.warn('[RED Lab] Error moving task in Supabase:', err);
      }
    }

    logActivity('TASK_MOVED', target.title, `${oldStatus} ➔ ${newStatus}`, '/kanban');

    // Automation trigger: If moved to professor review, dispatch notification
    if (newStatus === 'review_professor') {
      dispatchAutomationEvent({
        eventType: 'TASK_READY_FOR_PROFESSOR',
        title: `Áttekintésre Vár: ${target.title}`,
        message: `${currentProfile.full_name} a professzori véleményezés oszlopba helyezte ezt a feladatot.`,
        actorName: currentProfile.full_name,
        workstream: target.workstream,
        targetUrl: '/kanban',
      });
      toast.info('Témavezetői jóváhagyásra elküldve! 🎓', {
        description: 'Értesítés küldve a Discord csatornára és a professzornak.',
      });
    }
  };

  const toggleChecklistItem = async (taskId: string, checklistId: string) => {
    let updatedChecklist: any[] = [];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          updatedChecklist = t.checklist.map((item) =>
            item.id === checklistId ? { ...item, done: !item.done } : item
          );
          return { ...t, checklist: updatedChecklist, updated_at: new Date().toISOString() };
        }
        return t;
      })
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('kanban_tasks')
          .update({ checklist: updatedChecklist, updated_at: new Date().toISOString() })
          .eq('id', taskId);
      } catch (err) {
        console.warn('[RED Lab] Error toggling checklist item:', err);
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (isSupabaseConfigured) {
      try {
        await supabase.from('kanban_tasks').delete().eq('id', taskId);
      } catch (err) {
        console.warn(err);
      }
    }
    toast.success('Feladat törölve.');
  };

  // Comments
  const addComment = async (taskId?: string, milestoneId?: string, content?: string) => {
    if (!content?.trim()) return;

    const newComment: TaskComment = {
      id: `comment-${Date.now()}`,
      task_id: taskId,
      milestone_id: milestoneId,
      author_id: currentProfile.id,
      author_name: currentProfile.full_name,
      content: content.trim(),
      is_professor_note: currentProfile.role === 'supervisor',
      created_at: new Date().toISOString(),
    };

    setTaskComments((prev) => [...prev, newComment]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('task_comments').insert(newComment);
      } catch (err) {
        console.warn(err);
      }
    }
    toast.success('Hozzászólás elküldve.');
  };

  // ============================================================================
  // MILESTONE OPERATIONS
  // ============================================================================
  const addMilestone = async (ms: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => {
    const newMs: Milestone = {
      id: `ms-${Date.now()}`,
      ...ms,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMilestones((prev) => [...prev, newMs].sort((a, b) => a.phase_number - b.phase_number));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('milestones').insert(newMs);
      } catch (err) {
        console.warn(err);
      }
    }
    logActivity('MILESTONE_CREATED', newMs.title, 'Új mérföldkő hozzáadva a haladási tervhez', '/milestones');
    toast.success(`Mérföldkő hozzáadva: ${newMs.title}`);
  };

  const updateMilestone = async (milestoneId: string, updates: Partial<Milestone>) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
      )
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('milestones')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', milestoneId);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const deleteMilestone = async (milestoneId: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    if (isSupabaseConfigured) {
      try {
        await supabase.from('milestones').delete().eq('id', milestoneId);
      } catch (err) {
        console.warn(err);
      }
    }
    toast.success('Mérföldkő törölve.');
  };

  const updateMilestoneContent = async (milestoneId: string, content: string, newWords?: number) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              content_draft: content,
              current_words: newWords !== undefined ? newWords : m.current_words,
              updated_at: new Date().toISOString(),
            }
          : m
      )
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('milestones')
          .update({
            content_draft: content,
            current_words: newWords,
            updated_at: new Date().toISOString(),
          })
          .eq('id', milestoneId);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const submitMilestoneForReview = async (milestoneId: string) => {
    const ms = milestones.find((m) => m.id === milestoneId);
    if (!ms) return;

    await updateMilestone(milestoneId, { status: 'awaiting_approval' });

    dispatchAutomationEvent({
      eventType: 'TASK_READY_FOR_PROFESSOR',
      title: `Szakdolgozati Mérföldkő Jóváhagyásra Vár: ${ms.title}`,
      message: `${currentProfile.full_name} beadta véleményezésre a(z) "${ms.title}" fejezetet.`,
      actorName: currentProfile.full_name,
      workstream: 'thesis_writing',
      targetUrl: '/milestones',
    });

    logActivity('MILESTONE_SUBMITTED', ms.title, 'Beadva professzori jóváhagyásra', '/milestones');
    toast.success('Mérföldkő beküldve témavezetői áttekintésre!');
  };

  const supervisorApproveMilestone = async (milestoneId: string, feedback: string) => {
    const ms = milestones.find((m) => m.id === milestoneId);
    if (!ms) return;

    await updateMilestone(milestoneId, {
      status: 'approved',
      supervisor_feedback: feedback,
      approved_by: currentProfile.id,
      approved_at: new Date().toISOString(),
      progress_percent: 100,
    });

    dispatchAutomationEvent({
      eventType: 'MILESTONE_SIGNED_OFF',
      title: `Mérföldkő Jóváhagyva (Signed Off) ✅: ${ms.title}`,
      message: `${currentProfile.full_name} (Témavezető) jóváhagyta a(z) "${ms.title}" mérföldkövet! Megjegyzés: "${feedback}"`,
      actorName: currentProfile.full_name,
      workstream: 'thesis_writing',
      targetUrl: '/milestones',
    });

    logActivity('MILESTONE_APPROVED', ms.title, `Professzori jóváhagyás: "${feedback}"`, '/milestones');
    toast.success('Mérföldkő hivatalosan jóváhagyva!');
  };

  const supervisorRequestRevision = async (milestoneId: string, feedback: string) => {
    const ms = milestones.find((m) => m.id === milestoneId);
    if (!ms) return;

    await updateMilestone(milestoneId, {
      status: 'revision_requested',
      supervisor_feedback: feedback,
    });

    dispatchAutomationEvent({
      eventType: 'MILESTONE_SIGNED_OFF',
      title: `Revízió Kérve ⚠️: ${ms.title}`,
      message: `${currentProfile.full_name} javításokat kért a(z) "${ms.title}" mérföldkőhöz: "${feedback}"`,
      actorName: currentProfile.full_name,
      workstream: 'thesis_writing',
      targetUrl: '/milestones',
    });

    logActivity('MILESTONE_REVISION', ms.title, `Javítás kérése: "${feedback}"`, '/milestones');
    toast.warning('Revízió kérése elküldve a hallgatóknak.');
  };

  // ============================================================================
  // REPOSITORY FILES (GITHUB-STYLE VERSIONING)
  // ============================================================================
  const uploadFileVersion = async (
    fileGroupKey: string,
    fileName: string,
    folderCategory: WorkstreamType,
    commitMessage: string,
    fileSizeBytes?: number,
    milestoneId?: string
  ) => {
    const existingVersions = repositoryFiles.filter((f) => f.file_group_key === fileGroupKey);
    const newVersionNumber = existingVersions.length > 0
      ? Math.max(...existingVersions.map((f) => f.version_number)) + 1
      : 1;

    const newFile: RepositoryFile = {
      id: `file-${Date.now()}`,
      file_group_key: fileGroupKey,
      file_name: fileName,
      folder_category: folderCategory,
      version_number: newVersionNumber,
      storage_path: `/storage/files/${fileGroupKey}/v${newVersionNumber}_${fileName}`,
      file_size_bytes: fileSizeBytes || Math.floor(Math.random() * 5000000) + 500000,
      mime_type: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
      commit_message: commitMessage,
      is_latest: true,
      milestone_id: milestoneId,
      uploaded_by: currentProfile.id,
      uploaded_by_name: currentProfile.full_name,
      created_at: new Date().toISOString(),
    };

    // Mark previous versions as not latest
    setRepositoryFiles((prev) => [
      newFile,
      ...prev.map((f) => (f.file_group_key === fileGroupKey ? { ...f, is_latest: false } : f)),
    ]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('repository_files').insert(newFile);
      } catch (err) {
        console.warn('[RED Lab] Error uploading file version to Supabase:', err);
      }
    }

    dispatchAutomationEvent({
      eventType: 'FILE_NEW_VERSION',
      title: `Új Fájl Verzió Feltöltve: ${fileName} (v${newVersionNumber})`,
      message: `"${commitMessage}" — feltöltő: ${currentProfile.full_name}`,
      actorName: currentProfile.full_name,
      workstream: folderCategory,
      targetUrl: '/files',
    });

    logActivity(
      'FILE_UPLOADED',
      fileName,
      `v${newVersionNumber} feltöltve: "${commitMessage}"`,
      '/files'
    );
    toast.success(`Fájl új verzió feltöltve: v${newVersionNumber} (${fileName})`);
  };

  const deleteRepositoryFile = async (fileId: string) => {
    setRepositoryFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (isSupabaseConfigured) {
      try {
        await supabase.from('repository_files').delete().eq('id', fileId);
      } catch (err) {
        console.warn(err);
      }
    }
    toast.success('Fájl verzió törölve.');
  };

  const deleteRepositoryGroup = async (fileGroupKey: string) => {
    setRepositoryFiles((prev) => prev.filter((f) => f.file_group_key !== fileGroupKey));
    if (isSupabaseConfigured) {
      try {
        await supabase.from('repository_files').delete().eq('file_group_key', fileGroupKey);
      } catch (err) {
        console.warn(err);
      }
    }
    toast.success('Teljes fájlcsoport törölve.');
  };

  // ============================================================================
  // RESEARCH LOGS (DIGITAL NOTEBOOK)
  // ============================================================================
  const addResearchLog = async (
    log: Omit<ResearchLog, 'id' | 'created_at' | 'author_id' | 'author_name'>
  ) => {
    const newLog: ResearchLog = {
      id: `log-${Date.now()}`,
      ...log,
      author_id: currentProfile.id,
      author_name: currentProfile.full_name,
      created_at: new Date().toISOString(),
    };

    setResearchLogs((prev) => [newLog, ...prev]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('research_logs').insert(newLog);
      } catch (err) {
        console.warn(err);
      }
    }

    logActivity('LOG_CREATED', newLog.title, 'Új digitális kutatási naplóbejegyzés', '/logs');
    toast.success('Kutatási naplóbejegyzés elmentve!');
  };

  const updateResearchLog = async (logId: string, updates: Partial<ResearchLog>) => {
    setResearchLogs((prev) =>
      prev.map((log) => (log.id === logId ? { ...log, ...updates } : log))
    );

    if (isSupabaseConfigured) {
      try {
        await supabase.from('research_logs').update(updates).eq('id', logId);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const deleteResearchLog = async (logId: string) => {
    setResearchLogs((prev) => prev.filter((l) => l.id !== logId));
    if (isSupabaseConfigured) {
      try {
        await supabase.from('research_logs').delete().eq('id', logId);
      } catch (err) {
        console.warn(err);
      }
    }
    toast.success('Naplóbejegyzés törölve.');
  };

  // ============================================================================
  // LITERATURE ITEMS
  // ============================================================================
  const addLiteratureItem = async (
    item: Omit<LiteratureItem, 'id' | 'created_at' | 'updated_at' | 'added_by' | 'upvotes'>
  ) => {
    const newItem: LiteratureItem = {
      id: `paper-${Date.now()}`,
      ...item,
      added_by: currentProfile.id,
      upvotes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setLiteratureItems((prev) => [newItem, ...prev]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('literature_items').insert(newItem);
      } catch (err) {
        console.warn(err);
      }
    }

    logActivity('PAPER_ADDED', newItem.title, `Hozzáadva a szakirodalom gyűjteményhez`, '/literature');
    toast.success(`Cikk mentve: ${newItem.title}`);
  };

  const updateLiteratureItem = async (itemId: string, updates: Partial<LiteratureItem>) => {
    setLiteratureItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, ...updates, updated_at: new Date().toISOString() }
          : item
      )
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('literature_items')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', itemId);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const updateLiteratureStatus = async (itemId: string, status: LiteratureStatus) => {
    await updateLiteratureItem(itemId, { status });
  };

  const toggleLiteratureUpvote = async (itemId: string) => {
    const item = literatureItems.find((l) => l.id === itemId);
    if (!item) return;

    const currentUpvotes = item.upvotes || [];
    const hasUpvoted = currentUpvotes.includes(currentProfile.id);
    const newUpvotes = hasUpvoted
      ? currentUpvotes.filter((id) => id !== currentProfile.id)
      : [...currentUpvotes, currentProfile.id];

    await updateLiteratureItem(itemId, { upvotes: newUpvotes });
  };

  const toggleLiteraturePin = async (itemId: string) => {
    const item = literatureItems.find((l) => l.id === itemId);
    if (!item) return;

    const nextPin = !item.is_pinned_for_professor;
    await updateLiteratureItem(itemId, { is_pinned_for_professor: nextPin });

    if (nextPin) {
      toast.info('Cikk kitűzve a témavezetőnek! 📌');
    }
  };

  const deleteLiteratureItem = async (itemId: string) => {
    setLiteratureItems((prev) => prev.filter((i) => i.id !== itemId));
    if (isSupabaseConfigured) {
      try {
        await supabase.from('literature_items').delete().eq('id', itemId);
      } catch (err) {
        console.warn(err);
      }
    }
    toast.success('Cikk eltávolítva.');
  };

  // ============================================================================
  // MEETINGS & VOTING ENGINE
  // ============================================================================
  const voteMeetingSlot = async (
    meetingId: string,
    slotId: string,
    vote: VoteType,
    comment?: string
  ) => {
    // Optimistic local update
    setMeetings((prevMeetings) =>
      prevMeetings.map((m) => {
        if (m.id !== meetingId) return m;

        const updatedSlots = m.slots.map((s) => {
          if (s.id !== slotId) return s;
          const votesMap = { ...(s.votes || {}) };
          votesMap[currentProfile.id] = {
            id: `vote-${Date.now()}`,
            slot_id: slotId,
            meeting_id: meetingId,
            voter_id: currentProfile.id,
            vote,
            comment,
            updated_at: new Date().toISOString(),
          };
          return { ...s, votes: votesMap };
        });

        return { ...m, slots: updatedSlots, updated_at: new Date().toISOString() };
      })
    );

    if (isSupabaseConfigured) {
      try {
        await supabase.from('meeting_votes').upsert(
          {
            slot_id: slotId,
            meeting_id: meetingId,
            voter_id: currentProfile.id,
            vote,
            comment: comment || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'slot_id,voter_id' }
        );

        // Refetch to reflect database triggers (consensus / reschedule_needed)
        await fetchSupabaseMeetings();
      } catch (err) {
        console.warn('[RED Lab] Error voting on slot:', err);
      }
    }

    toast.success(
      vote === 'upvote'
        ? 'Időpont elfogadva (+1 szavazat)'
        : vote === 'downvote'
        ? 'Ütközés jelölve (-1 szavazat)'
        : 'Feltételes idősáv mentve'
    );
  };

  const createMeeting = async (
    meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'status'>
  ) => {
    const meetingId = `meeting-${Date.now()}`;
    const newMeeting: Meeting = {
      id: meetingId,
      ...meeting,
      status: 'voting',
      created_by: currentProfile.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMeetings((prev) => [newMeeting, ...prev]);

    if (isSupabaseConfigured) {
      try {
        // Insert meeting record
        await supabase.from('meetings').insert({
          id: meetingId,
          title: newMeeting.title,
          description: newMeeting.description,
          agenda_items: newMeeting.agenda_items,
          duration_minutes: newMeeting.duration_minutes,
          location_or_link: newMeeting.location_or_link,
          status: 'voting',
          requires_supervisor: newMeeting.requires_supervisor,
          created_by: currentProfile.id,
        });

        // Insert slot records
        if (newMeeting.slots && newMeeting.slots.length > 0) {
          const slotsToInsert = newMeeting.slots.map((s) => ({
            id: s.id || `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            meeting_id: meetingId,
            start_time: s.start_time,
            end_time: s.end_time,
            proposed_by: currentProfile.id,
          }));
          await supabase.from('meeting_slots').insert(slotsToInsert);
        }

        await fetchSupabaseMeetings();
      } catch (err) {
        console.warn('[RED Lab] Error creating meeting:', err);
      }
    }

    dispatchAutomationEvent({
      eventType: 'MEETING_PROPOSED',
      title: `Új Időpont-szavazás: ${newMeeting.title}`,
      message: `${currentProfile.full_name} új konzultációt hirdetett meg ${newMeeting.slots.length} javasolt idősávval.`,
      actorName: currentProfile.full_name,
      targetUrl: '/scheduler',
    });

    logActivity('MEETING_CREATED', newMeeting.title, 'Új konzultációs szavazás indult', '/scheduler');
    toast.success(`Konzultáció létrehozva: ${newMeeting.title}`);
  };

  const confirmMeetingSlot = async (
    meetingId: string,
    slotId: string,
    meetingLink?: string
  ) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              status: 'confirmed',
              confirmed_slot_id: slotId,
              location_or_link: meetingLink || m.location_or_link,
              updated_at: new Date().toISOString(),
            }
          : m
      )
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('meetings')
          .update({
            status: 'confirmed',
            confirmed_slot_id: slotId,
            location_or_link: meetingLink,
            updated_at: new Date().toISOString(),
          })
          .eq('id', meetingId);
      } catch (err) {
        console.warn(err);
      }
    }

    const m = meetings.find((meet) => meet.id === meetingId);
    if (m) {
      dispatchAutomationEvent({
        eventType: 'MEETING_CONFIRMED',
        title: `Konzultáció Időpont Véglegesítve: ${m.title}`,
        message: `A megbeszélés időpontja elfogadásra került! Helyszín / Link: ${
          meetingLink || m.location_or_link
        }`,
        actorName: currentProfile.full_name,
        targetUrl: '/scheduler',
      });
    }

    toast.success('Konzultáció időpontja hivatalosan megerősítve! 📅');
  };

  const addMeetingSlot = async (meetingId: string, startTime: string) => {
    const slotId = `slot-${Date.now()}`;
    const endDate = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();

    const newSlot: MeetingSlot = {
      id: slotId,
      meeting_id: meetingId,
      start_time: startTime,
      end_time: endDate,
      proposed_by: currentProfile.id,
      created_at: new Date().toISOString(),
      votes: {},
    };

    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, slots: [...m.slots, newSlot] } : m))
    );

    if (isSupabaseConfigured) {
      try {
        await supabase.from('meeting_slots').insert({
          id: slotId,
          meeting_id: meetingId,
          start_time: startTime,
          end_time: endDate,
          proposed_by: currentProfile.id,
        });
      } catch (err) {
        console.warn(err);
      }
    }

    toast.success('Új idősáv hozzáadva a szavazáshoz!');
  };

  const updateMeetingNotes = async (meetingId: string, notes: string) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId ? { ...m, meeting_notes: notes, updated_at: new Date().toISOString() } : m
      )
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('meetings')
          .update({ meeting_notes: notes, updated_at: new Date().toISOString() })
          .eq('id', meetingId);
      } catch (err) {
        console.warn(err);
      }
    }
    toast.success('Jegyzőkönyv frissítve.');
  };

  const deleteMeeting = async (meetingId: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    if (isSupabaseConfigured) {
      try {
        await supabase.from('meetings').delete().eq('id', meetingId);
      } catch (err) {
        console.warn(err);
      }
    }
    toast.success('Megbeszélés törölve.');
  };

  // ============================================================================
  // NOTIFICATIONS & ACTIVITY LOGS
  // ============================================================================
  const markNotificationRead = async (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );

    if (isSupabaseConfigured) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('recipient_id', currentProfile.id);
      } catch (err) {
        console.warn(err);
      }
    }
    toast.success('Összes értesítés olvasottnak jelölve.');
  };

  const addNotification = async (
    notif: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      ...notif,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotif, ...prev]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('notifications').insert(newNotif);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const logActivity = async (
    actionType: string,
    entityTitle: string,
    details?: string,
    targetUrl?: string
  ) => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      actor_id: currentProfile.id,
      actor_name: currentProfile.full_name,
      action_type: actionType,
      entity_title: entityTitle,
      details,
      target_url: targetUrl,
      created_at: new Date().toISOString(),
    };

    setActivityLogs((prev) => [newAct, ...prev]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('activity_logs').insert(newAct);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  return (
    <StoreContext.Provider
      value={{
        currentProfile,
        profiles,
        setCurrentProfileById,
        updateCurrentProfile,
        addNewMember,
        isSupervisorMode,
        toggleSupervisorMode,
        theme,
        toggleTheme,
        realtimeStatus,
        isSupabaseLive: isSupabaseConfigured,
        signOut,
        seedDatabase,

        tasks,
        addTask,
        updateTask,
        moveTask,
        toggleChecklistItem,
        deleteTask,

        taskComments,
        addComment,

        milestones,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        updateMilestoneContent,
        submitMilestoneForReview,
        supervisorApproveMilestone,
        supervisorRequestRevision,

        repositoryFiles,
        uploadFileVersion,
        deleteRepositoryFile,
        deleteRepositoryGroup,

        researchLogs,
        addResearchLog,
        updateResearchLog,
        deleteResearchLog,

        literatureItems,
        addLiteratureItem,
        updateLiteratureItem,
        updateLiteratureStatus,
        toggleLiteratureUpvote,
        toggleLiteraturePin,
        deleteLiteratureItem,

        meetings,
        voteMeetingSlot,
        createMeeting,
        confirmMeetingSlot,
        addMeetingSlot,
        updateMeetingNotes,
        deleteMeeting,

        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        activityLogs,
        logActivity,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

// Fallback profiles when database is completely empty
const initialProfilesFallback = initialProfiles;

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    // Return a safe fallback to prevent unhandled crashes if called before mount
    return {
      currentProfile: initialProfilesFallback[0],
      profiles: initialProfilesFallback,
      setCurrentProfileById: () => {},
      updateCurrentProfile: async () => {},
      addNewMember: () => {},
      isSupervisorMode: false,
      toggleSupervisorMode: () => {},
      theme: 'dark',
      toggleTheme: () => {},
      realtimeStatus: 'offline',
      isSupabaseLive: false,
      signOut: async () => {},
      seedDatabase: async () => {},

      tasks: [],
      addTask: async () => {},
      updateTask: async () => {},
      moveTask: async () => {},
      toggleChecklistItem: async () => {},
      deleteTask: async () => {},

      taskComments: [],
      addComment: async () => {},

      milestones: [],
      addMilestone: async () => {},
      updateMilestone: async () => {},
      deleteMilestone: async () => {},
      updateMilestoneContent: async () => {},
      submitMilestoneForReview: async () => {},
      supervisorApproveMilestone: async () => {},
      supervisorRequestRevision: async () => {},

      repositoryFiles: [],
      uploadFileVersion: async () => {},
      deleteRepositoryFile: async () => {},
      deleteRepositoryGroup: async () => {},

      researchLogs: [],
      addResearchLog: async () => {},
      updateResearchLog: async () => {},
      deleteResearchLog: async () => {},

      literatureItems: [],
      addLiteratureItem: async () => {},
      updateLiteratureItem: async () => {},
      updateLiteratureStatus: async () => {},
      toggleLiteratureUpvote: async () => {},
      toggleLiteraturePin: async () => {},
      deleteLiteratureItem: async () => {},

      meetings: [],
      voteMeetingSlot: async () => {},
      createMeeting: async () => {},
      confirmMeetingSlot: async () => {},
      addMeetingSlot: async () => {},
      updateMeetingNotes: async () => {},
      deleteMeeting: async () => {},

      notifications: [],
      markNotificationRead: async () => {},
      markAllNotificationsRead: async () => {},
      addNotification: async () => {},
      activityLogs: [],
      logActivity: async () => {},
    };
  }
  return context;
}

// Aliases for clear domain semantics
export const AuthAndRealtimeProvider = StoreProvider;
export const useAuthAndRealtime = useStore;
