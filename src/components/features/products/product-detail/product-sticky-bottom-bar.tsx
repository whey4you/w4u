'use client';

import React, { useEffect } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, cn } from '@/lib/utils';

interface ProductStickyBottomBarProps {
  isVisible: boolean;
  totalPrice: number;
  quantity: number;
  available: boolean;
  added: boolean;
  onAdd: () => void;
}

export function ProductStickyBottomBar({
  isVisible,
  totalPrice,
  quantity,
  available,
  added,
  onAdd,
}: ProductStickyBottomBarProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sticky-bar-change', { detail: { visible: isVisible } }));
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sticky-bar-change', { detail: { visible: false } }));
      }
    };
  }, []);

  return (
    <aside
      aria-label="Thanh đặt hàng nhanh"
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden transition-all duration-300 ease-out',
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500">Tổng ({quantity} món)</p>
          <p className="truncate text-base sm:text-lg font-bold text-apple-dark">
            {formatPrice(totalPrice)}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={onAdd}
          disabled={!available}
          className={cn(
            'h-11 rounded-full px-5 sm:px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-95 shrink-0',
            added ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-apple-blue hover:bg-apple-blue-hover shadow-blue-500/25'
          )}
        >
          {added ? <Check className="mr-1.5 h-4 w-4" /> : <ShoppingBag className="mr-1.5 h-4 w-4" />}
          <span>{added ? 'Đã thêm vào giỏ!' : 'Thêm vào giỏ hàng'}</span>
        </Button>
      </div>
    </aside>
  );
}
