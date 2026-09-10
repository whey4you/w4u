import { Product, MacroNutrients, NutritionTableRow } from '@/types/product';

export interface MacroPreset {
  labels: {
    protein: string;
    bcaa: string;
    calories: string;
    sugar: string;
    servings: string;
  };
  defaults: {
    protein: string;
    bcaa: string;
    calories: string;
    sugar: string;
    servings: number;
  };
  defaultTable: NutritionTableRow[];
  defaultIngredients: string;
  defaultAllergens: string;
}

export const CATEGORY_MACRO_PRESETS: Record<'whey' | 'strength' | 'vitamins', MacroPreset> = {
  whey: {
    labels: {
      protein: 'Protein / Lần Dùng',
      bcaa: 'Hàm Lượng BCAA',
      calories: 'Năng Lượng',
      sugar: 'Hàm Lượng Đường',
      servings: 'Số Lần Dùng',
    },
    defaults: {
      protein: '25g',
      bcaa: '6.0g',
      calories: '110 Cal',
      sugar: '0g',
      servings: 70,
    },
    defaultTable: [
      { name: 'Protein', perServing: '25g', per100g: '~80g' },
      { name: 'BCAA tự nhiên', perServing: '6.0g', per100g: '~18g' },
      { name: 'Năng lượng', perServing: '110 kcal', per100g: '~380 kcal' },
      { name: 'Đường (Sugar)', perServing: '0g', per100g: '~1.5g' },
    ],
    defaultIngredients: 'Whey Protein Isolate/Hydrolyzed (Sữa), Hương liệu tự nhiên, Lecithin hướng dương, Chất tạo ngọt (Sucralose).',
    defaultAllergens: 'Lưu ý dị ứng: Chứa thành phần từ Sữa và Đậu nành.',
  },
  strength: {
    labels: {
      protein: 'Hoạt Chất Chính',
      bcaa: 'Độ Tinh Khiết',
      calories: 'Năng Lượng',
      sugar: 'Chất Phụ Gia',
      servings: 'Số Lần Dùng',
    },
    defaults: {
      protein: '5g Creatine Pure',
      bcaa: '100% Pure',
      calories: '0 Cal',
      sugar: '0%',
      servings: 60,
    },
    defaultTable: [
      { name: 'Creatine Monohydrate', perServing: '5g', per100g: '100g' },
      { name: 'Năng lượng', perServing: '0 kcal', per100g: '0 kcal' },
      { name: 'Chất béo / Đường', perServing: '0g', per100g: '0g' },
      { name: 'Tạp chất / Phụ gia', perServing: '0%', per100g: '0%' },
    ],
    defaultIngredients: '100% Pure Micronized Creatine Monohydrate. Không chứa phụ gia, hương liệu hay chất độn.',
    defaultAllergens: 'Không chứa chất gây dị ứng thông thường (Gluten-free, Non-GMO, Soy-free).',
  },
  vitamins: {
    labels: {
      protein: 'Thành Phần Chủ Đạo',
      bcaa: 'Dạng Bào Chế',
      calories: 'Năng Lượng',
      sugar: 'Liều Dùng',
      servings: 'Quy Cách (Viên)',
    },
    defaults: {
      protein: '23+ Loại Vitamin',
      bcaa: 'Viên Nang Nhanh',
      calories: '0 Cal',
      sugar: '1 viên/ngày',
      servings: 90,
    },
    defaultTable: [
      { name: 'Vitamin Tổng Hợp (A, C, D3, E, Nhóm B)', perServing: 'Đạt chuẩn 100% RDA', per100g: '—' },
      { name: 'Khoáng chất Vi lượng (Kẽm, Magie, Canxi)', perServing: 'Hấp thu sinh học cao', per100g: '—' },
      { name: 'Hợp chất chống oxy hóa tự nhiên', perServing: 'Tăng đề kháng tối đa', per100g: '—' },
    ],
    defaultIngredients: 'Hỗn hợp Vitamin & Khoáng chất thiết yếu, Vỏ nang Gelatin thực vật, Magnesi stearat, Cellulose vi tinh thể.',
    defaultAllergens: 'Chiết xuất tự nhiên, an toàn cho hệ tiêu hóa, không chứa chất gây dị ứng.',
  },
};

function resolveCategoryPreset(product: Product) {
  const isProteinOrMass =
    product.category === 'whey' ||
    product.name?.toLowerCase().includes('mass') ||
    product.name?.toLowerCase().includes('protein') ||
    product.name?.toLowerCase().includes('iso');
  if (isProteinOrMass) return CATEGORY_MACRO_PRESETS.whey;
  const category = product.category in CATEGORY_MACRO_PRESETS ? product.category : 'whey';
  return CATEGORY_MACRO_PRESETS[category];
}

export function getProductHUDStats(product: Product): { label: string; value: string }[] {
  const preset = resolveCategoryPreset(product);
  const isWhey = preset === CATEGORY_MACRO_PRESETS.whey;
  const macros = product.macros || ({} as Partial<MacroNutrients>);

  const label1 = macros.proteinLabel || (isWhey ? 'Protein' : preset.labels.protein.split('/')[0].trim());
  const val1 = macros.protein && macros.protein !== '0g' ? macros.protein : preset.defaults.protein;

  const label2 = macros.bcaaLabel || (isWhey ? 'BCAA' : preset.labels.bcaa.split('/')[0].trim());
  const val2 = macros.bcaa && macros.bcaa !== '0g' ? macros.bcaa : (isWhey ? '5.5g' : preset.defaults.bcaa);

  const label3 = macros.servingsLabel || 'Lần dùng';
  const val3 = String(macros.servings || preset.defaults.servings);

  return [
    { label: label1, value: val1 },
    { label: label2, value: val2 },
    { label: label3, value: val3 },
  ];
}

export function getProductQuickMetrics(product: Product): { label: string; value: string }[] {
  const preset = resolveCategoryPreset(product);
  const isWhey = preset === CATEGORY_MACRO_PRESETS.whey;
  const macros = product.macros || ({} as Partial<MacroNutrients>);

  return [
    {
      label: macros.proteinLabel || (isWhey ? 'Protein' : preset.labels.protein),
      value: macros.protein && macros.protein !== '0g' ? macros.protein : preset.defaults.protein,
    },
    {
      label: macros.bcaaLabel || (isWhey ? 'BCAA' : preset.labels.bcaa),
      value: macros.bcaa && macros.bcaa !== '0g' ? macros.bcaa : preset.defaults.bcaa,
    },
    {
      label: macros.caloriesLabel || (isWhey ? 'Năng Lượng' : preset.labels.calories),
      value: macros.calories && macros.calories !== '0' ? macros.calories : preset.defaults.calories,
    },
    {
      label: macros.sugarLabel || (isWhey ? 'Đường' : preset.labels.sugar),
      value: macros.sugar && macros.sugar !== '0g' ? macros.sugar : preset.defaults.sugar,
    },
  ];
}

export function getDetailedNutritionTable(product: Product): NutritionTableRow[] {
  if (product.macros?.nutritionTable && product.macros.nutritionTable.length > 0) {
    return product.macros.nutritionTable;
  }
  return resolveCategoryPreset(product).defaultTable;
}

export function getProductAllergenInfo(product: Product): { ingredients: string; allergens: string } {
  const preset = resolveCategoryPreset(product);
  return {
    ingredients: product.macros?.ingredients || preset.defaultIngredients,
    allergens: product.macros?.allergens || preset.defaultAllergens,
  };
}
