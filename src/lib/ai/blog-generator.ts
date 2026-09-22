import { callGeminiContent, isGeminiAvailable } from './gemini-client';
import { callMistralChat } from './mistral-client';
import { searchInternet } from './search-service';
import { buildScientificQuery, buildProductReviewQuery } from './scientific-sources';
import { getAdminProducts } from '@/services/product.service';
import { buildBlogSystemPrompt, buildBlogUserPrompt } from './prompts/blog-generator.prompt';
import { parseStructuredBlogOutput } from './json-sanitizer';
import { slugify, extractProductIdsFromContent } from '@/lib/utils';

export interface GenerateBlogParams {
  topic: string;
  articleType?: 'scientific' | 'product_review';
  targetProductId?: string;
  tone?: string;
  keywords?: string;
  signal?: AbortSignal;
}

function normalizeBlogData(
  parsed: Record<string, unknown>,
  targetProductId?: string,
  sources: Array<{ title: string; url: string }> = []
) {
  const rawSlug = typeof parsed.slug === 'string' ? parsed.slug : '';
  const rawTitle = typeof parsed.title === 'string' ? parsed.title : '';
  parsed.slug = slugify(rawSlug || rawTitle || 'bai-viet-moi');
  parsed.sources = sources;

  const blogContent = typeof parsed.content === 'string' ? parsed.content : '';
  const contentProductIds = extractProductIdsFromContent(blogContent);
  const rawRelated = Array.isArray(parsed.relatedProductIds) ? parsed.relatedProductIds : [];
  const validRelated = rawRelated.filter(
    (id) => typeof id === 'string' && id && !id.includes('id-san-pham')
  );
  const combined = [
    ...(targetProductId ? [targetProductId] : []),
    ...validRelated,
    ...contentProductIds,
  ];
  parsed.relatedProductIds = Array.from(new Set(combined));
  return parsed;
}

export async function generateBlogArticle(params: GenerateBlogParams) {
  const isReview = params.articleType === 'product_review';
  const products = await getAdminProducts();
  const targetProd = params.targetProductId ? products.find((p) => p.id === params.targetProductId) : undefined;

  // 1. Dùng hệ thống search lọc nguồn khoa học uy tín (PubMed/ISSN/Examine) của chúng ta
  let searchEvidence = '';
  let scrapedSources: Array<{ title: string; url: string }> = [];

  try {
    const currentYear = new Date().getFullYear();
    const primaryQuery = isReview
      ? buildProductReviewQuery(params.topic, targetProd?.brand, params.keywords)
      : buildScientificQuery(params.topic, params.keywords, currentYear);

    const searchOutcome = await searchInternet(primaryQuery, 4, params.signal, { filterMode: 'scientific' });
    if (searchOutcome.status === 'ok' && searchOutcome.results.length > 0) {
      scrapedSources = searchOutcome.results
        .filter((r) => Boolean(r.url))
        .map((r) => ({ title: r.title || 'Tài liệu khoa học', url: r.url as string }));
      searchEvidence = searchOutcome.results
        .map((r, i) => `[Tài liệu ${i + 1} - ${r.title}]:\n${r.snippet}\n(Nguồn: ${r.url || 'N/A'})`)
        .join('\n\n');
    }
  } catch (searchErr) {
    console.warn('[AI Blog] Search failed, proceeding with fallback knowledge:', searchErr);
  }

  // 2. Tạo Prompt chuẩn SEO với nhiều gạch đầu dòng, ngắt đoạn thoáng mắt
  const systemPrompt = buildBlogSystemPrompt(isReview);
  const userPrompt = buildBlogUserPrompt(params, products, targetProd, searchEvidence);

  // 3. Thử chuỗi Cascade Gemini (3.8 -> 3.7 -> 3.6 -> 3.5 -> 2.5) với tài liệu đã lọc sạch
  if (isGeminiAvailable()) {
    try {
      const geminiResult = await callGeminiContent({
        userPrompt,
        systemInstruction: systemPrompt,
        temperature: isReview ? 0.35 : 0.3,
        maxTokens: 4096,
        signal: params.signal,
      });

      const parsed = parseStructuredBlogOutput(geminiResult.text);
      return normalizeBlogData(parsed, params.targetProductId, scrapedSources);
    } catch (geminiError) {
      console.warn('[AI Blog] All Gemini models failed, falling back to Mistral:', geminiError);
    }
  }

  // 4. Fallback cuối cùng sang Mistral AI
  const rawReply = await callMistralChat({
    messages: [{ role: 'user', content: userPrompt }],
    systemPrompt,
    temperature: isReview ? 0.35 : 0.3,
    maxTokens: 2500,
    signal: params.signal,
    enableTools: false,
  });

  const parsed = parseStructuredBlogOutput(rawReply);
  return normalizeBlogData(parsed, params.targetProductId, scrapedSources);
}
