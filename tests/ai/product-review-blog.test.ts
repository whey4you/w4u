import assert from 'node:assert/strict';
import { test } from 'vitest';
import { buildProductReviewQuery } from '../../src/lib/ai/scientific-sources';

test('buildProductReviewQuery forms targeted query for international supplement specs and lab tests', () => {
  const query = buildProductReviewQuery('R1 Protein Isolate', 'Rule One Proteins', 'CFM isolate, strawberry');
  assert.match(query, /R1 Protein Isolate/i);
  assert.match(query, /Rule One Proteins/i);
  assert.match(query, /supplement facts/i);
  assert.match(query, /lab test/i);
  assert.match(query, /amino acid profile/i);
});

test('buildProductReviewQuery handles standalone foreign product names without brand or keywords', () => {
  const query = buildProductReviewQuery('OstroVit Tri-Creatine Malate');
  assert.match(query, /OstroVit Tri-Creatine Malate/i);
  assert.match(query, /supplement facts/i);
  assert.match(query, /review/i);
  assert.match(query, /ingredients/i);
});
