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
  targetField: z
    .enum(['all', 'ingredients', 'allergens', 'description', 'howToUse', 'macros'])
    .optional()
    .default('all'),
});

interface ProductNutritionRow {
  name?: string;
  perServing?: string;
  per100g?: string;
}

interface ProductGeneratedData {
  protein?: string;
  bcaa?: string;
  calories?: string;
  sugar?: string;
  servings?: string;
  nutritionTable?: ProductNutritionRow[];
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
      const query = `${productName} ${brand || ''} supplement facts nutrition facts protein bcaa calories ingredients allergens directions how to use`.trim();
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
- Yêu cầu tạo mục: ${targetField === 'all' ? 'Toàn bộ Dinh Dưỡng, Bảng Thành Phần, Mô Tả & HDSD' : `Chỉ riêng mục "${targetField}"`}

[DỮ LIỆU TRA CỨU TỪ INTERNET / BẢNG THÀNH PHẦN THỰC TẾ]:
${searchEvidence || 'Không tìm thấy kết quả trực tiếp từ web search, hãy sử dụng kiến thức chuẩn xác chính hãng về dòng sản phẩm này để hoàn thiện đầy đủ.'}

Hãy xuất ra JSON object với các trường tương ứng (protein, bcaa, calories, sugar, servings, nutritionTable, ingredients, allergens, description, howToUse).
`;

    const rawResponse = await callMistralChat({
      systemPrompt: PRODUCT_GENERATOR_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.25,
      responseFormat: { type: 'json_object' },
      signal: req.signal,
    });

    const parsedData = parseLLMJson<ProductGeneratedData>(rawResponse);

    // Chuẩn hóa danh sách bảng dinh dưỡng chi tiết
    const normalizedNutritionTable = Array.isArray(parsedData.nutritionTable)
      ? parsedData.nutritionTable
          .map((row, idx) => ({
            id: `row-ai-${Date.now()}-${idx}`,
            name: String(row.name || '').trim(),
            perServing: String(row.perServing || '').trim(),
            per100g: row.per100g ? String(row.per100g).trim() : '',
          }))
          .filter((r) => r.name && r.perServing)
      : [];

    return NextResponse.json({
      success: true,
      data: {
        protein: parsedData.protein ? String(parsedData.protein).trim() : '',
        bcaa: parsedData.bcaa ? String(parsedData.bcaa).trim() : '',
        calories: parsedData.calories ? String(parsedData.calories).trim() : '',
        sugar: parsedData.sugar ? String(parsedData.sugar).trim() : '',
        servings: parsedData.servings ? String(parsedData.servings).trim() : '',
        nutritionTable: normalizedNutritionTable,
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

