import React, { useState } from 'react';
import {
  X,
  Plus,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Download,
  Settings,
  HelpCircle,
  FolderDown,
  Search,
  Smartphone,
  Laptop,
  Gamepad2,
  Image as ImageIcon,
} from 'lucide-react';
import { ChatThread, AppSettings } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onDeleteThread: (id: string) => void;
  onRenameThread: (id: string, title: string) => void;
  onTogglePin: (id: string) => void;
  onExportThread: (thread: ChatThread) => void;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  onOpenInstallApp?: () => void;
  onOpenGameBuilder?: () => void;
  onOpenImageCreator?: () => void;
  onDownloadZip: () => void;
  settings: AppSettings;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  onRenameThread,
  onTogglePin,
  onExportThread,
  onOpenSettings,
  onOpenOnboarding,
  onOpenInstallApp,
  onOpenGameBuilder,
  onOpenImageCreator,
  onDownloadZip,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedThreads = filteredThreads.filter((t) => t.isPinned);
  const unpinnedThreads = filteredThreads.filter((t) => !t.isPinned);

  const handleStartRename = (e: React.MouseEvent, t: ChatThread) => {
    e.stopPropagation();
    setEditingId(t.id);
    setEditTitle(t.title);
  };

  const handleSaveRename = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameThread(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="relative z-50 flex flex-col w-80 max-w-[85vw] h-full bg-stone-900 text-stone-100 shadow-2xl border-r border-stone-800">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-stone-800">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs">
              GPT
            </div>
            <span className="font-semibold text-sm tracking-tight text-stone-100">ChatGPT Clone</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            id="btn-close-sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex items-center justify-center w-full space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-xs transition-colors text-sm"
            id="btn-sidebar-new-chat"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search bar inside drawer */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-800/80 border border-stone-700/60 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2 text-xs">
          {/* Pinned */}
          {pinnedThreads.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center space-x-1">
                <Pin className="w-3 h-3 text-emerald-400" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {pinnedThreads.map((t) => (
                  <ThreadRow
                    key={t.id}
                    thread={t}
                    isActive={t.id === activeThreadId}
                    editingId={editingId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => {
                      onSelectThread(t.id);
                      onClose();
                    }}
                    onSaveRename={handleSaveRename}
                    onStartRename={handleStartRename}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      onTogglePin(t.id);
                    }}
                    onExport={(e) => {
                      e.stopPropagation();
                      onExportThread(t);
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteThread(t.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Chats ({unpinnedThreads.length})
            </div>
            <div className="space-y-0.5 mt-1">
              {unpinnedThreads.length === 0 ? (
                <div className="px-3 py-4 text-center text-stone-500">No chats found</div>
              ) : (
                unpinnedThreads.map((t) => (
                  <ThreadRow
                    key={t.id}
                    thread={t}
                    isActive={t.id === activeThreadId}
                    editingId={editingId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => {
                      onSelectThread(t.id);
                      onClose();
                    }}
                    onSaveRename={handleSaveRename}
                    onStartRename={handleStartRename}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      onTogglePin(t.id);
                    }}
                    onExport={(e) => {
                      e.stopPropagation();
                      onExportThread(t);
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteThread(t.id);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="p-3 border-t border-stone-800 space-y-1">
          {onOpenImageCreator && (
            <button
              onClick={() => {
                onOpenImageCreator();
                onClose();
              }}
              className="flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors shadow-xs"
              id="btn-sidebar-image-creator"
            >
              <ImageIcon className="w-4 h-4 text-white" />
              <span>🎨 Prompt to Image Creator (ছবি আঁকুন)</span>
            </button>
          )}

          {onOpenGameBuilder && (
            <button
              onClick={() => {
                onOpenGameBuilder();
                onClose();
              }}
              className="flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
              id="btn-sidebar-game-builder"
            >
              <Gamepad2 className="w-4 h-4 text-white" />
              <span>📱 AI App & Game Builder (গেম/অ্যাপ)</span>
            </button>
          )}

          {onOpenInstallApp && (
            <button
              onClick={() => {
                onOpenInstallApp();
                onClose();
              }}
              className="flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
              id="btn-sidebar-install-app"
            >
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>Install PC & Mobile Guide</span>
            </button>
          )}

          <button
            onClick={() => {
              onDownloadZip();
            }}
            className="flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-stone-800 rounded-lg transition-colors"
            id="btn-sidebar-download-zip"
          >
            <FolderDown className="w-4 h-4" />
            <span>Download Android ZIP Repo</span>
          </button>

          <button
            onClick={() => {
              onOpenOnboarding();
              onClose();
            }}
            className="flex items-center space-x-2.5 w-full px-3 py-2 text-xs text-stone-300 hover:bg-stone-800 rounded-lg transition-colors"
            id="btn-sidebar-help"
          >
            <HelpCircle className="w-4 h-4 text-stone-400" />
            <span>App Guide & Setup</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="flex items-center space-x-2.5 w-full px-3 py-2 text-xs text-stone-300 hover:bg-stone-800 rounded-lg transition-colors"
            id="btn-sidebar-settings"
          >
            <Settings className="w-4 h-4 text-stone-400" />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

interface ThreadRowProps {
  thread: ChatThread;
  isActive: boolean;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (s: string) => void;
  onSelect: () => void;
  onSaveRename: (e: React.FormEvent, id: string) => void;
  onStartRename: (e: React.MouseEvent, t: ChatThread) => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onExport: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ThreadRow: React.FC<ThreadRowProps> = ({
  thread,
  isActive,
  editingId,
  editTitle,
  setEditTitle,
  onSelect,
  onSaveRename,
  onStartRename,
  onTogglePin,
  onExport,
  onDelete,
}) => {
  const isEditing = editingId === thread.id;

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-stone-800 text-white font-medium'
          : 'text-stone-300 hover:bg-stone-800/60 hover:text-stone-100'
      }`}
    >
      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
        <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        {isEditing ? (
          <form onSubmit={(e) => onSaveRename(e, thread.id)} className="flex-1">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
              onBlur={(e) => onSaveRename(e, thread.id)}
              className="w-full px-1.5 py-0.5 text-xs bg-stone-700 text-white rounded border border-emerald-500 focus:outline-hidden"
            />
          </form>
        ) : (
          <span className="truncate">{thread.title}</span>
        )}
      </div>

      {/* Row action icons */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 shrink-0 transition-opacity">
        <button
          onClick={onTogglePin}
          title={thread.isPinned ? 'Unpin' : 'Pin'}
          className="p-1 text-stone-400 hover:text-emerald-400 hover:bg-stone-700 rounded"
        >
          <Pin className={`w-3 h-3 ${thread.isPinned ? 'text-emerald-400 fill-emerald-400' : ''}`} />
        </button>
        <button
          onClick={(e) => onStartRename(e, thread)}
          title="Rename"
          className="p-1 text-stone-400 hover:text-white hover:bg-stone-700 rounded"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={onExport}
          title="Export Text"
          className="p-1 text-stone-400 hover:text-white hover:bg-stone-700 rounded"
        >
          <Download className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="p-1 text-stone-400 hover:text-rose-400 hover:bg-stone-700 rounded"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
