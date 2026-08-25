export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';
export type QuestionStatus = 'approved' | 'pending' | 'rejected';
export type BranchType = 'CS' | 'ECE' | 'EE' | 'ME' | 'CE' | 'IN' | 'GA';

export interface Question {
  id: string;
  title?: string;
  questionText: string;
  type: QuestionType;
  options?: string[]; // For MCQ/MSQ
  correctAnswers: string[]; // For MCQ e.g. ["A"], MSQ e.g. ["A", "C"], NAT e.g. ["25"]
  natMin?: number; // For NAT range
  natMax?: number; // For NAT range
  subject: string;
  topic: string;
  branch: BranchType;
  year?: number; // e.g. 2024 for PYQ
  mark: 1 | 2;
  explanation: string;
  createdByUid?: string;
  createdByName?: string;
  isCommunity?: boolean;
  status?: QuestionStatus;
  createdAt: string;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswers: string[]; // Array of selected option keys e.g. ["A"] or NAT input value e.g. ["4.5"]
  isMarkedForReview: boolean;
  isVisited: boolean;
  timeSpentSeconds: number;
}

export interface TestAttempt {
  id: string;
  userId: string;
  userName?: string;
  testTitle: string;
  subject: string;
  topic?: string;
  type: 'Full Mock' | 'Subject Test' | 'Topic Test' | 'PYQ Set';
  score: number;
  maxScore: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  timeTakenSeconds: number;
  branch: BranchType;
  answers: Record<string, UserAnswer>; // Map of questionId -> UserAnswer
  questionIds: string[];
  attemptedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  branch: BranchType;
  targetYear: number;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorUid: string;
  authorName: string;
  authorPhoto?: string;
  subject: string;
  branch: BranchType;
  questionId?: string;
  upvotesCount: number;
  upvotedBy: string[]; // array of UIDs
  commentsCount: number;
  createdAt: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  content: string;
  authorUid: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  questionId: string;
  createdAt: string;
}

export interface TestConfig {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic?: string;
  branch: BranchType;
  type: 'Full Mock' | 'Subject Test' | 'Topic Test' | 'PYQ Set';
  durationMinutes: number;
  questionIds: string[];
  totalMarks: number;
}

export interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalStudyDays: number;
  totalStudyTimeMinutes: number;
  activeDatesMap: Record<string, boolean>; // e.g. { "2026-08-07": true }
  updatedAt: string;
}

export interface StudyLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  minutesStudied: number;
  questionsSolved: number;
  testsTaken: number;
  activityTypes: string[];
  note?: string;
  timestamp: string;
}

export interface UserPlannerData {
  userId: string;
  gateTargets?: any;
  topicStatuses?: Record<string, string>;
  monthlyGoals?: any[];
  timetable?: any[];
  todayLoggedHours?: number;
  updatedAt?: string;
}
