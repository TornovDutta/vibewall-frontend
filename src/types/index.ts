// ─── Auth ────────────────────────────────────────────────────────────────────
export interface UsersRequested {
  name: string;
  password: string;
}

export interface UsersResponse {
  id: string;
  name: string;
}

export interface TokenRequested {
  token: string;
}

export interface TokenResponse {
  jwt: string;
  refresh: string;
}

// ─── JWT payload (decoded from token) ────────────────────────────────────────
export interface JWTPayload {
  sub: string;        // fallback identifier
  name?: string;      // user's chosen name (preferred)
  username?: string;  // alternate name claim
  id: string;         // userId
  role: string;       // USER | ADMIN
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  username: string;
  role: 'USER' | 'ADMIN';
}

// ─── Confessions ─────────────────────────────────────────────────────────────
export interface ConfessionRequested {
  content: string;
}

export interface FeedbackItem {
  id: number;
  content: string;
  date?: string;
  status?: string;
}

export interface ConfessionResponse {
  id: string;
  content: string;
  feedbacks: FeedbackItem[];
}

// ─── Feedback ────────────────────────────────────────────────────────────────
export interface FeedbackRequested {
  content: string;
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export interface ReportRequested {
  content: string;
}

export interface ReportResponse {
  id: string;
  reportContent: string;
  status: string;
  dateTime?: string;
}

// ─── Error ───────────────────────────────────────────────────────────────────
export interface ApiError {
  dateTime?: string;
  msg?: string;
  details?: string;
  message?: string;
}

// ─── Local storage tracking (for ownership) ──────────────────────────────────
export interface OwnedConfession {
  id: string;
  content: string;
  createdAt: string;
}

export interface OwnedFeedback {
  confessionId: string;
  feedbackId: number;
}

export interface OwnedReport {
  id: string;
  content: string;
  createdAt: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface NotificationResponse {
  id: string;
  userId: string;
  confessionId?: string;
  type: 'REACTION' | 'COMMENT' | 'POST_CREATED' | 'SYSTEM' | string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── Polls ────────────────────────────────────────────────────────────────────
export interface PollOptionItem {
  id: number;
  text: string;
  voteCount: number;
  percentage: number;
}

export interface PollResponse {
  id: string;
  question: string;
  category: string;
  userId: string;
  options: PollOptionItem[];
  totalVotes: number;
  userVotedOptionId?: number | null;
  active: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
  category?: string;
}

export interface VoteRequest {
  optionId: number;
}
