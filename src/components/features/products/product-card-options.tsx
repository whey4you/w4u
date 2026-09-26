'use client';

import React from 'react';
import { ProductFlavor, ProductSize } from '@/types/product';
import { isFlavorInStock, isSizeInStock } from '@/lib/product-stock';

interface ProductCardOptionsProps {
  product?: { inStock?: boolean };
  flavors?: ProductFlavor[];
  sizes?: ProductSize[];
  selectedFlavor: ProductFlavor;
  selectedSize?: ProductSize;
  onSelectFlavor: (flavor: ProductFlavor) => void;
  onSelectSize: (size: ProductSize) => void;
}

export function ProductCardOptions({
  product = { inStock: true },
  flavors,
  sizes,
  selectedFlavor,
  selectedSize,
  onSelectFlavor,
  onSelectSize,
}: ProductCardOptionsProps) {
  const hasSizes = Boolean(sizes && sizes.length > 0);
  const hasFlavors = Boolean(flavors && flavors.length > 0);

  if (!hasSizes && !hasFlavors) return null;

  return (
    <div className="mt-2.5 sm:mt-3.5 space-y-2 border-t border-black/[0.04] pt-2">
      {/* 1. Size Selector */}
      {hasSizes && (
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {sizes!.map((size) => {
            const isSelected = selectedSize?.id === size.id;
            const isOutOfStock = !isSizeInStock(product, size);
            const shortLabel = size.name.split('(')[0]?.trim() || size.name;

            return (
              <button
                key={size.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSize(size);
                }}
                title={isOutOfStock ? `${size.name} (Hết hàng)` : size.name}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? isOutOfStock
                      ? 'border-rose-400 bg-rose-500 text-white font-semibold shadow-2xs'
                      : 'border-apple-dark bg-apple-dark text-white shadow-2xs font-semibold'
                    : isOutOfStock
                    ? 'border-slate-100 bg-slate-50 text-slate-300 line-through'
                    : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Flavor Selector */}
      {hasFlavors && (
        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
            {flavors!.map((flavor) => {
              const isSelected = selectedFlavor.id === flavor.id;
              const isFlavorOutOfStock = !isFlavorInStock(product, flavor, selectedSize);

              return (
                <button
                  key={flavor.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFlavor(flavor);
                  }}
                  title={isFlavorOutOfStock ? `${flavor.name} (Hết hàng)` : flavor.name}
                  aria-label={flavor.name}
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-apple-blue ring-offset-1 scale-110'
                      : isFlavorOutOfStock
                      ? 'border-slate-300 opacity-30 hover:opacity-60'
                      : 'border-black/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: flavor.colorHex }}
                />
              );
            })}
          </div>

          <span
            data-flavor-name
            className="text-[10px] sm:text-[11px] font-semibold text-apple-dark truncate max-w-[130px] text-right shrink-0 leading-none"
            title={selectedFlavor.name}
          >
            {selectedFlavor.name}
          </span>
        </div>
      )}
    </div>
  );
}
