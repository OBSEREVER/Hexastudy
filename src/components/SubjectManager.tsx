/**
 * HexaStudy — Subject & Syllabus Management
 * Add, Edit, Reorder, Delete, Chapter Checklists, and JSON/CSV Import/Export
 */

import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Download,
  Edit2,
  FileDown,
  FileUp,
  GraduationCap,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { DEFAULT_CSE_SUBJECTS, hexaStore } from '../services/store';
import { Chapter, Subject } from '../types';

interface SubjectManagerProps {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({ subjects, onSubjectsChange }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);
  const [isEditSubjectModal, setIsEditSubjectModal] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formSemester, setFormSemester] = useState(4);
  const [formExamDate, setFormExamDate] = useState('');
  const [formTargetGrade, setFormTargetGrade] = useState('A');

  // Chapter Add State
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterWeightage, setNewChapterWeightage] = useState<'High' | 'Medium' | 'Low'>('High');

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Reordering
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= subjects.length) return;
    const copy = [...subjects];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);
    onSubjectsChange(copy);
    hexaStore.saveSubjects(copy);
  };

  // Add Subject
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newSub: Subject = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: formName.trim(),
      code: formCode.trim() || 'CS-101',
      semester: formSemester,
      examDate: formExamDate || undefined,
      targetGrade: formTargetGrade,
      chapters: [],
      isPreloaded: false,
    };

    const updated = [...subjects, newSub];
    onSubjectsChange(updated);
    hexaStore.saveSubjects(updated);
    setSelectedSubjectId(newSub.id);
    setIsAddSubjectModal(false);
    setFormName('');
    setFormCode('');
  };

  // Delete Subject
  const handleDeleteSubject = (id: string) => {
    if (subjects.length <= 1) {
      alert('You must keep at least 1 subject in your curriculum.');
      return;
    }
    if (window.confirm('Remove this subject from your active study curriculum?')) {
      const updated = subjects.filter((s) => s.id !== id);
      onSubjectsChange(updated);
      hexaStore.saveSubjects(updated);
      setSelectedSubjectId(updated[0]?.id || '');
    }
  };

  // Toggle Chapter Completion
  const handleToggleChapter = (chapterId: string) => {
    if (!selectedSubject) return;
    const updatedChapters = selectedSubject.chapters.map((ch) =>
      ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch
    );
    const updatedSubjects = subjects.map((s) =>
      s.id === selectedSubject.id ? { ...s, chapters: updatedChapters } : s
    );
    onSubjectsChange(updatedSubjects);
    hexaStore.saveSubjects(updatedSubjects);
  };

  // Add Chapter to Selected Subject
  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim() || !selectedSubject) return;

    const newCh: Chapter = {
      id: `ch_${Date.now()}`,
      title: newChapterTitle.trim(),
      completed: false,
      weightage: newChapterWeightage,
    };

    const updatedChapters = [...selectedSubject.chapters, newCh];
    const updatedSubjects = subjects.map((s) =>
      s.id === selectedSubject.id ? { ...s, chapters: updatedChapters } : s
    );
    onSubjectsChange(updatedSubjects);
    hexaStore.saveSubjects(updatedSubjects);
    setNewChapterTitle('');
  };

  // Delete Chapter
  const handleDeleteChapter = (chapterId: string) => {
    if (!selectedSubject) return;
    const updatedChapters = selectedSubject.chapters.filter((ch) => ch.id !== chapterId);
    const updatedSubjects = subjects.map((s) =>
      s.id === selectedSubject.id ? { ...s, chapters: updatedChapters } : s
    );
    onSubjectsChange(updatedSubjects);
    hexaStore.saveSubjects(updatedSubjects);
  };

  // Reset to Demo Subjects
  const handleResetDemo = () => {
    if (window.confirm('Reset subjects to the 6 preloaded CSE Semester defaults?')) {
      onSubjectsChange(DEFAULT_CSE_SUBJECTS);
      hexaStore.saveSubjects(DEFAULT_CSE_SUBJECTS);
      setSelectedSubjectId(DEFAULT_CSE_SUBJECTS[0].id);
    }
  };

  // Export Subjects to JSON
  const handleExportSubjects = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(subjects, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `hexastudy-syllabus-${Date.now()}.json`);
    dlAnchorElem.click();
  };

  // Import Subjects from JSON
  const handleImportSubjects = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onSubjectsChange(parsed);
          hexaStore.saveSubjects(parsed);
          setSelectedSubjectId(parsed[0].id);
          alert(`Successfully imported ${parsed.length} subjects!`);
        }
      } catch (err: any) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900/70 border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Subject &amp; Syllabus Manager</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Configure your active course catalog. Add, reorder, or customize syllabus modules. HexaStudy supports 6 default subjects or any dynamic count.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg cursor-pointer transition-colors">
            <FileUp className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportSubjects} className="hidden" />
          </label>

          <button
            onClick={handleExportSubjects}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/60 border border-amber-800/40 rounded-lg transition-colors"
            title="Reset to the 6 official CSE sample subjects"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={() => setIsAddSubjectModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Subject List, Right Syllabus Chapters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Subjects Reorder List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span>Subject Queue ({subjects.length} active)</span>
            <span>Click to view chapters</span>
          </div>

          <div className="space-y-2">
            {subjects.map((sub, idx) => {
              const isSelected = sub.id === selectedSubject?.id;
              const completedCount = sub.chapters.filter((c) => c.completed).length;

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-neutral-800 border-sky-500/80 shadow-md ring-1 ring-sky-500/20'
                      : 'bg-neutral-900/60 hover:bg-neutral-800/70 border-white/5 text-neutral-300'
                  }`}
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-sky-400">
                        {sub.code}
                      </span>
                      {sub.isPreloaded && (
                        <span className="text-[10px] text-neutral-400 px-1.5 rounded bg-neutral-950 border border-white/5">
                          Demo
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-0.5 line-clamp-1">
                      {sub.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1 font-mono">
                      <span>Sem {sub.semester}</span>
                      <span>·</span>
                      <span>{completedCount}/{sub.chapters.length} chapters done</span>
                    </div>
                  </div>

                  {/* Reorder and Delete Controls */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === subjects.length - 1}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(sub.id)}
                      className="p-1 text-neutral-500 hover:text-red-400 ml-1"
                      title="Delete subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Syllabus Chapters for Selected Subject */}
        {selectedSubject && (
          <div className="lg:col-span-7 p-6 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">
                  {selectedSubject.code} · Semester {selectedSubject.semester}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedSubject.name}</h3>
                {selectedSubject.examDate && (
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>Target Exam: {selectedSubject.examDate}</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-xs text-neutral-400 block">Syllabus Completion</span>
                <span className="text-lg font-bold font-mono text-sky-400">
                  {selectedSubject.chapters.length > 0
                    ? Math.round(
                        (selectedSubject.chapters.filter((c) => c.completed).length /
                          selectedSubject.chapters.length) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>

            {/* Chapters Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-300 block">
                Syllabus Chapters ({selectedSubject.chapters.length}):
              </span>

              {selectedSubject.chapters.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-4">
                  No syllabus chapters entered for this course yet. Add chapter units below.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedSubject.chapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      className="p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-white/5 flex items-center justify-between transition-colors"
                    >
                      <div
                        onClick={() => handleToggleChapter(ch.id)}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        {ch.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-500 shrink-0" />
                        )}
                        <span
                          className={`text-xs ${
                            ch.completed ? 'text-neutral-400 line-through' : 'text-neutral-200'
                          }`}
                        >
                          Unit {idx + 1}: {ch.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {ch.weightage && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              ch.weightage === 'High'
                                ? 'bg-red-950/60 text-red-300 border border-red-800/40'
                                : ch.weightage === 'Medium'
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                                : 'bg-neutral-900 text-neutral-400'
                            }`}
                          >
                            {ch.weightage} Weight
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteChapter(ch.id)}
                          className="text-neutral-500 hover:text-red-400 p-1"
                          title="Delete chapter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Chapter Form */}
            <form onSubmit={handleAddChapter} className="pt-4 border-t border-white/10 space-y-3">
              <span className="text-xs font-semibold text-neutral-300 block">Add New Syllabus Unit:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Unit 5: Graph Theory, Dijkstra & Minimum Spanning Trees"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />

                <select
                  value={newChapterWeightage}
                  onChange={(e) => setNewChapterWeightage(e.target.value as any)}
                  className="px-2.5 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-neutral-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="High">High Weight</option>
                  <option value="Medium">Medium Weight</option>
                  <option value="Low">Low Weight</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shrink-0"
                >
                  Add Unit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      {isAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Add New Academic Subject</h3>
              <button
                onClick={() => setIsAddSubjectModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Subject Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Theory of Computation & Automata"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. KCS-501"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formSemester}
                    onChange={(e) => setFormSemester(parseInt(e.target.value) || 4)}
                    className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Exam Date (Optional)</label>
                  <input
                    type="date"
                    value={formExamDate}
                    onChange={(e) => setFormExamDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-neutral-300 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Target Grade</label>
                  <select
                    value={formTargetGrade}
                    onChange={(e) => setFormTargetGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-neutral-300 focus:outline-none focus:border-sky-500"
                  >
                    <option value="A+">A+ (Top Tier)</option>
                    <option value="A">A (Excellence)</option>
                    <option value="B+">B+ (Good)</option>
                    <option value="B">B (Passing)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModal(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
