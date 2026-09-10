/** Decode SSE across arbitrary network/UTF-8 boundaries, including the last frame. */
export async function* readSSEData(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() || '';
      if (done && buffer) frames.push(buffer);
      for (const frame of frames) {
        const data = frame.split(/\r?\n/).filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).replace(/^ /, '')).join('\n');
        if (data) yield data;
      }
      if (done) return;
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
}

export function encodeSSE(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${data === '[DONE]' ? data : JSON.stringify(data)}\n\n`);
}
