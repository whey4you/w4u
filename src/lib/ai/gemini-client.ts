import {
  GEMINI_CONFIG,
  GeminiContentOptions,
  GeminiContentResult,
  getGeminiModelCascade,
} from './gemini-config';

interface GeminiCandidate {
  content?: { parts?: Array<{ text?: string }> };
  finishReason?: string;
}

interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
  error?: { message?: string; code?: number; status?: string };
}

export function isGeminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

async function requestSingleModel(
  model: string,
  options: GeminiContentOptions,
  apiKey: string
): Promise<string> {
  const url = `${GEMINI_CONFIG.BASE_URL}/models/${model}:generateContent?key=${apiKey}`;

  const payload: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: options.userPrompt }] }],
    generationConfig: {
      temperature: options.temperature ?? GEMINI_CONFIG.TEMPERATURE,
      maxOutputTokens: options.maxTokens ?? GEMINI_CONFIG.MAX_TOKENS,
    },
  };

  if (options.systemInstruction) {
    payload.systemInstruction = { parts: [{ text: options.systemInstruction }] };
  }

  const timeoutSignal = AbortSignal.timeout(GEMINI_CONFIG.REQUEST_TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal;

  const response = await fetch(url, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const errJson = (await response.json()) as GeminiApiResponse;
      if (errJson.error?.message) errorDetail = errJson.error.message;
    } catch {
      // Ignored if not JSON
    }
    throw new Error(`Gemini [${model}] error: ${errorDetail}`);
  }

  const data = (await response.json()) as GeminiApiResponse;
  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error(`Gemini [${model}] returned an empty candidate list.`);
  }

  const text = candidate.content?.parts?.map((p) => p.text || '').join('') || '';
  if (!text.trim()) {
    throw new Error(`Gemini [${model}] returned empty text.`);
  }

  return text;
}

/**
 * Gọi Google Gemini theo chuỗi Cascade Fallback (từ mới nhất đến cũ hơn).
 * Bỏ qua web search của Google để tối ưu tốc độ, miễn phí và tránh lỗi quota.
 */
export async function callGeminiContent(options: GeminiContentOptions): Promise<GeminiContentResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }

  const modelsToTry = options.model ? [options.model] : getGeminiModelCascade();
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      options.signal?.throwIfAborted();
      const text = await requestSingleModel(model, options, apiKey);
      return { text, modelUsed: model };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Gemini Cascade] Model ${model} failed, trying next fallback:`, lastError.message);
    }
  }

  throw lastError || new Error('All Gemini cascade models failed.');
}
