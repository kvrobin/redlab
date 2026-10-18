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

export type MeetingStatus = 'voting' | 'confirmed' | 'reschedule_needed' | 'completed' | 'cancelled';

export type VoteType = 'upvote' | 'downvote' | 'if_needed';

export type LiteratureStatus = 'to_read' | 'reading' | 'summarized' | 'cited_in_thesis';

// 3.1 PROFILES
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  short_code: 'R' | 'E' | 'D' | 'P';
  role: UserRole;
  primary_workstream: WorkstreamType;
  avatar_url?: string;
  badge_color: string;
  notify_email: boolean;
  notify_webhook: boolean;
  affiliation?: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

// 3.2 MILESTONES
export interface Milestone {
  id: string;
  title: string;
  description: string;
  phase_number: number;
  due_date: string;
  status: MilestoneStatus;
  progress_percent: number; // 0..100
  deliverable_url?: string;
  supervisor_feedback?: string;
  approved_by?: string;
  approved_at?: string;
  created_by?: string;
  target_words?: number;
  current_words?: number;
  content_draft?: string;
  created_at: string;
  updated_at: string;
}

// 3.3 KANBAN TASKS
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
  milestone_id?: string;
  assigned_to?: string;
  co_assignees?: string[];
  due_date?: string;
  checklist: TaskChecklistItem[];
  tags: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// 3.4 TASK COMMENTS
export interface TaskComment {
  id: string;
  task_id?: string;
  milestone_id?: string;
  author_id: string;
  author_name?: string;
  content: string;
  is_professor_note: boolean;
  created_at: string;
}

// 3.5 & 3.6 & 3.7 MEETINGS, SLOTS, VOTES
export interface MeetingVote {
  id: string;
  slot_id: string;
  meeting_id: string;
  voter_id: string;
  vote: VoteType;
  comment?: string;
  updated_at: string;
}

export interface MeetingSlot {
  id: string;
  meeting_id: string;
  start_time: string;
  end_time: string;
  proposed_by: string;
  created_at: string;
  votes?: Record<string, MeetingVote>; // voter_id -> MeetingVote
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
  confirmed_slot_id?: string;
  meeting_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  slots: MeetingSlot[];
}

// 3.8 LITERATURE ITEMS
export interface LiteratureItem {
  id: string;
  title: string;
  authors: string;
  publication_year?: number;
  journal?: string;
  doi?: string;
  external_url?: string;
  pdf_storage_path?: string;
  abstract?: string;
  key_findings?: string;
  bibtex_citation?: string;
  status: LiteratureStatus;
  workstream: WorkstreamType;
  tags: string[];
  is_pinned_for_professor: boolean;
  added_by?: string;
  upvotes?: string[];
  created_at: string;
  updated_at: string;
}

// 3.9 REPOSITORY FILES
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
  milestone_id?: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: string;
}

// 3.10 RESEARCH LOGS
export interface ResearchLog {
  id: string;
  title: string;
  log_date: string;
  workstream: WorkstreamType;
  content_markdown: string;
  parameters_json: Record<string, string | number>;
  linked_file_ids: string[];
  author_id: string;
  author_name?: string;
  created_at: string;
}

// 3.11 ACTIVITY LOGS & NOTIFICATIONS
export interface ActivityLog {
  id: string;
  actor_id?: string;
  actor_name?: string;
  action_type: string; // 'TASK_MOVED' | 'FILE_UPLOADED' | 'MEETING_RESCHEDULE' | 'MILESTONE_APPROVED' | 'PAPER_ADDED'
  entity_title: string;
  details?: string;
  target_url?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  severity: 'info' | 'success' | 'warning' | 'urgent';
  created_at: string;
}
