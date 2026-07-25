import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, ShieldCheck, RefreshCw, Moon, Sun, Monitor } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel);
  const [themeMode, setThemeMode] = useState(settings.themeMode);
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);
  const [serverStatus, setServerStatus] = useState<string>('Checking...');
  const [hasEnvKey, setHasEnvKey] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(settings.apiKey);
      setSelectedModel(settings.selectedModel);
      setThemeMode(settings.themeMode);
      setSystemPrompt(settings.systemPrompt);

      fetch('/api/health')
        .then((r) => r.json())
        .then((data) => {
          setServerStatus('Connected & Active');
          setHasEnvKey(data.hasEnvKey);
        })
        .catch(() => {
          setServerStatus('Offline / Local Fallback Active');
        });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      apiKey: apiKey.trim(),
      selectedModel,
      themeMode,
      systemPrompt: systemPrompt.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold">App Settings & API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs">
          {/* Server status alert */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                Server Status: <span className="text-emerald-600 dark:text-emerald-400">{serverStatus}</span>
              </span>
            </div>
            {hasEnvKey && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                Default API Key Ready
              </span>
            )}
          </div>

          {/* Custom API Key input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-stone-700 dark:text-stone-300">
              User API Key (Optional Override)
            </label>
            <p className="text-[11px] text-stone-500">
              Provide your own Gemini or Anthropic API key. Stored in encrypted local storage.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... or sk-ant-..."
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="block font-bold text-stone-700 dark:text-stone-300">
              Active Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fast & Smart)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (High Reasoning & Coding)</option>
              <option value="gpt-4o-simulated">OpenAI GPT-4o (Simulated)</option>
              <option value="claude-3-5-sonnet-simulated">Claude 3.5 Sonnet (Simulated)</option>
            </select>
          </div>

          {/* Theme Mode */}
          <div className="space-y-1.5">
            <label className="block font-bold text-stone-700 dark:text-stone-300">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`flex items-center justify-center space-x-1.5 p-2 rounded-xl border transition-all ${
                  themeMode === 'system'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>System</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`flex items-center justify-center space-x-1.5 p-2 rounded-xl border transition-all ${
                  themeMode === 'light'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`flex items-center justify-center space-x-1.5 p-2 rounded-xl border transition-all ${
                  themeMode === 'dark'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* System Prompt & Date-Time Awareness */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-stone-700 dark:text-stone-300">System Instruction</label>
              <span className="text-[10px] text-emerald-500 font-semibold">🕒 Auto Real-Time Date/Time Injected</span>
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Footer Save Button */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-xs transition-colors"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
