import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callMistralChat } from '@/lib/ai/mistral-client';
import { searchInternet } from '@/lib/ai/search-service';
import { PRODUCT_GENERATOR_SYSTEM_PROMPT } from '@/lib/ai/prompts/product-generator.prompt';
import { parseLLMJson } from '@/lib/ai/json-sanitizer';

const requestSchema = z.object({
  productName: z.string().trim().min(2).max(250),
  brand: z.string().trim().optional(),
  category: z.string().optional(),
  targetField: z.enum(['all', 'ingredients', 'allergens', 'description', 'howToUse']).optional().default('all'),
});

interface ProductGeneratedData {
  ingredients?: string;
  allergens?: string;
  description?: string;
  howToUse?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Tên sản phẩm không hợp lệ.' }, { status: 400 });
    }

    const { productName, brand, category, targetField } = parsed.data;

    // 1. Web search thông tin thực tế từ Internet (nhãn phụ, supplement facts, bảng thành phần)
    let searchEvidence = '';
    let sources: Array<{ title: string; url: string }> = [];

    try {
      const query = `${productName} ${brand || ''} supplement facts ingredients allergens directions how to use`.trim();
      const searchOutcome = await searchInternet(query, 4, req.signal);

      if (searchOutcome.status === 'ok' && searchOutcome.results.length > 0) {
        sources = searchOutcome.results
          .filter((r) => Boolean(r.url))
          .map((r) => ({ title: r.title || 'Nguồn sản phẩm', url: r.url as string }));

        searchEvidence = searchOutcome.results
          .map((r, i) => `[Tài liệu ${i + 1} - ${r.title}]:\n${r.snippet}\n(URL: ${r.url || 'N/A'})`)
          .join('\n\n');
      }
    } catch (searchErr) {
      console.warn('[AI Product] Search error, proceeding with base knowledge:', searchErr);
    }

    // 2. Chuẩn bị prompt gửi LLM
    const userPrompt = `
[THÔNG TIN SẢN PHẨM]:
- Tên sản phẩm: ${productName}
- Thương hiệu: ${brand || 'Chính hãng'}
- Danh mục: ${category || 'Thực phẩm bổ sung thể hình'}
- Yêu cầu tạo mục: ${targetField === 'all' ? 'Tất cả 4 mục' : `Chỉ riêng mục "${targetField}"`}

[DỮ LIỆU TRA CỨU TỪ INTERNET / BẢNG THÀNH PHẦN THỰC TẾ]:
${searchEvidence || 'Không tìm thấy kết quả trực tiếp từ web search, hãy sử dụng kiến thức chính xác về dòng sản phẩm này để hoàn thiện.'}

Hãy xuất ra JSON object với các trường tương ứng (nếu yêu cầu riêng 1 mục thì vẫn có thể trả về đầy đủ hoặc trả về trường đó chất lượng nhất).
`;

    const rawResponse = await callMistralChat({
      systemPrompt: PRODUCT_GENERATOR_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.25,
      responseFormat: { type: 'json_object' },
      signal: req.signal,
    });

    const parsedData = parseLLMJson<ProductGeneratedData>(rawResponse);

    return NextResponse.json({
      success: true,
      data: {
        ingredients: parsedData.ingredients || '',
        allergens: parsedData.allergens || '',
        description: parsedData.description || '',
        howToUse: parsedData.howToUse || '',
        sources,
      },
    });
  } catch (error) {
    console.error('[API /api/ai/product/generate] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo nội dung sản phẩm bằng AI. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
