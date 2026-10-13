# HexaStudy — Windows 11 Academic Proficiency Assessor & CSE Suite

HexaStudy is a local-first academic proficiency assessor, study planning workstation, and study material repository designed for Windows 11. It combines deterministic hexagonal radar analysis, automated academic action plans, a dedicated Computer Science & Engineering (CSE) study suite, and a topic-tagged document vault with selective cloud backup.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions and new feature requests have been incorporated into this revised plan:

- **Confirmed Decision 1: Topic-Tagged Study Material Repository & PDF Vault**: A dedicated document repository where students can attach, name, and categorize PDFs, lecture slides, syllabus documents, and cheat sheets directly to subjects or topics. Includes in-app preview/open and an individual toggle per file for selective Google Drive cloud backup.
- **Confirmed Decision 2: Comprehensive CSE Major Suite**: Dedicated modules for Data Structures & Algorithms (DSA), Core CS theory (Operating Systems, DBMS, Computer Networks, System Design), lab practical checklists, viva voce oral exam banks, and GATE/placement tracking.
- **Confirmed Decision 3: Scalable Modular Architecture**: A decoupled, layered architecture (UI Shell → Domain Feature Modules → Unified Storage Adapter → Plug-in Registry) ensuring new subjects, exam formats, and cloud integrations can be added in future iterations without refactoring the core.
- **Confirmed Decision 4: Strict Core vs. Cloud/AI Isolation**: Core assessor, calculations, and local document vault function 100% offline with zero dependencies. Cloud Drive backup and Gemini AI intelligence remain modular plug-ins that can be toggled on/off at will.

---

## 1. Exhaustive Feature Catalogue

Here is the complete breakdown of all planned features for review and discussion:

### Category A: Core Academic Proficiency Assessor (100% Offline, Deterministic)
1. **Dynamic Subject & Syllabus Management**:
   - Add, edit, reorder, and archive subjects (supports 6+ subjects dynamically).
   - Preloaded CSE 4th-semester syllabus defaults (Maths 4, DS-TL, COA, UHV, Python, C Data Structures).
   - Syllabus chapter breakdown with completion checkmarks and weightage tags.
   - JSON/CSV export and import of subject catalogues.
2. **5-Dimension Diagnostic Interview Wizard**:
   - Structured step-by-step interview across 5 dimensions:
     - *Dimension A: Syllabus Coverage* (chapters completed vs. untouched, revision cycles).
     - *Dimension B: Conceptual Understanding* (explaining principles, deriving algorithms without notes).
     - *Dimension C: Problem-Solving* (standard vs. unseen problem readiness, reliance on hints).
     - *Dimension D: Practical Application* (code implementations, lab experiments, practical projects).
     - *Dimension E: Exam Readiness* (previous-year questions, timed conditions, recall confidence).
   - Fractional ratings (0.0 to 5.0 in 0.5 increments) with clear verbal anchor definitions.
   - Distinct "Not Assessed" handling (never treated as 0).
   - Quick Mode (rapid 5-minute rating) vs. Detailed Mode (guided qualitative notes and follow-ups).
   - Pause, resume, back navigation, and in-flight draft auto-saving.
3. **Deterministic Hexagonal Scoring & Gap Analysis**:
   - Exact mathematical subject scoring: `mean(valid dimensions)`.
   - Identification of critical cognitive gaps: *Coverage vs. Understanding gap* and *Mastery vs. Exam Readiness gap*.
   - Academic health index (overall mean, strongest subject, most vulnerable subject).
4. **Interactive Hexagonal Radar Visualization & Analytics**:
   - Recharts-powered responsive 6-axis polygon with score vertices and target threshold rings.
   - Dynamic adaptation if the user configures fewer or more than 6 subjects.
   - Dimensional comparative bar charts and subject-by-dimension heatmaps.
   - One-click chart export to PNG and raw metrics export to CSV/JSON.
5. **Deterministic 7-Day Academic Action Plan**:
   - Rule-based study plan generated strictly from mathematical gaps (no hallucinations).
   - Prioritized subject triage (Urgent Focus, Moderate Reinforcement, Maintenance).
   - Daily actionable study blocks targeting identified weak dimensions.
6. **Assessment History & Longitudinal Comparison**:
   - Immutable historical assessment snapshots with timestamping.
   - Head-to-head comparison between two assessment sessions (delta tracking, progress vs. regression).

### Category B: Computer Science & Engineering (CSE) Specialization Suite
1. **DSA & Algorithmic Concept Matrix**:
   - Structured topic roadmap (Arrays, Linked Lists, Trees, Graphs, DP, Recursion, Bit Manipulation).
   - Mastery status tracking (`Untouched`, `Practicing`, `Mastered`) with problem count logs (LeetCode / GFG).
2. **Core CS Theory Knowledge Trees**:
   - Topic checklists for Operating Systems (Process Scheduling, Deadlocks, Memory Management).
   - Database Management Systems (SQL, Normalization, ACID Transactions, Indexing).
   - Computer Networks (OSI Layers, TCP/UDP, Subnetting, Routing Protocols).
   - Computer Architecture & Organization (Pipelining, Cache Memory, Instruction Sets).
3. **Lab Practicals & Viva Voce Exam Bank**:
   - Digital lab journal tracker: list of practical assignments, compilation status, and output verification.
   - Interactive Viva Voce flashcard mode: frequent examiner questions with model answers and self-rating.
