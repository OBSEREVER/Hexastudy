/**
 * HexaStudy — Local-First Storage & Seeding Engine
 * 100% Offline, Deterministic Persistence with JSON Backup/Restore
 */

import {
  AppSettings,
  AssessmentSnapshot,
  CoreCsConcept,
  DsaTopic,
  LabPractical,
  Subject,
  VaultDocument,
  VivaQuestion,
} from '../types';
import { compileAssessmentSnapshot } from './scoringEngine';

// Default Demo CSE Subjects (per specification)
export const DEFAULT_CSE_SUBJECTS: Subject[] = [
  {
    id: 'sub_maths4',
    name: 'Maths 4 (Applied Mathematics)',
    code: 'KAS-402',
    semester: 4,
    examDate: '2026-11-15',
    targetGrade: 'A',
    isPreloaded: true,
    chapters: [
      { id: 'm4_c1', title: 'Partial Differential Equations', completed: true, weightage: 'High' },
      { id: 'm4_c2', title: 'Fourier Series & Transform', completed: true, weightage: 'High' },
      { id: 'm4_c3', title: 'Statistical Techniques & Moments', completed: false, weightage: 'Medium' },
      { id: 'm4_c4', title: 'Probability Distributions', completed: false, weightage: 'High' },
      { id: 'm4_c5', title: 'Hypothesis Testing & Chi-Square', completed: false, weightage: 'Medium' },
    ],
  },
  {
    id: 'sub_dstl',
    name: 'Discrete Structures & Theory of Logic (DS-TL)',
    code: 'KCS-403',
    semester: 4,
    examDate: '2026-11-18',
    targetGrade: 'A+',
    isPreloaded: true,
    chapters: [
      { id: 'ds_c1', title: 'Set Theory, Relations & Posets', completed: true, weightage: 'High' },
      { id: 'ds_c2', title: 'Algebraic Structures & Groups', completed: true, weightage: 'Medium' },
      { id: 'ds_c3', title: 'Propositional & Predicate Logic', completed: true, weightage: 'High' },
      { id: 'ds_c4', title: 'Lattices & Boolean Algebra', completed: false, weightage: 'Medium' },
      { id: 'ds_c5', title: 'Combinatorics & Recurrence Relations', completed: false, weightage: 'High' },
    ],
  },
  {
    id: 'sub_coa',
    name: 'Computer Organization & Architecture (COA)',
    code: 'KCS-401',
    semester: 4,
    examDate: '2026-11-21',
    targetGrade: 'A',
    isPreloaded: true,
    chapters: [
      { id: 'coa_c1', title: 'Functional Units & Bus Architecture', completed: true, weightage: 'Medium' },
      { id: 'coa_c2', title: 'Arithmetic Logic Unit & Booths Algorithm', completed: true, weightage: 'High' },
      { id: 'coa_c3', title: 'Control Unit: Hardwired vs Microprogrammed', completed: false, weightage: 'High' },
      { id: 'coa_c4', title: 'Memory Hierarchy & Cache Mapping', completed: true, weightage: 'High' },
      { id: 'coa_c5', title: 'Pipelining & Hazards', completed: false, weightage: 'High' },
    ],
  },
  {
    id: 'sub_uhv',
    name: 'Universal Human Values (UHV)',
    code: 'KVE-401',
    semester: 4,
    examDate: '2026-11-24',
    targetGrade: 'A',
    isPreloaded: true,
    chapters: [
      { id: 'uhv_c1', title: 'Course Introduction & Need for Value Education', completed: true, weightage: 'Medium' },
      { id: 'uhv_c2', title: 'Harmony in the Human Being (Self & Body)', completed: true, weightage: 'High' },
      { id: 'uhv_c3', title: 'Harmony in Family & Society (Trust & Respect)', completed: true, weightage: 'High' },
      { id: 'uhv_c4', title: 'Harmony in Nature & Existence', completed: true, weightage: 'Medium' },
      { id: 'uhv_c5', title: 'Professional Ethics in Practice', completed: false, weightage: 'Medium' },
    ],
  },
  {
    id: 'sub_python',
    name: 'Python Programming',
    code: 'KCS-452',
    semester: 4,
    examDate: '2026-11-27',
    targetGrade: 'A+',
    isPreloaded: true,
    chapters: [
      { id: 'py_c1', title: 'Python Syntax, Data Types & Control Flow', completed: true, weightage: 'Medium' },
      { id: 'py_c2', title: 'Functions, Scopes & Modules', completed: true, weightage: 'Medium' },
      { id: 'py_c3', title: 'Strings, Lists, Tuples, Dictionaries & Sets', completed: true, weightage: 'High' },
      { id: 'py_c4', title: 'File Handling & Exception Handling', completed: true, weightage: 'High' },
      { id: 'py_c5', title: 'NumPy, Pandas & Matplotlib Basics', completed: false, weightage: 'High' },
    ],
  },
  {
    id: 'sub_c_ds',
    name: 'Data Structure in C Programming',
    code: 'KCS-402',
    semester: 4,
    examDate: '2026-11-30',
    targetGrade: 'A+',
    isPreloaded: true,
    chapters: [
      { id: 'cds_c1', title: 'Arrays, Sparse Matrices & Dynamic Memory', completed: true, weightage: 'High' },
      { id: 'cds_c2', title: 'Singly, Doubly & Circular Linked Lists', completed: true, weightage: 'High' },
      { id: 'cds_c3', title: 'Stacks, Infix-to-Postfix & Recursion', completed: true, weightage: 'High' },
      { id: 'cds_c4', title: 'Queues, Deques & Circular Queues', completed: true, weightage: 'Medium' },
      { id: 'cds_c5', title: 'Binary Trees, BST, AVL Trees & Graph Traversal', completed: false, weightage: 'High' },
    ],
  },
];

