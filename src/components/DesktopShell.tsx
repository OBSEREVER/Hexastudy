/**
 * HexaStudy — Windows 11 Fluent Desktop Shell
 * Authentic Title Bar with Window Controls, Fluent Mica Navigation, and System Status Bar
 */

import React, { useState } from 'react';
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Code2,
  FolderOpen,
  GraduationCap,
  HardDrive,
  HelpCircle,
  History,
  Info,
  Layers,
  LayoutDashboard,
  Maximize2,
  Minimize2,
  Minus,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { AppSettings, AssessmentSnapshot, Subject } from '../types';

export type ActiveView =
  | 'dashboard'
  | 'wizard'
  | 'results'
  | 'cse_suite'
  | 'vault'
  | 'subjects'
  | 'history'
  | 'settings';

interface DesktopShellProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  subjects: Subject[];
  assessments: AssessmentSnapshot[];
  latestSnapshot: AssessmentSnapshot | null;
  settings: AppSettings;
  children: React.ReactNode;
}

export const DesktopShell: React.FC<DesktopShellProps> = ({
  activeView,
  onNavigate,
  subjects,
  assessments,
  latestSnapshot,
  settings,
  children,
}) => {
  const [isMaximized, setIsMaximized] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosePromptOpen, setIsClosePromptOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wizard', label: 'New Assessment', icon: Plus, badge: '5-Dim' },
    { id: 'results', label: 'Radar & Reports', icon: Layers },
    { id: 'cse_suite', label: 'CSE Major Suite', icon: Code2, highlight: true },
    { id: 'vault', label: 'Study PDF Vault', icon: FolderOpen, count: true },
    { id: 'subjects', label: 'Subjects & Syllabus', icon: GraduationCap },
    { id: 'history', label: 'History & Compare', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#1c1c1c] text-white overflow-hidden select-none font-sans">
      {/* WINDOWS 11 TITLE BAR */}
      <header className="h-9 bg-[#181818] border-b border-white/5 flex items-center justify-between px-3 text-xs z-50 shrink-0 window-titlebar">
        {/* Left: Window Icon, App Wordmark & Menus */}
        <div className="flex items-center gap-3">
          {/* App Icon: Hexagonal Academic Crest */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-5 h-5 rounded bg-sky-600 flex items-center justify-center shadow-sm">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-xs tracking-tight text-white font-display">
              HexaStudy
            </span>
          </div>

          <span className="text-white/20">|</span>

          {/* Windows Desktop File Menus */}
          <nav className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-400">
            <button
              onClick={() => onNavigate('wizard')}
              className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors"
            >
              File
            </button>
            <button
              onClick={() => onNavigate('subjects')}
              className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onNavigate('results')}
              className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors"
            >
              View
            </button>
            <button
              onClick={() => onNavigate('cse_suite')}
              className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors text-sky-400"
            >
              CSE Suite
            </button>
            <button
              onClick={() => onNavigate('vault')}
              className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors text-emerald-400"
            >
              PDF Vault
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors"
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Center: Active Window Title / Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
          <span className="text-neutral-300 font-semibold">HexaStudy Workstation</span>
          <span>·</span>
          <span>Windows 11 Local-First Edition</span>
          <span>·</span>
          <span className="text-sky-400 capitalize">{activeView.replace('_', ' ')}</span>
        </div>

        {/* Right: Window Controls (Minimize, Maximize, Close) */}
        <div className="flex items-center h-full window-control-btn">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-11 h-9 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-11 h-9 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isMaximized ? 'Restore Down' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsClosePromptOpen(true)}
            className="w-11 h-9 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-red-600 transition-colors"
            title="Close Application"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN DESKTOP BODY: SIDEBAR + CONTENT VIEWPORT */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Minimized Indicator Overlay */}
        {isMinimized && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="text-xs text-neutral-300">HexaStudy is running in background.</span>
            <button
              onClick={() => setIsMinimized(false)}
              className="px-2.5 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-500 rounded text-white"
            >
              Restore Window
            </button>
          </div>
        )}

        {/* FLUENT SIDEBAR NAVIGATION */}
        <aside className="w-56 bg-[#1f1f1f] border-r border-white/5 flex flex-col justify-between p-2 shrink-0">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Workstation Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as ActiveView)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-800 text-white font-semibold shadow-sm ring-1 ring-white/10'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-sky-400'
                          : item.highlight
                          ? 'text-sky-400/80'
                          : 'text-neutral-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-800/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Academic Snapshot Card in Sidebar */}
          {latestSnapshot && (
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-white/5 space-y-2 mt-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Current Health</span>
                <span className="font-mono font-bold text-sky-400">
                  {latestSnapshot.overallMean.toFixed(1)}/5.0
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full"
                  style={{ width: `${(latestSnapshot.overallMean / 5) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-neutral-500 font-mono truncate">
                Triage: {latestSnapshot.gapAnalysis.lowestSubject.name}
              </div>
            </div>
          )}
        </aside>

        {/* CONTENT VIEWPORT CANVAS */}
        <main className="flex-1 bg-[#1a1a1a] overflow-y-auto p-6 mica-canvas relative">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {/* WINDOWS 11 STATUS BAR */}
      <footer className="h-6 bg-[#141414] border-t border-white/5 px-3 flex items-center justify-between text-[11px] text-neutral-500 font-mono shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Local-First Core Active (0% Cloud Dependent)</span>
          </div>
          <span>·</span>
          <span>{subjects.length} Subjects</span>
          <span>·</span>
          <span>{assessments.length} Saved Snapshots</span>
        </div>

        <div className="flex items-center gap-3">
          <span>AI Plugin: {settings.aiEnabled ? 'Enabled (Optional)' : 'Offline (Disabled)'}</span>
          <span>·</span>
          <span>Workspace: {settings.googleWorkspaceEnabled ? 'Connected' : 'Local Only'}</span>
        </div>
      </footer>

      {/* CLOSE CONFIRMATION DIALOG */}
      {isClosePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Exit HexaStudy Workstation?</h3>
            <p className="text-xs text-neutral-400">
              All assessment ratings, study plans, and document vault files are permanently saved to your laptop's local storage.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsClosePromptOpen(false)}
                className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 rounded-lg"
              >
                Keep Open
              </button>
              <button
                onClick={() => setIsClosePromptOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
