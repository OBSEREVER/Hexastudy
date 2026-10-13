/**
 * HexaStudy — 5-Dimension Academic Assessment Interview Wizard
 * Sequential Interactive Interview with Fractional Ratings & Rule-Based Inconsistency Checks
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { compileAssessmentSnapshot } from '../services/scoringEngine';
import { hexaStore } from '../services/store';
import {
  AssessmentSnapshot,
  DimensionKey,
  DIMENSIONS,
  Subject,
  SubjectAssessmentInput,
} from '../types';

interface AssessmentWizardProps {
  subjects: Subject[];
  onComplete: (snapshot: AssessmentSnapshot) => void;
  onCancel: () => void;
}

const DIMENSION_KEYS: DimensionKey[] = [
  'coverage',
  'understanding',
  'problemSolving',
  'practical',
  'examReadiness',
];

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  subjects,
  onComplete,
  onCancel,
}) => {
  const [assessmentTitle, setAssessmentTitle] = useState(
    `Academic Diagnostic (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`
  );
  const [quickMode, setQuickMode] = useState(false);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);

  // Assessment inputs indexed by subjectId
  const [inputs, setInputs] = useState<Record<string, SubjectAssessmentInput>>(() => {
    const initial: Record<string, SubjectAssessmentInput> = {};
    subjects.forEach((s) => {
      initial[s.id] = {
        subjectId: s.id,
        subjectName: s.name,
        subjectCode: s.code,
        ratings: {
          coverage: null,
          understanding: null,
          problemSolving: null,
          practical: null,
          examReadiness: null,
        },
        qualitativeNotes: {
          coverage: '',
          understanding: '',
          problemSolving: '',
          practical: '',
          examReadiness: '',
        },
        inconsistentNotes: '',
      };
    });
    return initial;
  });

  const currentSubject = subjects[currentSubjectIndex];
  const currentDimensionKey = DIMENSION_KEYS[currentDimensionIndex];
  const currentDimensionMeta = DIMENSIONS[currentDimensionKey];
  const currentSubjectInput = inputs[currentSubject?.id];

  const currentRating = currentSubjectInput?.ratings[currentDimensionKey] ?? null;
  const currentNote = currentSubjectInput?.qualitativeNotes[currentDimensionKey] ?? '';

  // Fractional Rating Scale options (0.0 to 5.0 in 0.5 steps)
  const ratingSteps = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

  const setRating = (val: number | null) => {
    if (!currentSubject) return;
    setInputs((prev) => ({
      ...prev,
      [currentSubject.id]: {
        ...prev[currentSubject.id],
        ratings: {
          ...prev[currentSubject.id].ratings,
          [currentDimensionKey]: val,
        },
      },
    }));
  };

  const setNote = (noteText: string) => {
    if (!currentSubject) return;
    setInputs((prev) => ({
      ...prev,
      [currentSubject.id]: {
        ...prev[currentSubject.id],
        qualitativeNotes: {
          ...prev[currentSubject.id].qualitativeNotes,
          [currentDimensionKey]: noteText,
        },
      },
    }));
  };

  // Rule-based inconsistency detection
  const checkInconsistency = () => {
    if (!currentSubjectInput) return null;
    const cov = currentSubjectInput.ratings.coverage;
    const und = currentSubjectInput.ratings.understanding;
    const exm = currentSubjectInput.ratings.examReadiness;

    if (cov !== null && und !== null && cov - und >= 2.0) {
      return 'Noticeable gap: You reported high syllabus coverage but basic understanding. Were materials skimmed without solving textbook proofs?';
    }
    if (und !== null && exm !== null && und - exm >= 2.0) {
      return 'Noticeable gap: High conceptual confidence but low exam readiness. This usually signals anxiety or lack of timed PYQ practice.';
    }
    return null;
  };

  const inconsistencyAlert = checkInconsistency();

  // Navigation handlers
  const handleNext = () => {
    if (currentDimensionIndex < DIMENSION_KEYS.length - 1) {
      setCurrentDimensionIndex((prev) => prev + 1);
    } else if (currentSubjectIndex < subjects.length - 1) {
      setCurrentSubjectIndex((prev) => prev + 1);
      setCurrentDimensionIndex(0);
    } else {
      // Finished all subjects
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentDimensionIndex > 0) {
      setCurrentDimensionIndex((prev) => prev - 1);
    } else if (currentSubjectIndex > 0) {
      setCurrentSubjectIndex((prev) => prev - 1);
      setCurrentDimensionIndex(DIMENSION_KEYS.length - 1);
    }
  };

  const handleFinish = () => {
    const list = Object.values(inputs);
    const snapshot = compileAssessmentSnapshot(assessmentTitle.trim() || 'Academic Assessment', list, false);
    hexaStore.addAssessment(snapshot);
    onComplete(snapshot);
  };

  // Overall Progress
  const totalQuestions = subjects.length * DIMENSION_KEYS.length;
  const currentQuestionNumber = currentSubjectIndex * DIMENSION_KEYS.length + currentDimensionIndex + 1;
  const progressPercent = Math.round((currentQuestionNumber / totalQuestions) * 100);

  const getVerbalLabel = (val: number | null) => {
    if (val === null) return 'Not Assessed (Excluded from mean)';
    if (val === 0) return '0.0 — Untouched / Zero ability';
    if (val <= 1.0) return `${val.toFixed(1)} — Very Weak / Fragmentary`;
    if (val <= 2.0) return `${val.toFixed(1)} — Basic with major knowledge gaps`;
    if (val <= 3.0) return `${val.toFixed(1)} — Moderate / Passing competence`;
    if (val <= 4.0) return `${val.toFixed(1)} — Strong / Solid problem solver`;
    return `${val.toFixed(1)} — Excellent / Exam & Viva Ready`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none">
      {/* Title & Mode Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/70 border border-white/10">
        <div className="flex-1">
          <input
            type="text"
            value={assessmentTitle}
            onChange={(e) => setAssessmentTitle(e.target.value)}
            className="text-base font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-500 focus:outline-none w-full"
            placeholder="Assessment Name..."
          />
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 font-mono">
            <span>Subject {currentSubjectIndex + 1} of {subjects.length}</span>
            <span>·</span>
            <span>Dimension {currentDimensionIndex + 1} of 5</span>
            <span>·</span>
            <span className="text-sky-400">{progressPercent}% complete</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuickMode(!quickMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              quickMode
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{quickMode ? 'Quick Mode Active' : 'Detailed Mode'}</span>
          </button>

          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-800/80 h-2 rounded-full overflow-hidden border border-white/5">
        <div
          className="bg-sky-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-2xl space-y-6">
        {/* Subject Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800/40">
                {currentSubject?.code}
              </span>
              <span className="text-xs text-neutral-400">Semester {currentSubject?.semester}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{currentSubject?.name}</h3>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-white/5">
              Dimension {currentDimensionMeta.code}: {currentDimensionMeta.shortLabel}
            </span>
          </div>
        </div>

        {/* Dimension Evaluation Prompt */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-sky-300">{currentDimensionMeta.label}</h4>
          <p className="text-sm text-neutral-200 leading-relaxed">
            {currentDimensionMeta.evaluationPrompt}
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-500 pt-1 font-mono">
            <div>0.0: {currentDimensionMeta.anchor0}</div>
            <div className="text-right">5.0: {currentDimensionMeta.anchor5}</div>
          </div>
        </div>

        {/* Rating Stepper Buttons (0.0 to 5.0) */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-neutral-300">
            Select Rating (Fractional Allowed):
          </label>

          <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
            {ratingSteps.map((step) => {
              const isSelected = currentRating === step;
              return (
                <button
                  key={step}
                  onClick={() => setRating(step)}
                  className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-lg ring-2 ring-sky-300/40'
                      : 'bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 border border-white/5'
                  }`}
                >
                  {step.toFixed(1)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-neutral-300 font-mono">
              Selected: <strong className="text-sky-400">{getVerbalLabel(currentRating)}</strong>
            </span>

            <button
              onClick={() => setRating(null)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                currentRating === null
                  ? 'bg-neutral-700 text-white font-bold ring-1 ring-white/20'
                  : 'text-neutral-400 hover:text-neutral-200 bg-neutral-800/60'
              }`}
            >
              Skip / Not Assessed
            </button>
          </div>
        </div>

        {/* Rule-Based Inconsistency Warning */}
        {inconsistencyAlert && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{inconsistencyAlert}</span>
          </div>
        )}

        {/* Qualitative Notes (Detailed Mode) */}
        {!quickMode && (
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <label className="block text-xs font-medium text-neutral-400">
              Qualitative Notes &amp; Specific Chapters (Optional):
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Cleared Booth's algorithm and ALU design; need practice on cache tag/index/offset calculations..."
              value={currentNote}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-800/80 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={handlePrev}
            disabled={currentSubjectIndex === 0 && currentDimensionIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
          >
            <span>
              {currentSubjectIndex === subjects.length - 1 &&
              currentDimensionIndex === DIMENSION_KEYS.length - 1
                ? 'Finish & View Hexagonal Radar'
                : 'Next Question'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
