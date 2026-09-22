import assert from 'node:assert/strict';
import { afterEach, test } from 'vitest';
import { callGeminiContent, isGeminiAvailable } from '../../src/lib/ai/gemini-client';

const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY = originalKey;
  }
});

test('isGeminiAvailable checks if GEMINI_API_KEY is configured', () => {
  process.env.GEMINI_API_KEY = 'test-key';
  assert.equal(isGeminiAvailable(), true);

  delete process.env.GEMINI_API_KEY;
  assert.equal(isGeminiAvailable(), false);

  process.env.GEMINI_API_KEY = '   ';
  assert.equal(isGeminiAvailable(), false);
});

test('callGeminiContent throws error when GEMINI_API_KEY is not configured', async () => {
  delete process.env.GEMINI_API_KEY;
  await assert.rejects(
    () => callGeminiContent({ userPrompt: 'Hello' }),
    /GEMINI_API_KEY is not configured/
  );
});

test('callGeminiContent sends valid payload and returns text', async () => {
  process.env.GEMINI_API_KEY = 'valid-key';

  let capturedUrl = '';
  let capturedBody: Record<string, unknown> = {};

  globalThis.fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedBody = JSON.parse(String(init?.body || '{}'));

    return Response.json({
      candidates: [
        {
          content: {
            parts: [{ text: 'Nội dung bài viết y sinh chuẩn khoa học.' }],
            role: 'model',
          },
          finishReason: 'STOP',
        },
      ],
    });
  };

  const result = await callGeminiContent({
    userPrompt: 'Viết về Creatine',
    systemInstruction: 'Bạn là chuyên gia dinh dưỡng thể thao.',
    model: 'gemini-3.8-flash',
  });

  assert.match(capturedUrl, /models\/gemini-3\.8-flash:generateContent/);
  assert.match(capturedUrl, /key=valid-key/);
  assert.equal(capturedBody.tools, undefined); // No Google search tool
  assert.equal(result.text, 'Nội dung bài viết y sinh chuẩn khoa học.');
  assert.equal(result.modelUsed, 'gemini-3.8-flash');
});

test('callGeminiContent cascades to next model when primary model fails', async () => {
  process.env.GEMINI_API_KEY = 'valid-key';
  const calledModels: string[] = [];

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes('gemini-3.8-flash')) {
      calledModels.push('gemini-3.8-flash');
      return Response.json({ error: { message: 'High demand 503' } }, { status: 503 });
    }
    if (url.includes('gemini-3.7-flash')) {
      calledModels.push('gemini-3.7-flash');
      return Response.json({
        candidates: [
          {
            content: { parts: [{ text: 'Phản hồi từ gemini-3.7-flash dự phòng.' }] },
          },
        ],
      });
    }
    return Response.json({ error: { message: 'unexpected' } }, { status: 400 });
  };

  const result = await callGeminiContent({
    userPrompt: 'Test cascade',
  });

  assert.deepEqual(calledModels, ['gemini-3.8-flash', 'gemini-3.7-flash']);
  assert.equal(result.modelUsed, 'gemini-3.7-flash');
  assert.equal(result.text, 'Phản hồi từ gemini-3.7-flash dự phòng.');
});
