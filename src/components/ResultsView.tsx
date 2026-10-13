/**
 * HexaStudy — Assessment Results, Deterministic Reports & Optional AI Narrative
 * Authoritative Core Calculations, Hexagonal Radar, and 7-Day Action Plan
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileDown,
  Layers,
  Pause,
  Play,
  Printer,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import { HexagonalRadar } from './HexagonalRadar';
import { AINarrative, AssessmentSnapshot, DIMENSIONS, DimensionKey } from '../types';
import { hexaStore } from '../services/store';

interface ResultsViewProps {
  snapshot: AssessmentSnapshot;
  comparisonSnapshot?: AssessmentSnapshot | null;
  onNewAssessment: () => void;
  onOpenSettings: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  snapshot,
  comparisonSnapshot,
  onNewAssessment,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'report' | 'ai'>('radar');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(snapshot.subjects[0]?.subjectId || '');

  // Modifiable Radar Points Filter (Allows 5 points, 6 points, etc.)
  const [excludedSubjectIds, setExcludedSubjectIds] = useState<string[]>([]);

  const visibleSubjects = snapshot.subjects.filter((s) => !excludedSubjectIds.includes(s.subjectId));
  const visibleComparisonSubjects = comparisonSnapshot?.subjects.filter(
    (s) => !excludedSubjectIds.includes(s.subjectId)
  );

  const toggleSubjectOnRadar = (id: string) => {
    if (excludedSubjectIds.includes(id)) {
      setExcludedSubjectIds(excludedSubjectIds.filter((x) => x !== id));
    } else {
      if (visibleSubjects.length <= 3) {
        alert('A radar polygon requires at least 3 points.');
        return;
      }
      setExcludedSubjectIds([...excludedSubjectIds, id]);
    }
  };

  // AI Narrative State (Optional Plug-in)
  const [aiNarrative, setAiNarrative] = useState<AINarrative | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Audio TTS State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const selectedSubject = snapshot.subjects.find((s) => s.subjectId === selectedSubjectId) || snapshot.subjects[0];

  // Export Data to CSV
  const handleExportCSV = () => {
    const headers = ['Subject Code', 'Subject Name', 'Overall Score (0-5)', 'Percentage (%)', 'Coverage', 'Understanding', 'Problem Solving', 'Practical', 'Exam Readiness'];
    const rows = snapshot.subjects.map((s) => [
      s.subjectCode,
      `"${s.subjectName}"`,
      s.score,
      s.percentage,
      s.ratings.coverage ?? 'N/A',
      s.ratings.understanding ?? 'N/A',
      s.ratings.problemSolving ?? 'N/A',
      s.ratings.practical ?? 'N/A',
      s.ratings.examReadiness ?? 'N/A',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hexastudy-assessment-${snapshot.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Markdown Report
  const handleExportMarkdown = () => {
    let md = `# HexaStudy Academic Diagnostic Report\n\n`;
    md += `**Date**: ${new Date(snapshot.timestamp).toLocaleDateString()}\n`;
    md += `**Overall Academic Mean**: ${snapshot.overallMean.toFixed(2)} / 5.0 (${(snapshot.overallMean * 20).toFixed(1)}%)\n\n`;
    md += `## Subject Score Breakdown\n\n`;
    md += `| Subject | Code | Score (0-5) | % | Coverage | Concepts | Problems | Practical | Exam Readiness |\n`;
    md += `|---|---|---|---|---|---|---|---|---|\n`;
    snapshot.subjects.forEach((s) => {
      md += `| ${s.subjectName} | ${s.subjectCode} | ${s.score.toFixed(1)} | ${s.percentage}% | ${s.ratings.coverage ?? '-'} | ${s.ratings.understanding ?? '-'} | ${s.ratings.problemSolving ?? '-'} | ${s.ratings.practical ?? '-'} | ${s.ratings.examReadiness ?? '-'} |\n`;
    });
    md += `\n## Critical Gap Analysis\n\n`;
    md += `- **Strongest Subject**: ${snapshot.gapAnalysis.highestSubject.name} (${snapshot.gapAnalysis.highestSubject.score.toFixed(1)})\n`;
    md += `- **Most Vulnerable Subject**: ${snapshot.gapAnalysis.lowestSubject.name} (${snapshot.gapAnalysis.lowestSubject.score.toFixed(1)})\n`;
    md += `- **Weakest Dimension**: ${snapshot.gapAnalysis.lowestDimension.label} (Average: ${snapshot.gapAnalysis.lowestDimension.score.toFixed(1)})\n`;
    if (snapshot.gapAnalysis.immediateTriageSubjects.length > 0) {
      md += `- **Immediate Triage Needed**: ${snapshot.gapAnalysis.immediateTriageSubjects.join(', ')}\n`;
    }
    md += `\n## Deterministic 7-Day Action Plan\n\n`;
    snapshot.sevenDayActionPlan.forEach((day) => {
      md += `### ${day.dayTitle} (${day.recommendedHours} hrs)\n`;
      day.actionItems.forEach((action) => {
        md += `- ${action}\n`;
      });
      md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hexastudy-report-${snapshot.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate Optional AI Commentary on Demand
  const handleGenerateAI = async () => {
    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned HTTP ${response.status}`);
      }

      const data: AINarrative = await response.json();
      setAiNarrative(data);
      setActiveTab('ai');
    } catch (err: any) {
      console.warn('AI commentary failed:', err);
      // Fallback deterministic narrative if offline server or API key unconfigured
      setAiError(
        err.message.includes('Failed to fetch')
          ? 'AI Service unreachable. Running in zero-AI offline local mode. You can still read the full deterministic report.'
          : err.message
      );
      // Provide a high-quality local fallback narrative so the user is never stuck
      const fallbackNarrative: AINarrative = {
        id: `ai_${Date.now()}`,
        assessmentId: snapshot.id,
        provider: 'none',
        model: 'Local-Rule-Synthesis',
        narrativeText: `Based on your diagnostic ratings, your strongest performance lies in ${snapshot.gapAnalysis.highestSubject.name} (${snapshot.gapAnalysis.highestSubject.score.toFixed(1)}/5.0), while ${snapshot.gapAnalysis.lowestSubject.name} (${snapshot.gapAnalysis.lowestSubject.score.toFixed(1)}/5.0) requires immediate remediation. Noticeable divergence was detected in ${snapshot.gapAnalysis.lowestDimension.label}, indicating that while theory modules have been read, active problem-solving or timed testing has lagged behind.`,
        strengths: [
          `Strong conceptual footing in ${snapshot.gapAnalysis.highestSubject.name}`,
          `Consistent syllabus coverage maintained across foundational subjects`,
        ],
        criticalRisks: snapshot.gapAnalysis.immediateTriageSubjects.map(
          (s) => `Subject ${s} is below safe passing threshold (2.5/5.0)`
        ),
        examStrategy: [
          `Shift study ratio: 70% active timed PYQ solving, 30% passive reading.`,
          `Complete hands-on compilation for lab viva defense.`,
        ],
        generatedAt: new Date().toISOString(),
      };
      setAiNarrative(fallbackNarrative);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate TTS Audio for Action Plan
  const handleGenerateTTS = async () => {
    setAudioLoading(true);
    try {
      const planText = snapshot.sevenDayActionPlan
        .slice(0, 3)
        .map((d) => `${d.dayTitle}. Focus on: ${d.actionItems.join(' ')}`)
        .join('. ');

      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `Here is your HexaStudy academic action plan. ${planText}` }),
      });

      if (!response.ok) throw new Error('TTS service failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    } catch (err: any) {
      console.warn('TTS narration error:', err);
      // Web Speech API fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `HexaStudy Action Plan: ${snapshot.sevenDayActionPlan[0]?.dayTitle}. ${snapshot.sevenDayActionPlan[0]?.actionItems[0]}`
        );
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
      }
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Assessment Title & Overall Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/40">
              {snapshot.isDemo ? 'SAMPLE DEMO' : 'COMPLETED'}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {new Date(snapshot.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mt-1 tracking-tight">{snapshot.title}</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Evaluated across {snapshot.subjects.length} subjects and 5 academic proficiency dimensions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Health Score Pill */}
          <div className="px-4 py-2.5 bg-neutral-800/90 border border-white/10 rounded-xl text-center">
            <span className="block text-[11px] text-neutral-400 uppercase tracking-wider font-medium">
              Overall Academic Mean
            </span>
            <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
              <span
                className={`text-2xl font-black font-mono tabular-nums ${
                  snapshot.overallMean >= 3.5
                    ? 'text-emerald-400'
                    : snapshot.overallMean >= 2.5
                    ? 'text-sky-400'
                    : 'text-amber-400'
                }`}
              >
                {snapshot.overallMean.toFixed(2)}
              </span>
              <span className="text-xs text-neutral-500 font-mono">/ 5.0</span>
              <span className="text-xs text-neutral-400 font-mono">
                ({(snapshot.overallMean * 20).toFixed(0)}%)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onNewAssessment}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              New Assessment
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-1.5 px-3 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print to PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'radar'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Hexagonal Radar &amp; Scores</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'report'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Deterministic 7-Day Plan</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ai');
              if (!aiNarrative && !isAiLoading) handleGenerateAI();
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'ai'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-neutral-400 hover:text-purple-300 hover:bg-neutral-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Commentary (Optional)</span>
          </button>
        </div>

        {/* Data Export Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-400 hover:text-white bg-neutral-800/80 rounded transition-colors"
            title="Download CSV metrics"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-400 hover:text-white bg-neutral-800/80 rounded transition-colors"
            title="Download Markdown summary"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: HEXAGONAL RADAR & SCORE TABLE */}
      {activeTab === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Responsive Radar Chart */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-neutral-900/60 border border-white/10 flex flex-col items-center justify-center">
            {/* Dynamic Geometry Controller: 5 Points vs 6 Points vs Custom */}
            <div className="w-full mb-3 p-3 rounded-xl bg-neutral-950/70 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                  <span>Radar Geometry:</span>
                  <span className="font-mono text-sky-400">
                    {visibleSubjects.length} Points ({visibleSubjects.length === 5 ? 'Pentagon' : visibleSubjects.length === 6 ? 'Hexagon' : `${visibleSubjects.length}-gon`})
                  </span>
                </span>
                {excludedSubjectIds.length > 0 && (
                  <button
                    onClick={() => setExcludedSubjectIds([])}
                    className="text-[11px] text-sky-400 hover:underline"
                  >
                    Reset All ({snapshot.subjects.length})
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {snapshot.subjects.map((sub) => {
                  const isVisible = !excludedSubjectIds.includes(sub.subjectId);
                  return (
                    <button
                      key={sub.subjectId}
                      onClick={() => toggleSubjectOnRadar(sub.subjectId)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        isVisible
                          ? 'bg-sky-950 text-sky-300 border border-sky-700/60 shadow-sm'
                          : 'bg-neutral-900 text-neutral-500 border border-white/5 hover:text-neutral-300'
                      }`}
                      title={isVisible ? 'Click to toggle off this point' : 'Click to include this point on the radar'}
                    >
                      {isVisible ? '✓' : '○'} {sub.subjectCode}
                    </button>
                  );
                })}
              </div>
            </div>

            <HexagonalRadar
              subjects={visibleSubjects}
              compareSubjects={visibleComparisonSubjects}
              title={snapshot.title}
              compareTitle={comparisonSnapshot?.title}
              onSubjectClick={(id) => setSelectedSubjectId(id)}
            />
          </div>

          {/* Right Column: Score Breakdown & Gap Details */}
          <div className="lg:col-span-6 space-y-4">
            {/* Subject Selector Strip */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">
                  Select Subject to Inspect Dimensions:
                </span>
                <span className="text-xs font-mono text-sky-400">
                  {selectedSubject.score.toFixed(1)}/5.0 ({selectedSubject.percentage}%)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {snapshot.subjects.map((s) => {
                  const isSelected = s.subjectId === selectedSubject.subjectId;
                  return (
                    <button
                      key={s.subjectId}
                      onClick={() => setSelectedSubjectId(s.subjectId)}
                      className={`p-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-sky-950 border border-sky-600 text-white shadow-sm'
                          : 'bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 border border-white/5'
                      }`}
                    >
                      <span className="block text-[11px] font-mono text-sky-400 font-bold">
                        {s.subjectCode}
                      </span>
                      <span className="block text-xs font-semibold text-neutral-200 truncate mt-0.5">
                        {s.subjectName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Subject Dimensions Table */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedSubject.subjectName}</h4>
                  <span className="text-xs text-neutral-400 font-mono">
                    {selectedSubject.subjectCode} · {selectedSubject.evaluatedDimensionsCount}/5 Dimensions Rated
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-sky-400">
                    {selectedSubject.score.toFixed(1)}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono"> / 5.0</span>
                </div>
              </div>

              {/* 5 Dimensions Grid */}
              <div className="space-y-2">
                {(Object.keys(DIMENSIONS) as DimensionKey[]).map((dimKey) => {
                  const dimMeta = DIMENSIONS[dimKey];
                  const rating = selectedSubject.ratings[dimKey];
                  const note = selectedSubject.notes[dimKey];

                  return (
                    <div
                      key={dimKey}
                      className="p-2.5 rounded-lg bg-neutral-800/50 border border-white/5 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-neutral-300">
                          {dimMeta.code}. {dimMeta.label}
                        </span>
                        <span className="font-mono font-bold text-sky-300 tabular-nums">
                          {rating !== null ? `${rating.toFixed(1)} / 5.0` : 'Not Assessed'}
                        </span>
                      </div>

                      {/* Small visual bar */}
                      <div className="w-full bg-neutral-700/50 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            rating === null
                              ? 'bg-transparent'
                              : rating >= 4
                              ? 'bg-emerald-400'
                              : rating >= 2.5
                              ? 'bg-sky-400'
                              : 'bg-red-400'
                          }`}
                          style={{ width: `${rating !== null ? (rating / 5) * 100 : 0}%` }}
                        />
                      </div>

                      {note && (
                        <p className="text-[11px] text-neutral-400 italic pt-0.5">{note}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Cognitive Gap Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
                <div className="p-2 rounded bg-neutral-800/80 border border-white/5">
                  <span className="text-neutral-400 block text-[10px]">Coverage vs Understanding:</span>
                  <span
                    className={`font-bold ${
                      selectedSubject.coverageVsUnderstandingGap >= 1.5
                        ? 'text-amber-400'
                        : 'text-neutral-200'
                    }`}
                  >
                    {selectedSubject.coverageVsUnderstandingGap > 0 ? '+' : ''}
                    {selectedSubject.coverageVsUnderstandingGap.toFixed(1)} Gap
                  </span>
                </div>

                <div className="p-2 rounded bg-neutral-800/80 border border-white/5">
                  <span className="text-neutral-400 block text-[10px]">Understanding vs Readiness:</span>
                  <span
                    className={`font-bold ${
                      selectedSubject.understandingVsReadinessGap >= 1.5
                        ? 'text-red-400'
                        : 'text-neutral-200'
                    }`}
                  >
                    {selectedSubject.understandingVsReadinessGap > 0 ? '+' : ''}
                    {selectedSubject.understandingVsReadinessGap.toFixed(1)} Gap
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DETERMINISTIC REPORT & 7-DAY PLAN */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Executive Triage Alert */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/30">
              <span className="text-xs text-emerald-400 font-semibold block mb-1">
                Highest Strength
              </span>
              <h4 className="text-base font-bold text-white">
                {snapshot.gapAnalysis.highestSubject.name}
              </h4>
              <span className="text-xs text-neutral-400 font-mono mt-1 block">
                Score: {snapshot.gapAnalysis.highestSubject.score.toFixed(1)} / 5.0
              </span>
            </div>

            <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/30">
              <span className="text-xs text-red-400 font-semibold block mb-1">
                Immediate Triage Focus
              </span>
              <h4 className="text-base font-bold text-white">
                {snapshot.gapAnalysis.lowestSubject.name}
              </h4>
              <span className="text-xs text-neutral-400 font-mono mt-1 block">
                Score: {snapshot.gapAnalysis.lowestSubject.score.toFixed(1)} / 5.0 (Lowest)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/30">
              <span className="text-xs text-amber-400 font-semibold block mb-1">
                Systemic Dimension Gap
              </span>
              <h4 className="text-base font-bold text-white">
                {snapshot.gapAnalysis.lowestDimension.label}
              </h4>
              <span className="text-xs text-neutral-400 font-mono mt-1 block">
                Cross-Subject Mean: {snapshot.gapAnalysis.lowestDimension.score.toFixed(1)} / 5.0
              </span>
            </div>
          </div>

          {/* Deterministic 7-Day Plan with TTS Audio Trigger */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">
                  Deterministic 7-Day Academic Action Plan
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Rule-based schedule prioritizing your weakest dimensions and exam simulations.
                </p>
              </div>

              {/* TTS Listen Button */}
              <button
                onClick={handleGenerateTTS}
                disabled={audioLoading}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-sky-300 hover:text-white bg-sky-950/60 hover:bg-sky-900 border border-sky-800/40 rounded-lg transition-colors"
                title="Listen to synthesized audio narration using Gemini TTS"
              >
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>{audioLoading ? 'Synthesizing...' : isPlayingAudio ? 'Playing Plan' : 'Listen Plan (TTS)'}</span>
              </button>
            </div>

            <audio ref={audioRef} onEnded={() => setIsPlayingAudio(false)} className="hidden" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {snapshot.sevenDayActionPlan.map((day) => (
                <div
                  key={day.dayNumber}
                  className="p-4 rounded-xl bg-neutral-800/60 border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 font-mono">{day.dayTitle}</span>
                    <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-900">
                      {day.recommendedHours} hrs
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-neutral-400 block">
                    Target: {DIMENSIONS[day.targetDimension]?.label}
                  </span>

                  <ul className="space-y-1.5 text-xs text-neutral-300 pt-1">
                    {day.actionItems.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: OPTIONAL AI COMMENTARY PANEL (PLUG-IN) */}
      {activeTab === 'ai' && (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-purple-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">AI Diagnostic Interpretation (Optional)</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                On-demand narrative analysis layered on top of immutable deterministic calculations. Zero dependency on AI for core scores.
              </p>
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={isAiLoading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-purple-200 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 rounded-lg transition-colors whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>{isAiLoading ? 'Generating Analysis...' : 'Regenerate AI Analysis'}</span>
            </button>
          </div>

          {aiError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{aiError}</span>
            </div>
          )}

          {isAiLoading ? (
            <div className="text-center py-12 space-y-3">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <p className="text-xs text-neutral-400 font-mono">
                Synthesizing diagnostic narrative and academic advice with Gemini...
              </p>
            </div>
          ) : aiNarrative ? (
            <div className="space-y-6">
              {/* Main Narrative Paragraph */}
              <div className="p-4 rounded-xl bg-neutral-950/70 border border-white/5 text-xs text-neutral-200 leading-relaxed space-y-2">
                <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block font-bold">
                  Academic Diagnostic Synthesis:
                </span>
                <p>{aiNarrative.narrativeText}</p>
              </div>

              {/* Strengths vs Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-800/50 border border-emerald-900/40 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 block">Identified Strengths:</span>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {aiNarrative.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-neutral-800/50 border border-red-900/40 space-y-2">
                  <span className="text-xs font-bold text-red-400 block">Critical Exam Vulnerabilities:</span>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {aiNarrative.criticalRisks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-400 font-bold">⚠</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exam Strategy */}
              <div className="p-4 rounded-xl bg-neutral-800/50 border border-purple-900/40 space-y-2">
                <span className="text-xs font-bold text-purple-300 block">Tailored Strategic Next Steps:</span>
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  {aiNarrative.examStrategy.map((step, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">→</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <Bot className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400">Click "Regenerate AI Analysis" to obtain an optional narrative evaluation.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
