import { callGeminiContent, isGeminiAvailable } from './gemini-client';
import { callMistralChat } from './mistral-client';
import { searchInternet } from './search-service';
import { PRODUCT_GENERATOR_SYSTEM_PROMPT } from './prompts/product-generator.prompt';
import { parseLLMJson } from './json-sanitizer';
import {
  extractHighlightMetricsFromTable,
  cleanServingCount,
  cleanCaloriesValue,
} from '@/lib/nutrition-extractor';

export interface GenerateProductParams {
  productName: string;
  brand?: string;
  category?: string;
  targetField?: 'all' | 'ingredients' | 'allergens' | 'description' | 'howToUse' | 'macros';
  signal?: AbortSignal;
}

interface ProductNutritionRow {
  name?: string;
  perServing?: string;
  per100g?: string;
}

interface ProductGeneratedData {
  protein?: string;
  proteinLabel?: string;
  bcaa?: string;
  bcaaLabel?: string;
  calories?: string;
  caloriesLabel?: string;
  sugar?: string;
  sugarLabel?: string;
  servings?: string;
  servingsLabel?: string;
  nutritionTable?: ProductNutritionRow[];
  ingredients?: string;
  allergens?: string;
  description?: string;
  howToUse?: string;
}

function buildUserPrompt(params: GenerateProductParams, searchEvidence = '') {
  return `
[THÔNG TIN SẢN PHẨM]:
- Tên sản phẩm: ${params.productName}
- Thương hiệu: ${params.brand || 'Chính hãng'}
- Danh mục: ${params.category || 'Thực phẩm bổ sung thể hình'}
- Yêu cầu tạo mục: ${params.targetField === 'all' ? 'Toàn bộ Dinh Dưỡng, Bảng Thành Phần, Mô Tả & HDSD' : `Chỉ riêng mục "${params.targetField}"`}

${
  searchEvidence
    ? `[DỮ LIỆU TRA CỨU THỰC TẾ TỪ INTERNET]:\n${searchEvidence}`
    : '[LƯU Ý]: Dùng kiến thức chính hãng chuẩn xác nhất về dòng sản phẩm này để hoàn thiện đầy đủ.'
}

Hãy xuất ra DUY NHẤT 1 JSON object hợp lệ (protein, proteinLabel, bcaa, bcaaLabel, calories, caloriesLabel, sugar, sugarLabel, servings, servingsLabel, nutritionTable, ingredients, allergens, description, howToUse).
`.trim();
}

function normalizeProductData(
  parsedData: ProductGeneratedData,
  sources: Array<{ title: string; url: string }> = [],
  category = 'whey'
) {
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

  // Trích xuất chỉ số chuẩn từ bảng nutritionTable làm nền tảng
  const extracted = extractHighlightMetricsFromTable(normalizedNutritionTable, category);

  // Chuẩn hóa và làm sạch số lần dùng (tránh lỗi rỗng input form)
  const cleanedServings = cleanServingCount(parsedData.servings) || extracted.servings;
  const cleanedCalories = cleanCaloriesValue(parsedData.calories) || extracted.calories;

  // Nếu parsedData có giá trị hợp lệ thì ưu tiên, nếu trống hoặc không chuẩn thì lấy từ extracted
  const finalProtein = parsedData.protein?.trim() || extracted.protein;
  const finalBcaa = parsedData.bcaa?.trim() || extracted.bcaa;
  const finalSugar = parsedData.sugar?.trim() || extracted.sugar;

  return {
    protein: finalProtein,
    proteinLabel: parsedData.proteinLabel?.trim() || extracted.proteinLabel,
    bcaa: finalBcaa,
    bcaaLabel: parsedData.bcaaLabel?.trim() || extracted.bcaaLabel,
    calories: cleanedCalories,
    caloriesLabel: parsedData.caloriesLabel?.trim() || extracted.caloriesLabel,
    sugar: finalSugar,
    sugarLabel: parsedData.sugarLabel?.trim() || extracted.sugarLabel,
    servings: cleanedServings,
    servingsLabel: parsedData.servingsLabel?.trim() || extracted.servingsLabel,
    nutritionTable: normalizedNutritionTable,
    ingredients: parsedData.ingredients || '',
    allergens: parsedData.allergens || '',
    description: parsedData.description || '',
    howToUse: parsedData.howToUse || '',
    sources,
  };
}

export async function generateProductData(params: GenerateProductParams) {
  let searchEvidence = '';
  let sources: Array<{ title: string; url: string }> = [];

  try {
    const query = `${params.productName} ${params.brand || ''} supplement facts nutrition facts protein bcaa calories ingredients allergens directions how to use`.trim();
    const searchOutcome = await searchInternet(query, 4, params.signal);

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

  const userPrompt = buildUserPrompt(params, searchEvidence);

  if (isGeminiAvailable()) {
    try {
      const geminiResult = await callGeminiContent({
        userPrompt,
        systemInstruction: PRODUCT_GENERATOR_SYSTEM_PROMPT,
        temperature: 0.2,
        maxTokens: 4096,
        signal: params.signal,
      });

      const parsedData = parseLLMJson<ProductGeneratedData>(geminiResult.text);
      return normalizeProductData(parsedData, sources, params.category);
    } catch (geminiError) {
      console.warn('[AI Product] All Gemini models failed, falling back to Mistral:', geminiError);
    }
  }

  const rawResponse = await callMistralChat({
    systemPrompt: PRODUCT_GENERATOR_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    temperature: 0.25,
    responseFormat: { type: 'json_object' },
    signal: params.signal,
  });

  const parsedData = parseLLMJson<ProductGeneratedData>(rawResponse);
  return normalizeProductData(parsedData, sources, params.category);
}
