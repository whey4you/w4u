import React from 'react';
import assert from 'node:assert/strict';
import { test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChatMarkdown } from '../../src/components/features/chat/chat-markdown';
import { prepareChatContent } from '../../src/components/features/chat/chat-content';
import { parseInlineFormatting } from '../../src/components/features/blog/markdown-parser';
import { BlogContentRenderer } from '../../src/components/features/blog/blog-content-renderer';

test('headings, emphasis, lists and GFM tables render as elements', () => {
  const html = renderToStaticMarkup(<ChatMarkdown content={'# Tư vấn\n\n**Đậm** và *nghiêng*\n\n- Một\n- Hai\n\n| Loại | Giá |\n| --- | --- |\n| Whey | 100đ |'} />);
  assert.ok(html.includes('<strong') && html.includes('<em>nghiêng</em>'));
  assert.ok(html.includes('<ul') && html.includes('<table'));
  assert.ok(!html.includes('**') && !html.includes('# Tư vấn') && !html.includes('| ---'));
});

test('source links work; unsafe links and raw HTML cannot execute', () => {
  const html = renderToStaticMarkup(<ChatMarkdown content={'[Nguồn](https://example.org) [X](javascript:alert%281%29)\n<script>alert(1)</script>'} />);
  assert.ok(html.includes('href="https://example.org"'));
  assert.ok(html.includes('noopener noreferrer'));
  assert.ok(!html.includes('javascript:') && !html.includes('<script'));
});

test('partial emphasis and links render cleanly while streaming', () => {
  const bold = renderToStaticMarkup(<ChatMarkdown content="Mình khuyên **tập đều" isStreaming />);
  const link = renderToStaticMarkup(<ChatMarkdown content="Theo [nghiên cứu](https://exam" isStreaming />);
  assert.ok(bold.includes('<strong') && !bold.includes('**'));
  assert.ok(link.includes('nghiên cứu') && !link.includes('href='));
});

test('product markers are deduplicated and incomplete prefixes stay hidden', () => {
  const result = prepareChatContent('Gợi ý\n**[PRODUCT_CARD:p1]**\n[PRODUCT_CARD:p1]');
  assert.deepEqual(result.productIds, ['p1']);
  assert.equal(result.text, 'Gợi ý');
  for (const prefix of ['[', '[P', '[PRODUCT_', '[PRODUCT_CARD:p1']) {
    assert.equal(prepareChatContent('Gợi ý\n' + prefix, true).text, 'Gợi ý');
  }
  assert.equal(prepareChatContent('Ký hiệu * và # bình thường').text, 'Ký hiệu * và # bình thường');
});

test('parseInlineFormatting handles bold, italic, underscores, links, and strips stray hashes and quotes', () => {
  const sample = '> # Nghiên cứu từ **ISSN** chỉ ra *Whey Isolate* và __Creatine__ giúp phục hồi.';
  const markup = renderToStaticMarkup(React.createElement('div', null, parseInlineFormatting(sample)));
  assert.ok(markup.includes('<strong') && markup.includes('ISSN</strong>'));
  assert.ok(markup.includes('<strong') && markup.includes('Creatine</strong>'));
  assert.ok(markup.includes('<em') && markup.includes('Whey Isolate</em>'));
  assert.ok(!markup.includes('#'));
  assert.ok(!markup.includes('&gt;'));
  assert.ok(!markup.includes('**'));
  assert.ok(!markup.includes('__'));
});

test('BlogContentRenderer correctly renders markdown image and image directive with caption', () => {
  const mdContent = `## 1. Cơ Chế Y Sinh\n\n![Biểu đồ hấp thu whey](/blogs/whey-timing.jpg)\n\n:::image{src="/blogs/bca-seal.jpg" caption="Tem chống hàng giả"}:::\n\nNội dung văn bản.`;
  const markup = renderToStaticMarkup(<BlogContentRenderer content={mdContent} />);
  assert.ok(markup.includes('<figure'));
  assert.ok(markup.includes('<figcaption'));
  assert.ok(markup.includes('Biểu đồ hấp thu whey'));
  assert.ok(markup.includes('Tem chống hàng giả'));
  assert.ok(markup.includes('src="/blogs/whey-timing.jpg"'));
  assert.ok(markup.includes('src="/blogs/bca-seal.jpg"'));
});
