import { z } from 'zod';
import { AI_CONFIG, AIMessage, AIToolCall, ChatOptions } from './config';
import { MISTRAL_TOOLS } from './tools';

const contentSchema = z.union([
  z.string(), z.array(z.object({ type: z.literal('text'), text: z.string() })),
]).nullish();

export const mistralChunkSchema = z.object({
  choices: z.array(z.object({
    delta: z.object({
      content: contentSchema,
      tool_calls: z.array(z.object({
        index: z.number().int().min(0).max(7), id: z.string().optional(),
        type: z.literal('function').optional(),
        function: z.object({ name: z.string().optional(), arguments: z.string().optional() }),
      })).optional(),
    }),
    finish_reason: z.string().nullish(),
  })),
});

export function contentText(content: z.infer<typeof contentSchema>): string {
  if (typeof content === 'string') return content;
  return content?.map((part) => part.text).join('') || '';
}

export function mergeToolCalls(
  calls: Map<number, AIToolCall>,
  deltas: NonNullable<z.infer<typeof mistralChunkSchema>['choices'][number]['delta']['tool_calls']>,
): void {
  for (const delta of deltas) {
    const call = calls.get(delta.index) || { id: '', type: 'function', function: { name: '', arguments: '' } };
    if (delta.id) call.id = delta.id;
    call.function.name += delta.function.name || '';
    call.function.arguments += delta.function.arguments || '';
    if (call.function.arguments.length > 8000) throw new Error('Tool arguments exceeded limit.');
    calls.set(delta.index, call);
  }
}

export async function requestMistralStream(options: ChatOptions, messages: AIMessage[], toolsEnabled: boolean) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY is not configured.');
  const response = await fetch(`${AI_CONFIG.MISTRAL_API_URL}/chat/completions`, {
    method: 'POST', signal: options.signal,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI_CONFIG.DEFAULT_MODEL, messages, stream: true,
      temperature: options.temperature ?? AI_CONFIG.TEMPERATURE,
      max_tokens: options.maxTokens ?? AI_CONFIG.MAX_TOKENS,
      ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
      ...(toolsEnabled ? { tools: MISTRAL_TOOLS, tool_choice: 'auto', parallel_tool_calls: true } : {}),
    }),
  });
  if (!response.ok || !response.body) throw new Error(`Mistral API error: ${response.status}`);
  return response.body;
}
