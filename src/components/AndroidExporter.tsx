import React, { useState } from 'react';
import {
  FolderGit2,
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../data/androidFiles';
import { AndroidProjectFile } from '../types';

interface AndroidExporterProps {
  onDownloadZip: () => void;
}

export const AndroidExporter: React.FC<AndroidExporterProps> = ({ onDownloadZip }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<AndroidProjectFile>(ANDROID_PROJECT_FILES[0]);
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const filteredFiles = ANDROID_PROJECT_FILES.filter((file) => {
    const matchesCategory =
      selectedCategory === 'all' || file.category === selectedCategory;
    const matchesSearch =
      file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleCopyAll = () => {
    const fullBundle = ANDROID_PROJECT_FILES.map(
      (f) => `// ==========================================\n// File: ${f.path}\n// Description: ${f.description}\n// ==========================================\n\n${f.content}\n`
    ).join('\n\n');

    navigator.clipboard.writeText(fullBundle);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-stone-900 text-stone-100 overflow-hidden">
      {/* Exporter Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-stone-950 border-b border-stone-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-white flex items-center space-x-2">
              <span>ChatGPT Clone Android Repository</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                Jetpack Compose + Codemagic
              </span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              100% complete, zero-placeholder Android codebase ready to clone, build, and deploy.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={handleCopyAll}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium border border-stone-700 transition-colors"
            title="Copy all file contents to clipboard"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'All Copied!' : 'Copy All Code'}</span>
          </button>

          <button
            onClick={onDownloadZip}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
            id="btn-download-android-zip"
          >
            <Download className="w-4 h-4" />
            <span>Download ZIP Repo</span>
          </button>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: File Tree & Category filter */}
        <div className="w-full md:w-80 bg-stone-900 border-r border-stone-800 flex flex-col shrink-0">
          {/* Search bar */}
          <div className="p-3 border-b border-stone-800 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search repo files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {['all', 'config', 'kotlin', 'compose', 'db', 'manifest'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* File list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
            {filteredFiles.map((f) => {
              const isSelected = f.path === selectedFile.path;
              return (
                <div
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`flex flex-col p-2.5 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-stone-800 border-emerald-500/50 text-white shadow-xs'
                      : 'bg-stone-950/40 border-stone-800/80 text-stone-300 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-mono font-semibold text-xs truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-stone-500'}`} />
                    <span className="truncate">{f.path}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1 truncate pl-5">
                    {f.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="flex-1 flex flex-col bg-stone-950 overflow-hidden">
          {/* Code Viewer Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900 border-b border-stone-800 text-xs">
            <div className="flex items-center space-x-2 font-mono text-stone-200 truncate">
              <span className="px-2 py-0.5 rounded bg-stone-800 text-emerald-400 font-bold uppercase text-[10px]">
                {selectedFile.category}
              </span>
              <span className="font-semibold truncate">{selectedFile.path}</span>
            </div>

            <button
              onClick={handleCopyCurrent}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors shrink-0"
              title="Copy current file code"
            >
              {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile ? 'Copied' : 'Copy File'}</span>
            </button>
          </div>

          {/* Code Editor Preview */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-stone-200 leading-relaxed bg-stone-950 selection:bg-emerald-900 selection:text-emerald-100">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>

          {/* Build Info Footer */}
          <div className="px-4 py-2 bg-stone-900 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Codemagic CI Command: <code className="text-emerald-300 font-mono">./gradlew assembleDebug</code>
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Target SDK 34 | Min SDK 24</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