// Seeded Sample Demo Assessment
export function createSampleDemoAssessment(): AssessmentSnapshot {
  return compileAssessmentSnapshot(
    'Mid-Semester Diagnostic Review (Sample Demo)',
    [
      {
        subjectId: 'sub_maths4',
        subjectName: 'Maths 4 (Applied Mathematics)',
        subjectCode: 'KAS-402',
        ratings: { coverage: 3.5, understanding: 3.0, problemSolving: 2.5, practical: 2.0, examReadiness: 2.0 },
        qualitativeNotes: {
          coverage: 'Completed Unit 1 and 2, halfway through Probability.',
          understanding: 'Need better intuition on Fourier transforms.',
          problemSolving: 'Can solve standard questions, but stuck on tricky transforms.',
          practical: 'Minimal practical usage; mostly theoretical.',
          examReadiness: 'Have not attempted timed 3-hour PYQs yet.',
        },
      },
      {
        subjectId: 'sub_dstl',
        subjectName: 'Discrete Structures & Theory of Logic (DS-TL)',
        subjectCode: 'KCS-403',
        ratings: { coverage: 4.0, understanding: 4.0, problemSolving: 3.5, practical: 3.0, examReadiness: 3.5 },
        qualitativeNotes: {
          coverage: 'Units 1, 2, 3 finished completely.',
          understanding: 'Strong grasp of Posets, Hasse diagrams, and Logic proofs.',
          problemSolving: 'Comfortable with proof by contradiction.',
          practical: 'Useful logic foundations for coding.',
          examReadiness: 'Solved 2 recent mid-term question papers.',
        },
      },
      {
        subjectId: 'sub_coa',
        subjectName: 'Computer Organization & Architecture (COA)',
        subjectCode: 'KCS-401',
        ratings: { coverage: 3.0, understanding: 2.5, problemSolving: 2.0, practical: 2.5, examReadiness: 1.5 },
        qualitativeNotes: {
          coverage: 'Unit 1, 2 and cache memory finished.',
          understanding: 'Confused about Booths algorithm steps and pipeline hazards.',
          problemSolving: 'Difficult to calculate cache hit/miss numericals without formula sheet.',
          practical: 'Reviewed block diagrams.',
          examReadiness: 'High anxiety regarding 10-mark architecture questions.',
        },
      },
      {
        subjectId: 'sub_uhv',
        subjectName: 'Universal Human Values (UHV)',
        subjectCode: 'KVE-401',
        ratings: { coverage: 4.0, understanding: 4.5, problemSolving: 4.0, practical: 3.5, examReadiness: 4.0 },
        qualitativeNotes: {
          coverage: 'Read Units 1-4 textbook chapters thoroughly.',
          understanding: 'Can explain harmony in human beings and trust vs respect easily.',
          problemSolving: 'Case study analysis is clear.',
          practical: 'Self-reflection journals maintained.',
          examReadiness: 'Ready for long descriptive questions.',
        },
      },
      {
        subjectId: 'sub_python',
        subjectName: 'Python Programming',
        subjectCode: 'KCS-452',
        ratings: { coverage: 4.5, understanding: 4.5, problemSolving: 4.0, practical: 4.5, examReadiness: 4.0 },
        qualitativeNotes: {
          coverage: 'All syntax, data structures, and file ops covered.',
          understanding: 'Clear mental model of dictionaries, list comprehensions, and generators.',
          problemSolving: 'Solved all lab exercises.',
          practical: 'Implemented custom CLI utilities and scripts.',
          examReadiness: 'Confident in writing error-free code snippets on paper.',
        },
      },
      {
        subjectId: 'sub_c_ds',
        subjectName: 'Data Structure in C Programming',
        subjectCode: 'KCS-402',
        ratings: { coverage: 4.0, understanding: 4.0, problemSolving: 3.5, practical: 4.0, examReadiness: 3.0 },
        qualitativeNotes: {
          coverage: 'Stacks, Queues, Linked Lists, Trees covered.',
          understanding: 'Pointer arithmetic and tree traversals are solid.',
          problemSolving: 'Can write recursive algorithms comfortably.',
          practical: 'All C lab programs compiled and tested on GCC.',
          examReadiness: 'Need timed practice on AVL tree rotations and DFS/BFS graphs.',
        },
      },
    ],
    true
  );
}

