'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingBag, Check, X } from 'lucide-react';
import { getProductBySlug } from '@/services/product.service';
import { useCart } from '@/context/cart-context';
import { formatPrice, cn } from '@/lib/utils';
import { Product } from '@/types/product';

interface BlogMobileBottomBarProps {
  productId?: string;
}

export function BlogMobileBottomBar({ productId }: BlogMobileBottomBarProps) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    getProductBySlug(productId).then((res) => {
      if (active) setProduct(res);
    });
    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sticky-bar-change', { detail: { visible: isVisible } })
      );
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('sticky-bar-change', { detail: { visible: false } })
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!product || isDismissed) return;

    const handleScroll = () => {
      // Show when user has scrolled past 400px
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [product, isDismissed]);

  if (!product || isDismissed) return null;

  const handleQuickAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      price: product.price,
      flavor: product.flavors?.[0] || { id: 'std', name: 'Tiêu Chuẩn', colorHex: '#0071e3' },
      image: product.defaultImage,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <aside
      aria-label="Đặt nhanh sản phẩm bài viết"
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-10 w-10 shrink-0 rounded-lg bg-slate-50 border border-slate-100 p-0.5">
            <Image src={product.defaultImage} alt={product.name} fill className="object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-apple-blue uppercase tracking-wider">
              Khuyên Dùng Trong Bài
            </p>
            <p className="text-xs font-bold text-apple-dark truncate">{product.name}</p>
            <p className="text-xs font-bold text-red-600">{formatPrice(product.price)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleQuickAdd}
            className={cn(
              'h-9 px-3.5 rounded-full text-xs font-semibold text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-sm',
              isAdded ? 'bg-emerald-600' : 'bg-apple-blue hover:bg-apple-blue-hover'
            )}
          >
            {isAdded ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
            <span>{isAdded ? 'Đã thêm' : 'Mua ngay'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="h-10 w-10 -mr-2 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
            aria-label="Đóng thanh mua hàng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
