import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MessageSquare, ArrowRight, Pin, Filter, Clock, CornerDownLeft } from 'lucide-react';
import { ChatThread } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  threads: ChatThread[];
  onSelectThread: (id: string) => void;
}

type FilterType = 'all' | 'titles' | 'messages';

function formatDate(timestamp: number) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffHours < 24 * 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  }
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-semibold rounded-xs px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function getSnippetContext(text: string, query: string) {
  if (!query.trim() || !text) return null;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return null;

  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + query.length + 55);

  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';

  const preMatch = prefix + text.slice(start, index);
  const matchText = text.slice(index, index + query.length);
  const postMatch = text.slice(index + query.length, end) + suffix;

  return { preMatch, matchText, postMatch };
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  threads,
  onSelectThread,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setFilterType('all');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter threads based on query and filterType
  const filteredResults = threads.filter((t) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;

    const titleMatch = t.title.toLowerCase().includes(q);
    const msgMatch = t.messages.some((m) =>
      m.content.toLowerCase().includes(q)
    );

    if (filterType === 'titles') return titleMatch;
    if (filterType === 'messages') return msgMatch;
    return titleMatch || msgMatch;
  });

  // Reset selected index when filtered results or query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filterType]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredResults.length > 0 ? (prev + 1) % filteredResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredResults.length > 0 ? (prev - 1 + filteredResults.length) % filteredResults.length : 0));
    } else if (e.key === 'Enter') {
      if (filteredResults[selectedIndex]) {
        e.preventDefault();
        onSelectThread(filteredResults[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-stone-900/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/90">
          <Search className="w-5 h-5 text-stone-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations, titles or message contents..."
            className="w-full bg-transparent text-sm placeholder-stone-400 focus:outline-hidden text-stone-900 dark:text-stone-100 font-medium"
            id="input-search-modal"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 mr-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            id="btn-close-search-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-950/40 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-stone-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
              id="filter-search-all"
            >
              All
            </button>
            <button
              onClick={() => setFilterType('titles')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                filterType === 'titles'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
              id="filter-search-titles"
            >
              Titles Only
            </button>
            <button
              onClick={() => setFilterType('messages')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                filterType === 'messages'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
              id="filter-search-messages"
            >
              Message Content
            </button>
          </div>

          <span className="text-[11px] text-stone-400 font-medium">
            {filteredResults.length} {filteredResults.length === 1 ? 'chat' : 'chats'} found
          </span>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs min-h-[180px]">
          {filteredResults.length === 0 ? (
            <div className="p-10 text-center text-stone-400 flex flex-col items-center justify-center space-y-2">
              <Search className="w-8 h-8 text-stone-300 dark:text-stone-700" />
              <p className="font-medium">No matching conversations found.</p>
              <p className="text-[11px] text-stone-500">
                Try searching with a different keyword or switch filter options.
              </p>
            </div>
          ) : (
            filteredResults.map((t, index) => {
              const q = query.trim();
              const isSelected = index === selectedIndex;

              // Find matching messages in this thread
              const matchingMsgs = q
                ? t.messages.filter((m) => m.content.toLowerCase().includes(q.toLowerCase()))
                : [];
              const topMatchingMsg = matchingMsgs[0];
              const snippet = topMatchingMsg ? getSnippetContext(topMatchingMsg.content, q) : null;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectThread(t.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-stone-900 dark:text-stone-100'
                      : 'border-transparent hover:bg-stone-100 dark:hover:bg-stone-800/60'
                  }`}
                  id={`search-result-item-${t.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {/* Title & Metadata */}
                      <div className="flex items-center space-x-2 font-semibold text-stone-800 dark:text-stone-200 text-xs">
                        <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">
                          <HighlightedText text={t.title} query={q} />
                        </span>
                        {t.isPinned && (
                          <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>

                      {/* Matching snippet preview */}
                      {snippet ? (
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 pl-6 leading-relaxed">
                          "{snippet.preMatch}
                          <mark className="bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-semibold rounded-xs px-0.5">
                            {snippet.matchText}
                          </mark>
                          {snippet.postMatch}"
                        </p>
                      ) : (
                        t.messages.length > 0 && (
                          <p className="text-[11px] text-stone-400 truncate mt-1 pl-6">
                            {t.messages[t.messages.length - 1].content.slice(0, 90)}...
                          </p>
                        )
                      )}

                      {/* Matching message count pill if > 1 */}
                      {matchingMsgs.length > 1 && (
                        <div className="mt-1.5 pl-6">
                          <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                            {matchingMsgs.length} messages matched in this chat
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Info: Timestamp & Arrow */}
                    <div className="flex flex-col items-end shrink-0 space-y-1.5">
                      <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(t.updatedAt || t.createdAt)}
                      </span>
                      <ArrowRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected
                            ? 'text-emerald-500 translate-x-0.5'
                            : 'text-stone-400 opacity-60'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-sm bg-stone-200 dark:bg-stone-800 font-mono text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-sm bg-stone-200 dark:bg-stone-800 font-mono text-[10px] flex items-center gap-0.5">
                <CornerDownLeft className="w-2.5 h-2.5" /> Enter
              </kbd> Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-sm bg-stone-200 dark:bg-stone-800 font-mono text-[10px]">ESC</kbd> Close
            </span>
          </div>
          <span className="hidden sm:inline text-stone-500">
            Search older chats instantly
          </span>
        </div>
      </div>
    </div>
  );
};
