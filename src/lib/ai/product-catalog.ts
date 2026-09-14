import { z } from 'zod';
import { getProductCatalogRows } from '@/services/product.service';
import { formatPrice } from '@/lib/utils';

const text = z.string().nullish();
const amount = z.number().finite().nonnegative().nullish();
const macroSchema = z.object({
  protein: text, bcaa: text, calories: text, sugar: text, servings: amount,
  protein_label: text, bcaa_label: text, calories_label: text, sugar_label: text,
  nutrition_table: z.array(z.object({ name: z.string(), perServing: z.string(), per100g: text })).nullish(),
  ingredients: text, allergens: text,
});
const productSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/), name: z.string(), brand: z.string(),
  category: z.string(), price: amount, in_stock: z.boolean().nullish(),
  description: text, how_to_use: text,
  product_macros: z.union([macroSchema, z.array(macroSchema)]).nullish(),
  product_flavors: z.array(z.object({ name: z.string() })).nullish(),
  product_sizes: z.array(z.object({
    name: z.string(), price: amount, servings: amount, in_stock: z.boolean().nullish(),
  })).nullish(),
  product_goals: z.array(z.object({ goal: z.string() })).nullish(),
});
type CatalogProduct = z.infer<typeof productSchema>;

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function relevance(product: CatalogProduct, query: string): number {
  const name = normalize(product.name);
  const primary = normalize(`${product.name} ${product.brand} ${product.category}`);
  const description = normalize(product.description || '');
  const words = query.split(' ');
  if (name === query) return 100;
  if (primary.includes(query)) return 80;
  if (words.every((word) => primary.split(' ').includes(word))) return 60;
  if (words.every((word) => `${primary} ${description}`.split(' ').includes(word))) return 20;
  return 0;
}

function productFacts(product: CatalogProduct) {
  const macros = Array.isArray(product.product_macros) ? product.product_macros[0] : product.product_macros;
  return {
    id: product.id, name: product.name, brand: product.brand, category: product.category,
    price: product.price ?? null, currency: 'VND', inStock: product.in_stock ?? null,
    flavors: product.product_flavors?.map((flavor) => flavor.name) ?? [],
    sizes: product.product_sizes ?? [], nutrition: macros ?? null,
    goals: product.product_goals?.map((item) => item.goal) ?? [],
    description: product.description?.slice(0, 1800) ?? null,
    howToUse: product.how_to_use?.slice(0, 1200) ?? null,
    card: `[PRODUCT_CARD:${product.id}]`,
  };
}

/** Uses raw shop facts, never mock products or display-only nutrition/flavor defaults. */
export async function searchShopProducts(query: string, signal?: AbortSignal) {
  const products = z.array(productSchema).parse(await getProductCatalogRows(signal));
  const normalized = normalize(query);
  if (!normalized) return [];
  return products.map((product) => ({ product, score: relevance(product, normalized) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Number(b.product.in_stock) - Number(a.product.in_stock))
    .slice(0, 4).map(({ product }) => productFacts(product));
}

let cachedSummary: { text: string; expiresAt: number } | null = null;
const SUMMARY_TTL_MS = 60_000;

/** Trích xuất tóm tắt danh mục sản phẩm Supabase (kèm thẻ ID) với bộ nhớ đệm 60s cho AI prompt. */
export async function getShopCatalogSummary(signal?: AbortSignal): Promise<string> {
  const now = Date.now();
  if (cachedSummary && cachedSummary.expiresAt > now) {
    return cachedSummary.text;
  }
  try {
    const rawRows = await getProductCatalogRows(signal);
    const products = z.array(productSchema).parse(rawRows);
    if (products.length === 0) {
      return '(Kho hàng hiện tại chưa có sản phẩm nào được kích hoạt.)';
    }
    const lines = products.map((p) => {
      const macros = Array.isArray(p.product_macros) ? p.product_macros[0] : p.product_macros;
      const details: string[] = [
        `[PRODUCT_CARD:${p.id}] : ${p.name}`,
        `Brand: ${p.brand}`,
        `Danh mục: ${p.category}`,
        `Giá: ${formatPrice(p.price ?? 0)}`,
        p.in_stock ? 'Còn hàng' : 'Tạm hết hàng',
      ];
      if (macros?.protein) details.push(`Protein: ${macros.protein}`);
      if (macros?.servings) details.push(`${macros.servings} lần dùng`);
      return `- ${details.join(' | ')}`;
    });
    const summary = lines.join('\n');
    cachedSummary = { text: summary, expiresAt: now + SUMMARY_TTL_MS };
    return summary;
  } catch (err) {
    console.error('[ProductCatalog] Failed to load catalog summary:', err);
    return cachedSummary?.text || '(Không thể tải danh mục sản phẩm từ Supabase lúc này.)';
  }
}

