// ============================================================================
// RED LAB COLLABORATION PLATFORM - DATABASE TYPES & METADATA
// ============================================================================

export type UserRole = 'researcher' | 'supervisor';

export type WorkstreamType =
  | 'general'
  | 'wet_lab'
  | 'dry_lab_code'
  | 'cad_hardware'
  | 'thesis_writing'
  | 'administration';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review_professor' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type MilestoneStatus =
  | 'upcoming'
  | 'in_progress'
  | 'awaiting_approval'
  | 'approved'
  | 'revision_requested';

export type MeetingStatus =
  | 'voting'
  | 'confirmed'
  | 'reschedule_needed'
  | 'completed'
  | 'cancelled';

export type VoteType = 'upvote' | 'downvote' | 'if_needed';

export type LiteratureStatus = 'to_read' | 'reading' | 'summarized' | 'cited_in_thesis';

// ============================================================================
// TABLE INTERFACES
// ============================================================================

/**
 * 3.1 PROFILES (auth.users profil adatok)
 */
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  short_code: string;
  role: UserRole;
  primary_workstream: WorkstreamType;
  avatar_url?: string | null;
  badge_color: string;
  notify_email: boolean;
  notify_webhook: boolean;
  affiliation?: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 3.2 MILESTONES (Szakdolgozati Haladási Mérföldkövek & Témavezetői Sign-off)
 */
