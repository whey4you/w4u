'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ChatProductCard } from './chat-product-card';
import { getProductBySlug } from '@/services/product.service';
import { Product } from '@/types/product';

interface ChatProductCarouselProps {
  productIds: string[];
}

/**
 * Hiển thị danh sách sản phẩm gợi ý dạng thẻ cuộn ngang.
 * Tự động ẩn hoàn toàn nếu không tìm thấy sản phẩm hợp lệ, tránh giao diện bị trống.
 */
export function ChatProductCarousel({ productIds }: ChatProductCarouselProps) {
  const [validProducts, setValidProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!productIds || productIds.length === 0) {
      setValidProducts([]);
      return;
    }
    let active = true;
    Promise.all(productIds.map((id) => getProductBySlug(id))).then((results) => {
      if (!active) return;
      const valid = results.filter((p): p is Product => Boolean(p));
      const seen = new Set<string>();
      setValidProducts(
        valid.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        })
      );
    });
    return () => {
      active = false;
    };
  }, [productIds]);

  if (!productIds || productIds.length === 0 || validProducts.length === 0) return null;

  return (
    <div className="mt-3 pt-2.5 border-t border-slate-200/70">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="h-3.5 w-3.5 text-brand-600" />
          <span className="text-[11px] font-bold text-slate-700">
            Sản phẩm đề xuất ({validProducts.length})
          </span>
        </div>
        {validProducts.length > 1 && (
          <span className="text-[10px] text-slate-400">Vuốt ngang để xem thêm →</span>
        )}
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar snap-x snap-mandatory -mx-1 px-1 scroll-smooth">
        {validProducts.map((product) => (
          <ChatProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
