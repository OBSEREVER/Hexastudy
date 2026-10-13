/**
 * HexaStudy — Deterministic Mathematical Scoring Engine
 * Zero-AI, 100% Deterministic Rule-Based Analysis
 */

import {
  AssessmentSnapshot,
  ComputedSubjectScore,
  DayPlan,
  DimensionKey,
  DIMENSIONS,
  GapAnalysis,
  SubjectAssessmentInput,
} from '../types';

export function computeSubjectScore(input: SubjectAssessmentInput): ComputedSubjectScore {
  const keys: DimensionKey[] = ['coverage', 'understanding', 'problemSolving', 'practical', 'examReadiness'];

  let totalValid = 0;
  let countValid = 0;

  for (const key of keys) {
    const val = input.ratings[key];
    if (val !== null && typeof val === 'number') {
      totalValid += val;
      countValid += 1;
    }
  }

  const score = countValid > 0 ? Number((totalValid / countValid).toFixed(2)) : 0;
  const percentage = Number((score * 20).toFixed(1));

  const cov = input.ratings.coverage ?? 0;
  const und = input.ratings.understanding ?? 0;
  const exm = input.ratings.examReadiness ?? 0;

  // Coverage overestimation: high coverage but low understanding
  const coverageVsUnderstandingGap = Number((cov - und).toFixed(2));
  // Exam panic gap: high understanding but unprepared for timed test
  const understandingVsReadinessGap = Number((und - exm).toFixed(2));

  return {
    subjectId: input.subjectId,
    subjectName: input.subjectName,
    subjectCode: input.subjectCode,
    score,
    percentage,
    evaluatedDimensionsCount: countValid,
    unassessedDimensionsCount: 5 - countValid,
    ratings: input.ratings,
    notes: input.qualitativeNotes,
    coverageVsUnderstandingGap,
    understandingVsReadinessGap,
  };
}

export function computeGapAnalysis(subjects: ComputedSubjectScore[]): GapAnalysis {
  if (subjects.length === 0) {
    return {
      overallMean: 0,
      lowestSubject: { id: '', name: 'None', score: 0 },
      highestSubject: { id: '', name: 'None', score: 0 },
      lowestDimension: { key: 'coverage', label: 'Coverage', score: 0 },
      highestDimension: { key: 'coverage', label: 'Coverage', score: 0 },
      coverageOverestimationCount: 0,
      examPanicSubjects: [],
      immediateTriageSubjects: [],
    };
  }

  // Calculate overall mean across available subjects
  const sumScores = subjects.reduce((acc, s) => acc + s.score, 0);
  const overallMean = Number((sumScores / subjects.length).toFixed(2));

  // Sort subjects by score
  const sortedByScore = [...subjects].sort((a, b) => a.score - b.score);
  const lowestSub = sortedByScore[0];
  const highestSub = sortedByScore[sortedByScore.length - 1];

  // Calculate dimension means across all subjects
  const dimSums: Record<DimensionKey, { sum: number; count: number }> = {
    coverage: { sum: 0, count: 0 },
    understanding: { sum: 0, count: 0 },
    problemSolving: { sum: 0, count: 0 },
    practical: { sum: 0, count: 0 },
    examReadiness: { sum: 0, count: 0 },
  };

  subjects.forEach((s) => {
    (Object.keys(dimSums) as DimensionKey[]).forEach((dim) => {
      const val = s.ratings[dim];
      if (val !== null) {
        dimSums[dim].sum += val;
        dimSums[dim].count += 1;
      }
    });
  });

  const dimAverages = (Object.keys(dimSums) as DimensionKey[]).map((dim) => ({
    key: dim,
    label: DIMENSIONS[dim].shortLabel,
    score: dimSums[dim].count > 0 ? Number((dimSums[dim].sum / dimSums[dim].count).toFixed(2)) : 0,
  }));

  dimAverages.sort((a, b) => a.score - b.score);
  const lowestDim = dimAverages[0];
  const highestDim = dimAverages[dimAverages.length - 1];

  // Specific risk heuristics
  let coverageOverestimationCount = 0;
  const examPanicSubjects: string[] = [];
  const immediateTriageSubjects: string[] = [];

  subjects.forEach((s) => {
    if (s.coverageVsUnderstandingGap >= 1.5) {
      coverageOverestimationCount += 1;
    }
    if (s.understandingVsReadinessGap >= 1.5) {
      examPanicSubjects.push(s.subjectName);
    }
    if (s.score < 2.5) {
      immediateTriageSubjects.push(s.subjectName);
    }
  });

  return {
    overallMean,
    lowestSubject: { id: lowestSub.subjectId, name: lowestSub.subjectName, score: lowestSub.score },
    highestSubject: { id: highestSub.subjectId, name: highestSub.subjectName, score: highestSub.score },
    lowestDimension: lowestDim,
    highestDimension: highestDim,
    coverageOverestimationCount,
    examPanicSubjects,
    immediateTriageSubjects,
  };
}

