import { ChatOptions } from './config';
import { generateChatCompletion } from './chat-completion';
import { encodeSSE } from './sse';

/** Stream application events, including explicit failures after HTTP headers are sent. */
export async function streamMistralChat(options: ChatOptions): Promise<ReadableStream<Uint8Array>> {
  const abort = new AbortController();
  const signal = options.signal ? AbortSignal.any([options.signal, abort.signal]) : abort.signal;
  const completion = generateChatCompletion({ ...options, signal });
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await completion.next();
        controller.enqueue(encodeSSE(next.done ? '[DONE]' : { content: next.value }));
        if (next.done) controller.close();
      } catch (error) {
        if (abort.signal.aborted) return;
        console.error('[MistralChat] Completion failed:', error);
        controller.enqueue(encodeSSE({ error: 'Kết nối bị gián đoạn hoặc phản hồi chưa hoàn tất. Bạn vui lòng thử lại nhé.' }));
        controller.close();
      }
    },
    async cancel() {
      abort.abort();
      await completion.return(undefined);
    },
  });
}
