import assert from 'node:assert/strict';
import { afterEach, test } from 'vitest';
import { callMistralChat } from '../../src/lib/ai/mistral-client';
import { streamMistralChat } from '../../src/lib/ai/stream-client';
import { readSSEData } from '../../src/lib/ai/sse';
import { delta, sseResponse, toolEvents } from './fixtures';

const originalFetch = globalThis.fetch;
const originalKey = process.env.MISTRAL_API_KEY;
const messages = [{ role: 'user' as const, content: 'Chào bạn' }];
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.MISTRAL_API_KEY;
  else process.env.MISTRAL_API_KEY = originalKey;
});

test('ordinary chat uses one request and preserves Vietnamese across byte boundaries', async () => {
  process.env.MISTRAL_API_KEY = 'test';
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    return sseResponse([delta('Chào bạn!', 'stop')]);
  };
  assert.equal(await callMistralChat({ messages }), 'Chào bạn!');
  assert.equal(requests, 1);
});

test('successive tool rounds preserve IDs/results and end with tools disabled', async () => {
  process.env.MISTRAL_API_KEY = 'test';
  const payloads: Record<string, unknown>[] = [];
  globalThis.fetch = async (_url, init) => {
    const payload = JSON.parse(String(init?.body));
    payloads.push(payload);
    if (payloads.length <= 3) return sseResponse(toolEvents('search_shop_products', 'x', `round000${payloads.length}`));
    assert.equal(payload.tools, undefined);
    return sseResponse([delta('Chưa đủ thông tin.', 'stop')]);
  };
  assert.match(await callMistralChat({ messages }), /Chưa đủ/);
  assert.equal(payloads.length, 4);
  assert.ok(payloads[1].tools);
  const history = payloads[3].messages as { role: string; tool_call_id?: string; content: string }[];
  assert.equal(history.filter((message) => message.role === 'tool').length, 3);
  assert.equal(history.at(-1)?.tool_call_id, 'round0003');
  assert.match(history.at(-1)?.content || '', /invalid_arguments/);
});

test('truncated/malformed streams fail instead of silently completing', async () => {
  process.env.MISTRAL_API_KEY = 'test';
  globalThis.fetch = async () => sseResponse([delta('Chưa xong')], false);
  await assert.rejects(callMistralChat({ messages }), /before completion/);
  globalThis.fetch = async () => sseResponse([delta('Quá dài', 'length')]);
  await assert.rejects(callMistralChat({ messages }), /token limit/);
  globalThis.fetch = async () => sseResponse([{ error: 'invalid upstream' }]);
  await assert.rejects(callMistralChat({ messages }));
});

test('upstream HTTP failures produce app errors without a DONE marker', async () => {
  process.env.MISTRAL_API_KEY = 'test';
  globalThis.fetch = async () => new Response('', { status: 429 });
  const events: string[] = [];
  for await (const event of readSSEData(await streamMistralChat({ messages }))) events.push(event);
  assert.equal(events.length, 1);
  assert.ok(JSON.parse(events[0]).error);
});

test('last SSE frame is decoded without a trailing newline', async () => {
  const events: string[] = [];
  for await (const event of readSSEData(new Response('data: {"content":"ok"}').body!)) events.push(event);
  assert.deepEqual(events, ['{"content":"ok"}']);
});
