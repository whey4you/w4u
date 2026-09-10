'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAdminProducts } from '@/services/product.service';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { Product } from '@/types/product';

interface BlogSidebarCommerceProps {
  productIds?: string[];
}

export function BlogSidebarCommerce({ productIds = [] }: BlogSidebarCommerceProps) {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!productIds || productIds.length === 0) return;
    let active = true;
    getAdminProducts().then((all) => {
      if (active) {
        setProducts(
          all.filter(
            (p) => productIds.includes(p.id) || (p.slug && productIds.includes(p.slug))
          )
        );
      }
    });
    return () => {
      active = false;
    };
  }, [productIds]);

  const handleQuickAdd = (p: (typeof products)[0]) => {
    addItem({
      productId: p.id,
      productName: p.name,
      brand: p.brand,
      price: p.price,
      flavor: p.flavors?.[0] || { id: 'std', name: 'Tiêu Chuẩn', colorHex: '#0071e3' },
      image: p.defaultImage,
    });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  if (products.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Products Mentioned Box */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Sản Phẩm Trong Bài
          </h3>
          <span className="text-[10px] font-semibold text-apple-blue bg-blue-50 px-2 py-0.5 rounded-full">
            {products.length} Món
          </span>
        </div>

        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 group">
              <div className="relative h-14 w-14 rounded-lg bg-slate-50 border border-slate-100 shrink-0 overflow-hidden p-1">
                <Image src={p.defaultImage} alt={p.name} fill className="object-contain p-1" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold text-apple-subhead uppercase block truncate">
                  {p.brand}
                </span>
                <Link
                  href={`/products/${p.id}`}
                  className="text-xs font-semibold text-apple-dark line-clamp-1 group-hover:text-apple-blue transition-colors"
                >
                  {p.name}
                </Link>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-red-600">{formatPrice(p.price)}</span>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(p)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded transition ${
                      addedId === p.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-apple-blue hover:bg-apple-blue hover:text-white'
                    }`}
                  >
                    {addedId === p.id ? '✓ Đã thêm' : '+ Mua'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
