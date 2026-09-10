'use client';

import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  PRODUCT_CATEGORIES,
  PRICE_RANGE_OPTIONS,
} from './product-filter-constants';

interface ProductToolbarProps {
  category: string;
  onSelectCategory?: (catId: string) => void;
  count: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  onOpenMobileFilter: () => void;
  selectedPriceRanges: string[];
  onRemovePriceRange: (rangeId: string) => void;
  inStockOnly: boolean;
  onRemoveInStock: () => void;
  activeFilterCount: number;
  onResetFilters: () => void;
}

export function ProductToolbar({
  category,
  onSelectCategory,
  count,
  showFilters,
  onToggleFilters,
  onOpenMobileFilter,
  selectedPriceRanges,
  onRemovePriceRange,
  inStockOnly,
  onRemoveInStock,
  activeFilterCount,
  onResetFilters,
}: ProductToolbarProps) {
  const currentCategoryLabel =
    PRODUCT_CATEGORIES.find((c) => c.id === category)?.label || 'Tất Cả Sản Phẩm';

  return (
    <div className="pb-3 space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between gap-3">
        {/* Title & Count */}
        <div className="flex items-baseline gap-2 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-apple-dark truncate">
            {currentCategoryLabel}
          </h1>
          <span className="text-sm sm:text-base font-normal text-neutral-500 flex-shrink-0">
            ({count})
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Desktop Toggle Hide/Show Filters */}
          <button
            type="button"
            onClick={onToggleFilters}
            className="hidden lg:flex items-center gap-2 text-sm font-medium text-apple-dark hover:text-neutral-600 transition-colors py-2 px-3 rounded-full hover:bg-neutral-100"
          >
            <span>{showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}</span>
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Mobile Filter & Sort Button (Opens Drawer) */}
          <button
            type="button"
            onClick={onOpenMobileFilter}
            className="flex lg:hidden items-center gap-1.5 text-xs sm:text-sm font-medium text-apple-dark border border-neutral-300 py-1.5 px-3 rounded-full hover:bg-neutral-50 active:scale-95 transition-all shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Lọc & Sắp Xếp</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Quick Category Bar */}
      {onSelectCategory && (
        <div className="flex lg:hidden gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {selectedPriceRanges.map((r) => {
            const label = PRICE_RANGE_OPTIONS.find((opt) => opt.id === r)?.label;
            return (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 bg-neutral-100 text-apple-dark text-xs font-medium pl-3 pr-2 py-1 rounded-full border border-neutral-200"
              >
                {label}
                <button
                  type="button"
                  aria-label={`Bỏ chọn ${label}`}
                  onClick={() => onRemovePriceRange(r)}
                  className="hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-apple-dark text-xs font-medium pl-3 pr-2 py-1 rounded-full border border-neutral-200">
              Còn hàng
              <button
                type="button"
                aria-label="Bỏ chọn chỉ hiện còn hàng"
                onClick={onRemoveInStock}
                className="hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-neutral-500 hover:text-black font-semibold underline underline-offset-4 ml-1 transition-colors"
          >
            Xóa tất cả ({activeFilterCount})
          </button>
        </div>
      )}
    </div>
  );
}
