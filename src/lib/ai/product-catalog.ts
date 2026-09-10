import { z } from 'zod';
import { getProductCatalogRows } from '@/services/product.service';

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
