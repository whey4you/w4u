import { AI_CONFIG, ChatOptions, AIMessage } from './config';
import { requestMistralStream } from './mistral-protocol';
import { requestZAIStream } from './zai-protocol';

/**
 * Gửi yêu cầu SSE stream:
 * - Tier 1: Z.AI GLM-4.7-Flash (Free, MoE thế hệ mới nhất)
 * - Tier 2: Z.AI GLM-4.5-Flash (Free, fallback khi 4.7 nghẽn mạng/overloaded)
 * - Tier 3: Mistral AI (Fallback chốt chặn cuối cùng, ổn định tuyệt đối)
 */
export async function requestAIStream(
  options: ChatOptions,
  messages: AIMessage[],
  toolsEnabled: boolean
): Promise<ReadableStream<Uint8Array>> {
  const hasZAI = Boolean(process.env.ZAI_API_KEY?.trim());

  if (hasZAI) {
    // Tier 1: GLM-4.7-Flash
    try {
      return await requestZAIStream(options, messages, toolsEnabled, AI_CONFIG.ZAI_PRIMARY_MODEL);
    } catch (error) {
      if (options.signal?.aborted) throw error;
      console.warn(
        `[AI] Tier 1 (${AI_CONFIG.ZAI_PRIMARY_MODEL}) failed, trying Tier 2 (${AI_CONFIG.ZAI_SECONDARY_MODEL}):`,
        error instanceof Error ? error.message : error
      );
    }

    // Tier 2: GLM-4.5-Flash
    try {
      return await requestZAIStream(options, messages, toolsEnabled, AI_CONFIG.ZAI_SECONDARY_MODEL);
    } catch (error) {
      if (options.signal?.aborted) throw error;
      console.warn(
        `[AI] Tier 2 (${AI_CONFIG.ZAI_SECONDARY_MODEL}) failed, falling back to Tier 3 (Mistral):`,
        error instanceof Error ? error.message : error
      );
    }
  }

  // Tier 3: Mistral AI
  return await requestMistralStream(options, messages, toolsEnabled);
}
