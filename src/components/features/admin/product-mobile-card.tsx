'use client';

import React from 'react';
import Image from 'next/image';
import { Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface ProductMobileCardProps {
  product: Product;
  isLoading: boolean;
  onToggleStock: (product: Product) => void;
  onEdit: (product: Product) => void;
}

export function ProductMobileCard({
  product,
  isLoading,
  onToggleStock,
  onEdit,
}: ProductMobileCardProps) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
      {/* Top row: Image & Product Info */}
      <div className="flex items-start gap-3">
        <div className="relative w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
          <Image
            src={product.defaultImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
              {product.category}
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate">
              {product.brand}
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>
      </div>

      {/* Middle row: Price & Nutrition */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        <div>
          <span className="font-bold text-slate-900 text-sm">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-slate-400 line-through ml-2">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {product.macros?.protein && (
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
            {product.macros.protein}
          </span>
        )}
      </div>

      {/* Bottom row: Stock status & Edit button */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onToggleStock(product)}
          disabled={isLoading}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer ${
            product.inStock
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
          } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
        >
          {product.inStock ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Còn hàng</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Hết hàng</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onEdit(product)}
          className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Chỉnh sửa</span>
        </button>
      </div>
    </div>
  );
}
