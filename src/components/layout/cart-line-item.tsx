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
    <article className="flex gap-3 rounded-xl border border-slate-200 p-3 sm:gap-4">
      <div className="relative h-16 w-16 flex-none overflow-hidden rounded-lg bg-slate-100 sm:h-20 sm:w-20">
        <Image src={item.image} alt={item.productName} fill sizes="80px" className="object-contain p-1" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-blue-700">{item.brand}</p>
        <h3 className="truncate text-sm font-semibold text-slate-950">{item.productName}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Vị: {item.flavor.name}{item.size ? ` · ${item.size.name}` : ''}
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-950">{formatPrice(item.price * item.quantity)}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex h-9 items-center rounded-lg border border-slate-300">
            <button
              type="button"
              onClick={() => onUpdateQuantity(-1)}
              className="grid h-9 w-9 place-items-center"
              aria-label={`Giảm số lượng ${item.productName}`}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(1)}
              className="grid h-9 w-9 place-items-center"
              aria-label={`Tăng số lượng ${item.productName}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="grid h-9 w-9 place-items-center text-slate-400 hover:text-rose-600"
            aria-label={`Xóa ${item.productName} khỏi giỏ hàng`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
