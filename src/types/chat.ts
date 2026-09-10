export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  error?: string;
}

export interface QuickPrompt {
  id: string;
  label: string;
  query: string;
}
