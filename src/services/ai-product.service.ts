export interface GenerateProductParams {
  productName: string;
  brand?: string;
  category?: string;
  targetField?: 'all' | 'ingredients' | 'allergens' | 'description' | 'howToUse' | 'macros';
}

export interface GeneratedNutritionItem {
  id?: string;
  name: string;
  perServing: string;
  per100g?: string;
}

export interface GeneratedProductResponse {
  protein?: string;
  bcaa?: string;
  calories?: string;
  sugar?: string;
  servings?: string;
  nutritionTable?: GeneratedNutritionItem[];
  ingredients: string;
  allergens: string;
  description: string;
  howToUse: string;
  sources: Array<{ title: string; url: string }>;
}

export async function generateProductDetails(
  params: GenerateProductParams,
  signal?: AbortSignal
): Promise<GeneratedProductResponse> {
  const res = await fetch('/api/ai/product/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Lỗi khi gọi dịch vụ AI soạn thảo sản phẩm.');
  }

  return json.data;
}
