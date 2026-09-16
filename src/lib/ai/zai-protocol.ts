import { AI_CONFIG, AIMessage, ChatOptions } from './config';
import { MISTRAL_TOOLS } from './tools';

/**
 * Gửi yêu cầu SSE Stream tới Z.AI (GLM-4.7-Flash) theo chuẩn OpenAI Chat Completions
 */
export async function requestZAIStream(
  options: ChatOptions,
  messages: AIMessage[],
  toolsEnabled: boolean,
  modelOverride?: string
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) throw new Error('ZAI_API_KEY is not configured.');

  const model = modelOverride || AI_CONFIG.ZAI_DEFAULT_MODEL;

  const response = await fetch(`${AI_CONFIG.ZAI_API_URL}/chat/completions`, {
    method: 'POST',
    signal: options.signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: options.temperature ?? AI_CONFIG.TEMPERATURE,
      max_tokens: options.maxTokens ?? AI_CONFIG.MAX_TOKENS,
      thinking: { type: 'disabled' },
      ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
      ...(toolsEnabled ? { tools: MISTRAL_TOOLS, tool_choice: 'auto' } : {}),
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Z.AI API error: ${response.status}`);
  }

  return response.body;
}
