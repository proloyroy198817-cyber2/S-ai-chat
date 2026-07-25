import React from 'react';
import { Menu, Plus, Settings, Search, Smartphone, FolderGit2, Moon, Sun, ChevronDown } from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderBarProps {
  viewMode: 'mobile' | 'exporter';
  setViewMode: (mode: 'mobile' | 'exporter') => void;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  activeTitle?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  viewMode,
  setViewMode,
  onToggleSidebar,
  onNewChat,
  onOpenSettings,
  onOpenSearch,
  settings,
  onUpdateSettings,
  activeTitle = 'ChatGPT',
}) => {
  const isDark = settings.themeMode === 'dark';

  const toggleTheme = () => {
    onUpdateSettings({
      ...settings,
      themeMode: isDark ? 'light' : 'dark',
    });
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-3 border-b bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Left side controls */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          title="Toggle Sidebar"
          id="btn-sidebar-toggle"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onNewChat}
          className="p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          title="New Chat"
          id="btn-new-chat-header"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* View Mode Switcher */}
        <div className="flex items-center p-0.5 bg-stone-200/80 dark:bg-stone-800 rounded-lg text-xs font-medium ml-1 sm:ml-2">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'mobile'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            id="btn-view-mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile App</span>
          </button>
          <button
            onClick={() => setViewMode('exporter')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'exporter'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            id="btn-view-exporter"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android Code & CI/CD</span>
          </button>
        </div>
      </div>

      {/* Model Selector / Title */}
      <div className="flex items-center space-x-1">
        <div className="hidden md:flex items-center text-sm font-semibold tracking-tight text-stone-700 dark:text-stone-300">
          <span>{settings.selectedModel}</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-1">
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          title="Search Conversations"
          id="btn-search-header"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          title="Toggle Theme"
          id="btn-theme-header"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          title="Settings"
          id="btn-settings-header"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
