export const AI_CONFIG = {
  ZAI_API_URL: 'https://api.z.ai/api/paas/v4',
  ZAI_PRIMARY_MODEL: process.env.ZAI_PRIMARY_MODEL || 'glm-4.7-flash',
  ZAI_SECONDARY_MODEL: process.env.ZAI_SECONDARY_MODEL || 'glm-4.5-flash',
  ZAI_DEFAULT_MODEL: process.env.ZAI_DEFAULT_MODEL || 'glm-4.7-flash',
  MISTRAL_API_URL: 'https://api.mistral.ai/v1',
  DEFAULT_MODEL: process.env.MISTRAL_DEFAULT_MODEL || 'ministral-8b-latest',
  TEMPERATURE: 0.3, // 0.3: Giảm mơ hồ, bám sát dữ liệu sản phẩm nhưng vẫn giữ độ tự nhiên tiếng Việt
  MAX_TOKENS: 1600, // Dư địa cho tiếng Việt; độ dài hội thoại được kiểm soát bằng prompt.
  MAX_TOOL_ROUNDS: 3,
  REQUEST_TIMEOUT_MS: 90000,
  SEARCH_TIMEOUT_MS: 6000,
} as const;

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: AIToolCall[];
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface ChatOptions {
  messages: AIMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  enableTools?: boolean;
  signal?: AbortSignal;
  responseFormat?: { type: 'json_object' | 'text' };
}

export interface SearchResultItem {
  title: string;
  snippet: string;
  url?: string;
}
