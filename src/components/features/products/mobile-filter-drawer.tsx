'use client';

import { X, Check } from 'lucide-react';
import {
  PRODUCT_CATEGORIES,
  PRICE_RANGE_OPTIONS,
  SORT_OPTIONS,
} from './product-filter-constants';
import { FilterCheckboxItem } from './filter-controls';
import { ProductSortOption } from '@/types/product';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  onSelectCategory: (catId: string) => void;
  sortBy: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  selectedPriceRanges: string[];
  onTogglePriceRange: (rangeId: string) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  onResetFilters: () => void;
  resultCount: number;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  category,
  onSelectCategory,
  sortBy,
  onSortChange,
  selectedPriceRanges,
  onTogglePriceRange,
  inStockOnly,
  onToggleInStock,
  onResetFilters,
  resultCount,
}: MobileFilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#111111]">Bộ Lọc & Sắp Xếp</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bộ lọc"
            className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-700" />
          </button>
        </div>

        {/* Scrollable Filter Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
          {/* Danh mục (3 mục chính) */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Danh Mục</h3>
            <div className="space-y-1.5">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    category === cat.id
                      ? 'font-semibold text-black bg-neutral-100'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>{cat.label}</span>
                  {category === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                </button>
              ))}
            </div>
          </div>

          {/* Sắp xếp (Dưới danh mục, trên mức giá) */}
          <div className="border-t border-neutral-200 pt-5">
            <h3 className="font-semibold text-neutral-900 mb-2.5">Sắp Xếp Theo</h3>
            <div className="space-y-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSortChange(opt.id)}
                  className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    sortBy === opt.id
                      ? 'font-semibold text-apple-blue bg-apple-blue/10'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <Check className="w-4 h-4 text-apple-blue flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mức giá */}
          <div className="border-t border-neutral-200 pt-5">
            <h3 className="font-semibold text-neutral-900 mb-3">Mức Giá</h3>
            <div className="space-y-2.5">
              {PRICE_RANGE_OPTIONS.map((r) => (
                <FilterCheckboxItem
                  key={r.id}
                  checked={selectedPriceRanges.includes(r.id)}
                  onChange={() => onTogglePriceRange(r.id)}
                  label={r.label}
                />
              ))}
            </div>
          </div>

          {/* Tình trạng */}
          <div className="border-t border-neutral-200 pt-5">
            <FilterCheckboxItem
              checked={inStockOnly}
              onChange={() => onToggleInStock(!inStockOnly)}
              label="Chỉ hiện sản phẩm còn hàng"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex-1 py-2.5 px-4 rounded-full border border-neutral-300 text-sm font-semibold text-neutral-800 hover:bg-white transition-colors"
          >
            Xóa Lọc
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Xem ({resultCount})
          </button>
        </div>
      </div>
    </div>
  );
}
