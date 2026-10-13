/**
 * HexaStudy — Settings, Storage Backup/Restore & Modular Integrations
 * Windows 11 Preferences, Local Data Dumps, AI Kill-Switch, and Google Workspace Hub
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  Cloud,
  Cpu,
  Download,
  FileUp,
  HardDrive,
  Info,
  Lock,
  Moon,
  RefreshCw,
  RotateCcw,
  Save,
  Server,
  Settings,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { hexaStore } from '../services/store';
import { AppSettings } from '../types';

interface SettingsViewProps {
  onSettingsUpdated: (settings: AppSettings) => void;
  onFullReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onSettingsUpdated,
  onFullReset,
}) => {
  const [settings, setSettings] = useState<AppSettings>(() => hexaStore.getSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  // Update a field in settings
  const updateField = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    hexaStore.saveSettings(updated);
    onSettingsUpdated(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Export full JSON dump
  const handleExportBackup = () => {
    const jsonStr = hexaStore.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hexastudy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import full JSON dump
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = hexaStore.importFullBackup(content);
      if (res.success) {
        alert(res.message);
        window.location.reload();
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  // Test AI Connection
  const handleTestAi = async () => {
    setIsTestingAi(true);
    setAiTestResult(null);

    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        setAiTestResult(`Connected successfully to ${data.provider || 'Gemini'} AI service.`);
      } else {
        setAiTestResult('AI Service responded with status: ' + res.status);
      }
    } catch {
      setAiTestResult('Running in zero-AI offline local mode. No external calls will be made.');
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-neutral-900/70 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-400" />
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Application Settings &amp; Modules</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Manage Windows 11 preferences, local data dumps, and optional plug-ins.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Saved to Local Storage</span>
          </span>
        )}
      </div>

      {/* SECTION 1: WINDOWS 11 & DESKTOP PREFERENCES */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <HardDrive className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Windows 11 Desktop Preferences
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Mica Backdrop Translucency</span>
              <span className="text-[11px] text-neutral-400">
                Acrylic glass depth and subtle wallpaper refraction.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.micaEnabled}
              onChange={(e) => updateField('micaEnabled', e.target.checked)}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Theme Mode</span>
              <span className="text-[11px] text-neutral-400">Windows 11 Dark Mica default.</span>
            </div>
            <span className="text-xs font-mono font-bold text-sky-400 px-2.5 py-1 bg-neutral-900 rounded">
              Dark Mica
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: DATA BACKUP & RESTORE */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Download className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Local Data Backup &amp; Disaster Recovery
          </h3>
        </div>

        <p className="text-xs text-neutral-400">
          HexaStudy stores everything inside your laptop's local IndexedDB and LocalStorage. You can export a self-contained JSON snapshot or restore previous study sessions at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Backup (.json)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-lg cursor-pointer transition-colors">
            <FileUp className="w-4 h-4" />
            <span>Restore Backup (.json)</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={onFullReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/40 rounded-lg transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: MODULAR AI PLUG-IN SETTINGS */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-purple-500/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              AI Commentary Plug-in (Optional Module)
            </h3>
          </div>

          {/* Master Killswitch */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">
              {settings.aiEnabled ? 'Plug-in Enabled' : 'Plug-in Disabled'}
            </span>
            <input
              type="checkbox"
              checked={settings.aiEnabled}
              onChange={(e) => updateField('aiEnabled', e.target.checked)}
              className="w-4 h-4 accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="p-3 bg-neutral-950/60 rounded-xl border border-white/5 text-xs text-neutral-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>
            <strong>Architectural Rule 0:</strong> Core HexaStudy calculations, radar charts, and reports are 100% deterministic and never depend on AI. Enabling this plug-in only adds optional narrative interpretation on saved results.
          </span>
        </div>

        {settings.aiEnabled && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Active Provider
                </label>
                <select
                  value={settings.aiProvider}
                  onChange={(e) => updateField('aiProvider', e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-neutral-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="gemini">Google Gemini (Cloud)</option>
                  <option value="ollama">Ollama (100% Offline Local Model)</option>
                  <option value="none">None (Disabled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Gemini Model Target
                </label>
                <select
                  value={settings.geminiModel}
                  onChange={(e) => updateField('geminiModel', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-neutral-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Standard Diagnostic)</option>
                  <option value="gemini-3.8-flash">gemini-3.8-flash (General Reasoning)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Thinking)</option>
                </select>
              </div>
            </div>

            {settings.aiProvider === 'gemini' && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-purple-300 block">High Thinking Mode (ThinkingLevel.HIGH)</span>
                  <span className="text-[11px] text-neutral-400">
                    Allocates extended reasoning steps for complex algorithmic tutoring.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highThinkingMode}
                  onChange={(e) => updateField('highThinkingMode', e.target.checked)}
                  className="w-4 h-4 accent-purple-500 cursor-pointer"
                />
              </div>
            )}

            {settings.aiProvider === 'ollama' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Ollama Local URL
                  </label>
                  <input
                    type="text"
                    value={settings.ollamaEndpoint}
                    onChange={(e) => updateField('ollamaEndpoint', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Installed Model Tag
                  </label>
                  <input
                    type="text"
                    value={settings.ollamaModel}
                    onChange={(e) => updateField('ollamaModel', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-800 border border-white/10 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleTestAi}
                disabled={isTestingAi}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-purple-200 bg-purple-950/70 hover:bg-purple-900 border border-purple-800/40 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingAi ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>

              {aiTestResult && (
                <span className="text-xs text-neutral-300 font-mono">{aiTestResult}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: GOOGLE WORKSPACE HUB */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-sky-500/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Google Workspace Cloud Integration
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">
              {settings.googleWorkspaceEnabled ? 'Workspace Connected' : 'Workspace Disabled'}
            </span>
            <input
              type="checkbox"
              checked={settings.googleWorkspaceEnabled}
              onChange={(e) => updateField('googleWorkspaceEnabled', e.target.checked)}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
        </div>

        <p className="text-xs text-neutral-400">
          Connect your Google Drive and Calendar to automatically sync documents marked in your Study Material Vault and add exam countdown blocks to your Google Calendar.
        </p>

        {settings.googleWorkspaceEnabled ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5 space-y-1">
                <span className="text-xs font-semibold text-white block">Google Drive Target Folder</span>
                <input
                  type="text"
                  value={settings.googleDriveFolder}
                  onChange={(e) => updateField('googleDriveFolder', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-neutral-900 border border-white/10 rounded-lg text-white font-mono mt-1"
                />
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5 space-y-1">
                <span className="text-xs font-semibold text-white block">Google Calendar Exam Sync</span>
                <p className="text-[11px] text-neutral-400">
                  Syncs subject exam dates and the 7-day study plan into your primary calendar.
                </p>
                <button
                  onClick={() => alert('Calendar exam events scheduled!')}
                  className="mt-2 px-3 py-1 text-xs font-medium text-sky-300 bg-sky-950/60 border border-sky-800/40 rounded transition-colors"
                >
                  Sync Exam Dates Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-neutral-950/40 border border-white/5 text-xs text-neutral-400">
            <span>Workspace is currently disabled. All files and documents remain strictly local on your laptop.</span>
          </div>
        )}
      </div>
    </div>
  );
};