// Seeded CSE Specialization Data
export const DEFAULT_DSA_TOPICS: DsaTopic[] = [
  { id: 'dsa_1', category: 'Arrays & Hashing', name: 'Two Sum & HashMap Lookups', difficulty: 'Easy', status: 'mastered', solvedCount: 12, platform: 'LeetCode' },
  { id: 'dsa_2', category: 'Arrays & Hashing', name: 'Kadanes Algorithm (Max Subarray)', difficulty: 'Medium', status: 'mastered', solvedCount: 8, platform: 'LeetCode' },
  { id: 'dsa_3', category: 'Two Pointers', name: '3Sum & Container With Most Water', difficulty: 'Medium', status: 'revising', solvedCount: 5, platform: 'LeetCode' },
  { id: 'dsa_4', category: 'Sliding Window', name: 'Longest Substring Without Repeating', difficulty: 'Medium', status: 'revising', solvedCount: 6, platform: 'LeetCode' },
  { id: 'dsa_5', category: 'Stack & Queue', name: 'Valid Parentheses & Min Stack', difficulty: 'Easy', status: 'mastered', solvedCount: 10, platform: 'LeetCode' },
  { id: 'dsa_6', category: 'Linked Lists', name: 'Reverse Linked List & Cycle Detection', difficulty: 'Medium', status: 'mastered', solvedCount: 7, platform: 'LeetCode' },
  { id: 'dsa_7', category: 'Trees & BST', name: 'Binary Tree Invert & Max Depth', difficulty: 'Easy', status: 'mastered', solvedCount: 15, platform: 'LeetCode' },
  { id: 'dsa_8', category: 'Trees & BST', name: 'Lowest Common Ancestor in BST', difficulty: 'Medium', status: 'revising', solvedCount: 4, platform: 'LeetCode' },
  { id: 'dsa_9', category: 'Graphs', name: 'Number of Islands (BFS/DFS)', difficulty: 'Medium', status: 'untouched', solvedCount: 2, platform: 'LeetCode' },
  { id: 'dsa_10', category: 'Dynamic Programming', name: 'Climbing Stairs & Coin Change', difficulty: 'Medium', status: 'revising', solvedCount: 6, platform: 'LeetCode' },
  { id: 'dsa_11', category: 'Dynamic Programming', name: '0/1 Knapsack & Longest Common Subseq', difficulty: 'Hard', status: 'untouched', solvedCount: 1, platform: 'GFG' },
  { id: 'dsa_12', category: 'Bit Manipulation', name: 'Single Number & Counting Bits', difficulty: 'Easy', status: 'mastered', solvedCount: 5, platform: 'LeetCode' },
];

