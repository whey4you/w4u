import assert from 'node:assert/strict';
import { afterEach, test } from 'vitest';
import { executeAITool } from '../../src/lib/ai/tools';
import { searchShopProducts } from '../../src/lib/ai/product-catalog';
import { searchInternet } from '../../src/lib/ai/search-service';

const originalFetch = globalThis.fetch;
const keys = ['MCP_SERVER_URL', 'MCP_API_KEY', 'JINA_API_KEY'] as const;
const env = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of keys) {
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = env[key];
  }
});
const product = { id: 'verified-1', name: 'Whey Isolate', brand: 'Brand', category: 'whey', price: 900000, in_stock: true };

test('catalog returns real variants without invented nutrition defaults', async () => {
  globalThis.fetch = async () => Response.json([{
    ...product, product_flavors: [{ name: 'Chocolate' }],
    product_sizes: [{ name: '2 lbs', price: 900000, in_stock: false }],
  }]);
  const [result] = await searchShopProducts('whey isolate');
  assert.equal(result.nutrition, null);
  assert.deepEqual(result.flavors, ['Chocolate']);
  assert.equal(result.sizes[0].in_stock, false);
  assert.equal(result.sizes[0].servings, undefined);
});

test('search ranks exact names first and requires all query terms', async () => {
  globalThis.fetch = async () => Response.json([
    { ...product, id: 'other', name: 'Whey concentrate' },
    { ...product, id: 'related', name: 'Premium Whey Isolate' }, product,
  ]);
  assert.deepEqual((await searchShopProducts('whey isolate')).map((item) => item.id), ['verified-1', 'related']);
});

test('empty/error database never becomes mock products', async () => {
  globalThis.fetch = async () => Response.json([]);
  assert.deepEqual(await searchShopProducts('whey'), []);
  globalThis.fetch = async () => Response.json({ message: 'database unavailable' }, { status: 400 });
  const result = JSON.parse(await executeAITool('search_shop_products', '{"query":"whey"}'));
  assert.equal(result.status, 'error');
  assert.equal(result.products, undefined);
});

test('invalid tool arguments never reach search or database', async () => {
  globalThis.fetch = async () => { throw new Error('must not fetch'); };
  for (const args of ['{', '{"query":1}', '{"query":""}', '{"query":"whey","extra":true}']) {
    assert.equal(JSON.parse(await executeAITool('search_shop_products', args)).status, 'invalid_arguments');
  }
});

test('unconfigured search is explicit', async () => {
  for (const key of keys) delete process.env[key];
  assert.equal((await searchInternet('research')).status, 'unavailable');
});

test('MCP failure falls back to Jina with safe URLs, no duplicates and bounded snippets', async () => {
  process.env.MCP_SERVER_URL = 'https://search.example/mcp';
  process.env.MCP_API_KEY = 'test';
  process.env.JINA_API_KEY = 'test';
  globalThis.fetch = async (url) => String(url).includes('search.example')
    ? new Response('', { status: 503 })
    : Response.json({ data: [
      { title: 'Official', description: 'a'.repeat(2200), url: 'https://example.org/study' },
      { title: 'Duplicate', description: 'copy', url: 'https://example.org/study' },
      { title: 'Bad', description: 'unsafe', url: 'javascript:alert(1)' },
    ] });
  const result = await searchInternet('research');
  assert.equal(result.status, 'ok');
  assert.equal(result.results.length, 1);
  assert.equal(result.results[0].snippet.length, 1800);
});
