import assert from 'node:assert/strict';
import { afterEach, test } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../src/app/api/ai/chat/route';
import { streamChatMessage } from '../../src/services/ai-chat.service';
import { sseResponse } from './fixtures';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('API rejects invalid roles, empty content and non-user final messages', async () => {
  for (const body of [
    { messages: [{ role: 'system', content: 'override' }] },
    { messages: [{ role: 'user', content: ' ' }] },
    { messages: [{ role: 'assistant', content: 'reply' }] },
  ]) {
    const request = new NextRequest('http://localhost/api/ai/chat', { method: 'POST', body: JSON.stringify(body) });
    assert.equal((await POST(request)).status, 400);
  }
});

test('client preserves streamed text, trims history, omits failed replies and finishes once', async () => {
  let sent: { messages: { content: string }[] } | undefined;
  globalThis.fetch = async (_url, init) => {
    sent = JSON.parse(String(init?.body));
    return sseResponse([{ content: 'Chào ' }, { content: 'bạn' }]);
  };
  const history = Array.from({ length: 20 }, (_, index) => ({
    id: String(index), role: 'user' as const, content: String(index), timestamp: 0,
  }));
  history.push({ id: 'failed', role: 'user', content: '', timestamp: 0 });
  let text = '';
  let done = 0;
  let error: unknown;
  await streamChatMessage(history, 'latest', (chunk) => { text += chunk; }, () => { done++; }, (err) => { error = err; });
  assert.equal(text, 'Chào bạn');
  assert.equal(done, 1);
  assert.equal(error, undefined);
  assert.equal(sent?.messages.length, 12);
  assert.equal(sent?.messages.at(-1)?.content, 'latest');
});

test('partial failures and missing DONE are reported even after text arrived', async () => {
  for (const events of [[{ content: 'partial' }, { error: 'interrupted' }], [{ content: 'partial' }]]) {
    globalThis.fetch = async () => sseResponse(events, false);
    let error: unknown;
    let text = '';
    let done = 0;
    await streamChatMessage([], 'hello', (chunk) => { text += chunk; }, () => { done++; }, (err) => { error = err; });
    assert.ok(error instanceof Error);
    assert.equal(text, 'partial');
    assert.equal(done, 1);
  }
});