export const DEFAULT_CORE_CS: CoreCsConcept[] = [
  { id: 'cs_1', subject: 'OS', subjectTitle: 'Operating Systems', topic: 'CPU Scheduling Algorithms (Round Robin, SRTF, FCFS)', keyPoints: ['Gantt chart drawing', 'Turnaround Time = Completion - Arrival', 'Waiting Time = TAT - Burst'], readiness: 4, vivaFrequent: true },
  { id: 'cs_2', subject: 'OS', subjectTitle: 'Operating Systems', topic: 'Deadlock: Necessary Conditions & Bankers Algorithm', keyPoints: ['Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait', 'Resource Allocation Graph', 'Safe sequence check'], readiness: 3.5, vivaFrequent: true },
  { id: 'cs_3', subject: 'OS', subjectTitle: 'Operating Systems', topic: 'Virtual Memory & Page Replacement (LRU, FIFO, Optimal)', keyPoints: ['Page fault calculation', 'Beladys Anomaly in FIFO', 'TLB hit/miss latency'], readiness: 3, vivaFrequent: true },
  { id: 'cs_4', subject: 'DBMS', subjectTitle: 'Database Systems', topic: 'Normalization (1NF, 2NF, 3NF, BCNF)', keyPoints: ['Partial dependency removal', 'Transitive dependency removal', 'Lossless decomposition check'], readiness: 4, vivaFrequent: true },
  { id: 'cs_5', subject: 'DBMS', subjectTitle: 'Database Systems', topic: 'ACID Properties & Transaction Schedules', keyPoints: ['Atomicity via WAL', 'Conflict Serializability with Precedence Graph', 'Strict 2-Phase Locking (2PL)'], readiness: 3.5, vivaFrequent: true },
  { id: 'cs_6', subject: 'CN', subjectTitle: 'Computer Networks', topic: 'OSI 7 Layers vs TCP/IP Protocol Stack', keyPoints: ['Physical, Data Link, Network, Transport, Session, Presentation, Application', 'PDU names: Bit, Frame, Packet, Segment'], readiness: 4, vivaFrequent: true },
  { id: 'cs_7', subject: 'CN', subjectTitle: 'Computer Networks', topic: 'TCP 3-Way Handshake & Flow Control', keyPoints: ['SYN, SYN-ACK, ACK sequence numbers', 'Sliding Window Protocol', 'Congestion Window & Slow Start'], readiness: 3, vivaFrequent: true },
  { id: 'cs_8', subject: 'COA', subjectTitle: 'Computer Organization', topic: 'Cache Memory Mapping (Direct, Associative, Set-Associative)', keyPoints: ['Tag, Index, Offset bit division', 'Hit ratio calculation', 'Write-through vs Write-back'], readiness: 2.5, vivaFrequent: true },
  { id: 'cs_9', subject: 'COA', subjectTitle: 'Computer Organization', topic: 'Pipelining Hazards (Structural, Data, Control)', keyPoints: ['Pipeline speedup formula = (k * n) / (k + n - 1)', 'Data forwarding bypassing', 'Branch prediction stalls'], readiness: 2.5, vivaFrequent: true },
];

export const DEFAULT_LAB_PRACTICALS: LabPractical[] = [
  { id: 'lab_1', subjectCode: 'KCS-452', subjectName: 'Python Programming Lab', experimentNo: 1, title: 'Implement Matrix Multiplication & Transpose using Nested Lists', language: 'Python', codeStatus: 'verified', vivaPrepared: true },
  { id: 'lab_2', subjectCode: 'KCS-452', subjectName: 'Python Programming Lab', experimentNo: 2, title: 'Word Frequency Counter with Text File Parsing & Dictionaries', language: 'Python', codeStatus: 'verified', vivaPrepared: true },
  { id: 'lab_3', subjectCode: 'KCS-452', subjectName: 'Python Programming Lab', experimentNo: 3, title: 'Data Cleaning & Summary Visualizations using Pandas & Matplotlib', language: 'Python', codeStatus: 'compiled', vivaPrepared: false },
  { id: 'lab_4', subjectCode: 'KCS-402', subjectName: 'Data Structures Lab', experimentNo: 1, title: 'Implementation of Stack ADT with Infix to Postfix Conversion in C', language: 'C', codeStatus: 'verified', vivaPrepared: true },
  { id: 'lab_5', subjectCode: 'KCS-402', subjectName: 'Data Structures Lab', experimentNo: 2, title: 'Circular Queue Implementation with Array & Dynamic Resizing', language: 'C', codeStatus: 'verified', vivaPrepared: true },
  { id: 'lab_6', subjectCode: 'KCS-402', subjectName: 'Data Structures Lab', experimentNo: 3, title: 'Binary Search Tree Operations: Insert, Delete, Search & Traversals in C', language: 'C', codeStatus: 'compiled', vivaPrepared: false },
];

