export const encoder = new TextEncoder();

export function sseResponse(events: unknown[], finished = true): Response {
  const payload = events.map((event) => `data: ${JSON.stringify(event)}\r\n\r\n`).join('')
    + (finished ? 'data: [DONE]\r\n\r\n' : '');
  const bytes = encoder.encode(payload);
  return new Response(new ReadableStream<Uint8Array>({
    start(controller) {
      for (let index = 0; index < bytes.length; index += 3) controller.enqueue(bytes.slice(index, index + 3));
      controller.close();
    },
  }), { headers: { 'Content-Type': 'text/event-stream' } });
}

export function delta(content: string, finish_reason: string | null = null) {
  return { choices: [{ delta: { content }, finish_reason }] };
}

export function toolEvents(name: string, query: string, id = '123456789') {
  const args = JSON.stringify({ query });
  return [
    { choices: [{ delta: { tool_calls: [{ index: 0, id, type: 'function', function: { name, arguments: args.slice(0, 6) } }] }, finish_reason: null }] },
    { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: args.slice(6) } }] }, finish_reason: 'tool_calls' }] },
  ];
}
