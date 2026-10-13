/**
 * HexaStudy — Core Domain Types and Schemas
 * Local-First Academic Proficiency Assessor & CSE Workstation
 */

export type DimensionKey =
  | 'coverage'
  | 'understanding'
  | 'problemSolving'
  | 'practical'
  | 'examReadiness';

export interface DimensionMeta {
  key: DimensionKey;
  code: 'A' | 'B' | 'C' | 'D' | 'E';
  label: string;
  shortLabel: string;
  description: string;
  evaluationPrompt: string;
  anchor0: string;
  anchor5: string;
}

export const DIMENSIONS: Record<DimensionKey, DimensionMeta> = {
  coverage: {
    key: 'coverage',
    code: 'A',
    label: 'Syllabus Coverage',
    shortLabel: 'Coverage',
    description: 'Chapters completed, untouched units, and revision cycles.',
    evaluationPrompt: 'How thoroughly have you read through the assigned curriculum and lectures?',
    anchor0: '0% covered or completely untouched',
    anchor5: '100% completed with at least 1 revision cycle',
  },
  understanding: {
    key: 'understanding',
    code: 'B',
    label: 'Conceptual Understanding',
    shortLabel: 'Concepts',
    description: 'Ability to explain principles, derive algorithms, and connect concepts without notes.',
    evaluationPrompt: 'Can you clearly explain why algorithms work and explain principles without notes?',
    anchor0: 'Pure rote learning with no conceptual intuition',
    anchor5: 'Deep intuition; can derive proofs & explain to others',
  },
  problemSolving: {
    key: 'problemSolving',
    code: 'C',
    label: 'Problem-Solving Ability',
    shortLabel: 'Problems',
    description: 'Solving standard vs. novel/unfamiliar problems independently without hints.',
    evaluationPrompt: 'Can you solve unexpected exam problems or edge cases without consulting hints?',
    anchor0: 'Unable to solve basic textbook examples',
    anchor5: 'Easily tackle unseen, modified, or tricky problems',
  },
  practical: {
    key: 'practical',
    code: 'D',
    label: 'Practical Application',
    shortLabel: 'Practical',
    description: 'Code implementation, lab experiments, simulation, and real-world project usage.',
    evaluationPrompt: 'Can you write the code, execute the lab experiments, or apply this in a project?',
    anchor0: 'Zero hands-on coding or lab execution ability',
    anchor5: 'Production-ready code or flawless lab execution',
  },
  examReadiness: {
    key: 'examReadiness',
    code: 'E',
    label: 'Exam & Viva Readiness',
    shortLabel: 'Readiness',
    description: 'Timed paper solving, Previous Year Questions (PYQs), formula recall under pressure.',
    evaluationPrompt: 'How prepared are you for a timed written exam or immediate professor viva?',
    anchor0: 'Certain failure under exam conditions',
    anchor5: 'Confident in scoring grade A/A+ under timed pressure',
  },
};

export interface Chapter {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
  weightage?: 'High' | 'Medium' | 'Low';
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  examDate?: string;
  targetGrade?: string;
  chapters: Chapter[];
  isPreloaded?: boolean;
}

export interface SubjectAssessmentInput {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  ratings: Record<DimensionKey, number | null>; // null = Not Assessed
  qualitativeNotes: Record<DimensionKey, string>;
  inconsistentNotes?: string;
}

export interface ComputedSubjectScore {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  score: number; // 0.0 to 5.0
  percentage: number; // 0 to 100
  evaluatedDimensionsCount: number;
  unassessedDimensionsCount: number;
  ratings: Record<DimensionKey, number | null>;
  notes: Record<DimensionKey, string>;
  coverageVsUnderstandingGap: number; // coverage - understanding
  understandingVsReadinessGap: number; // understanding - examReadiness
}

export interface GapAnalysis {
  overallMean: number;
  lowestSubject: { id: string; name: string; score: number };
  highestSubject: { id: string; name: string; score: number };
  lowestDimension: { key: DimensionKey; label: string; score: number };
  highestDimension: { key: DimensionKey; label: string; score: number };
  coverageOverestimationCount: number;
  examPanicSubjects: string[];
  immediateTriageSubjects: string[];
}

