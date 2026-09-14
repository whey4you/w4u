'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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

  const productUrl = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;

  return (
    <Link
      href={productUrl}
      target="_blank"
      className="group flex w-[230px] sm:w-[245px] shrink-0 snap-start items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white p-2 shadow-2xs transition-all hover:border-brand-500 hover:shadow-xs active:scale-[0.99]"
      title={`Xem chi tiết ${product.name}`}
    >
      {/* Product Image (Trái) */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100 p-1">
        <Image
          src={product.defaultImage}
          alt={product.name}
          fill
          className="object-contain p-0.5 group-hover:scale-105 transition-transform duration-200"
          sizes="56px"
        />
      </div>

      {/* Product Content (Phải) */}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        {product.brand && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600 truncate">
            {product.brand}
          </span>
        )}
        <h4 className="text-[12px] font-semibold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h4>
        <div className="mt-0.5 flex items-center">
          <span className="text-[12px] font-bold text-red-600">
            {product.price.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      {/* Mũi tên chỉ hướng tinh tế */}
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all mr-0.5" />
    </Link>
  );
}

