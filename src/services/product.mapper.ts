import { Product, ProductSize, WorkoutGoal, NutritionTableRow, ProductFAQ, MacroNutrients } from '@/types/product';

interface RawProductMacro {
  protein: string;
  bcaa?: string;
  calories?: string;
  sugar?: string;
  servings: number;
  protein_label?: string;
  bcaa_label?: string;
  calories_label?: string;
  sugar_label?: string;
  servings_label?: string;
  nutrition_table?: NutritionTableRow[];
  ingredients?: string;
  allergens?: string;
}

export interface RawProductRow {
  id: string;
  name: string;
  brand: string;
  category: 'whey' | 'strength' | 'vitamins';
  price: number;
  original_price?: number;
  discount_percent?: number;
  rating: number;
  review_count: number;
  badge?: string;
  default_image: string;
  images?: string[];
  in_stock: boolean;
  slug?: string;
  description?: string;
  how_to_use?: string;
  faq?: ProductFAQ[];
  product_macros?: RawProductMacro | RawProductMacro[];
  product_flavors?: {
    id: string;
    name: string;
    color_hex: string;
    image?: string;
  }[];
  product_goals?: { goal: string }[];
  product_sizes?: {
    id: string;
    name: string;
    servings: number;
    price: number;
    original_price?: number;
    flavor_prices?: Record<string, { price: number; originalPrice?: number }>;
    in_stock?: boolean;
    sort_order?: number;
  }[];
}

const VALID_GOALS: WorkoutGoal[] = [
  'all',
  'lean-muscle',
  'mass-gaining',
  'strength',
  'fat-loss',
];

function getMacros(value?: RawProductMacro | RawProductMacro[]): MacroNutrients {
  const macros = Array.isArray(value) ? value[0] : value;
  if (!macros) {
    return {
      protein: '25g',
      servings: 50,
      bcaa: '',
      calories: '',
      sugar: '',
      nutritionTable: [],
    };
  }

  return {
    protein: macros.protein || '25g',
    servings: Number(macros.servings || 50),
    bcaa: macros.bcaa || undefined,
    calories: macros.calories || undefined,
    sugar: macros.sugar || undefined,
    proteinLabel: macros.protein_label,
    bcaaLabel: macros.bcaa_label,
    caloriesLabel: macros.calories_label,
    sugarLabel: macros.sugar_label,
    servingsLabel: macros.servings_label,
    nutritionTable: Array.isArray(macros.nutrition_table) ? macros.nutrition_table : [],
    ingredients: macros.ingredients,
    allergens: macros.allergens,
  };
}

function isWorkoutGoal(goal: string): goal is WorkoutGoal {
  return VALID_GOALS.includes(goal as WorkoutGoal);
}

export function mapRowToProduct(row: RawProductRow): Product {
  const flavors = (row.product_flavors || []).map((flavor) => ({
    id: flavor.id,
    name: flavor.name,
    colorHex: flavor.color_hex,
    image: flavor.image || undefined,
  }));
  const sizes: ProductSize[] = (row.product_sizes || [])
    .map((size, index) => ({
      id: size.id,
      name: size.name,
      servings: Number(size.servings || 60),
      price: Number(size.price),
      originalPrice: size.original_price ? Number(size.original_price) : undefined,
      flavorPrices: size.flavor_prices || undefined,
      inStock: size.in_stock !== false,
      sortOrder: size.sort_order !== undefined ? Number(size.sort_order) : index,
    }))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const goals = (row.product_goals || []).map(({ goal }) => goal).filter(isWorkoutGoal);

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    discountPercent: row.discount_percent ? Number(row.discount_percent) : undefined,
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    badge: row.badge,
    defaultImage: row.default_image || '/products/r1-protein.jpg',
    images: row.images || [],
    inStock: Boolean(row.in_stock),
    slug: row.slug || row.id,
    description: row.description,
    howToUse: row.how_to_use,
    macros: getMacros(row.product_macros),
    flavors: flavors.length > 0
      ? flavors
      : [{ id: 'std', name: 'Tiêu chuẩn', colorHex: '#0071e3' }],
    sizes: sizes.length > 0 ? sizes : undefined,
    goals: goals.length > 0 ? goals : ['lean-muscle'],
    faq: Array.isArray(row.faq) ? row.faq : [],
  };
}
