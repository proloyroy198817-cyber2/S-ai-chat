import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatThread, AppSettings, AttachedFile } from './types';
import {
  loadSettings,
  saveSettings,
  loadThreads,
  saveThreads,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { downloadAndroidProjectZip } from './utils/zipExporter';
import { HeaderBar } from './components/HeaderBar';
import { SidebarDrawer } from './components/SidebarDrawer';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SearchModal } from './components/SearchModal';
import { AndroidExporter } from './components/AndroidExporter';
import { Sparkles, MessageSquarePlus } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'mobile' | 'exporter'>('mobile');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [threads, setThreads] = useState<ChatThread[]>(loadThreads);
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    const loaded = loadThreads();
    return loaded[0]?.id || 'welcome-thread';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Apply Dark/Light theme class to html root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.themeMode === 'dark') {
      root.classList.add('dark');
    } else if (settings.themeMode === 'light') {
      root.classList.remove('dark');
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.themeMode]);

  // Sync threads to storage
  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  // Auto-save trigger: periodically sync threads to local storage during active streaming & before unload
  useEffect(() => {
    if (!isStreaming) return;

    const autoSaveInterval = setInterval(() => {
      saveThreads(threads);
    }, 1000);

    const handleBeforeUnload = () => {
      saveThreads(threads);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(autoSaveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStreaming, threads]);

  // Sync settings to storage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Keyboard navigation shortcuts (Ctrl/Cmd+N, Ctrl/Cmd+K, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsSettingsOpen(false);
        setIsOnboardingOpen(false);
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.selectedModel]);

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  // Create new chat thread
  const handleNewChat = () => {
    const newId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newId,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.selectedModel,
      messages: [],
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
  };

  // Delete thread
  const handleDeleteThread = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThreadId === id) {
      const remaining = threads.filter((t) => t.id !== id);
      if (remaining.length > 0) {
        setActiveThreadId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  // Rename thread
  const handleRenameThread = (id: string, newTitle: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle, updatedAt: Date.now() } : t))
    );
  };

  // Toggle pin
  const handleTogglePin = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
    );
  };

  // Export thread to txt file
  const handleExportThread = (thread: ChatThread) => {
    const textContent = thread.messages
      .map((m) => `[${new Date(m.timestamp).toLocaleString()}] ${m.role.toUpperCase()}:\n${m.content}\n`)
      .join('\n---\n\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${thread.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Delete single message from active thread
  const handleDeleteMessage = (msgId: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: t.messages.filter((m) => m.id !== msgId),
            updatedAt: Date.now(),
          };
        }
        return t;
      })
    );
  };

  // Handle streaming message generation with Web Search & Deep Research
  const handleSendMessage = async (
    userText: string,
    imageUrl?: string,
    attachedFiles?: AttachedFile[],
    isWebSearch?: boolean,
    isDeepResearch?: boolean
  ) => {
    if (!activeThread) return;

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
      imageUrl,
      attachedFiles,
    };

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      isDeepResearch,
    };

    // Auto-update title if it's the first user message in thread
    const newTitle =
      activeThread.messages.length === 0
        ? userText.slice(0, 32) || (attachedFiles?.[0]?.name ? `File: ${attachedFiles[0].name}` : 'Chat Conversation')
        : activeThread.title;

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            title: newTitle,
            updatedAt: Date.now(),
            messages: [...t.messages, userMsg, assistantMsg],
          };
        }
        return t;
      })
    );

    setIsStreaming(true);
    setTimeout(scrollToBottom, 50);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const messagesPayload = [...activeThread.messages, userMsg].map((m) => {
        let fullText = m.content || '';
        if (m.attachedFiles && m.attachedFiles.length > 0) {
          const fileDetails = m.attachedFiles
            .map((f) => {
              if (f.textContent) {
                return `\n\n[ATTACHED FILE: ${f.name}]\n\`\`\`\n${f.textContent}\n\`\`\``;
              }
              return `\n\n[ATTACHED FILE: ${f.name} (${f.type}, ${f.size} bytes)]`;
            })
            .join('');
          fullText += fileDetails;
        }

        const primaryImage =
          m.imageUrl ||
          m.attachedFiles?.find((f) => f.dataUrl && f.type.startsWith('image/'))?.dataUrl;

        return {
          role: m.role,
          content: fullText,
          imageUrl: primaryImage,
          attachedFiles: m.attachedFiles,
        };
      });

      const clientTime = new Date().toLocaleString();
      const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.apiKey ? { 'x-custom-api-key': settings.apiKey } : {}),
        },
        body: JSON.stringify({
          messages: messagesPayload,
          model: settings.selectedModel,
          systemInstruction: settings.systemPrompt,
          isWebSearchEnabled: isWebSearch,
          isDeepResearchEnabled: isDeepResearch,
          clientTime,
          clientTimeZone,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let receivedCitations: any[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const json = JSON.parse(line.replace('data: ', ''));

                if (json.citations) {
                  receivedCitations = json.citations;
                  setThreads((prev) =>
                    prev.map((t) => {
                      if (t.id === activeThread.id) {
                        return {
                          ...t,
                          messages: t.messages.map((m) =>
                            m.id === assistantMsgId
                              ? { ...m, citations: receivedCitations }
                              : m
                          ),
                        };
                      }
                      return t;
                    })
                  );
                }

                if (json.error) {
                  const errMessage =
                    typeof json.error === 'string'
                      ? json.error
                      : json.error.message || 'An error occurred during response generation.';
                  const isQuota =
                    errMessage.includes('429') ||
                    errMessage.includes('RESOURCE_EXHAUSTED') ||
                    errMessage.includes('Quota exceeded');

                  const friendlyNotice = isQuota
                    ? `⚠️ **Gemini API Free Tier Quota Reached**\n\nThe shared free tier limit for Gemini API has been reached.\n\n### 💡 Options:\n1. **Add Custom API Key**: Go to **Settings (⚙️)** and paste your personal API key from [Google AI Studio](https://aistudio.google.com/app/apikey).\n2. **Switch Model**: Select **Gemini 2.5 Flash** or **Gemini 1.5 Flash** in the model selector.\n3. **Retry in 15 seconds**.`
                    : `⚠️ **Notice**: ${errMessage}`;

                  accumulatedContent += (accumulatedContent ? '\n\n' : '') + friendlyNotice;
                  setThreads((prev) =>
                    prev.map((t) => {
                      if (t.id === activeThread.id) {
                        return {
                          ...t,
                          messages: t.messages.map((m) =>
                            m.id === assistantMsgId
                              ? { ...m, content: accumulatedContent, isStreaming: false }
                              : m
                          ),
                        };
                      }
                      return t;
                    })
                  );
                }

                if (json.text) {
                  accumulatedContent += json.text;
                  setThreads((prev) =>
                    prev.map((t) => {
                      if (t.id === activeThread.id) {
                        return {
                          ...t,
                          messages: t.messages.map((m) =>
                            m.id === assistantMsgId
                              ? { ...m, content: accumulatedContent, isStreaming: true }
                              : m
                          ),
                        };
                      }
                      return t;
                    })
                  );
                  scrollToBottom();
                }
              } catch (e) {
                // Ignore parse errors for raw stream
              }
            }
          }
        }
      }

      // Finalize streaming
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThread.id) {
            return {
              ...t,
              messages: t.messages.map((m) =>
                m.id === assistantMsgId ? { ...m, isStreaming: false } : m
              ),
            };
          }
          return t;
        })
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === activeThread.id) {
              return {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: m.content || 'An error occurred while streaming.',
                        isStreaming: false,
                        error: err.message,
                      }
                    : m
                ),
              };
            }
            return t;
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Edit last user message & regenerate
  const handleEditMessage = (msgId: string, newText: string) => {
    if (!activeThread) return;
    const msgIndex = activeThread.messages.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;

    // Trim messages up to edited message
    const trimmedMessages = activeThread.messages.slice(0, msgIndex);
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThread.id ? { ...t, messages: trimmedMessages } : t))
    );

    handleSendMessage(newText);
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (!activeThread || activeThread.messages.length === 0) return;
    const lastUserMsg = [...activeThread.messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content, lastUserMsg.imageUrl);
    }
  };

  // Handle emoji reaction feedback for assistant messages
  const handleFeedback = (msgId: string, feedback: 'thumbs_up' | 'thumbs_down' | null) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.messages.some((m) => m.id === msgId)) {
          return {
            ...thread,
            updatedAt: Date.now(),
            messages: thread.messages.map((m) => (m.id === msgId ? { ...m, feedback } : m)),
          };
        }
        return thread;
      })
    );
  };

  // Copy full conversation formatted text to clipboard
  const handleCopyConversation = async () => {
    if (!activeThread || activeThread.messages.length === 0) return;
    const formattedText = activeThread.messages
      .map((msg) => {
        const roleLabel = msg.role === 'user' ? 'User' : 'ChatGPT';
        const timestamp = new Date(msg.timestamp).toLocaleString();
        return `[${roleLabel} - ${timestamp}]\n${msg.content}`;
      })
      .join('\n\n---\n\n');

    try {
      await navigator.clipboard.writeText(formattedText);
    } catch (err) {
      console.error('Failed to copy conversation:', err);
    }
  };

  const lastUserMsgId = [...(activeThread?.messages || [])]
    .reverse()
    .find((m) => m.role === 'user')?.id;

  return (
    <div className="flex flex-col h-screen bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-sans antialiased overflow-hidden">
      {/* Top Bar Header */}
      <HeaderBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onCopyConversation={handleCopyConversation}
        hasMessages={Boolean(activeThread && activeThread.messages.length > 0)}
        settings={settings}
        onUpdateSettings={setSettings}
        activeTitle={activeThread?.title}
      />

      {/* Main Content Area */}
      {viewMode === 'exporter' ? (
        <AndroidExporter onDownloadZip={downloadAndroidProjectZip} />
      ) : (
        <main className="flex-1 flex flex-col justify-between overflow-hidden relative max-w-4xl w-full mx-auto">
          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3">
            {activeThread?.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center space-y-4 text-stone-500 my-auto">
                <div className="p-4 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
                    What can I help with today?
                  </h3>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Ask a question, analyze code, upload an image, or explore the Android Jetpack Compose codebase.
                  </p>
                </div>

                {/* Preset Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full pt-2 text-left">
                  <button
                    onClick={() => handleSendMessage('What is today\'s current date and time?')}
                    className="p-3 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 hover:border-emerald-500 text-xs text-stone-700 dark:text-stone-300 transition-all shadow-2xs"
                  >
                    <span className="font-semibold block text-stone-900 dark:text-stone-100">🕒 Device Time Context</span>
                    <span>Check real-time date, time & timezone awareness</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Latest updates in Android 15 & Jetpack Compose 2026', undefined, undefined, true, false)}
                    className="p-3 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 hover:border-sky-500 text-xs text-stone-700 dark:text-stone-300 transition-all shadow-2xs"
                  >
                    <span className="font-semibold block text-stone-900 dark:text-stone-100">🌐 Quick Web Search</span>
                    <span>Search web with live citations & source links</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Deep research on Jetpack Compose vs Flutter cross-platform architecture in 2026', undefined, undefined, false, true)}
                    className="p-3 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 hover:border-purple-500 text-xs text-stone-700 dark:text-stone-300 transition-all shadow-2xs"
                  >
                    <span className="font-semibold block text-stone-900 dark:text-stone-100">🔬 Deep Research Report</span>
                    <span>Multi-step search, reading, & report synthesis</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Explain ViewModel, StateFlow & Hilt Dependency Injection in Kotlin')}
                    className="p-3 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 hover:border-emerald-500 text-xs text-stone-700 dark:text-stone-300 transition-all shadow-2xs"
                  >
                    <span className="font-semibold block text-stone-900 dark:text-stone-100">📱 Android Code Architecture</span>
                    <span>MVVM + Hilt + Room codebase structure</span>
                  </button>
                </div>
              </div>
            ) : (
              activeThread?.messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  isLastUserMessage={msg.id === lastUserMsgId}
                  onEditMessage={handleEditMessage}
                  onRegenerate={handleRegenerate}
                  onDeleteMessage={handleDeleteMessage}
                  onFeedback={handleFeedback}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            onStopGeneration={handleStopGeneration}
            selectedModel={settings.selectedModel}
          />
        </main>
      )}

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        onRenameThread={handleRenameThread}
        onTogglePin={handleTogglePin}
        onExportThread={handleExportThread}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onDownloadZip={downloadAndroidProjectZip}
        settings={settings}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onDownloadZip={downloadAndroidProjectZip}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        threads={threads}
        onSelectThread={setActiveThreadId}
      />
    </div>
  );
}
