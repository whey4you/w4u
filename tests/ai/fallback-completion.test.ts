import assert from 'node:assert/strict';
import { afterEach, test } from 'vitest';
import { callMistralChat } from '../../src/lib/ai/mistral-client';
import { delta, sseResponse } from './fixtures';

const originalFetch = globalThis.fetch;
const originalZaiKey = process.env.ZAI_API_KEY;
const originalMistralKey = process.env.MISTRAL_API_KEY;
const messages = [{ role: 'user' as const, content: 'Tư vấn whey protein' }];

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalZaiKey === undefined) delete process.env.ZAI_API_KEY;
  else process.env.ZAI_API_KEY = originalZaiKey;

  if (originalMistralKey === undefined) delete process.env.MISTRAL_API_KEY;
  else process.env.MISTRAL_API_KEY = originalMistralKey;
});

test('Primary Z.AI (GLM-4.7-Flash) is used when ZAI_API_KEY is configured', async () => {
  process.env.ZAI_API_KEY = 'zai-test-key';
  process.env.MISTRAL_API_KEY = 'mistral-test-key';

  const requestedUrls: string[] = [];
  const requestedBodies: Record<string, unknown>[] = [];

  globalThis.fetch = async (url, init) => {
    requestedUrls.push(String(url));
    if (init?.body) requestedBodies.push(JSON.parse(String(init.body)));
    return sseResponse([delta('Chào bạn, GLM-4.7-Flash tư vấn whey đây!', 'stop')]);
  };

  const reply = await callMistralChat({ messages });

  assert.equal(reply, 'Chào bạn, GLM-4.7-Flash tư vấn whey đây!');
  assert.equal(requestedUrls.length, 1);
  assert.match(requestedUrls[0], /api\.z\.ai/);
  assert.equal(requestedBodies[0].model, 'glm-4.7-flash');
});

test('Fallback to Tier 2 (GLM-4.5-Flash) happens when Tier 1 (GLM-4.7-Flash) returns 429', async () => {
  process.env.ZAI_API_KEY = 'zai-test-key';
  process.env.MISTRAL_API_KEY = 'mistral-test-key';

  const requestedBodies: Record<string, unknown>[] = [];

  globalThis.fetch = async (url, init) => {
    const urlStr = String(url);
    if (init?.body) requestedBodies.push(JSON.parse(String(init.body)));

    if (urlStr.includes('api.z.ai') && requestedBodies.length === 1) {
      // Tier 1 (4.7) fails with 429
      return new Response(JSON.stringify({ error: 'Rate limit on 4.7' }), { status: 429 });
    }

    // Tier 2 (4.5) succeeds
    return sseResponse([delta('Phản hồi từ GLM-4.5-Flash Tier 2!', 'stop')]);
  };

  const reply = await callMistralChat({ messages });

  assert.equal(reply, 'Phản hồi từ GLM-4.5-Flash Tier 2!');
  assert.equal(requestedBodies.length, 2);
  assert.equal(requestedBodies[0].model, 'glm-4.7-flash');
  assert.equal(requestedBodies[1].model, 'glm-4.5-flash');
});

test('Fallback all the way to Tier 3 (Mistral) when both 4.7 and 4.5 fail', async () => {
  process.env.ZAI_API_KEY = 'zai-test-key';
  process.env.MISTRAL_API_KEY = 'mistral-test-key';

  const requestedUrls: string[] = [];

  globalThis.fetch = async (url) => {
    const urlStr = String(url);
    requestedUrls.push(urlStr);

    if (urlStr.includes('api.z.ai')) {
      // Both Tier 1 and Tier 2 fail with 429
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
    }

    // Mistral fallback succeeds
    return sseResponse([delta('Phản hồi an toàn từ Mistral Tier 3!', 'stop')]);
  };

  const reply = await callMistralChat({ messages });

  assert.equal(reply, 'Phản hồi an toàn từ Mistral Tier 3!');
  assert.equal(requestedUrls.length, 3); // 4.7 -> 4.5 -> mistral
  assert.match(requestedUrls[0], /api\.z\.ai/);
  assert.match(requestedUrls[1], /api\.z\.ai/);
  assert.match(requestedUrls[2], /api\.mistral\.ai/);
});

test('Direct Mistral execution when ZAI_API_KEY is not configured', async () => {
  delete process.env.ZAI_API_KEY;
  process.env.MISTRAL_API_KEY = 'mistral-test-key';

  const requestedUrls: string[] = [];

  globalThis.fetch = async (url) => {
    requestedUrls.push(String(url));
    return sseResponse([delta('Phản hồi từ Mistral trực tiếp', 'stop')]);
  };

  const reply = await callMistralChat({ messages });

  assert.equal(reply, 'Phản hồi từ Mistral trực tiếp');
  assert.equal(requestedUrls.length, 1);
  assert.match(requestedUrls[0], /api\.mistral\.ai/);
});
