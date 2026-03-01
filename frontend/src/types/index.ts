export type Priority = "low" | "medium" | "high";

export interface Outcome {
  _id: string;
  type: "note" | "link" | "file";
  title: string;
  content: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  category: string;
  tags: string[];
  notes: string;
  pinned: boolean;
  order: number;
  userId: string;
  outcomes: Outcome[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  createdAt?: string;
}

export interface Stats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  byPriority: { _id: Priority; count: number }[];
  byCategory: { _id: string; count: number }[];
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

export type TaskFilter = "all" | "active" | "completed" | "today" | "overdue";
export type SortBy = "createdAt" | "dueDate" | "priority" | "title";

// ── Groups ──────────────────────────────────────────────────────────────────
export type MemberRole = "owner" | "admin" | "member";

export interface GroupMember {
  userId: User;
  role: MemberRole;
  joinedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  avatar?: string;
  owner: User;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupInvite {
  _id: string;
  groupId: { _id: string; name: string; description: string };
  invitedBy: User;
  inviteeEmail: string;
  status: "pending" | "accepted" | "rejected";
  expiresAt: string;
  createdAt: string;
}

export type AssignmentStatus = "pending" | "accepted" | "rejected" | "done";
export type GroupTaskStatus = "open" | "in_progress" | "done" | "cancelled";

export interface Assignment {
  memberId: User;
  status: AssignmentStatus;
  note: string;
  respondedAt: string | null;
}

export interface GroupTask {
  _id: string;
  groupId: string;
  title: string;
  description: string;
  createdBy: User;
  priority: Priority;
  status: GroupTaskStatus;
  dueDate: string | null;
  assignments: Assignment[];
  outcomes: Outcome[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
