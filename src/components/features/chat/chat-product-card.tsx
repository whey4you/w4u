'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { Product } from '@/types/product';
import { getProductBySlug } from '@/services/product.service';

interface ChatProductCardProps {
  productId?: string;
  product?: Product;
}

export function ChatProductCard({ productId, product: propProduct }: ChatProductCardProps) {
  const [product, setProduct] = useState<Product | null>(propProduct || null);

  useEffect(() => {
    if (propProduct) {
      setProduct(propProduct);
      return;
    }
    if (!productId) return;
    let active = true;
    getProductBySlug(productId).then((res) => {
      if (active) setProduct(res);
    });
    return () => {
      active = false;
    };
  }, [productId, propProduct]);

  if (!product) return null;

  return (
    <div className="flex w-[185px] sm:w-[195px] shrink-0 snap-start flex-col rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs transition hover:border-brand-500 hover:shadow-xs">
      {/* Product Image */}
      <div className="relative h-24 w-full overflow-hidden rounded-lg bg-slate-50/80 border border-slate-100/80 mb-2">
        <Image
          src={product.defaultImage}
          alt={product.name}
          fill
          className="object-contain p-1.5"
          sizes="180px"
        />
        {product.badge && (
          <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 rounded-md bg-brand-50 px-1.5 py-0.5 text-[8.5px] font-semibold text-brand-700 border border-brand-200/60">
            <Flame className="h-2 w-2 text-brand-600" />
            {product.badge}
          </span>
        )}
      </div>

      {/* Brand & Name */}
      <span className="text-[9.5px] font-bold uppercase tracking-wider text-brand-600 truncate">
        {product.brand}
      </span>
      <h4
        className="text-[11.5px] font-semibold text-slate-800 line-clamp-2 leading-snug mt-0.5 min-h-[30px]"
        title={product.name}
      >
        {product.name}
      </h4>

      {/* Protein & Price */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[12px] font-bold text-red-600">
            {product.price.toLocaleString('vi-VN')}đ
          </div>
          {product.macros?.protein && (
            <span className="text-[9.5px] font-medium text-slate-400">
              {product.macros.protein} Protein
            </span>
          )}
        </div>

        <Link
          href={product.slug ? `/products/${product.slug}` : `/products/${product.id}`}
          target="_blank"
          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-[10.5px] font-semibold text-brand-600 hover:bg-brand-600 hover:text-white transition"
          title="Xem chi tiết"
        >
          Xem
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