export interface DayPlan {
  dayNumber: number;
  dayTitle: string;
  focusSubjectName: string;
  targetDimension: DimensionKey;
  recommendedHours: number;
  actionItems: string[];
}

export interface AssessmentSnapshot {
  id: string;
  timestamp: string;
  title: string;
  isDemo?: boolean;
  subjects: ComputedSubjectScore[];
  dimensionMeans: Record<DimensionKey, number>;
  overallMean: number;
  gapAnalysis: GapAnalysis;
  sevenDayActionPlan: DayPlan[];
  aiCommentaryId?: string;
}

/** CSE Major Specialization Suite Types */
export type DsaCategory =
  | 'Arrays & Hashing'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Stack & Queue'
  | 'Binary Search'
  | 'Linked Lists'
  | 'Trees & BST'
  | 'Heaps & Priority Queues'
  | 'Backtracking'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Bit Manipulation';

export interface DsaTopic {
  id: string;
  category: DsaCategory;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'untouched' | 'revising' | 'mastered';
  solvedCount: number;
  platform: 'LeetCode' | 'GFG' | 'HackerRank' | 'CodeStudio';
  keyNotes?: string;
}

export type CoreCsSubject = 'OS' | 'DBMS' | 'CN' | 'COA' | 'Compiler' | 'SoftwareEng';

export interface CoreCsConcept {
  id: string;
  subject: CoreCsSubject;
  subjectTitle: string;
  topic: string;
  keyPoints: string[];
  readiness: number; // 0 to 5
  vivaFrequent: boolean;
  lastReviewed?: string;
}

export interface LabPractical {
  id: string;
  subjectCode: string;
  subjectName: string;
  experimentNo: number;
  title: string;
  language: 'C' | 'Python' | 'C++' | 'Java' | 'Verilog' | 'SQL';
  codeStatus: 'not_started' | 'written' | 'compiled' | 'verified';
  vivaPrepared: boolean;
  gitRepoLink?: string;
  notes?: string;
}

export interface VivaQuestion {
  id: string;
  subjectCode: string;
  subjectName: string;
  question: string;
  answer: string;
  keyKeywords: string[];
  userConfidence: 'unreviewed' | 'shaky' | 'confident';
}

/** Document Vault & Study Material Repository */
export type DocumentCategory =
  | 'lecture_notes'
  | 'pyq'
  | 'lab_manual'
  | 'syllabus'
  | 'cheat_sheet'
  | 'handwritten';

export interface VaultDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number; // bytes
  fileType: string; // e.g. application/pdf
  subjectId?: string;
  subjectName?: string;
  topicTag: string;
  category: DocumentCategory;
  dataUrl?: string; // Stored in IndexedDB for offline quick viewing
  backupToDrive: boolean; // Per-file toggle for selective cloud backup
  driveSyncStatus: 'local' | 'queued' | 'synced' | 'failed';
  driveFileId?: string;
  driveSyncedAt?: string;
  uploadedAt: string;
  notes?: string;
}

/** Optional AI Plug-in Types */
export interface AINarrative {
  id: string;
  assessmentId: string;
  provider: 'gemini' | 'ollama' | 'none';
  model: string;
  narrativeText: string;
  strengths: string[];
  criticalRisks: string[];
  examStrategy: string[];
  searchSources?: { title: string; url: string }[];
  ttsAudioBase64?: string;
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  thinking?: string;
  sources?: { title: string; url: string }[];
}

/** Global Application Settings */
export interface AppSettings {
  theme: 'dark' | 'light';
  micaEnabled: boolean;
  aiEnabled: boolean;
  aiProvider: 'gemini' | 'ollama' | 'none';
  geminiModel: string;
  ollamaEndpoint: string;
  ollamaModel: string;
  googleWorkspaceEnabled: boolean;
  googleDriveFolder: string;
  autoSyncDrive: boolean;
  highThinkingMode: boolean;
}