4. **Placement & GATE Revision Checklists**:
   - High-yield syllabus weighting tags for competitive and campus placement tests.

### Category C: Study Material Repository & PDF Document Vault
1. **Subject & Topic-Tagged Document Vault**:
   - Store and organize PDFs, lecture notes, question banks, syllabus copies, and cheat sheets.
   - Direct tagging by subject, semester, and topic (e.g., `COA / Module 3 / Cache Memory Notes.pdf`).
   - Custom naming and description for instant searchability.
2. **In-App Quick Viewer & One-Click Launch**:
   - Built-in PDF reader modal to study directly inside HexaStudy without context switching.
   - Quick-launch button to view full-screen or open externally.
3. **Local-First Offline Storage**:
   - Stored locally in the browser's persistent IndexedDB/File Storage so documents remain accessible offline.
4. **Selective Cloud Backup Toggle**:
   - Per-file backup toggle: `[Backup to Google Drive: ON/OFF]`.
   - Clear sync status tags (`Stored Locally`, `Queued for Sync`, `Synced to Google Drive`).
   - Manual "Sync Enabled Files" trigger and automatic background sync when online.

### Category D: Windows 11 Desktop Experience & Shell
1. **Windows 11 Fluent UI Design**:
   - Dark Mica backdrop feel (`#202020` / `#181818`), subtle acrylic translucent card surfaces, and hairline borders.
   - Native-feeling Windows 11 Title Bar with icon, app name, and window control buttons (Minimize, Maximize, Close).
   - Smooth transitions and desktop-proportioned typography using `Plus Jakarta Sans` and `JetBrains Mono`.
2. **Desktop Productivity Controls**:
   - Keyboard navigation shortcuts (e.g., `Ctrl+N` for New Assessment, `Ctrl+F` to search docs).
   - Backup/Restore manager with one-click JSON database dump and import for Windows file storage.

### Category E: Modular Plug-Ins (Opt-In Only, Off by Default)
1. **Gemini Intelligence Plug-In**:
   - *On-Demand Narrative Commentary*: Detailed academic diagnosis generated only when clicking "Generate AI Commentary" on a saved assessment.
   - *Search Grounding*: Real-time retrieval of latest university syllabus updates or exam patterns via `gemini-3.5-flash` with Google Search.
   - *Text-to-Speech (TTS)*: Audio recitation of your 7-day action plan using `gemini-3.8-flash-tts` for hands-free audio review.
   - *CSE Study Companion Chatbot*: Contextual multi-turn tutor with high-thinking mode (`gemini-3.1-pro-preview` with `ThinkingLevel.HIGH`) for complex algorithmic debugging.
2. **Google Workspace Integration**:
   - *Google Drive*: Syncs files selected in the Document Vault to a dedicated `HexaStudy` folder in Drive.
   - *Google Calendar*: Exports the 7-day revision plan directly as study events in Google Calendar.
   - *Gmail*: Generates a structured email study summary to share with study groups or mentors.

---

## 2. Technical Architecture & Scalability Strategy

To guarantee the project is scalable and easy to extend in future iterations, we use a clean layered architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Windows 11 Fluent Desktop Shell                      │
│      [Title Bar · Search Bar · Tabbed Navigation · Window Actions]     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    │                                                               │
┌───▼──────────────────────────┐        ┌───────────────────────────▼───┐
│       CORE ENGINE (Local)    │        │      OPTIONAL PLUG-INS        │
│  - Subject Manager           │        │                               │
│  - 5-Dimension Assessor      │        │ ┌───────────────────────────┐ │
│  - Hexagonal Radar Analytics │        │ │ Gemini Intelligence Suite │ │
│  - Deterministic Action Plan │◄───────┤ │ - Commentary / TTS / Chat │ │
│  - CSE Specialization Hub    │Snapshot│ └───────────────────────────┘ │
│  - Document Vault & Viewer   │ (Read) │ ┌───────────────────────────┐ │
│  - Local Backup & Export     │        │ │ Google Workspace Hub      │ │
└──────────────┬───────────────┘        │ │ - Drive Sync / Calendar   │ │
               │                        │ └───────────────────────────┘ │
┌──────────────▼───────────────┐        └───────────────────────────────┘
│   HexaStore Persistence API  │
│  (IndexedDB / LocalStorage)  │
└──────────────────────────────┘
```

### Extensibility Guarantees
- **Plugin Registry Interface**: AI commentary and Cloud storage implement clean standard interfaces (`AIProvider`, `CloudStorageProvider`). Adding a new cloud provider (e.g., OneDrive, Dropbox) or local LLM (Ollama) only requires implementing a single adapter interface without touching UI or assessment code.
- **Strict Data Contracts**: All data structures (Assessments, Documents, CSE Milestones) are defined in centralized TypeScript types and validated with runtime schemas, ensuring zero migration friction when adding new fields later.

---

## 3. Discussion Points for User Review

Please review this comprehensive feature list. In particular, we can refine:
1. **Document Vault**: Do you prefer files to be organized by Subject folders or by Document Types (e.g., Notes, PYQs, Lab Manuals, Cheat Sheets)?
2. **CSE Modules**: Are there specific courses you are currently taking this semester (e.g., Theory of Computation, Web Dev, Microprocessors) that you'd like preloaded into the CSE topic trees?
3. **Scope Priority**: Which of the categories above should be ready in the initial shippable version vs. expanded in subsequent iterations?
