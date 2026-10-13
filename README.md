# HexaStudy — Local-First Academic Proficiency Assessor (Windows 11)

**HexaStudy** is a local-first academic proficiency assessor, study planning workstation, and study material repository designed for Windows 11. Built with special emphasis on Computer Science and Engineering (CSE) college students.

---

## 🏛️ Governing Architecture Rule

The application is architected with strict, failure-isolated separation:

1. **CORE MODULE (100% Offline, Zero AI Dependency)**:
   - Subject & syllabus management.
   - 5-dimension structured interview wizard (Coverage, Conceptual Understanding, Problem Solving, Practical Application, Exam Readiness).
   - Deterministic mathematical score calculations (0.0 to 5.0, fractional allowed, "Not Assessed" excluded from mean).
   - 6-axis hexagonal radar polygon and dynamic multi-axis Recharts/SVG visualization.
   - Deterministic 7-day academic triage action plan.
   - CSE Major Specialization Suite (DSA matrix, Core CS theory trees for OS/DBMS/CN/COA, lab practicals journal, viva voce flashcard bank).
   - Study Material Repository & PDF Document Vault with in-app document viewing.
   - Local persistence in browser IndexedDB/LocalStorage with JSON backup & restore.

2. **OPTIONAL PLUG-IN MODULES (Off by Default, Non-Blocking)**:
   - **Google Gemini Intelligence**: On-demand narrative diagnostic analysis layered on top of immutable snapshots.
   - **Gemini TTS (`gemini-3.8-flash-tts`)**: Audio narration of your 7-day revision schedule.
   - **Search Grounding (`gemini-3.5-flash`)**: Real-time university syllabus trends and exam patterns.
   - **High Thinking Mode (`gemini-3.1-pro-preview` with `ThinkingLevel.HIGH`)**: Deep algorithmic tutoring in the CSE Study Companion chat.
   - **Google Workspace Hub**: Selective Google Drive backup per document in the Vault and Google Calendar exam schedule export.

---

## 🚀 Quick Start on Windows 11

### 1. Prerequisites
- Node.js (LTS version 20+ recommended) from [nodejs.org](https://nodejs.org).

### 2. Launch
Double-click `start.bat` or run:
```bash
npm install
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📁 Preloaded CSE 4th Semester Curriculum
1. **Maths 4 (Applied Mathematics)** (`KAS-402`)
2. **Discrete Structures & Theory of Logic (DS-TL)** (`KCS-403`)
3. **Computer Organization & Architecture (COA)** (`KCS-401`)
4. **Universal Human Values (UHV)** (`KVE-401`)
5. **Python Programming** (`KCS-452`)
6. **Data Structure in C Programming** (`KCS-402`)

---

## 🔒 Security & Privacy
- No API keys are ever stored or exposed in client bundles.
- All documents cataloged in the PDF Vault remain stored locally in your laptop's sandbox.
- Cloud Google Drive sync is strictly selective: each document has an individual toggle.
