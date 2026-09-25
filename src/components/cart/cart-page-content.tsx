'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Container } from '@/components/ui/container';
import { CartItemCard } from './cart-item-card';
import { CartSummaryCard } from './cart-summary-card';

export function CartPageContent() {
  const { items, totalAmount, totalItems, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center py-16">
        <Container className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-700">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-neutral-900">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            Khám phá các dòng sản phẩm dinh dưỡng thể hình chất lượng cao tại Whey4You để bắt đầu đơn hàng.
          </p>
          <div className="pt-2">
            <Link href="/products">
              <button
                type="button"
                className="py-3 px-8 rounded-full bg-neutral-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm"
              >
                Tiếp tục mua sắm
              </button>
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50/30 py-8 sm:py-12">
      <Container className="max-w-7xl">
        {/* Header navigation & title */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Tiếp tục chọn sản phẩm</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight uppercase">
            Giỏ hàng của bạn
          </h1>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Items list */}
          <div className="lg:col-span-8 space-y-3">
            {items.map((item) => (
              <CartItemCard
                key={`${item.productId}-${item.flavor.id}-${item.size?.id || 'default'}`}
                item={item}
                onUpdateQuantity={(delta) => updateQuantity(item.productId, item.flavor.id, item.size?.id, delta)}
                onRemove={() => removeItem(item.productId, item.flavor.id, item.size?.id)}
              />
            ))}
          </div>

          {/* Right: Sticky Summary */}
          <div className="lg:col-span-4">
            <CartSummaryCard totalAmount={totalAmount} totalItems={totalItems} />
          </div>
        </div>
      </Container>
    </main>
  );
}
