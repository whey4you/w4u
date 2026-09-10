import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callMistralChat } from '@/lib/ai/mistral-client';
import { streamMistralChat } from '@/lib/ai/stream-client';
import { WHEY4YOU_CONSULTANT_SYSTEM_PROMPT } from '@/lib/ai/prompts/consultant.prompt';
import { evaluateCustomerIntent } from '@/lib/ai/evaluator-agent';

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(12000),
  })).min(1).max(24),
  stream: z.boolean().optional(),
}).refine((body) => body.messages.at(-1)?.role === 'user');

const complexityHints: Record<string, string> = {
  simple: '\n\n[RESPONSE LENGTH GUIDELINE]: Simple or factual inquiry. Keep your response very brief and direct (1–2 sentences, under 40 words).',
  standard: '\n\n[RESPONSE LENGTH GUIDELINE]: Standard advisory inquiry. Provide a concise, practical response (80–150 words) with actionable numbers and clear guidance.',
  in_depth: '\n\n[RESPONSE LENGTH GUIDELINE]: In-depth or comparative inquiry. Provide a detailed, high-value breakdown (200–350 words) with thorough explanations.',
};

export async function POST(req: NextRequest) {
  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nội dung yêu cầu không hợp lệ.' }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Tin nhắn không hợp lệ hoặc quá dài.' }, { status: 400 });
  }

  const rawMessages = parsed.data.messages.slice(-12);

  // TẦNG 1: AI Đánh Giá (Evaluator Agent) phân tích câu hỏi & kích hoạt tool
  const evaluation = await evaluateCustomerIntent(rawMessages, req.signal);

  // TẦNG 2: Xây dựng ngữ cảnh kèm dữ liệu cho AI Tư Vấn (Chat AI)
  let systemPrompt = WHEY4YOU_CONSULTANT_SYSTEM_PROMPT;
  systemPrompt += complexityHints[evaluation.decision.complexity] || '';

  if (evaluation.toolData) {
    systemPrompt += `\n\n[VERIFIED DATA FROM TOOL ${evaluation.decision.tool}]:\n${evaluation.toolData}\nUse the factual information above to advise the user. If the inquiry relates to supplements, include the appropriate [PRODUCT_CARD:id] tag at the end of your response.`;
  }

  const options = {
    messages: rawMessages,
    systemPrompt,
    signal: req.signal,
    enableTools: false, // Dữ liệu đã được Tầng 1 xử lý, Tầng 2 chỉ cần stream trả lời
  };

  try {
    if (parsed.data.stream === false) return NextResponse.json({ reply: await callMistralChat(options) });
    return new Response(await streamMistralChat(options), {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[API /api/ai/chat] Error:', error);
    return NextResponse.json({ error: 'Trợ lý đang mất kết nối. Bạn vui lòng thử lại nhé.' }, { status: 503 });
  }
}
