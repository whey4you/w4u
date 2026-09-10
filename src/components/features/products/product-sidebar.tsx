'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import {
  PRODUCT_CATEGORIES,
  PRICE_RANGE_OPTIONS,
  SORT_OPTIONS,
} from './product-filter-constants';
import { FilterAccordion, FilterCheckboxItem } from './filter-controls';
import { ProductSortOption } from '@/types/product';

interface ProductSidebarProps {
  category: string;
  onSelectCategory: (catId: string) => void;
  sortBy: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  selectedPriceRanges: string[];
  onTogglePriceRange: (rangeId: string) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
}

export function ProductSidebar({
  category,
  onSelectCategory,
  sortBy,
  onSortChange,
  selectedPriceRanges,
  onTogglePriceRange,
  inStockOnly,
  onToggleInStock,
}: ProductSidebarProps) {
  const [openSort, setOpenSort] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);

  return (
    <aside className="w-64 shrink-0 select-none">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3 pb-8 space-y-6 text-sm text-[#111111] scrollbar-thin scrollbar-thumb-neutral-200">
        {/* Main Category List (Nike Style) */}
        <div className="space-y-1">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full text-left py-2 px-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${
                  isActive
                    ? 'font-semibold text-black bg-neutral-100/80'
                    : 'text-[#707072] hover:text-black hover:bg-neutral-50'
                }`}
              >
                <span>{cat.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
              </button>
            );
          })}
        </div>

        {/* Sắp Xếp (Nằm dưới danh mục chính, trên Mức Giá) */}
        <FilterAccordion
          title="Sắp Xếp"
          isOpen={openSort}
          onToggle={() => setOpenSort((prev) => !prev)}
        >
          <div className="space-y-1 pt-0.5">
            {SORT_OPTIONS.map((opt) => {
              const isSelected = sortBy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSortChange(opt.id)}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-between group ${
                    isSelected
                      ? 'font-semibold text-apple-blue bg-apple-blue/10'
                      : 'text-[#707072] hover:text-black hover:bg-neutral-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-apple-blue flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </FilterAccordion>

        {/* Mức Giá */}
        <FilterAccordion
          title="Mức Giá"
          isOpen={openPrice}
          onToggle={() => setOpenPrice((prev) => !prev)}
        >
          {PRICE_RANGE_OPTIONS.map((range) => (
            <FilterCheckboxItem
              key={range.id}
              checked={selectedPriceRanges.includes(range.id)}
              onChange={() => onTogglePriceRange(range.id)}
              label={range.label}
            />
          ))}
        </FilterAccordion>

        {/* Tình Trạng Hàng */}
        <div className="border-t border-neutral-200/80 pt-5">
          <FilterCheckboxItem
            checked={inStockOnly}
            onChange={() => onToggleInStock(!inStockOnly)}
            label="Chỉ hiện sản phẩm còn hàng"
          />
        </div>
      </div>
    </aside>
  );
}
