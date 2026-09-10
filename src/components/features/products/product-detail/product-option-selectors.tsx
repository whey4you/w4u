'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ProductFlavor, ProductSize } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface ProductOptionSelectorsProps {
  flavors: ProductFlavor[];
  sizes?: ProductSize[];
  selectedFlavor: ProductFlavor;
  selectedSize?: ProductSize;
  onSelectFlavor: (flavor: ProductFlavor) => void;
  onSelectSize: (size: ProductSize) => void;
}

export function ProductOptionSelectors({
  flavors,
  sizes,
  selectedFlavor,
  selectedSize,
  onSelectFlavor,
  onSelectSize,
}: ProductOptionSelectorsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pricePerServing = selectedSize?.servings && selectedSize.price
    ? Math.round(selectedSize.price / selectedSize.servings)
    : null;

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Flavor Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-900">
          Hương vị
        </label>

        {/* Flavor Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 text-left text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-apple-blue"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full border border-black/20"
                style={{ backgroundColor: selectedFlavor.colorHex }}
                aria-hidden="true"
              />
              <span>{selectedFlavor.name}</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
              <div className="absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {flavors.map((flavor) => {
                  const isSelected = selectedFlavor.id === flavor.id;
                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onClick={() => { onSelectFlavor(flavor); setDropdownOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                        isSelected ? 'bg-slate-100 font-semibold text-apple-dark' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="h-3 w-3 rounded-full border border-black/15" style={{ backgroundColor: flavor.colorHex }} />
                        <span>{flavor.name}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-apple-blue" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Size Section (Matching MyProtein: 3 buttons row + unit price hint) */}
      {sizes && sizes.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-900">
            Kích cỡ: <span className="font-semibold text-apple-dark">{selectedSize?.servings} lần dùng / {selectedSize?.name.split('(')[0]?.trim()}</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {sizes.map((size) => {
              const isSelected = selectedSize?.id === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => onSelectSize(size)}
                  className={`h-11 rounded-xl border px-2 text-center text-xs font-semibold transition ${
                    isSelected
                      ? 'border-apple-blue bg-apple-blue text-white shadow-sm'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-apple-dark'
                  }`}
                >
                  {size.servings} Lần dùng
                </button>
              );
            })}
          </div>

          {pricePerServing && (
            <p className="text-xs text-slate-500">
              {formatPrice(pricePerServing)} / lần dùng · Đã bao gồm thuế
            </p>
          )}
        </div>
      )}
    </div>
  );
}