export const DEFAULT_VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 'vq_1',
    subjectCode: 'KCS-402',
    subjectName: 'Data Structures in C',
    question: 'What is the worst-case time complexity of searching in a Binary Search Tree (BST), and how does an AVL tree prevent it?',
    answer: 'In an unskewed BST, search is O(log n), but in a degenerate/skewed BST (e.g., elements inserted in sorted order), the tree degenerates into a linked list giving O(n) worst-case. An AVL tree is a self-balancing BST that guarantees height balance factor |hL - hR| <= 1 using rotations, maintaining O(log n) worst-case time.',
    keyKeywords: ['Skewed BST', 'O(n) worst case', 'Balance Factor', 'Rotations', 'O(log n)'],
    userConfidence: 'confident',
  },
  {
    id: 'vq_2',
    subjectCode: 'KCS-401',
    subjectName: 'COA',
    question: 'Explain what a RAW (Read-After-Write) data hazard is in instruction pipelining and how operand forwarding mitigates it.',
    answer: 'A RAW hazard occurs when an instruction depends on the result of a previous instruction that has not yet completed its write-back stage (WB). Operand forwarding resolves this by routing the intermediate result directly from the execution (ALU) or memory stage back to the decode/execution stage of the dependent instruction without waiting for memory write-back.',
    keyKeywords: ['RAW Data Hazard', 'Dependency', 'Write-Back stage', 'Bypassing / Forwarding', 'ALU output to input'],
    userConfidence: 'shaky',
  },
  {
    id: 'vq_3',
    subjectCode: 'KCS-403',
    subjectName: 'DS-TL',
    question: 'What is a Hasse Diagram and what relations does a Poset satisfy?',
    answer: 'A Partially Ordered Set (Poset) satisfies Reflexivity, Anti-symmetry, and Transitivity. A Hasse diagram is a simplified graphical representation of a finite poset that omits self-loops (reflexivity) and transitive edges, displaying elements with lower elements drawn below higher ones.',
    keyKeywords: ['Poset', 'Reflexive', 'Anti-symmetric', 'Transitive', 'Hasse Diagram', 'Covering relation'],
    userConfidence: 'confident',
  },
  {
    id: 'vq_4',
    subjectCode: 'KCS-452',
    subjectName: 'Python Programming',
    question: 'What is the difference between shallow copy and deep copy in Python? When does it matter for mutable objects?',
    answer: 'A shallow copy (copy.copy()) constructs a new compound object and inserts references into it to the objects found in the original. A deep copy (copy.deepcopy()) recursively copies all nested objects. For mutable nested structures like lists of lists or dicts, modifying a child element in a shallow copy alters the original.',
    keyKeywords: ['copy.copy vs copy.deepcopy', 'Reference vs recursive duplicate', 'Nested mutable objects'],
    userConfidence: 'confident',
  },
];

