import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface CartLineItemProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (delta: number) => void;
}

export function CartLineItem({ item, onRemove, onUpdateQuantity }: CartLineItemProps) {
  return (
    <article className="flex gap-2.5 sm:gap-3.5 rounded-xl border border-neutral-200/80 p-2.5 sm:p-3 bg-white hover:border-neutral-300 transition-colors">
      <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-none overflow-hidden rounded-lg bg-neutral-50 p-1 border border-neutral-100">
        <Image src={item.image} alt={item.productName} fill sizes="64px" className="object-contain p-0.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-apple-blue">{item.brand}</p>
        <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-neutral-900 leading-snug mt-0.5">
          {item.productName}
        </h3>
        <p className="mt-0.5 text-[11px] leading-4 text-neutral-500">
          Vị: {item.flavor.name}{item.size ? ` · ${item.size.name}` : ''}
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-1.5">
          <p className="text-xs sm:text-sm font-bold text-neutral-900 whitespace-nowrap">
            {formatPrice(item.price * item.quantity)}
          </p>

          <div className="flex items-center gap-1.5">
            <div className="flex h-7 items-center rounded-lg border border-neutral-200 bg-neutral-50/60">
              <button
                type="button"
                onClick={() => onUpdateQuantity(-1)}
                className="grid h-7 w-6 place-items-center text-neutral-600 hover:text-black transition-colors"
                aria-label={`Giảm số lượng ${item.productName}`}
              >
                <Minus className="h-2.5 w-2.5" />
              </button>
              <span className="min-w-[22px] text-center text-xs font-semibold text-neutral-900">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(1)}
                className="grid h-7 w-6 place-items-center text-neutral-600 hover:text-black transition-colors"
                aria-label={`Tăng số lượng ${item.productName}`}
              >
                <Plus className="h-2.5 w-2.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="grid h-7 w-7 place-items-center rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              aria-label={`Xóa ${item.productName} khỏi giỏ hàng`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
