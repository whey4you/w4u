import { z } from 'zod';
import { AI_CONFIG, SearchResultItem } from './config';
import { scoreScientificAuthority, isUntrustedSource } from './scientific-sources';

const itemSchema = z.object({
  title: z.string(), snippet: z.string().optional(), body: z.string().optional(),
  description: z.string().optional(), url: z.string().optional(), href: z.string().optional(),
});
const mcpSchema = z.object({
  result: z.object({
    isError: z.boolean().optional(),
    content: z.array(z.object({ type: z.string(), text: z.string().optional() })),
  }),
});
const webUrl = z.string().url().refine((url) => /^https?:\/\//i.test(url));
export interface SearchOutcome {
  status: 'ok' | 'no_results' | 'unavailable' | 'error';
  results: SearchResultItem[];
}

export interface SearchOptions {
  filterMode?: 'scientific' | 'default';
}

function extractYear(item: SearchResultItem): number {
  const combined = `${item.title} ${item.snippet} ${item.url || ''}`;
  const matches = combined.match(/\b(20[12]\d)\b/g);
  return matches ? Math.max(...matches.map(Number)) : 0;
}

function normalizeResults(
  items: z.infer<typeof itemSchema>[],
  limit: number,
  filterMode: 'scientific' | 'default' = 'default'
): SearchResultItem[] {
  let results = items.map((item) => ({
    title: item.title.trim().slice(0, 200),
    snippet: (item.snippet || item.body || item.description || '').replace(/\s+/g, ' ').trim().slice(0, 1800),
    url: item.url || item.href,
  })).filter((item) => item.title && item.snippet && webUrl.safeParse(item.url).success);

  if (filterMode === 'scientific') {
    results = results.filter((item) => !isUntrustedSource(item.url || ''));
  }

  const deduped = results.filter((item, index) => results.findIndex((other) => other.url === item.url) === index);

  if (filterMode === 'scientific') {
    // Xếp hạng ưu tiên theo thẩm quyền khoa học (PubMed, ISSN, ScienceDaily...) sau đó đến tính mới
    deduped.sort((a, b) => {
      const scoreA = scoreScientificAuthority(a.url || '', a.title, a.snippet);
      const scoreB = scoreScientificAuthority(b.url || '', b.title, b.snippet);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return extractYear(b) - extractYear(a);
    });
  } else {
    // Mặc định: Xếp hạng ưu tiên theo tính mới (Recency Booster)
    deduped.sort((a, b) => extractYear(b) - extractYear(a));
  }

  return deduped.slice(0, limit);
}

function searchSignal(signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(AI_CONFIG.SEARCH_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

async function searchMCP(query: string, limit: number, signal?: AbortSignal, filterMode: 'scientific' | 'default' = 'default') {
  const response = await fetch(process.env.MCP_SERVER_URL!, {
    method: 'POST', signal: searchSignal(signal),
    headers: { 'X-API-Key': process.env.MCP_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: Date.now(), method: 'tools/call',
      params: { name: 'web_search', arguments: { query, max_results: limit } },
    }),
  });
  if (!response.ok) throw new Error(`MCP search: HTTP ${response.status}`);
  const { result } = mcpSchema.parse(await response.json());
  if (result.isError) throw new Error('MCP search failed.');
  const rawText = result.content.filter((part) => part.type === 'text').map((part) => part.text || '').join('\n');
  const data = z.object({ results: z.array(itemSchema) }).parse(JSON.parse(rawText));
  return normalizeResults(data.results, limit, filterMode);
}

async function searchJina(query: string, limit: number, signal?: AbortSignal, filterMode: 'scientific' | 'default' = 'default') {
  const response = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
    signal: searchSignal(signal),
    headers: {
      Authorization: `Bearer ${process.env.JINA_API_KEY}`, Accept: 'application/json',
      'X-Engine': 'direct', 'X-Retain-Images': 'none',
    },
  });
  if (!response.ok) throw new Error(`Jina search: HTTP ${response.status}`);
  const data = z.object({ data: z.array(itemSchema) }).parse(await response.json());
  return normalizeResults(data.data, limit, filterMode);
}

/** Reuse configured MCP/Jina search; preserve failures instead of inventing verification. */
export async function searchInternet(
  query: string,
  limit = 4,
  signal?: AbortSignal,
  options?: SearchOptions
): Promise<SearchOutcome> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return { status: 'no_results', results: [] };
  const providers = [searchMCP, searchJina].filter((_, idx) =>
    idx === 0 ? Boolean(process.env.MCP_SERVER_URL && process.env.MCP_API_KEY) : Boolean(process.env.JINA_API_KEY)
  );
  if (!providers.length) return { status: 'unavailable', results: [] };
  let succeeded = false;
  const filterMode = options?.filterMode || 'default';
  for (const provider of providers) {
    try {
      signal?.throwIfAborted();
      const results = await provider(cleanQuery, Math.min(Math.max(limit, 1), 4), signal, filterMode);
      succeeded = true;
      if (results.length) return { status: 'ok', results };
    } catch (error) {
      if (signal?.aborted) throw error;
      console.warn('[Search] Provider failed:', error instanceof Error ? error.message : 'Invalid response');
    }
  }
  return { status: succeeded ? 'no_results' : 'error', results: [] };
}
