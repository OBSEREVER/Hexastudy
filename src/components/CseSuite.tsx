/**
 * HexaStudy — CSE Specialization Workstation Hub
 * Comprehensive Suite: DSA Matrix, Core CS Trees, Lab Journal, & Viva Voce Flashcards
 */

import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  MessageSquare,
  Plus,
  Server,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { hexaStore } from '../services/store';
import { CoreCsConcept, CoreCsSubject, DsaCategory, DsaTopic, LabPractical, VivaQuestion } from '../types';

export const CseSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dsa' | 'core_cs' | 'labs' | 'viva'>('dsa');

  // State from Local Store
  const [dsaTopics, setDsaTopics] = useState<DsaTopic[]>(() => hexaStore.getDsaTopics());
  const [coreCs, setCoreCs] = useState<CoreCsConcept[]>(() => hexaStore.getCoreCs());
  const [labs, setLabs] = useState<LabPractical[]>(() => hexaStore.getLabs());
  const [vivaQuestions, setVivaQuestions] = useState<VivaQuestion[]>(() => hexaStore.getVivaQuestions());

  // Filter State
  const [selectedDsaCategory, setSelectedDsaCategory] = useState<string>('all');
  const [selectedCsSubject, setSelectedCsSubject] = useState<string>('all');
  const [revealedVivaId, setRevealedVivaId] = useState<string | null>(null);

  // Quick stats
  const masteredDsa = dsaTopics.filter((t) => t.status === 'mastered').length;
  const verifiedLabs = labs.filter((l) => l.codeStatus === 'verified').length;
  const confidentViva = vivaQuestions.filter((v) => v.userConfidence === 'confident').length;

  // Toggle DSA Status
  const handleToggleDsaStatus = (id: string) => {
    const nextStatus: Record<DsaTopic['status'], DsaTopic['status']> = {
      untouched: 'revising',
      revising: 'mastered',
      mastered: 'untouched',
    };
    const updated = dsaTopics.map((t) => (t.id === id ? { ...t, status: nextStatus[t.status] } : t));
    setDsaTopics(updated);
    hexaStore.saveDsaTopics(updated);
  };

  // Increment DSA Solved Count
  const handleIncrementDsa = (id: string, amount: number) => {
    const updated = dsaTopics.map((t) =>
      t.id === id ? { ...t, solvedCount: Math.max(0, t.solvedCount + amount) } : t
    );
    setDsaTopics(updated);
    hexaStore.saveDsaTopics(updated);
  };

  // Update Core CS Readiness (0 to 5)
  const handleUpdateCoreReadiness = (id: string, readiness: number) => {
    const updated = coreCs.map((c) => (c.id === id ? { ...c, readiness } : c));
    setCoreCs(updated);
    hexaStore.saveCoreCs(updated);
  };

  // Toggle Lab Practical Code Status
  const handleToggleLabStatus = (id: string) => {
    const nextStatus: Record<LabPractical['codeStatus'], LabPractical['codeStatus']> = {
      not_started: 'written',
      written: 'compiled',
      compiled: 'verified',
      verified: 'not_started',
    };
    const updated = labs.map((l) => (l.id === id ? { ...l, codeStatus: nextStatus[l.codeStatus] } : l));
    setLabs(updated);
    hexaStore.saveLabs(updated);
  };

  // Update Viva Confidence
  const handleSetVivaConfidence = (id: string, confidence: 'unreviewed' | 'shaky' | 'confident') => {
    const updated = vivaQuestions.map((v) => (v.id === id ? { ...v, userConfidence: confidence } : v));
    setVivaQuestions(updated);
    hexaStore.saveVivaQuestions(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900/70 border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">CSE Major Specialization Suite</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Integrated tools for Computer Science undergraduates: LeetCode/DSA tracking, core CS theory (OS, DBMS, CN, COA), lab practical journal, and viva defense flashcards.
          </p>
        </div>

        {/* Quick KPI Strip */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-neutral-800/80 border border-white/5 rounded-lg text-center">
            <span className="block text-xs text-neutral-400">DSA Mastered</span>
            <span className="text-sm font-bold text-sky-400 font-mono tabular-nums">
              {masteredDsa} / {dsaTopics.length}
            </span>
          </div>

          <div className="px-3 py-2 bg-neutral-800/80 border border-white/5 rounded-lg text-center">
            <span className="block text-xs text-neutral-400">Labs Verified</span>
            <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
              {verifiedLabs} / {labs.length}
            </span>
          </div>

          <div className="px-3 py-2 bg-neutral-800/80 border border-white/5 rounded-lg text-center">
            <span className="block text-xs text-neutral-400">Viva Confident</span>
            <span className="text-sm font-bold text-purple-400 font-mono tabular-nums">
              {confidentViva} / {vivaQuestions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('dsa')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'dsa'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>DSA &amp; LeetCode Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('core_cs')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'core_cs'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Core CS Theory Trees</span>
        </button>

        <button
          onClick={() => setActiveTab('labs')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'labs'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Lab Practical Journal</span>
        </button>

        <button
          onClick={() => setActiveTab('viva')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'viva'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Viva Voce Flashcards</span>
        </button>
      </div>

      {/* TAB 1: DSA MATRIX */}
      {activeTab === 'dsa' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-neutral-900/40 rounded-xl border border-white/5 text-xs text-neutral-400">
            <span>
              Click on status badge to cycle: <strong className="text-neutral-300">Untouched → Revising → Mastered</strong>. Increment solved problems to track coding consistency.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dsaTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-4 rounded-xl bg-neutral-900/60 border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] text-neutral-400 font-mono">{topic.category}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        topic.difficulty === 'Easy'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : topic.difficulty === 'Medium'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                          : 'bg-red-950/60 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {topic.difficulty}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white leading-snug">{topic.name}</h4>
                  <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                    Platform: {topic.platform}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  {/* Status Button */}
                  <button
                    onClick={() => handleToggleDsaStatus(topic.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                      topic.status === 'mastered'
                        ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-700/50'
                        : topic.status === 'revising'
                        ? 'bg-sky-950/70 text-sky-300 border border-sky-700/50'
                        : 'bg-neutral-800 text-neutral-400 border border-white/5'
                    }`}
                  >
                    {topic.status === 'mastered'
                      ? '✓ Mastered'
                      : topic.status === 'revising'
                      ? '↻ Revising'
                      : '○ Untouched'}
                  </button>

                  {/* Problem Count Stepper */}
                  <div className="flex items-center gap-1.5 bg-neutral-800/80 px-2 py-0.5 rounded border border-white/5">
                    <span className="text-xs font-mono tabular-nums text-neutral-200">
                      {topic.solvedCount} solved
                    </span>
                    <button
                      onClick={() => handleIncrementDsa(topic.id, 1)}
                      className="w-5 h-5 flex items-center justify-center text-xs text-neutral-400 hover:text-white hover:bg-neutral-700 rounded"
                      title="Add 1 solved problem"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CORE CS THEORY */}
      {activeTab === 'core_cs' && (
        <div className="space-y-4">
          <div className="p-3 bg-neutral-900/40 rounded-xl border border-white/5 text-xs text-neutral-400">
            <span>
              High-yield university exam topics across Operating Systems, DBMS, Computer Networks, and Architecture. Rate your conceptual readiness from 0.0 to 5.0.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreCs.map((concept) => (
              <div
                key={concept.id}
                className="p-4 rounded-xl bg-neutral-900/60 border border-white/5 hover:border-white/15 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/40">
                      {concept.subject}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">{concept.subjectTitle}</span>
                  </div>

                  {concept.vivaFrequent && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/30 px-2 py-0.5 rounded">
                      Frequent Viva Topic
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-white mt-1">{concept.topic}</h4>

                <ul className="mt-2.5 space-y-1 text-xs text-neutral-400">
                  {concept.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-sky-400 font-bold">·</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Readiness Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleUpdateCoreReadiness(concept.id, star)}
                        className={`w-6 h-6 text-xs font-mono font-bold rounded transition-colors ${
                          concept.readiness >= star
                            ? 'bg-sky-500 text-white'
                            : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                    <span className="text-xs font-mono tabular-nums text-neutral-300 ml-1.5">
                      {concept.readiness.toFixed(1)}/5.0
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LAB PRACTICAL JOURNAL */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          <div className="p-3 bg-neutral-900/40 rounded-xl border border-white/5 text-xs text-neutral-400">
            <span>
              Track university lab assignment code compilation, GCC/Python output verification, and viva preparation. Click on status badge to update.
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3">Exp #</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Assignment Title</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Code Status</th>
                  <th className="p-3">Viva Ready</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300">
                {labs.map((lab) => (
                  <tr key={lab.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-400">Exp {lab.experimentNo}</td>
                    <td className="p-3 font-medium text-white">{lab.subjectName}</td>
                    <td className="p-3 max-w-sm leading-relaxed">{lab.title}</td>
                    <td className="p-3 font-mono text-neutral-400">{lab.language}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleLabStatus(lab.id)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                          lab.codeStatus === 'verified'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : lab.codeStatus === 'compiled'
                            ? 'bg-sky-950 text-sky-400 border border-sky-800'
                            : lab.codeStatus === 'written'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {lab.codeStatus.replace('_', ' ')}
                      </button>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          lab.vivaPrepared ? 'text-emerald-400' : 'text-neutral-500'
                        }`}
                      >
                        {lab.vivaPrepared ? '✓ Prepared' : '○ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VIVA VOCE FLASHCARDS */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="p-3 bg-neutral-900/40 rounded-xl border border-white/5 text-xs text-neutral-400">
            <span>
              Real viva voce questions commonly asked by college professors and lab examiners. Click a question card to reveal the model answer and keywords.
            </span>
          </div>

          <div className="space-y-3">
            {vivaQuestions.map((vq) => {
              const isRevealed = revealedVivaId === vq.id;
              return (
                <div
                  key={vq.id}
                  className="p-4 rounded-xl bg-neutral-900/60 border border-white/5 hover:border-white/15 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-mono text-sky-400 font-semibold">
                          {vq.subjectName} ({vq.subjectCode})
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white leading-snug">{vq.question}</h4>
                    </div>

                    <button
                      onClick={() => setRevealedVivaId(isRevealed ? null : vq.id)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 rounded-lg flex items-center gap-1 shrink-0"
                    >
                      <span>{isRevealed ? 'Hide Answer' : 'Reveal Answer'}</span>
                      {isRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5">
                      <div className="p-3 bg-neutral-950/70 rounded-lg border border-white/5 text-xs text-neutral-300 leading-relaxed">
                        <span className="font-semibold text-emerald-400 block mb-1">Model Answer:</span>
                        {vq.answer}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
                        <span className="text-[11px] text-neutral-500">Key Keywords to Say:</span>
                        {vq.keyKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[11px] bg-neutral-800 text-sky-300 rounded font-mono"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs">
                        <span className="text-neutral-400">Your Confidence:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSetVivaConfidence(vq.id, 'shaky')}
                            className={`px-2.5 py-1 rounded text-xs transition-colors ${
                              vq.userConfidence === 'shaky'
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                            }`}
                          >
                            Need Revision
                          </button>
                          <button
                            onClick={() => handleSetVivaConfidence(vq.id, 'confident')}
                            className={`px-2.5 py-1 rounded text-xs transition-colors ${
                              vq.userConfidence === 'confident'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                            }`}
                          >
                            Confident
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