// Seeded Sample Documents for the Document Vault
export const DEFAULT_VAULT_DOCS: VaultDocument[] = [
  {
    id: 'doc_1',
    title: 'COA Module 4 Cache Memory & Pipelining Comprehensive Notes',
    fileName: 'COA_Mod4_Cache_Pipelining_Notes.pdf',
    fileSize: 2450000,
    fileType: 'application/pdf',
    subjectId: 'sub_coa',
    subjectName: 'Computer Organization & Architecture (COA)',
    topicTag: 'Cache Mapping & Hazards',
    category: 'lecture_notes',
    backupToDrive: true,
    driveSyncStatus: 'synced',
    uploadedAt: '2026-10-01T10:15:00.000Z',
    notes: 'Hand-annotated derivation of direct and 4-way set associative cache index calculation.',
  },
  {
    id: 'doc_2',
    title: 'Data Structures in C Previous 5 Years Exam Question Papers (PYQs)',
    fileName: 'DS_C_Previous_5_Years_PYQs_Solved.pdf',
    fileSize: 4200000,
    fileType: 'application/pdf',
    subjectId: 'sub_c_ds',
    subjectName: 'Data Structure in C Programming',
    topicTag: 'Semester Exam PYQs',
    category: 'pyq',
    backupToDrive: true,
    driveSyncStatus: 'synced',
    uploadedAt: '2026-10-03T14:30:00.000Z',
    notes: 'Contains university questions from 2021 to 2025 with AVL rotations and recursion tracing.',
  },
  {
    id: 'doc_3',
    title: 'Python Programming Lab Manual with Verified Code Solutions',
    fileName: 'Python_Lab_Manual_Verified_2026.pdf',
    fileSize: 1850000,
    fileType: 'application/pdf',
    subjectId: 'sub_python',
    subjectName: 'Python Programming',
    topicTag: 'Lab Practical Exercises',
    category: 'lab_manual',
    backupToDrive: false,
    driveSyncStatus: 'local',
    uploadedAt: '2026-10-05T09:00:00.000Z',
    notes: 'All 10 lab experiments with sample input, outputs, and viva questions.',
  },
  {
    id: 'doc_4',
    title: 'DS-TL Propositional Logic & Hasse Diagrams Formula Cheat Sheet',
    fileName: 'DSTL_Logic_Hasse_Formulas_CheatSheet.pdf',
    fileSize: 950000,
    fileType: 'application/pdf',
    subjectId: 'sub_dstl',
    subjectName: 'Discrete Structures & Theory of Logic (DS-TL)',
    topicTag: 'Formula & Proof Cheat Sheet',
    category: 'cheat_sheet',
    backupToDrive: true,
    driveSyncStatus: 'queued',
    uploadedAt: '2026-10-08T16:45:00.000Z',
    notes: 'Two-page quick revision sheet for boolean lattices and generating functions.',
  },
];

// App Settings Defaults
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  micaEnabled: true,
  aiEnabled: false,
  aiProvider: 'none',
  geminiModel: 'gemini-3.5-flash',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3:8b',
  googleWorkspaceEnabled: false,
  googleDriveFolder: 'HexaStudy-Vault',
  autoSyncDrive: false,
  highThinkingMode: false,
};

// Storage Keys
const STORAGE_PREFIX = 'hexastudy_';
const KEYS = {
  SUBJECTS: `${STORAGE_PREFIX}subjects_v1`,
  ASSESSMENTS: `${STORAGE_PREFIX}assessments_v1`,
  DSA_TOPICS: `${STORAGE_PREFIX}dsa_topics_v1`,
  CORE_CS: `${STORAGE_PREFIX}core_cs_v1`,
  LABS: `${STORAGE_PREFIX}labs_v1`,
  VIVA: `${STORAGE_PREFIX}viva_v1`,
  DOCUMENTS: `${STORAGE_PREFIX}documents_v1`,
  SETTINGS: `${STORAGE_PREFIX}settings_v1`,
};

