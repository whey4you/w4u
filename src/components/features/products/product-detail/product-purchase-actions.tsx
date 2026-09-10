'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useScrollPast } from '@/hooks/use-scroll-past';
import { ProductStickyBottomBar } from './product-sticky-bottom-bar';

interface ProductPurchaseActionsProps {
  added: boolean;
  available: boolean;
  price: number;
  originalPrice?: number;
  quantity: number;
  onAdd: () => void;
  onQuantityChange: (quantity: number) => void;
}

export function ProductPurchaseActions({
  added,
  available,
  price,
  originalPrice,
  quantity,
  onAdd,
  onQuantityChange,
}: ProductPurchaseActionsProps) {
  const [wishlist, setWishlist] = useState(false);
  const { targetRef, isScrolledPast } = useScrollPast<HTMLDivElement>();

  const totalPrice = price * quantity;
  const savings = originalPrice && originalPrice > price ? (originalPrice - price) * quantity : 0;

  return (
    <div className="space-y-4 pt-2">
      {/* Quantity Stepper & Wishlist & In-stock line */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 items-center rounded-xl border border-slate-300 bg-white">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={!available || quantity <= 1}
            className="grid h-10 w-9 place-items-center text-slate-600 hover:text-apple-dark disabled:opacity-30"
            aria-label="Giảm"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-apple-dark" aria-label={`Số lượng ${quantity}`}>
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(20, quantity + 1))}
            disabled={!available || quantity >= 20}
            className="grid h-10 w-9 place-items-center text-slate-600 hover:text-apple-dark disabled:opacity-30"
            aria-label="Tăng"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {available ? 'Còn hàng trong kho' : 'Tạm hết hàng'}
          </span>
          <button
            type="button"
            onClick={() => setWishlist(!wishlist)}
            className={`grid h-10 w-10 place-items-center rounded-xl border transition shadow-xs ${
              wishlist ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
            }`}
            aria-label={wishlist ? 'Đã thích' : 'Yêu thích'}
          >
            <Heart className={`h-4 w-4 ${wishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Price & Add to Cart Section (Visible on ALL viewports: Mobile, Tablet, Desktop) */}
      <div
        ref={targetRef}
        className="flex items-center justify-between gap-3 sm:gap-4 border-t border-slate-200/90 pt-4"
      >
        {/* Price & Discount Badges on Left */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-apple-dark">
            {formatPrice(totalPrice)}
          </div>
          {originalPrice && originalPrice > price && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
              <span className="text-slate-400 line-through">
                {formatPrice(originalPrice * quantity)}
              </span>
              {savings > 0 && (
                <span className="rounded-md bg-rose-50 border border-rose-200/80 px-1.5 py-0.5 font-semibold text-rose-700 text-[11px]">
                  Tiết kiệm {formatPrice(savings)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Big Pill Add To Cart Button on Right */}
        <Button
          type="button"
          size="lg"
          onClick={onAdd}
          disabled={!available}
          className={`h-11 sm:h-12 px-4 sm:px-7 rounded-full text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] shrink-0 ${
            added
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-apple-blue hover:bg-apple-blue-hover shadow-blue-500/20'
          }`}
        >
          {added ? (
            <Check className="mr-1.5 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5" />
          ) : (
            <ShoppingBag className="mr-1.5 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5" />
          )}
          <span>{added ? 'Đã thêm vào giỏ!' : 'Thêm vào giỏ hàng'}</span>
        </Button>
      </div>

      {/* Sticky Bottom Bar: Only slides in when user has scrolled down past the inline buy box */}
      <ProductStickyBottomBar
        isVisible={isScrolledPast}
        totalPrice={totalPrice}
        quantity={quantity}
        available={available}
        added={added}
        onAdd={onAdd}
      />
    </div>
  );
}
