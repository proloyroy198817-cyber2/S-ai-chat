import React, { useState } from 'react';
import { Search, X, MessageSquare, ArrowRight } from 'lucide-react';
import { ChatThread } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  threads: ChatThread[];
  onSelectThread: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  threads,
  onSelectThread,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = threads.filter((t) => {
    const titleMatch = t.title.toLowerCase().includes(query.toLowerCase());
    const msgMatch = t.messages.some((m) =>
      m.content.toLowerCase().includes(query.toLowerCase())
    );
    return titleMatch || msgMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Search input header */}
        <div className="flex items-center px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
          <Search className="w-5 h-5 text-stone-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all chats & messages..."
            autoFocus
            className="w-full bg-transparent text-sm placeholder-stone-400 focus:outline-hidden text-stone-900 dark:text-stone-100"
          />
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 text-xs">
          {results.length === 0 ? (
            <div className="p-6 text-center text-stone-400">
              No matching conversations or messages found.
            </div>
          ) : (
            results.map((t) => {
              const matchingMsg = t.messages.find((m) =>
                m.content.toLowerCase().includes(query.toLowerCase())
              );

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectThread(t.id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center space-x-2 font-semibold text-stone-800 dark:text-stone-200">
                      <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{t.title}</span>
                    </div>
                    {matchingMsg && (
                      <p className="text-[11px] text-stone-500 truncate mt-1 pl-6">
                        "{matchingMsg.content}"
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-500 transition-colors shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