class HexaStore {
  // Subjects
  getSubjects(): Subject[] {
    try {
      const data = localStorage.getItem(KEYS.SUBJECTS);
      if (!data) {
        this.saveSubjects(DEFAULT_CSE_SUBJECTS);
        return DEFAULT_CSE_SUBJECTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CSE_SUBJECTS;
    }
  }

  saveSubjects(subjects: Subject[]): void {
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
  }

  // Assessments
  getAssessments(): AssessmentSnapshot[] {
    try {
      const data = localStorage.getItem(KEYS.ASSESSMENTS);
      if (!data) {
        const demo = createSampleDemoAssessment();
        this.saveAssessments([demo]);
        return [demo];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveAssessments(assessments: AssessmentSnapshot[]): void {
    localStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(assessments));
  }

  addAssessment(assessment: AssessmentSnapshot): void {
    const list = this.getAssessments();
    const updated = [assessment, ...list];
    this.saveAssessments(updated);
  }

  deleteAssessment(id: string): void {
    const list = this.getAssessments();
    this.saveAssessments(list.filter((a) => a.id !== id));
  }

  // DSA
  getDsaTopics(): DsaTopic[] {
    try {
      const data = localStorage.getItem(KEYS.DSA_TOPICS);
      if (!data) {
        this.saveDsaTopics(DEFAULT_DSA_TOPICS);
        return DEFAULT_DSA_TOPICS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_DSA_TOPICS;
    }
  }

  saveDsaTopics(topics: DsaTopic[]): void {
    localStorage.setItem(KEYS.DSA_TOPICS, JSON.stringify(topics));
  }

  // Core CS
  getCoreCs(): CoreCsConcept[] {
    try {
      const data = localStorage.getItem(KEYS.CORE_CS);
      if (!data) {
        this.saveCoreCs(DEFAULT_CORE_CS);
        return DEFAULT_CORE_CS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CORE_CS;
    }
  }

  saveCoreCs(concepts: CoreCsConcept[]): void {
    localStorage.setItem(KEYS.CORE_CS, JSON.stringify(concepts));
  }

  // Labs
  getLabs(): LabPractical[] {
    try {
      const data = localStorage.getItem(KEYS.LABS);
      if (!data) {
        this.saveLabs(DEFAULT_LAB_PRACTICALS);
        return DEFAULT_LAB_PRACTICALS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_LAB_PRACTICALS;
    }
  }

  saveLabs(labs: LabPractical[]): void {
    localStorage.setItem(KEYS.LABS, JSON.stringify(labs));
  }

  // Viva
  getVivaQuestions(): VivaQuestion[] {
    try {
      const data = localStorage.getItem(KEYS.VIVA);
      if (!data) {
        this.saveVivaQuestions(DEFAULT_VIVA_QUESTIONS);
        return DEFAULT_VIVA_QUESTIONS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_VIVA_QUESTIONS;
    }
  }

  saveVivaQuestions(viva: VivaQuestion[]): void {
    localStorage.setItem(KEYS.VIVA, JSON.stringify(viva));
  }

  // Documents
  getDocuments(): VaultDocument[] {
    try {
      const data = localStorage.getItem(KEYS.DOCUMENTS);
      if (!data) {
        this.saveDocuments(DEFAULT_VAULT_DOCS);
        return DEFAULT_VAULT_DOCS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_VAULT_DOCS;
    }
  }

  saveDocuments(docs: VaultDocument[]): void {
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(docs));
  }

  addDocument(doc: VaultDocument): void {
    const current = this.getDocuments();
    this.saveDocuments([doc, ...current]);
  }

  deleteDocument(id: string): void {
    const current = this.getDocuments();
    this.saveDocuments(current.filter((d) => d.id !== id));
  }

  toggleDocumentBackup(id: string): VaultDocument | undefined {
    const docs = this.getDocuments();
    const doc = docs.find((d) => d.id === id);
    if (doc) {
      doc.backupToDrive = !doc.backupToDrive;
      doc.driveSyncStatus = doc.backupToDrive ? 'queued' : 'local';
      this.saveDocuments(docs);
      return doc;
    }
    return undefined;
  }

  // Settings
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Full Backup & Restore
  exportFullBackup(): string {
    const backup = {
      exportVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      app: 'HexaStudy Windows 11 Workstation',
      subjects: this.getSubjects(),
      assessments: this.getAssessments(),
      dsaTopics: this.getDsaTopics(),
      coreCs: this.getCoreCs(),
      labs: this.getLabs(),
      viva: this.getVivaQuestions(),
      documents: this.getDocuments().map((d) => ({
        ...d,
        // If dataUrl is large, we still export it so backup is self-contained
      })),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  }

  importFullBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.subjects || !Array.isArray(data.subjects)) {
        return { success: false, message: 'Invalid backup file: missing subjects array.' };
      }
      if (data.subjects) this.saveSubjects(data.subjects);
      if (data.assessments) this.saveAssessments(data.assessments);
      if (data.dsaTopics) this.saveDsaTopics(data.dsaTopics);
      if (data.coreCs) this.saveCoreCs(data.coreCs);
      if (data.labs) this.saveLabs(data.labs);
      if (data.viva) this.saveVivaQuestions(data.viva);
      if (data.documents) this.saveDocuments(data.documents);
      if (data.settings) this.saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      return { success: true, message: 'HexaStudy state restored successfully!' };
    } catch (err: any) {
      return { success: false, message: `Backup restoration failed: ${err.message}` };
    }
  }

  resetToDefaultDemo(): void {
    localStorage.removeItem(KEYS.SUBJECTS);
    localStorage.removeItem(KEYS.ASSESSMENTS);
    localStorage.removeItem(KEYS.DSA_TOPICS);
    localStorage.removeItem(KEYS.CORE_CS);
    localStorage.removeItem(KEYS.LABS);
    localStorage.removeItem(KEYS.VIVA);
    localStorage.removeItem(KEYS.DOCUMENTS);
    localStorage.removeItem(KEYS.SETTINGS);
  }
}

export const hexaStore = new HexaStore();
