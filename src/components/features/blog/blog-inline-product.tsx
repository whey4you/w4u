'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ShoppingBag, Sparkles, ExternalLink } from 'lucide-react';
import { getProductBySlug } from '@/services/product.service';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { Product, ProductFlavor } from '@/types/product';

interface BlogInlineProductProps {
  productId: string;
}

export function BlogInlineProduct({ productId }: BlogInlineProductProps) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<ProductFlavor | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    let active = true;
    getProductBySlug(productId).then((res) => {
      if (active && res) {
        setProduct(res);
        if (res.flavors && res.flavors.length > 0) {
          setSelectedFlavor(res.flavors[0]);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [productId]);

  const activeFlavor: ProductFlavor = selectedFlavor || product?.flavors?.[0] || {
    id: 'std',
    name: 'Tiêu Chuẩn',
    colorHex: '#0071e3',
  };

  if (!product) return null;

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addItem({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      price: product.price,
      flavor: activeFlavor,
      image: activeFlavor.image || product.defaultImage,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <aside
      aria-label={`Sản phẩm tham khảo: ${product.name}`}
      className="my-6 sm:my-8 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300"
    >
      {/* Header Pill */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider text-apple-blue uppercase">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          Sản Phẩm Tham Khảo
        </span>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
          {product.badge || 'Chính Hãng BCA'}
        </span>
      </div>

      {/* 2-Column Horizontal Layout: Image Left, Details & Actions Right */}
      <div className="flex flex-row items-start gap-3 sm:gap-5">
        {/* Left: Product Image (Crisp & Prominent) */}
        <Link
          href={`/products/${product.id}`}
          className="relative h-28 w-24 xs:h-32 xs:w-28 sm:h-44 sm:w-36 shrink-0 bg-slate-50/80 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 p-1 sm:p-2 flex items-center justify-center group/img block"
        >
          <Image
            src={product.defaultImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 112px, 144px"
            className="object-contain p-1 group-hover/img:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Right: Content & Action Button */}
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2 sm:space-y-3">
          <div>
            <span className="text-[9.5px] sm:text-[10px] font-bold text-apple-subhead uppercase tracking-wider block">
              {product.brand}
            </span>
            <h3 className="text-xs xs:text-sm sm:text-base font-semibold text-apple-dark leading-snug hover:text-apple-blue transition-colors line-clamp-2 mt-0.5">
              <Link href={`/products/${product.id}`}>{product.name}</Link>
            </h3>

            {/* Quick Macro Specs */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10.5px] sm:text-xs">
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-blue-50 text-apple-blue font-semibold border border-blue-100">
                {product.macros.protein} Protein
              </span>
              {product.macros.servings && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                  {product.macros.servings} lần
                </span>
              )}
            </div>
          </div>

          {/* Flavor Selection Chips */}
          {product.flavors && product.flavors.length > 1 && (
            <div className="space-y-1">
              <span className="text-[10.5px] text-slate-500 font-medium block">
                Vị: <strong className="text-slate-800">{activeFlavor.name}</strong>
              </span>
              <div className="flex flex-wrap gap-1">
                {product.flavors.map((flv) => (
                  <button
                    key={flv.id}
                    type="button"
                    onClick={() => setSelectedFlavor(flv)}
                    className={`px-2 py-0.5 text-[10px] sm:text-[11px] rounded-md font-medium transition-all ${
                      activeFlavor.id === flv.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {flv.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price & Add to Cart */}
          <div className="flex flex-wrap xs:flex-nowrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="min-w-0">
              <span className="text-sm sm:text-lg font-bold text-red-600 block leading-tight">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href={`/products/${product.id}`}
                className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200"
              >
                Chi tiết
                <ExternalLink className="h-3 w-3" />
              </Link>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm shrink-0 ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-apple-blue text-white hover:bg-apple-blue-hover'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Đã thêm!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Thêm vào giỏ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
