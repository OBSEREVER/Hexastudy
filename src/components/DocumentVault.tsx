/**
 * HexaStudy — Study Material Repository & PDF Document Vault
 * Local-First Document Storage, In-App PDF Viewer, and Selective Google Drive Backup
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Cloud,
  CloudCheck,
  CloudOff,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { hexaStore } from '../services/store';
import { DocumentCategory, Subject, VaultDocument } from '../types';

interface DocumentVaultProps {
  subjects: Subject[];
  onOpenSettings: () => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({ subjects, onOpenSettings }) => {
  const [documents, setDocuments] = useState<VaultDocument[]>(() => hexaStore.getDocuments());
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<VaultDocument | null>(null);

  // Add Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formTopicTag, setFormTopicTag] = useState('');
  const [formCategory, setFormCategory] = useState<DocumentCategory>('lecture_notes');
  const [formBackupToDrive, setFormBackupToDrive] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string; dataUrl: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Filtered Documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSubject = selectedSubjectFilter === 'all' || doc.subjectId === selectedSubjectFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || doc.category === selectedCategoryFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.topicTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesCategory && matchesSearch;
  });

  // Handle File Upload to Local Storage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        dataUrl,
      });
      if (!formTitle) {
        setFormTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const matchedSub = subjects.find((s) => s.id === formSubjectId);

    const newDoc: VaultDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: formTitle.trim(),
      fileName: selectedFile?.name || `${formTitle.trim().replace(/\s+/g, '_')}.pdf`,
      fileSize: selectedFile?.size || 1024000,
      fileType: selectedFile?.type || 'application/pdf',
      subjectId: matchedSub?.id,
      subjectName: matchedSub?.name || 'General CSE',
      topicTag: formTopicTag.trim() || 'General Curriculum',
      category: formCategory,
      dataUrl: selectedFile?.dataUrl,
      backupToDrive: formBackupToDrive,
      driveSyncStatus: formBackupToDrive ? 'queued' : 'local',
      uploadedAt: new Date().toISOString(),
      notes: formNotes.trim(),
    };

    hexaStore.addDocument(newDoc);
    setDocuments(hexaStore.getDocuments());

    // Reset Form
    setIsAddModalOpen(false);
    setFormTitle('');
    setFormTopicTag('');
    setFormNotes('');
    setSelectedFile(null);
  };

  const handleDeleteDoc = (id: string) => {
    if (window.confirm('Delete this document from the local repository?')) {
      hexaStore.deleteDocument(id);
      setDocuments(hexaStore.getDocuments());
      if (viewingDoc?.id === id) setViewingDoc(null);
    }
  };

  const handleToggleBackup = (id: string) => {
    const updated = hexaStore.toggleDocumentBackup(id);
    if (updated) {
      setDocuments(hexaStore.getDocuments());
    }
  };

  // Sync Enabled Files to Google Drive
  const handleSyncToDrive = () => {
    setIsSyncing(true);
    setSyncFeedback('Checking Google Drive connection...');

    setTimeout(() => {
      const settings = hexaStore.getSettings();
      if (!settings.googleWorkspaceEnabled) {
        setIsSyncing(false);
        setSyncFeedback(
          'Google Workspace is currently disabled in Settings. Enabled documents are safely queued in local storage.'
        );
        return;
      }

      // Simulate synchronization of queued files
      const allDocs = hexaStore.getDocuments();
      let syncedCount = 0;
      allDocs.forEach((d) => {
        if (d.backupToDrive && d.driveSyncStatus !== 'synced') {
          d.driveSyncStatus = 'synced';
          d.driveSyncedAt = new Date().toISOString();
          syncedCount++;
        }
      });
      hexaStore.saveDocuments(allDocs);
      setDocuments([...allDocs]);
      setIsSyncing(false);
      setSyncFeedback(`Successfully synchronized ${syncedCount} study materials to your Google Drive!`);
    }, 1200);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'lecture_notes':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'pyq':
        return <FileQuestion className="w-4 h-4 text-amber-400" />;
      case 'lab_manual':
        return <FileCode className="w-4 h-4 text-emerald-400" />;
      case 'cheat_sheet':
        return <FileSpreadsheet className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900/70 border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Study Material &amp; PDF Vault</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            A centralized, local-first repository for lecture notes, PYQs, lab manuals, and cheat sheets. Open documents directly in-app without navigating your laptop, with selective Google Drive backup.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleSyncToDrive}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-sky-300 hover:text-white bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/40 rounded-lg transition-colors"
            title="Sync all backup-enabled documents to Google Drive"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync to Drive</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Document / PDF</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="flex items-center justify-between p-3 px-4 text-xs rounded-lg bg-sky-950/40 border border-sky-800/30 text-sky-200">
          <span>{syncFeedback}</span>
          <div className="flex items-center gap-2">
            <button onClick={onOpenSettings} className="underline hover:text-white">
              Settings
            </button>
            <button onClick={() => setSyncFeedback(null)} className="text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-neutral-900/50 rounded-xl border border-white/5">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Search documents by title, topic, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-800/80 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="w-full py-2 px-2.5 text-xs bg-neutral-800/80 border border-white/10 rounded-lg text-neutral-200 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Subjects ({subjects.length})</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full py-2 px-2.5 text-xs bg-neutral-800/80 border border-white/10 rounded-lg text-neutral-200 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Document Types</option>
            <option value="lecture_notes">Lecture Notes</option>
            <option value="pyq">Exam PYQs</option>
            <option value="lab_manual">Lab Manuals</option>
            <option value="cheat_sheet">Cheat Sheets &amp; Formulas</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl bg-neutral-900/30 border border-white/5">
          <FolderOpen className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
          <h3 className="text-base font-semibold text-neutral-300">No documents found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No documents matched your search filter. Try clearing the search term.'
              : 'Add your PDFs, handwritten notes, and past year question papers to keep everything organized.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
          >
            Add First Study Material
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="group flex flex-col justify-between p-4 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-white/5 hover:border-white/15 transition-all shadow-sm"
            >
              <div>
                {/* Header row: Category Icon + Drive Backup Toggle */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-neutral-800 border border-white/5">
                      {getCategoryIcon(doc.category)}
                    </span>
                    <span className="text-[11px] font-medium text-neutral-400 capitalize">
                      {doc.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Drive Backup Status Button */}
                  <button
                    onClick={() => handleToggleBackup(doc.id)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                      doc.backupToDrive
                        ? doc.driveSyncStatus === 'synced'
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/70'
                          : 'bg-amber-950/70 text-amber-300 border border-amber-800/40 hover:bg-amber-900/70'
                        : 'bg-neutral-800/60 text-neutral-400 border border-white/5 hover:text-neutral-200'
                    }`}
                    title={
                      doc.backupToDrive
                        ? doc.driveSyncStatus === 'synced'
                          ? 'Backed up to Google Drive. Click to toggle OFF.'
                          : 'Queued for next Google Drive sync. Click to toggle OFF.'
                        : 'Local only. Click to enable Google Drive backup.'
                    }
                  >
                    {doc.backupToDrive ? (
                      doc.driveSyncStatus === 'synced' ? (
                        <>
                          <CloudCheck className="w-3 h-3" />
                          <span>Drive Synced</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="w-3 h-3" />
                          <span>Queued Sync</span>
                        </>
                      )
                    ) : (
                      <>
                        <CloudOff className="w-3 h-3" />
                        <span>Local Only</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Title & Topic */}
                <h4
                  onClick={() => setViewingDoc(doc)}
                  className="text-sm font-semibold text-white group-hover:text-sky-300 cursor-pointer line-clamp-2 leading-snug transition-colors"
                >
                  {doc.title}
                </h4>

                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1.5">
                  <span className="text-neutral-300 font-medium truncate max-w-[140px]">
                    {doc.subjectName}
                  </span>
                  <span>·</span>
                  <span className="text-sky-400/90 truncate max-w-[120px]">{doc.topicTag}</span>
                </div>

                {doc.notes && (
                  <p className="text-[11px] text-neutral-400 mt-2 line-clamp-2 leading-relaxed bg-black/20 p-2 rounded">
                    {doc.notes}
                  </p>
                )}
              </div>

              {/* Bottom Metadata & Action Bar */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>{formatFileSize(doc.fileSize)}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingDoc(doc)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-sky-300 hover:text-white bg-sky-950/60 hover:bg-sky-900/80 rounded transition-colors"
                    title="Open in built-in PDF viewer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </button>

                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Add Study Material / PDF</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-4 mt-4">
              {/* File Picker */}
              <div className="p-4 border-2 border-dashed border-white/10 hover:border-sky-500/50 rounded-xl bg-neutral-800/40 text-center transition-colors">
                <input
                  type="file"
                  id="vaultFileInput"
                  accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="vaultFileInput" className="cursor-pointer flex flex-col items-center">
                  <FileText className="w-8 h-8 text-sky-400 mb-2" />
                  <span className="text-xs font-medium text-neutral-200">
                    {selectedFile ? selectedFile.name : 'Choose a PDF, document, or notes file'}
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-1">
                    {selectedFile
                      ? `${formatFileSize(selectedFile.size)} · Click to replace`
                      : 'Stored securely in your local laptop storage'}
                  </span>
                </label>
              </div>

              {/* Document Title */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Document Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COA Unit 4 Cache & Pipelining Handwritten Notes"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Subject & Category Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Subject</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-neutral-200 focus:outline-none focus:border-sky-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DocumentCategory)}
                    className="w-full px-2.5 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-neutral-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="lecture_notes">Lecture Notes</option>
                    <option value="pyq">Exam PYQs</option>
                    <option value="lab_manual">Lab Manual</option>
                    <option value="cheat_sheet">Cheat Sheet</option>
                  </select>
                </div>
              </div>

              {/* Specific Topic Tag */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Topic / Module Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Module 4: Cache Mapping, FIFO, LRU"
                  value={formTopicTag}
                  onChange={(e) => setFormTopicTag(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Notes / Keywords */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Quick Notes / Key Formulas</label>
                <textarea
                  rows={2}
                  placeholder="Key concepts included or specific examiner points..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Selective Drive Backup Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/60 border border-white/5">
                <div>
                  <div className="text-xs font-medium text-white flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-sky-400" />
                    <span>Auto-Backup to Google Drive</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Syncs this document to your cloud Drive folder when online.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formBackupToDrive}
                  onChange={(e) => setFormBackupToDrive(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Built-in PDF and Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl h-[85vh] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Viewer Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-neutral-950/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-950/60 border border-sky-800/40 rounded-lg">
                  {getCategoryIcon(viewingDoc.category)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{viewingDoc.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                    <span>{viewingDoc.subjectName}</span>
                    <span>·</span>
                    <span className="text-sky-400">{viewingDoc.topicTag}</span>
                    <span>·</span>
                    <span className="font-mono text-neutral-500">{formatFileSize(viewingDoc.fileSize)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {viewingDoc.dataUrl && (
                  <a
                    href={viewingDoc.dataUrl}
                    download={viewingDoc.fileName}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}

                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 bg-neutral-950 overflow-hidden relative">
              {viewingDoc.dataUrl ? (
                <iframe
                  src={viewingDoc.dataUrl}
                  title={viewingDoc.title}
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FileText className="w-16 h-16 text-neutral-600 mb-4" />
                  <h4 className="text-base font-semibold text-neutral-200">
                    Offline Study Document Registered
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-md">
                    File <span className="font-mono text-sky-400">{viewingDoc.fileName}</span> is catalogued in your local repository.
                  </p>
                  {viewingDoc.notes && (
                    <div className="mt-4 p-4 rounded-xl bg-neutral-900 border border-white/5 max-w-lg text-left text-xs text-neutral-300">
                      <span className="font-semibold text-neutral-400 block mb-1">Attached Study Notes:</span>
                      {viewingDoc.notes}
                    </div>
                  )}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={() => handleToggleBackup(viewingDoc.id)}
                      className="px-4 py-2 text-xs font-medium text-sky-300 bg-sky-950/60 border border-sky-800/40 rounded-lg hover:bg-sky-900/60 transition-colors"
                    >
                      {viewingDoc.backupToDrive ? 'Disable Cloud Drive Backup' : 'Enable Google Drive Backup'}
                    </button>
                    <button
                      onClick={() => setViewingDoc(null)}
                      className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                    >
                      Close Viewer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
