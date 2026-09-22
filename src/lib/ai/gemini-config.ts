export const GEMINI_CONFIG = {
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  DEFAULT_MODEL: process.env.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash',
  TEMPERATURE: 0.3,
  MAX_TOKENS: 4096,
  REQUEST_TIMEOUT_MS: 75000,
} as const;

export function getGeminiModelCascade(): string[] {
  const primary = process.env.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash';
  const rawFallbacks = process.env.GEMINI_FALLBACK_MODELS || 'gemini-3.7-flash,gemini-3.6-flash,gemini-3.5-flash,gemini-2.5-flash';
  const fallbacks = rawFallbacks
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const cascade: string[] = [];

  for (const model of [primary, ...fallbacks]) {
    if (!seen.has(model)) {
      seen.add(model);
      cascade.push(model);
    }
  }

  return cascade;
}

export interface GeminiContentOptions {
  userPrompt: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface GeminiContentResult {
  text: string;
  modelUsed: string;
}
