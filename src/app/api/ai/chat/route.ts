import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callMistralChat } from '@/lib/ai/mistral-client';
import { streamMistralChat } from '@/lib/ai/stream-client';
import { buildConsultantSystemPrompt } from '@/lib/ai/prompts/consultant.prompt';
import { getShopCatalogSummary } from '@/lib/ai/product-catalog';
import { evaluateCustomerIntent } from '@/lib/ai/evaluator-agent';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(800),
  })).min(1).max(12),
  stream: z.boolean().optional(),
}).refine((body) => body.messages.at(-1)?.role === 'user');

const complexityHints: Record<string, string> = {
  simple: '\n\n[RESPONSE LENGTH GUIDELINE]: Simple or factual inquiry. Keep your response very brief and direct (1–2 sentences, under 40 words).',
  standard: '\n\n[RESPONSE LENGTH GUIDELINE]: Standard advisory inquiry. Provide a concise, practical response (80–150 words) with actionable numbers and clear guidance.',
  in_depth: '\n\n[RESPONSE LENGTH GUIDELINE]: In-depth or comparative inquiry. Provide a detailed, high-value breakdown (200–350 words) with thorough explanations.',
};

export async function POST(req: NextRequest) {
  // Chống Spam / DDoS: Giới hạn tối đa 10 câu hỏi / 10 phút trên mỗi IP
  const clientIp = getClientIp(req);
  const rateLimitKey = `ai_chat:${clientIp}`;
  const rateCheck = checkRateLimit(rateLimitKey, 10, 10 * 60 * 1000);
  if (!rateCheck.allowed) {
    const retrySecs = Math.max(1, Math.ceil((rateCheck.resetTime - Date.now()) / 1000));
    return NextResponse.json(
      { error: 'Bạn đang gửi câu hỏi quá nhanh. Vui lòng thử lại sau ít phút hoặc liên hệ hotline để được hỗ trợ ngay nhé!' },
      { status: 429, headers: { 'Retry-After': String(retrySecs) } }
    );
  }

  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nội dung yêu cầu không hợp lệ.' }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Tin nhắn không hợp lệ hoặc vượt quá 800 ký tự cho phép.' }, { status: 400 });
  }

  const rawMessages = parsed.data.messages.slice(-8);

  // TẦNG 1: Phân tích ý định người dùng & lấy danh mục sản phẩm từ Supabase (song song)
  const [evaluation, catalogSummary] = await Promise.all([
    evaluateCustomerIntent(rawMessages, req.signal),
    getShopCatalogSummary(req.signal),
  ]);

  // TẦNG 2: Xây dựng ngữ cảnh kèm dữ liệu cho AI Tư Vấn (Chat AI)
  let systemPrompt = buildConsultantSystemPrompt(catalogSummary);
  systemPrompt += complexityHints[evaluation.decision.complexity] || '';

  if (evaluation.toolData) {
    if (evaluation.decision.tool === 'web_search') {
      systemPrompt += `\n\n[VERIFIED REAL-TIME DATA FROM WEB SEARCH]:\n${evaluation.toolData}\nUse the factual real-time web search findings above to provide an accurate, evidence-based answer. Do NOT attach any product cards unless the user specifically asked for product purchase recommendations.`;
    } else {
      systemPrompt += `\n\n[VERIFIED DATA FROM SHOP CATALOG]:\n${evaluation.toolData}\nUse the verified store product information above to advise the user and include the appropriate [PRODUCT_CARD:id] tag at the end of your response.`;
    }
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