export interface Milestone {
  id: string;
  title: string;
  description: string;
  phase_number: number;
  due_date: string;
  status: MilestoneStatus;
  progress_percent: number; // 0..100
  deliverable_url?: string | null;
  supervisor_feedback?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_by?: string | null;
  target_words?: number;
  current_words?: number;
  content_draft?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 3.3 KANBAN TASKS (Kutatási Feladatok & Checklistek)
 */
export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  workstream: WorkstreamType;
  position: number;
  milestone_id?: string | null;
  assigned_to?: string | null;
  co_assignees?: string[];
  due_date?: string | null;
  checklist: TaskChecklistItem[];
  tags: string[];
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 3.4 TASK COMMENTS (Feladat és Kézirat Megjegyzések)
 */
export interface TaskComment {
  id: string;
  task_id?: string | null;
  milestone_id?: string | null;
  author_id: string;
  author_name?: string;
  content: string;
  is_professor_note: boolean;
  created_at: string;
}

/**
 * 3.5 & 3.6 & 3.7 MEETINGS, SLOTS, VOTES (Konzultáció Időpont-egyeztető)
 */
export interface MeetingVote {
  id: string;
  slot_id: string;
  meeting_id: string;
  voter_id: string;
  vote: VoteType;
  comment?: string | null;
  updated_at: string;
}

export interface MeetingSlot {
  id: string;
  meeting_id: string;
  start_time: string;
  end_time: string;
  proposed_by: string;
  created_at: string;
  votes?: Record<string, MeetingVote>;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  agenda_items: string[];
  duration_minutes: number;
  location_or_link: string;
  status: MeetingStatus;
  requires_supervisor: boolean;
  confirmed_slot_id?: string | null;
  meeting_notes?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  slots: MeetingSlot[];
}

/**
 * 3.8 LITERATURE ITEMS (Szakirodalom & DOI Tár)
 */
export interface LiteratureItem {
  id: string;
  title: string;
  authors: string;
  publication_year?: number | null;
  journal?: string | null;
  doi?: string | null;
  external_url?: string | null;
  pdf_storage_path?: string | null;
  abstract?: string | null;
  key_findings?: string | null;
  bibtex_citation?: string | null;
  status: LiteratureStatus;
  workstream: WorkstreamType;
  tags: string[];
  is_pinned_for_professor: boolean;
  added_by?: string | null;
  upvotes?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * 3.9 REPOSITORY FILES (Tudományos Fájltár & Git Verziózás)
 */
export interface RepositoryFile {
  id: string;
  folder_category: WorkstreamType;
  file_group_key: string;
  file_name: string;
  version_number: number;
  storage_path: string;
  file_size_bytes: number;
  mime_type: string;
  commit_message: string;
  is_latest: boolean;
  milestone_id?: string | null;
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: string;
}

export interface ThesisFigureMapping {
  figure_number: string;
  file_id: string;
  file_group_key: string;
  pinned_version: number;
  caption: string;
  latex_label: string;
}

export type ThesisChapterStatus = 'draft' | 'in_progress' | 'ready_for_review' | 'approved';

export interface ThesisChapterMetadata {
  is_thesis_chapter: boolean;
  chapter_number: number;
  section_code: string;
  status: ThesisChapterStatus;
  assigned_to_code: string;
  target_word_count: number;
  linked_literature_ids: string[];
  figure_mappings: ThesisFigureMapping[];
}

/**
 * 3.10 RESEARCH LOGS (Kísérleti & Laboratóriumi Napló)
 */
export interface ResearchLog {
  id: string;
  title: string;
  log_date: string;
  workstream: WorkstreamType;
  content_markdown: string;
  parameters_json: Record<string, any>;
  linked_file_ids: string[];
  author_id: string;
  author_name?: string;
  created_at: string;
}

/**
 * 3.11 ACTIVITY LOGS (Rendszer Esemény Audit)
 */
export interface ActivityLog {
  id: string;
  actor_id?: string | null;
  actor_name?: string;
  action_type: string;
  entity_title: string;
  details?: string | null;
  target_url?: string | null;
  created_at: string;
}

/**
 * 3.12 NOTIFICATIONS (Valós Idejű Értesítések)
 */
export interface NotificationItem {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  link_url?: string | null;
  is_read: boolean;
  severity: 'info' | 'success' | 'warning' | 'urgent';
  created_at: string;
}

// Alias for convenience
export type Notification = NotificationItem;

// ============================================================================
// SUPABASE DATABASE TYPE DEFINITION
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      milestones: {
        Row: Milestone;
        Insert: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Milestone, 'id' | 'created_at' | 'updated_at'>>;
      };
      kanban_tasks: {
        Row: KanbanTask;
        Insert: Omit<KanbanTask, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<KanbanTask, 'id' | 'created_at' | 'updated_at'>>;
      };
      task_comments: {
        Row: TaskComment;
        Insert: Omit<TaskComment, 'id' | 'created_at'>;
        Update: Partial<Omit<TaskComment, 'id' | 'created_at'>>;
      };
      meetings: {
        Row: Meeting;
        Insert: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'slots'>;
        Update: Partial<Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'slots'>>;
      };
      meeting_slots: {
        Row: MeetingSlot;
        Insert: Omit<MeetingSlot, 'id' | 'created_at' | 'votes'>;
        Update: Partial<Omit<MeetingSlot, 'id' | 'created_at' | 'votes'>>;
      };
      meeting_votes: {
        Row: MeetingVote;
        Insert: Omit<MeetingVote, 'id' | 'updated_at'>;
        Update: Partial<Omit<MeetingVote, 'id' | 'updated_at'>>;
      };
      literature_items: {
        Row: LiteratureItem;
        Insert: Omit<LiteratureItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LiteratureItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      repository_files: {
        Row: RepositoryFile;
        Insert: Omit<RepositoryFile, 'id' | 'created_at'>;
        Update: Partial<Omit<RepositoryFile, 'id' | 'created_at'>>;
      };
      research_logs: {
        Row: ResearchLog;
        Insert: Omit<ResearchLog, 'id' | 'created_at'>;
        Update: Partial<Omit<ResearchLog, 'id' | 'created_at'>>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'created_at'>;
        Update: Partial<Omit<ActivityLog, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: NotificationItem;
        Insert: Omit<NotificationItem, 'id' | 'created_at'>;
        Update: Partial<Omit<NotificationItem, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      workstream_type: WorkstreamType;
      task_status: TaskStatus;
      task_priority: TaskPriority;
      milestone_status: MilestoneStatus;
      meeting_status: MeetingStatus;
      vote_type: VoteType;
      literature_status: LiteratureStatus;
    };
  };
}

// ============================================================================
// HELPER CONSTANTS: WORKSTREAMS, ROLES, STATUSES & TEAM MEMBERS
// ============================================================================

export interface WorkstreamMeta {
  id: WorkstreamType;
  label: string;
  description: string;
  badgeColor: string;
  borderColor: string;
  bgLight: string;
  iconName: string;
}

export const WORKSTREAM_CONFIG: Record<WorkstreamType, WorkstreamMeta> = {
  general: {
    id: 'general',
    label: 'Általános Koordináció',
    description: 'Csoportszintű szervezés, adminisztráció és megbeszélések',
    badgeColor: '#64748B',
    borderColor: 'border-slate-500/40',
    bgLight: 'bg-slate-500/10',
    iconName: 'FolderKanban',
  },
  wet_lab: {
    id: 'wet_lab',
    label: 'Nedves Labor & Reagensek',
    description: 'Biomérnöki tesztek, inkubáció, spektrometria és pipettázási protokollok',
    badgeColor: '#F43F5E',
    borderColor: 'border-rose-500/40',
    bgLight: 'bg-rose-500/10',
    iconName: 'FlaskConical',
  },
  dry_lab_code: {
    id: 'dry_lab_code',
    label: 'Számítási Kód & Szimuláció',
    description: 'Python algoritmusok, ML modellek, szimulációk és adatelemzés',
    badgeColor: '#3B82F6',
    borderColor: 'border-blue-500/40',
    bgLight: 'bg-blue-500/10',
    iconName: 'Code2',
  },
  cad_hardware: {
    id: 'cad_hardware',
    label: 'CAD Tervezés & Hardver',
    description: 'Mikrofluidikai chipek, 3D nyomtatás és áramköri integráció',
    badgeColor: '#F59E0B',
    borderColor: 'border-amber-500/40',
    bgLight: 'bg-amber-500/10',
    iconName: 'Cpu',
  },
  thesis_writing: {
    id: 'thesis_writing',
    label: 'Szakdolgozat Kézirat',
    description: 'Kéziratfejezetek, bibliográfia és publikációs ábrák szerkesztése',
    badgeColor: '#E11D48',
    borderColor: 'border-red-500/40',
    bgLight: 'bg-red-500/10',
    iconName: 'BookOpenCheck',
  },
  administration: {
    id: 'administration',
    label: 'Egyetemi Adminisztráció',
    description: 'Formanyomtatványok, tanszéki jóváhagyások és határidők',
    badgeColor: '#8B5CF6',
    borderColor: 'border-purple-500/40',
    bgLight: 'bg-purple-500/10',
    iconName: 'FileCheck',
  },
};

export interface TeamMemberSeed {
  id: string;
  email: string;
  fullName: string;
  shortCode: 'R' | 'E' | 'D' | 'P';
  role: UserRole;
  primaryWorkstream: WorkstreamType;
  badgeColor: string;
  title: string;
  affiliation: string;
}

export const DEFAULT_TEAM_MEMBERS: TeamMemberSeed[] = [
  {
    id: 'user-robin',
    email: 'robin@redlab.edu',
    fullName: 'Robin',
    shortCode: 'R',
    role: 'researcher',
    primaryWorkstream: 'dry_lab_code',
    badgeColor: '#EF4444', // Crimson / Red
    title: 'Vezető Rendszerkutató & PhD Hallgató',
    affiliation: 'RED Lab / BME Villamosmérnöki és Informatikai Kar',
  },
  {
    id: 'user-emma',
    email: 'emma@redlab.edu',
    fullName: 'Emma',
    shortCode: 'E',
    role: 'researcher',
    primaryWorkstream: 'wet_lab',
    badgeColor: '#F43F5E', // Rose
    title: 'Biomérnök Kutató & Laborvezető',
    affiliation: 'RED Lab / BME Kémiai és Biomérnöki Kar',
  },
  {
    id: 'user-domi',
    email: 'domi@redlab.edu',
    fullName: 'Domi',
    shortCode: 'D',
    role: 'researcher',
    primaryWorkstream: 'cad_hardware',
    badgeColor: '#F97316', // Orange / Amber
    title: 'Számítási Mérnök & Hardvertervező',
    affiliation: 'RED Lab / BME Gépészmérnöki Kar',
  },
  {
    id: 'user-prof-kovacs',
    email: 'prof.kovacs@redlab.edu',
    fullName: 'Prof. Dr. Kovács Gergely',
    shortCode: 'P',
    role: 'supervisor',
    primaryWorkstream: 'thesis_writing',
    badgeColor: '#9333EA', // Royal Purple
    title: 'Tanszékvezető Egyetemi Tanár, DSc',
    affiliation: 'MTA-BME Nanobiotechnológiai Kutatócsoport',
  },
  {
    id: 'user-dr-szabo',
    email: 'szabo.peter@redlab.edu',
    fullName: 'Dr. Szabó Péter',
    shortCode: 'P',
    role: 'supervisor',
    primaryWorkstream: 'dry_lab_code',
    badgeColor: '#2563EB', // Sapphire Blue
    title: 'Egyetemi Docens, PhD',
    affiliation: 'Alkalmazott Mesterséges Intelligencia Tanszék',
  },
];

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; badgeClass: string }> = {
  backlog: {
    label: 'Ötlettár / Backlog',
    badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
  },
  todo: {
    label: 'Előkészítve / To-Do',
    badgeClass: 'bg-slate-800/90 text-slate-300 border-slate-700',
  },
  in_progress: {
    label: 'Kutatás Alatt',
    badgeClass: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
  },
  review_professor: {
    label: 'Témavezetői Ellenőrzés',
    badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-800/60 animate-pulse',
  },
  done: {
    label: 'Befejezve & Verifikálva',
    badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
  },
};

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Alacsony', color: 'text-slate-400' },
  medium: { label: 'Normál', color: 'text-blue-400' },
  high: { label: 'Kiemelt', color: 'text-amber-400' },
  critical: { label: 'Kritikus (Deadlock)', color: 'text-rose-500 font-bold animate-pulse' },
};

