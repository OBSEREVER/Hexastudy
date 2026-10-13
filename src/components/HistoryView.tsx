/**
 * HexaStudy — Assessment History & Longitudinal Comparison
 * Compare Historical Snapshots, Track Subject & Dimension Regressions/Improvements
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  GitCompare,
  History,
  Layers,
  Minus,
  Trash2,
} from 'lucide-react';
import { HexagonalRadar } from './HexagonalRadar';
import { hexaStore } from '../services/store';
import { AssessmentSnapshot, DIMENSIONS, DimensionKey } from '../types';

interface HistoryViewProps {
  assessments: AssessmentSnapshot[];
  onSelectAssessment: (snapshot: AssessmentSnapshot, compareSnapshot?: AssessmentSnapshot) => void;
  onAssessmentsChange: (updated: AssessmentSnapshot[]) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  assessments,
  onSelectAssessment,
  onAssessmentsChange,
}) => {
  const [selectedAId, setSelectedAId] = useState<string>(assessments[0]?.id || '');
  const [selectedBId, setSelectedBId] = useState<string>(assessments[1]?.id || '');

  const assessmentA = assessments.find((a) => a.id === selectedAId) || assessments[0];
  const assessmentB = assessments.find((a) => a.id === selectedBId);

  // Delete Assessment
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this saved assessment snapshot from history?')) {
      hexaStore.deleteAssessment(id);
      const updated = hexaStore.getAssessments();
      onAssessmentsChange(updated);
      if (selectedAId === id) setSelectedAId(updated[0]?.id || '');
    }
  };

  // Export Assessment JSON
  const handleExportJSON = (snapshot: AssessmentSnapshot, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `hexastudy-snapshot-${snapshot.id}.json`);
    dlAnchorElem.click();
  };

  // Compute Delta between Assessment A and Assessment B
  const computeSubjectDeltas = () => {
    if (!assessmentA || !assessmentB) return [];

    return assessmentA.subjects.map((subA) => {
      const subB = assessmentB.subjects.find((b) => b.subjectId === subA.subjectId || b.subjectCode === subA.subjectCode);
      const prevScore = subB?.score ?? null;
      const delta = prevScore !== null ? Number((subA.score - prevScore).toFixed(2)) : null;

      return {
        subjectId: subA.subjectId,
        subjectName: subA.subjectName,
        subjectCode: subA.subjectCode,
        currentScore: subA.score,
        previousScore: prevScore,
        delta,
      };
    });
  };

  const subjectDeltas = computeSubjectDeltas();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900/70 border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Assessment History &amp; Comparison</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Longitudinal records of all past evaluations. Compare any two diagnostic sessions to track subject mastery improvements or exam regressions.
          </p>
        </div>

        <div className="text-xs text-neutral-400 font-mono">
          Total Sessions Stored: <strong className="text-white">{assessments.length}</strong>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-16 p-4 rounded-2xl bg-neutral-900/40 border border-white/5">
          <History className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-300">No Assessment Snapshots Saved</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Complete your first diagnostic interview wizard to begin logging longitudinal history.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Historical List */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-semibold text-neutral-400 block px-1">
              Select Snapshot to Inspect or Compare:
            </span>

            <div className="space-y-2.5">
              {assessments.map((a) => {
                const isSelectedA = a.id === selectedAId;
                const isSelectedB = a.id === selectedBId;

                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAId(a.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelectedA
                        ? 'bg-neutral-800 border-sky-500 shadow-md ring-1 ring-sky-500/20'
                        : isSelectedB
                        ? 'bg-neutral-800/70 border-amber-500/60'
                        : 'bg-neutral-900/60 hover:bg-neutral-800/60 border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-neutral-400">
                            {new Date(a.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {a.isDemo && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-400 border border-white/5">
                              Sample Demo
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white mt-0.5">{a.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 font-mono">
                          <span>{a.subjects.length} Subjects</span>
                          <span>·</span>
                          <span className="text-sky-400 font-bold">
                            Mean: {a.overallMean.toFixed(1)} / 5.0
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectAssessment(a)}
                          className="p-1.5 text-xs text-sky-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded"
                          title="Open full Results view"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleExportJSON(a, e)}
                          className="p-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded"
                          title="Export snapshot as JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(a.id, e)}
                          className="p-1.5 text-xs text-neutral-500 hover:text-red-400 bg-neutral-800 hover:bg-neutral-700 rounded"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Head-to-Head Comparison Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Compare Against Baseline</h3>
                </div>

                {/* Comparison Selector Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Compare With:</span>
                  <select
                    value={selectedBId}
                    onChange={(e) => setSelectedBId(e.target.value)}
                    className="py-1.5 px-2.5 text-xs bg-neutral-800 border border-white/10 rounded-lg text-neutral-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="">None (Single Radar Only)</option>
                    {assessments
                      .filter((a) => a.id !== selectedAId)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title} ({new Date(a.timestamp).toLocaleDateString()})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Dual-Overlay Radar Chart */}
              {assessmentA && (
                <div className="flex flex-col items-center justify-center pt-2">
                  <HexagonalRadar
                    subjects={assessmentA.subjects}
                    compareSubjects={assessmentB?.subjects}
                    title={assessmentA.title}
                    compareTitle={assessmentB?.title || 'Baseline'}
                    size={420}
                  />
                </div>
              )}

              {/* Delta Comparison Table */}
              {assessmentB && subjectDeltas.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <span className="text-xs font-bold text-neutral-300 block">
                    Subject Score Delta Breakdown:
                  </span>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-neutral-950/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                        <tr>
                          <th className="p-3">Subject</th>
                          <th className="p-3 text-right">Primary</th>
                          <th className="p-3 text-right">Baseline</th>
                          <th className="p-3 text-right">Growth / Regression</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-neutral-300 font-mono">
                        {subjectDeltas.map((row) => (
                          <tr key={row.subjectId} className="hover:bg-neutral-800/30">
                            <td className="p-3 font-sans font-medium text-white">
                              {row.subjectName} ({row.subjectCode})
                            </td>
                            <td className="p-3 text-right tabular-nums">{row.currentScore.toFixed(1)}</td>
                            <td className="p-3 text-right tabular-nums text-neutral-400">
                              {row.previousScore !== null ? row.previousScore.toFixed(1) : '-'}
                            </td>
                            <td className="p-3 text-right">
                              {row.delta !== null ? (
                                <span
                                  className={`inline-flex items-center gap-0.5 font-bold ${
                                    row.delta > 0
                                      ? 'text-emerald-400'
                                      : row.delta < 0
                                      ? 'text-red-400'
                                      : 'text-neutral-400'
                                  }`}
                                >
                                  {row.delta > 0 ? (
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  ) : row.delta < 0 ? (
                                    <ArrowDownRight className="w-3.5 h-3.5" />
                                  ) : (
                                    <Minus className="w-3.5 h-3.5" />
                                  )}
                                  {row.delta > 0 ? `+${row.delta.toFixed(1)}` : row.delta.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-neutral-500">New Subject</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-neutral-400 italic">
                    Note: Changes below ±0.3 typically reflect subtle day-to-day self-reporting variance, whereas shifts &ge; ±0.5 represent meaningful academic progress or regression.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
