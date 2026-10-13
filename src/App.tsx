/**
 * HexaStudy — Main Application Root
 * Windows 11 Academic Proficiency Assessor, Study Workstation & Document Vault
 */

import React, { useState } from 'react';
import { Bot, MessageSquare, Sparkles, X } from 'lucide-react';
import { AiChatbot } from './components/AiChatbot';
import { AssessmentWizard } from './components/AssessmentWizard';
import { CseSuite } from './components/CseSuite';
import { DashboardView } from './components/DashboardView';
import { ActiveView, DesktopShell } from './components/DesktopShell';
import { DocumentVault } from './components/DocumentVault';
import { HistoryView } from './components/HistoryView';
import { ResultsView } from './components/ResultsView';
import { SettingsView } from './components/SettingsView';
import { SubjectManager } from './components/SubjectManager';
import { hexaStore } from './services/store';
import { AppSettings, AssessmentSnapshot, Subject, VaultDocument } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [subjects, setSubjects] = useState<Subject[]>(() => hexaStore.getSubjects());
  const [assessments, setAssessments] = useState<AssessmentSnapshot[]>(() => hexaStore.getAssessments());
  const [settings, setSettings] = useState<AppSettings>(() => hexaStore.getSettings());
  const [documents, setDocuments] = useState<VaultDocument[]>(() => hexaStore.getDocuments());

  // Comparison State
  const [currentSnapshot, setCurrentSnapshot] = useState<AssessmentSnapshot | null>(
    () => assessments[0] || null
  );
  const [comparisonSnapshot, setComparisonSnapshot] = useState<AssessmentSnapshot | null>(null);

  // Floating Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Handle Assessment Completion
  const handleAssessmentComplete = (snapshot: AssessmentSnapshot) => {
    setCurrentSnapshot(snapshot);
    setAssessments(hexaStore.getAssessments());
    setActiveView('results');
  };

  // Open Document Directly
  const handleOpenDocFromDashboard = (doc: VaultDocument) => {
    setActiveView('vault');
  };

  // View specific assessment from History
  const handleSelectHistoricalAssessment = (
    snapshot: AssessmentSnapshot,
    compare?: AssessmentSnapshot
  ) => {
    setCurrentSnapshot(snapshot);
    setComparisonSnapshot(compare || null);
    setActiveView('results');
  };

  // Reset to Demo
  const handleFullReset = () => {
    if (window.confirm('Reset all HexaStudy data to the initial CSE demo setup?')) {
      hexaStore.resetToDefaultDemo();
      setSubjects(hexaStore.getSubjects());
      setAssessments(hexaStore.getAssessments());
      setDocuments(hexaStore.getDocuments());
      setSettings(hexaStore.getSettings());
      setCurrentSnapshot(hexaStore.getAssessments()[0] || null);
      setActiveView('dashboard');
    }
  };

  return (
    <DesktopShell
      activeView={activeView}
      onNavigate={setActiveView}
      subjects={subjects}
      assessments={assessments}
      latestSnapshot={currentSnapshot}
      settings={settings}
    >
      {/* Dynamic View Router */}
      {activeView === 'dashboard' && (
        <DashboardView
          subjects={subjects}
          latestSnapshot={currentSnapshot}
          documents={documents}
          onNavigate={setActiveView}
          onOpenDoc={handleOpenDocFromDashboard}
        />
      )}

      {activeView === 'wizard' && (
        <AssessmentWizard
          subjects={subjects}
          onComplete={handleAssessmentComplete}
          onCancel={() => setActiveView('dashboard')}
        />
      )}

      {activeView === 'results' && currentSnapshot && (
        <ResultsView
          snapshot={currentSnapshot}
          comparisonSnapshot={comparisonSnapshot}
          onNewAssessment={() => setActiveView('wizard')}
          onOpenSettings={() => setActiveView('settings')}
        />
      )}

      {activeView === 'cse_suite' && <CseSuite />}

      {activeView === 'vault' && (
        <DocumentVault subjects={subjects} onOpenSettings={() => setActiveView('settings')} />
      )}

      {activeView === 'subjects' && (
        <SubjectManager subjects={subjects} onSubjectsChange={setSubjects} />
      )}

      {activeView === 'history' && (
        <HistoryView
          assessments={assessments}
          onSelectAssessment={handleSelectHistoricalAssessment}
          onAssessmentsChange={setAssessments}
        />
      )}

      {activeView === 'settings' && (
        <SettingsView onSettingsUpdated={setSettings} onFullReset={handleFullReset} />
      )}

      {/* Floating CSE AI Companion Button & Modal */}
      <div className="fixed bottom-9 right-6 z-40">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-2xl transition-all border border-purple-400/30 group hover:scale-105"
            title="Open CSE AI Academic Companion"
          >
            <Sparkles className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold">CSE Tutor Chat</span>
          </button>
        ) : (
          <div className="relative w-96 shadow-2xl">
            <div className="absolute top-3 right-3 z-50">
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <AiChatbot subjects={subjects} onClose={() => setIsChatOpen(false)} />
          </div>
        )}
      </div>
    </DesktopShell>
  );
}
