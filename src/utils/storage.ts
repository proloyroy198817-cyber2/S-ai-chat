import { ChatThread, AppSettings, ChatMessage } from '../types';

const THREADS_KEY = 'chatgpt_clone_threads_v1';
const SETTINGS_KEY = 'chatgpt_clone_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  searchApiKey: '',
  searchProvider: 'simulated',
  selectedModel: 'gemini-3.6-flash',
  themeMode: 'system',
  systemPrompt: 'You are ChatGPT, a large language model trained by OpenAI. Respond directly, clearly, and accurately in formatted Markdown with code blocks when applicable.',
  hasCompletedOnboarding: false,
  apiProvider: 'gemini',
  enableDateTimeContext: true,
};

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'welcome-thread',
    title: 'Welcome to ChatGPT Mobile Clone',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    model: 'gemini-3.6-flash',
    isPinned: true,
    messages: [
      {
        id: 'msg-1',
        role: 'assistant',
        content: `👋 **Welcome to ChatGPT Mobile Clone (v3 with Web Search & Deep Research)!**

This app features:
- ⚡ **Real-time Streaming Responses** token-by-token
- 🌐 **Quick Web Search Mode**: Live web citations with clickable inline sources [1], [2]
- 🔬 **Deep Research Mode**: Multi-step pipeline with query breakdown & synthesized reports
- 🕒 **Real-Time Date & Time Awareness**: Automatic device time, date & timezone injection
- 🎨 **Markdown & Code Highlighting** with instant copy & image attachments
- 📱 **Complete Native Android Codebase** (Kotlin + Jetpack Compose) ready for Codemagic & USB debugging!

Try asking "What is the current time and date?" or toggle **Web Search** in the input bar!`,
        timestamp: Date.now() - 3600000,
      },
    ],
  },
];

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadThreads(): ChatThread[] {
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    if (!raw) return INITIAL_THREADS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_THREADS;
  } catch (e) {
    return INITIAL_THREADS;
  }
}

export function saveThreads(threads: ChatThread[]): void {
  try {
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  } catch (e) {
    console.error('Failed to save threads:', e);
  }
}
