export type MessageRole = 'user' | 'assistant' | 'system';

export interface CitationSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  imageUrl?: string;
  isStreaming?: boolean;
  error?: string;
  citations?: CitationSource[];
  isDeepResearch?: boolean;
  researchSteps?: string[];
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  model: string;
  isPinned?: boolean;
}

export interface AppSettings {
  apiKey: string;
  searchApiKey?: string;
  searchProvider?: 'google_custom' | 'tavily' | 'bing' | 'simulated';
  selectedModel: string;
  themeMode: 'system' | 'light' | 'dark';
  systemPrompt: string;
  hasCompletedOnboarding: boolean;
  apiProvider: 'gemini' | 'anthropic' | 'openai';
  enableDateTimeContext: boolean;
}

export interface AndroidProjectFile {
  path: string;
  content: string;
  category: 'config' | 'manifest' | 'kotlin' | 'compose' | 'res' | 'di' | 'db';
  description: string;
}

