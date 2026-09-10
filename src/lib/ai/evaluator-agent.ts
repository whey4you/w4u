import { z } from 'zod';
import { AI_CONFIG, AIMessage } from './config';
import { WHEY4YOU_EVALUATOR_SYSTEM_PROMPT } from './prompts/evaluator.prompt';
import { executeAITool } from './tools';

const decisionSchema = z.object({
  tool: z.enum(['search_shop_products', 'web_search', 'none']).default('none'),
  query: z.string().default(''),
  complexity: z.enum(['simple', 'standard', 'in_depth']).default('standard'),
});

export type EvaluatorDecision = z.infer<typeof decisionSchema>;

export interface EvaluatorResult {
  decision: EvaluatorDecision;
  toolData?: string;
}

/**
 * AI Tầng 1: Đánh giá câu hỏi người dùng, quyết định gọi tool và xác định độ dài
 */
export async function evaluateCustomerIntent(
  messages: AIMessage[],
  signal?: AbortSignal
): Promise<EvaluatorResult> {
  const apiKey = process.env.MISTRAL_API_KEY;
  const fallbackResult: EvaluatorResult = {
    decision: { tool: 'none', query: '', complexity: 'standard' },
  };

  if (!apiKey) return fallbackResult;

  try {
    const formattedMessages: AIMessage[] = [
      { role: 'system', content: WHEY4YOU_EVALUATOR_SYSTEM_PROMPT },
      ...messages.slice(-4),
    ];

    const res = await fetch(`${AI_CONFIG.MISTRAL_API_URL}/chat/completions`, {
      method: 'POST',
      signal: signal || AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.DEFAULT_MODEL,
        messages: formattedMessages,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        max_tokens: 150,
      }),
    });

    if (!res.ok) return fallbackResult;

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    const parsed = decisionSchema.safeParse(JSON.parse(rawContent));
    const decision = parsed.success ? parsed.data : fallbackResult.decision;

    let toolData: string | undefined;
    if (decision.tool !== 'none' && decision.query.trim().length >= 2) {
      try {
        toolData = await executeAITool(
          decision.tool,
          JSON.stringify({ query: decision.query.trim() }),
          signal
        );
      } catch (err) {
        console.warn('[EvaluatorAgent] Tool execution failed:', err);
      }
    }

    return { decision, toolData };
  } catch (error) {
    console.warn('[EvaluatorAgent] Evaluation failed, continuing with fallback:', error);
    return fallbackResult;
  }
}