export function generateDeterministic7DayPlan(
  subjects: ComputedSubjectScore[],
  gaps: GapAnalysis
): DayPlan[] {
  // Sort subjects from weakest to strongest for triage
  const priorityQueue = [...subjects].sort((a, b) => a.score - b.score);
  const days: DayPlan[] = [];

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let i = 0; i < 7; i++) {
    const dayNumber = i + 1;
    // Rotate weaker subjects on earlier days, reinforcement on later days
    const focusSub = priorityQueue[i % priorityQueue.length] || subjects[0];
    let targetDim: DimensionKey = 'understanding';
    let actionItems: string[] = [];
    let hours = 3;

    if (i < 3) {
      // Days 1-3: Critical Triage on weakest dimension
      if (focusSub.ratings.understanding !== null && focusSub.ratings.understanding < 3.0) {
        targetDim = 'understanding';
        hours = 4;
        actionItems = [
          `Review core fundamentals and algorithmic derivations for ${focusSub.subjectName}.`,
          `Write one-page cheat sheet summarizing key definitions without consulting lecture slides.`,
          `Solve 3 standard textbook derivations independently to verify comprehension.`,
        ];
      } else if (focusSub.ratings.problemSolving !== null && focusSub.ratings.problemSolving < 3.0) {
        targetDim = 'problemSolving';
        hours = 3.5;
        actionItems = [
          `Practice 5 unassisted numericals or algorithm tracing problems in ${focusSub.subjectName}.`,
          `Identify patterns where hints were required previously; re-solve without hints.`,
        ];
      } else {
        targetDim = 'coverage';
        hours = 3;
        actionItems = [
          `Complete unfinished syllabus modules in ${focusSub.subjectName}.`,
          `Review lecture notes and create concise formula index.`,
        ];
      }
    } else if (i < 5) {
      // Days 4-5: Practical application & lab defense
      targetDim = 'practical';
      hours = 3.5;
      actionItems = [
        `Hands-on code verification: compile and test all required lab programs for ${focusSub.subjectName}.`,
        `Practice oral viva questions with focus on edge cases and time complexities.`,
        `Document input/output test cases to prevent practical exam confusion.`,
      ];
    } else {
      // Days 6-7: Exam Simulation & Timed PYQ Recall
      targetDim = 'examReadiness';
      hours = 4;
      actionItems = [
        `Solve 1 full previous year question paper (PYQ) under strictly timed exam conditions.`,
        `Mark answers against official marking scheme; tally score objectively.`,
        `Consolidate final revision cards for high-frequency exam topics.`,
      ];
    }

    days.push({
      dayNumber,
      dayTitle: `Day ${dayNumber} (${dayNames[i]}): ${focusSub.subjectName}`,
      focusSubjectName: focusSub.subjectName,
      targetDimension: targetDim,
      recommendedHours: hours,
      actionItems,
    });
  }

  return days;
}

export function compileAssessmentSnapshot(
  title: string,
  inputs: SubjectAssessmentInput[],
  isDemo = false
): AssessmentSnapshot {
  const computedSubjects = inputs.map(computeSubjectScore);
  const gapAnalysis = computeGapAnalysis(computedSubjects);

  // Calculate dimension means
  const dimMeans: Record<DimensionKey, number> = {
    coverage: 0,
    understanding: 0,
    problemSolving: 0,
    practical: 0,
    examReadiness: 0,
  };

  const keys: DimensionKey[] = ['coverage', 'understanding', 'problemSolving', 'practical', 'examReadiness'];
  keys.forEach((k) => {
    let s = 0;
    let c = 0;
    computedSubjects.forEach((sub) => {
      const v = sub.ratings[k];
      if (v !== null) {
        s += v;
        c += 1;
      }
    });
    dimMeans[k] = c > 0 ? Number((s / c).toFixed(2)) : 0;
  });

  const sevenDayActionPlan = generateDeterministic7DayPlan(computedSubjects, gapAnalysis);

  return {
    id: `eval_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    title,
    isDemo,
    subjects: computedSubjects,
    dimensionMeans: dimMeans,
    overallMean: gapAnalysis.overallMean,
    gapAnalysis,
    sevenDayActionPlan,
  };
}
