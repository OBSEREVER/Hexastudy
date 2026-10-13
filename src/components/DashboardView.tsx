/**
 * HexaStudy — Executive Academic Dashboard
 * Hexagonal Radar Visualization, Academic Triage Alerts, CSE Shortcuts, and Document Vault
 */

import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Code2,
  Cpu,
  FileText,
  Flame,
  FolderOpen,
  GraduationCap,
  History,
  Layers,
  MessageSquare,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { HexagonalRadar } from './HexagonalRadar';
import { AssessmentSnapshot, Subject, VaultDocument } from '../types';

interface DashboardViewProps {
  subjects: Subject[];
  latestSnapshot: AssessmentSnapshot | null;
  documents: VaultDocument[];
  onNavigate: (view: any) => void;
  onOpenDoc: (doc: VaultDocument) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  latestSnapshot,
  documents,
  onNavigate,
  onOpenDoc,
}) => {
  const triageSubjects = latestSnapshot?.gapAnalysis.immediateTriageSubjects || [];
  const recentDocs = documents.slice(0, 3);

  // Dynamic Points Filter (Allows 5 points, 6 points, etc.)
  const [excludedSubjectIds, setExcludedSubjectIds] = React.useState<string[]>([]);
  const visibleSubjects = (latestSnapshot?.subjects || []).filter(
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

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/40">
              WINDOWS 11 WORKSTATION
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              CSE Undergrad Specialization Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight font-display">
            HexaStudy Academic Assessor
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5 max-w-xl">
            Local-first multi-dimensional diagnostic matrix. Objectively separates syllabus coverage from exam readiness and problem-solving mastery.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('wizard')}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Start Diagnostic Interview</span>
          </button>

          <button
            onClick={() => onNavigate('vault')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-xl transition-all"
          >
            <FolderOpen className="w-4 h-4 text-sky-400" />
            <span>Open PDF Vault</span>
          </button>
        </div>
      </div>

      {/* Urgent Triage Notification Banner (if any subject below 2.5) */}
      {triageSubjects.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-red-300 block">
              Immediate Academic Triage Alert:
            </span>
            <span>
              The following courses scored below the 2.5/5.0 passing confidence threshold:{' '}
              <strong className="text-white">{triageSubjects.join(', ')}</strong>. Prioritize their 7-day action items before upcoming semester theory examinations.
            </span>
          </div>
          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-bold text-red-300 underline hover:text-white shrink-0"
          >
            View Triage Plan →
          </button>
        </div>
      )}

      {/* Main Grid: Radar Chart Left, Status Metrics Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Latest Assessment Radar Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-neutral-900/60 border border-white/10 flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Current Hexagonal Radar State</h3>
              <span className="text-[11px] text-neutral-400 font-mono">
                {latestSnapshot ? latestSnapshot.title : 'No completed assessment'}
              </span>
            </div>

            {latestSnapshot && (
              <div className="text-right">
                <span className="text-xs text-neutral-400 font-mono block">Overall Mean</span>
                <span className="text-lg font-bold font-mono text-sky-400">
                  {latestSnapshot.overallMean.toFixed(1)} / 5.0
                </span>
              </div>
            )}
          </div>

          {latestSnapshot ? (
            <div className="pt-2 w-full flex flex-col items-center">
              {/* Dynamic Geometry Controller */}
              <div className="w-full mb-2 p-2.5 rounded-xl bg-neutral-950/70 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                    <span>Radar Shape:</span>
                    <span className="font-mono text-sky-400">
                      {visibleSubjects.length} Points ({visibleSubjects.length === 5 ? 'Pentagon' : visibleSubjects.length === 6 ? 'Hexagon' : `${visibleSubjects.length}-gon`})
                    </span>
                  </span>
                  {excludedSubjectIds.length > 0 && (
                    <button
                      onClick={() => setExcludedSubjectIds([])}
                      className="text-[11px] text-sky-400 hover:underline"
                    >
                      Show All ({latestSnapshot.subjects.length})
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {latestSnapshot.subjects.map((sub) => {
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
                        title={isVisible ? 'Click to exclude this course' : 'Click to include this course on the radar'}
                      >
                        {isVisible ? '✓' : '○'} {sub.subjectCode}
                      </button>
                    );
                  })}
                </div>
              </div>

              <HexagonalRadar
                subjects={visibleSubjects}
                title="Current Health"
                size={440}
                onSubjectClick={() => onNavigate('results')}
              />
            </div>
          ) : (
            <div className="text-center py-16">
              <Layers className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-neutral-300">No Assessment Active</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Take the 5-minute diagnostic wizard to visualize your six-axis academic radar polygon.
              </p>
              <button
                onClick={() => onNavigate('wizard')}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg"
              >
                Start Assessment
              </button>
            </div>
          )}
        </div>

        {/* Right: Key Academic Indicators & CSE Suite Quick Launch */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Academic Health Stats */}
          {latestSnapshot && (
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Cognitive Gap Analysis
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-800/60 border border-white/5">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Strongest Subject</span>
                  <span className="text-sm font-bold text-emerald-400 block truncate mt-0.5">
                    {latestSnapshot.gapAnalysis.highestSubject.name}
                  </span>
                  <span className="text-xs font-mono text-neutral-500">
                    {latestSnapshot.gapAnalysis.highestSubject.score.toFixed(1)} / 5.0
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-800/60 border border-white/5">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Lowest Subject</span>
                  <span className="text-sm font-bold text-red-400 block truncate mt-0.5">
                    {latestSnapshot.gapAnalysis.lowestSubject.name}
                  </span>
                  <span className="text-xs font-mono text-neutral-500">
                    {latestSnapshot.gapAnalysis.lowestSubject.score.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/60 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white block">Weakest Dimension</span>
                  <span className="text-[11px] text-neutral-400">
                    {latestSnapshot.gapAnalysis.lowestDimension.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {latestSnapshot.gapAnalysis.lowestDimension.score.toFixed(1)} / 5.0
                </span>
              </div>
            </div>
          )}

          {/* CSE Suite Shortcuts */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-sky-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  CSE Major Study Suite
                </h3>
              </div>
              <button
                onClick={() => onNavigate('cse_suite')}
                className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Full Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('cse_suite')}
                className="p-3 rounded-xl bg-neutral-800/70 hover:bg-neutral-800 text-left border border-white/5 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>DSA Roadmap</span>
                </div>
                <span className="text-[11px] text-neutral-400 block">
                  Track LeetCode problems &amp; patterns
                </span>
              </button>

              <button
                onClick={() => onNavigate('cse_suite')}
                className="p-3 rounded-xl bg-neutral-800/70 hover:bg-neutral-800 text-left border border-white/5 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Viva Voce Bank</span>
                </div>
                <span className="text-[11px] text-neutral-400 block">
                  Examiner oral questions &amp; answers
                </span>
              </button>
            </div>
          </div>

          {/* Document Vault Recent Files */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Study PDF Vault ({documents.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('vault')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onOpenDoc(doc)}
                  className="p-2.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 border border-white/5 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-xs font-semibold text-neutral-200 block truncate">
                        {doc.title}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono truncate">
                        {doc.topicTag} · {doc.subjectName}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-sky-400 font-semibold shrink-0 ml-2">
                    Open
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
