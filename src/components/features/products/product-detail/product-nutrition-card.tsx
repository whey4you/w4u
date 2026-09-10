import { Product, MacroNutrients } from '@/types/product';
import { getProductQuickMetrics } from '@/lib/nutrition-helpers';

interface ProductNutritionCardProps {
  product?: Product;
  macros?: MacroNutrients;
  servings?: number | string;
}

export function ProductNutritionCard({ product, macros, servings }: ProductNutritionCardProps) {
  const effectiveProduct: Product = product || {
    id: '',
    name: '',
    brand: '',
    category: 'whey',
    goals: [],
    price: 0,
    rating: 5,
    reviewCount: 0,
    defaultImage: '',
    inStock: true,
    macros: macros || { protein: '25g', servings: 60 },
    flavors: [],
  };

  const items = getProductQuickMetrics(effectiveProduct);
  const displayServings = servings ?? effectiveProduct.macros?.servings ?? 60;

  return (
    <section className="border-y border-slate-200 py-5" aria-label="Thông số dinh dưỡng nổi bật">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Mỗi lần dùng
        </h2>
        <span className="text-xs text-slate-500">{displayServings} lần dùng</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-xs text-slate-500">{item.label}</dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight text-apple-dark">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
