export type Role = 'researcher' | 'supervisor';

export type WorkstreamId = 'robin' | 'emma' | 'domi' | 'general';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  affiliation: string;
  workstream?: WorkstreamId;
  workstreamDescription?: string;
  avatarColor: string; // Hex color for badge
  initials: string;
}

export type TaskPriority = 'alacsony' | 'kozepes' | 'magas' | 'kritikus';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  workstream: WorkstreamId;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  tags: string[];
  checklist: TaskChecklistItem[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export type ChapterStatus = 'tervezet' | 'felulvizsgalatra_var' | 'jovahagyva';

export interface ChapterFeedback {
  id: string;
  supervisorId: string;
  supervisorName: string;
  comment: string;
  createdAt: string;
  statusChange?: ChapterStatus;
}

export interface ThesisChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  targetWords: number;
  currentWords: number;
  status: ChapterStatus;
  leadResearcherId: string;
  leadResearcherName: string;
  version: string;
  lastModified: string;
  contentDraft: string;
  supervisorApprovedAt?: string;
  supervisorApprovedBy?: string;
  feedbackHistory: ChapterFeedback[];
}

export type FileCategory = 'thesis' | 'cad' | 'code' | 'data' | 'microscopy' | 'presentation';

export interface FileVersion {
  version: string;
  changelog: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  commitHash: string;
  fileSizeBytes: number;
  downloadUrl?: string;
}

export interface LabFile {
  id: string;
  name: string;
  category: FileCategory;
  workstream: WorkstreamId;
  description: string;
  extension: string;
  currentVersion: string;
  versions: FileVersion[];
  tags: string[];
}

export type PaperReadStatus = 'elolvasva' | 'olvasas_alatt' | 'feldolgozando';

export interface Paper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  bibtex: string;
  tags: string[];
  readStatus: PaperReadStatus;
  addedById: string;
  addedByName: string;
  addedAt: string;
  summary: string;
  upvotes: string[]; // user IDs who upvoted
}

export type VoteChoice = 'available' | 'if_needed' | 'unavailable';

export interface ConsultationSlot {
  id: string;
  dateTime: string;
  durationMinutes: number;
  votes: Record<string, VoteChoice>; // userId -> choice
}

export interface ConsultationPoll {
  id: string;
  title: string;
  description: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  deadline: string;
  status: 'open' | 'confirmed' | 'cancelled';
  slots: ConsultationSlot[];
  confirmedSlotId?: string;
  meetingLink?: string;
  agenda: string[];
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  actionType: 'task' | 'thesis' | 'file' | 'literature' | 'consultation' | 'approval';
  description: string;
  targetTitle: string;
}
