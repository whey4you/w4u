import { ProductSize } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface ProductPriceProps {
  price: number;
  originalPrice?: number;
  selectedSize?: ProductSize;
}

export function ProductPrice({ price, originalPrice, selectedSize }: ProductPriceProps) {
  const savings = originalPrice && originalPrice > price ? originalPrice - price : 0;
  const pricePerServing = selectedSize?.servings
    ? Math.round(price / selectedSize.servings)
    : null;

  return (
    <div className="border-y border-slate-200 py-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-3xl font-semibold tracking-[-0.035em] text-apple-dark sm:text-4xl">
          {formatPrice(price)}
        </span>
        {originalPrice && originalPrice > price && (
          <span className="text-base text-slate-400 line-through">{formatPrice(originalPrice)}</span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {pricePerServing && (
          <span className="text-slate-600">Khoảng {formatPrice(pricePerServing)} / lần dùng</span>
        )}
        {savings > 0 && (
          <span className="font-medium text-rose-700">Tiết kiệm {formatPrice(savings)}</span>
        )}
      </div>
    </div>
  );
}
