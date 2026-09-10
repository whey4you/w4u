import { z } from 'zod';
import { readSSEData } from '@/lib/ai/sse';
import { ChatMessage, QuickPrompt } from '@/types/chat';

const chatEventSchema = z.union([z.object({ content: z.string() }), z.object({ error: z.string() })]);

export const DEFAULT_QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'whey-beginner',
    label: '🥛 Mới tập nên chọn Whey nào?',
    query: 'Mình mới bắt đầu tập gym thì nên dùng loại Whey nào phù hợp nhất?',
  },
  {
    id: 'mass-gain',
    label: '💪 Muốn tăng cân tăng cơ',
    query: 'Mình gầy muốn tăng cân và phát triển cơ bắp thì nên dùng Mass hay Whey?',
  },
  {
    id: 'creatine-guide',
    label: '⚡ Cách dùng Creatine chuẩn',
    query: 'Creatine nên uống vào thời điểm nào và liều lượng ra sao?',
  },
  {
    id: 'macro-guide',
    label: '📊 Tính lượng Protein mỗi ngày',
    query: 'Người tập gym cần nạp bao nhiêu gram protein mỗi ngày để phát triển cơ bắp?',
  },
];

export const INITIAL_GREETING_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content:
    'Chào bạn! Mình là trợ lý AI của Whey4You, có thể hỗ trợ về tập gym, dinh dưỡng và chọn sản phẩm. Bạn đang muốn cải thiện điều gì?',
  timestamp: Date.now(),
};

/**
 * Gửi tin nhắn và nhận phản hồi Streaming SSE theo thời gian thực
 */
export async function streamChatMessage(
  history: ChatMessage[],
  userMessage: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError?: (err: unknown) => void
): Promise<void> {
  const messages = [
    ...history.filter((message) => !message.error && message.content.trim() && message.role !== 'system')
      .slice(-11).map(({ role, content }) => ({ role, content })),
    { role: 'user', content: userMessage },
  ];
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, stream: true }),
    });
    if (!res.ok || !res.body) {
      throw new Error(res.status === 400 ? 'Tin nhắn quá dài hoặc không hợp lệ. Bạn hãy rút gọn và gửi lại nhé.' : 'Trợ lý đang mất kết nối. Bạn vui lòng thử lại nhé.');
    }
    if (!res.headers.get('content-type')?.includes('text/event-stream')) {
      throw new Error('Phản hồi không hợp lệ. Bạn vui lòng thử lại nhé.');
    }
    await consumeChatEvents(res.body, onChunk);
  } catch (err) {
    console.error('[streamChatMessage] Error:', err);
    onError?.(err);
  } finally {
    onDone();
  }
}

async function consumeChatEvents(body: ReadableStream<Uint8Array>, onChunk: (chunk: string) => void) {
  for await (const data of readSSEData(body)) {
    if (data === '[DONE]') return;
    const event = chatEventSchema.parse(JSON.parse(data));
    if ('error' in event) throw new Error(event.error);
    onChunk(event.content);
  }
  throw new Error('Phản hồi chưa hoàn tất. Bạn vui lòng thử lại nhé.');
}
