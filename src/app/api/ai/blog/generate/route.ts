import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callMistralChat } from '@/lib/ai/mistral-client';
import { searchInternet } from '@/lib/ai/search-service';
import { buildScientificQuery, buildProductReviewQuery } from '@/lib/ai/scientific-sources';
import { getAdminProducts } from '@/services/product.service';
import { BLOG_GENERATOR_SYSTEM_PROMPT } from '@/lib/ai/prompts/blog-generator.prompt';
import { PRODUCT_REVIEW_BLOG_PROMPT } from '@/lib/ai/prompts/product-review-blog.prompt';
import { parseStructuredBlogOutput } from '@/lib/ai/json-sanitizer';
import { slugify } from '@/lib/utils';

const requestSchema = z.object({
  topic: z.string().trim().min(2).max(300),
  articleType: z.enum(['scientific', 'product_review']).optional().default('scientific'),
  targetProductId: z.string().optional(),
  tone: z.string().optional(),
  keywords: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Dữ liệu đầu vào không hợp lệ.' }, { status: 400 });
    }

    const { topic, articleType, targetProductId, tone, keywords } = parsed.data;
    const isReview = articleType === 'product_review';

    // 1. Lấy thông tin sản phẩm mục tiêu (nếu có từ kho Whey4You)
    const products = await getAdminProducts();
    const targetProd = targetProductId ? products.find((p) => p.id === targetProductId) : undefined;

    // 2. Web Search tìm kiếm nguồn dữ liệu quốc tế uy tín (PubMed/ISSN hoặc Thông số/Lab test sản phẩm)
    let searchEvidence = '';
    let scrapedSources: Array<{ title: string; url: string; snippet?: string }> = [];
    const currentYear = new Date().getFullYear();
    try {
      const primaryQuery = isReview
        ? buildProductReviewQuery(topic, targetProd?.brand, keywords)
        : buildScientificQuery(topic, keywords, currentYear);

      let searchOutcome = await searchInternet(primaryQuery, 4, req.signal, { filterMode: 'scientific' });

      if (searchOutcome.status !== 'ok' || searchOutcome.results.length === 0) {
        const fallbackQuery = isReview
          ? `${topic} supplement facts review ingredients lab test analysis`
          : `${topic} sports nutrition exercise physiology pubmed issn clinical trial systematic review`;
        searchOutcome = await searchInternet(fallbackQuery, 4, req.signal, { filterMode: 'scientific' });
      }

      if (searchOutcome.status === 'ok' && searchOutcome.results.length > 0) {
        scrapedSources = searchOutcome.results
          .filter((r) => Boolean(r.url))
          .map((r) => ({
            title: r.title || 'Tài liệu tham khảo',
            url: r.url as string,
            snippet: r.snippet || '',
          }));
        searchEvidence = searchOutcome.results
          .map((r, i) => `[Tài liệu quốc tế ${i + 1} - ${r.title}]:\n${r.snippet}\n(Nguồn: ${r.url || 'N/A'})`)
          .join('\n\n');
      }
    } catch (searchErr) {
      console.warn('[AI Blog] Search failed, proceeding with fallback knowledge:', searchErr);
    }

    // 3. Xây dựng ngữ cảnh prompt theo chế độ
    const systemPrompt = isReview ? PRODUCT_REVIEW_BLOG_PROMPT : BLOG_GENERATOR_SYSTEM_PROMPT;
    const catalogSummary = products.slice(0, 10).map((p) => `- ID: "${p.id}", Nhóm/Tên: "${p.name}"`).join('\n');

    let userPrompt = '';
    if (isReview) {
      const prodDetails = targetProd
        ? `Tên: ${targetProd.name}\nHãng: ${targetProd.brand}\nNhóm: ${targetProd.category}\nThành phần shop: ${targetProd.macros?.ingredients || 'N/A'}\nMacros: Protein: ${targetProd.macros?.protein || 'N/A'}, BCAA: ${targetProd.macros?.bcaa || 'N/A'}`
        : `Tên sản phẩm: ${topic}`;

      userPrompt = `
<task>Author an exhaustive sports nutrition product deep-dive and review in Vietnamese.</task>
<target_product>\n${prodDetails}\n</target_product>
${keywords ? `<focus_keywords>${keywords}</focus_keywords>` : ''}
<tone>${tone || 'Objective, technical product formulator review (Examine / Labdoor style)'}</tone>
<international_data>\n${searchEvidence || 'Sử dụng thông số chuẩn của dòng sản phẩm quốc tế này.'}\n</international_data>
<reference_product_id>${targetProductId ? `:::product{id="${targetProductId}"}:::` : ''}</reference_product_id>
<content_requirements>
1. Mổ xẻ chi tiết công thức, công nghệ lọc CFM/bào chế, nguồn gốc hoạt chất và kiểm định độc lập.
2. Nêu rõ ưu điểm vượt trội VÀ nhược điểm/lưu ý thực tế (Pros & Cons công tâm).
3. Bắt buộc có bảng Markdown so sánh công thức với tiêu chuẩn ngành.
4. Chỉ rõ chân dung khách hàng phù hợp nhất và ai không nên dùng.
5. Bài viết 550-700 từ tiếng Việt, chia 3 phần ## rõ ràng, trả về chuẩn ---METADATA--- và ---CONTENT---.
</content_requirements>`.trim();
    } else {
      const targetProductContext = targetProductId
        ? `\n[THẺ THAM KHẢO]: Gắn duy nhất :::product{id="${targetProductId}"}::: ở cuối bài. TUYỆT ĐỐI KHÔNG PR hay chào mua.`
        : `\n[THẺ THAM KHẢO]: Có thể gắn tối đa 1 thẻ :::product{id="..."}::: ở cuối bài nếu phù hợp.`;

      userPrompt = `
<task>Author a high-level sports science monograph in scholarly Vietnamese.</task>
<topic>${topic}</topic>
${keywords ? `<keywords>${keywords}</keywords>` : ''}
<tone>${tone || 'Evidence-based clinical sports science (ISSN / PubMed)'}</tone>
<scientific_evidence>\n${searchEvidence}\n</scientific_evidence>
<reference_product_instruction>${targetProductContext}</reference_product_instruction>
<catalog_reference_ids>\n${catalogSummary}\n</catalog_reference_ids>
<content_requirements>
1. 100% EVIDENCE-BASED PHYSIOLOGY: Synthesize directly from peer-reviewed evidence (PubMed/ISSN/ScienceDaily/Examine).
2. REFUTE TABLOID MYTHS & STRICT ZERO-PR: No marketing claims.
3. SCIENTIFIC COMPARISON TABLE: Markdown table comparing physiological forms or biochemical mechanisms.
4. 500 to 650 words in scholarly Vietnamese, 3 ## sections, deliver partitioned into ---METADATA--- and ---CONTENT---.
</content_requirements>`.trim();
    }

    // 4. Gọi Mistral AI với 2500 tokens
    let rawReply = '';
    try {
      rawReply = await callMistralChat({
        messages: [{ role: 'user', content: userPrompt }],
        systemPrompt,
        temperature: isReview ? 0.35 : 0.3,
        maxTokens: 2500,
        signal: req.signal,
        enableTools: false,
      });
    } catch (chatError) {
      if (chatError instanceof Error && (chatError.message.includes('token limit') || chatError.message.includes('capacity'))) {
        console.warn('[AI Blog] Capacity issue, retrying with compact prompt...');
        rawReply = await callMistralChat({
          messages: [{ role: 'user', content: `${userPrompt}\n\n[LƯU Ý]: Hãy viết súc tích 450 - 550 từ.` }],
          systemPrompt,
          temperature: 0.2,
          maxTokens: 2200,
          signal: req.signal,
          enableTools: false,
        });
      } else {
        throw chatError;
      }
    }

    // 5. Trích xuất metadata và nội dung markdown bằng parser phân tách
    const parsedBlogData = parseStructuredBlogOutput(rawReply);

    // Chuẩn hóa Slug loại bỏ 100% dấu tiếng Việt và ký tự đặc biệt
    if (parsedBlogData && typeof parsedBlogData === 'object') {
      const rawSlug = typeof parsedBlogData.slug === 'string' ? parsedBlogData.slug : '';
      const rawTitle = typeof parsedBlogData.title === 'string' ? parsedBlogData.title : '';
      parsedBlogData.slug = slugify(rawSlug || rawTitle || 'bai-viet-moi');
      parsedBlogData.sources = scrapedSources;
    }

    return NextResponse.json({
      success: true,
      data: parsedBlogData,
    });
  } catch (error) {
    console.error('[API /api/ai/blog/generate] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi khi tạo bài viết bằng AI' },
      { status: 500 }
    );
  }
}