export const MILESTONE_STATUS_CONFIG: Record<MilestoneStatus, { label: string; colorClass: string }> = {
  upcoming: {
    label: 'Közelgő Fázis',
    colorClass: 'bg-slate-800 text-slate-400 border-slate-700',
  },
  in_progress: {
    label: 'Kidolgozás Alatt',
    colorClass: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
  },
  awaiting_approval: {
    label: 'Témavezetői Szignóra Vár',
    colorClass: 'bg-amber-950/80 text-amber-400 border-amber-800/60 animate-pulse',
  },
  approved: {
    label: 'Hivatalosan Jóváhagyva',
    colorClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
  },
  revision_requested: {
    label: 'Átdolgozás Kérve',
    colorClass: 'bg-rose-950/80 text-rose-400 border-rose-800/60',
  },
};

export const MEETING_STATUS_CONFIG: Record<MeetingStatus, { label: string; colorClass: string }> = {
  voting: {
    label: 'Szavazás Folyamatban',
    colorClass: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
  },
  confirmed: {
    label: 'Megerősített Időpont',
    colorClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
  },
  reschedule_needed: {
    label: 'Újraidőzítés Szükséges',
    colorClass: 'bg-rose-950/80 text-rose-400 border-rose-800/60 animate-pulse',
  },
  completed: {
    label: 'Lezajlott Konzultáció',
    colorClass: 'bg-slate-800 text-slate-400 border-slate-700',
  },
  cancelled: {
    label: 'Törölve',
    colorClass: 'bg-slate-900 text-slate-500 border-slate-800 line-through',
  },
};
