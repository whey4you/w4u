export type WorkoutGoal = 
  | 'all' 
  | 'lean-muscle' 
  | 'mass-gaining' 
  | 'strength' 
  | 'fat-loss';

export interface ProductFlavor {
  id: string;
  name: string;
  colorHex: string;
  image?: string;
}

export interface NutritionTableRow {
  id?: string;
  name: string;
  perServing: string;
  per100g?: string;
}

export interface MacroNutrients {
  protein: string;
  bcaa?: string;
  calories?: string;
  sugar?: string;
  servings: number;
  proteinLabel?: string;
  bcaaLabel?: string;
  caloriesLabel?: string;
  sugarLabel?: string;
  servingsLabel?: string;
  nutritionTable?: NutritionTableRow[];
  ingredients?: string;
  allergens?: string;
}

export interface ProductSizeFlavorPrice {
  price: number;
  originalPrice?: number;
}

export interface ProductSize {
  id: string;
  name: string;
  servings: number;
  price: number;
  originalPrice?: number;
  flavorPrices?: Record<string, ProductSizeFlavorPrice>;
  inStock?: boolean;
  sortOrder?: number;
  weightKg?: number;
}

export interface ProductFAQ {
  id?: string;
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'whey' | 'strength' | 'vitamins';
  goals: WorkoutGoal[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  macros: MacroNutrients;
  flavors: ProductFlavor[];
  sizes?: ProductSize[];
  images?: string[];
  defaultImage: string;
  inStock: boolean;
  slug?: string;
  description?: string;
  howToUse?: string;
  faq?: ProductFAQ[];
  weightKg?: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  brand: string;
  price: number;
  flavor: ProductFlavor;
  size?: ProductSize;
  quantity: number;
  image: string;
  weightKg?: number;
}

export type ProductSortOption = 'price-asc' | 'price-desc';

export interface ProductFilterState {
  category: string;
  goals: WorkoutGoal[];
  priceRanges: string[];
  brands: string[];
  inStockOnly: boolean;
  sortBy: ProductSortOption;
}
