'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (delta: number) => void;
  onRemove: () => void;
}

export function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const lineSubtotal = item.price * item.quantity;

  return (
    <div className="flex gap-3.5 sm:gap-5 p-3.5 sm:p-5 rounded-2xl bg-white border border-neutral-200/90 transition-all hover:border-neutral-400/80 items-start">
      {/* Product Image Thumbnail */}
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-50/70 border border-neutral-200/60 p-2">
        <Image
          src={item.image}
          alt={item.productName}
          fill
          sizes="96px"
          className="object-contain"
        />
      </div>

      {/* Product Details & Controls */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
        {/* Top: Brand, Title, and Delete Icon */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 pr-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5 leading-none">
                {item.brand}
              </span>
              <h3 className="text-xs sm:text-base font-bold text-neutral-900 line-clamp-2 leading-snug">
                <Link href={`/products/${item.productId}`} className="hover:text-black transition-colors">
                  {item.productName}
                </Link>
              </h3>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="p-1 -mr-1 -mt-1 text-neutral-400 hover:text-rose-600 transition-colors flex-shrink-0"
              aria-label={`Xóa ${item.productName}`}
              title="Xóa sản phẩm"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Variants chips */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 font-medium text-neutral-700 border border-neutral-200/50">
              Vị: {item.flavor.name}
            </span>
            {item.size && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 font-medium text-neutral-700 border border-neutral-200/50">
                {item.size.name}
              </span>
            )}
          </div>
        </div>

        {/* Bottom row: Stepper (Left) & Price (Right) */}
        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
          {/* Stepper */}
          <div className="flex h-7 sm:h-8 items-center rounded-full border border-neutral-200 bg-neutral-50/80 px-1">
            <button
              type="button"
              onClick={() => onUpdateQuantity(-1)}
              className="grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-full text-neutral-600 hover:bg-white hover:text-neutral-900 active:scale-90 transition-all"
              aria-label={`Giảm số lượng ${item.productName}`}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-neutral-900">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(1)}
              className="grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-full text-neutral-600 hover:bg-white hover:text-neutral-900 active:scale-90 transition-all"
              aria-label={`Tăng số lượng ${item.productName}`}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Line Subtotal */}
          <div className="text-right whitespace-nowrap">
            {item.quantity > 1 && (
              <span className="text-[10px] text-neutral-400 block font-normal leading-none mb-0.5">
                {formatPrice(item.price)} × {item.quantity}
              </span>
            )}
            <span className="text-sm sm:text-base font-black text-neutral-900 tracking-tight">
              {formatPrice(lineSubtotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
