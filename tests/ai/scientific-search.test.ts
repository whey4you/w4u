import assert from 'node:assert/strict';
import { afterEach, test } from 'vitest';
import {
  buildScientificQuery,
  scoreScientificAuthority,
  isUntrustedSource,
  TRUSTED_SCIENTIFIC_DOMAINS,
} from '../../src/lib/ai/scientific-sources';
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

test('buildScientificQuery translates Vietnamese sports nutrition terms to English academic query', () => {
  const query1 = buildScientificQuery('Thời điểm uống Whey Protein sau tập');
  assert.match(query1, /nutrient timing/i);
  assert.match(query1, /pubmed/i);
  assert.match(query1, /issn/i);
  assert.match(query1, /clinical trial/i);

  const query2 = buildScientificQuery('Creatine có hại thận không');
  assert.match(query2, /renal function/i);
  assert.match(query2, /kidney/i);
  assert.match(query2, /meta-analysis/i);
});

test('scoreScientificAuthority gives high priority to PubMed, ISSN, ScienceDaily and Examine', () => {
  const pubmedScore = scoreScientificAuthority(
    'https://pubmed.ncbi.nlm.nih.gov/12345678/',
    'Randomized controlled trial of protein timing',
    'A double-blind placebo-controlled study on muscle protein synthesis'
  );
  assert.ok(pubmedScore >= 130, 'PubMed with trial keywords should score >= 130');

  const jissnScore = scoreScientificAuthority(
    'https://jissn.biomedcentral.com/articles/10.1186/s12970',
    'International Society of Sports Nutrition position stand: nutrient timing'
  );
  assert.ok(jissnScore >= 100, 'JISSN domain should score >= 100');

  const tabloidScore = scoreScientificAuthority(
    'https://www.dailymail.co.uk/health/article/fake-news.html',
    'Shocking whey protein truth'
  );
  assert.equal(tabloidScore, -1000, 'DailyMail should be penalized as untrusted');
});

test('isUntrustedSource catches tabloids and generic social media/entertainment sites', () => {
  assert.equal(isUntrustedSource('https://www.dailymail.co.uk/news'), true);
  assert.equal(isUntrustedSource('https://kenh14.vn/dinh-duong'), true);
  assert.equal(isUntrustedSource('https://www.thesun.co.uk/fabulous'), true);
  assert.equal(isUntrustedSource('https://pubmed.ncbi.nlm.nih.gov/123/'), false);
  assert.equal(isUntrustedSource('https://sciencedaily.com/releases/2026'), false);
});

test('searchInternet with scientific filterMode rejects tabloids and prioritizes scientific publications', async () => {
  process.env.JINA_API_KEY = 'test-jina-key';
  globalThis.fetch = async () =>
    Response.json({
      data: [
        {
          title: 'Shocking gossip on supplements',
          description: 'A clickbait tabloid rumor with generic news.',
          url: 'https://www.dailymail.co.uk/health/shocking-protein.html',
        },
        {
          title: 'General workout blog post 2026',
          description: 'Some gym advice from a local forum blog.',
          url: 'https://genericfitnessblog.com/post',
        },
        {
          title: 'ISSN Position Stand: Protein and Exercise',
          description: 'A systematic review and meta-analysis on protein timing and muscle protein synthesis.',
          url: 'https://jissn.biomedcentral.com/articles/10.1186/protein-timing',
        },
        {
          title: 'Clinical trial on creatine supplementation',
          description: 'A double-blind randomized controlled trial published on PubMed.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/98765432/',
        },
      ],
    });

  const outcome = await searchInternet('creatine renal safety', 4, undefined, { filterMode: 'scientific' });
  assert.equal(outcome.status, 'ok');
  // DailyMail must be filtered out
  assert.ok(!outcome.results.some((r) => r.url?.includes('dailymail.co.uk')));

  // Top result must be an authoritative scientific domain (JISSN or PubMed)
  assert.ok(
    outcome.results[0].url?.includes('biomedcentral.com') || outcome.results[0].url?.includes('pubmed.ncbi.nlm.nih.gov')
  );
});
