'use client';

import React, { useState } from 'react';
import { Tag, ChevronDown, ChevronUp, RotateCcw, Sparkles } from 'lucide-react';
import { ProductFlavor, ProductSizeFlavorPrice } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface ProductSizeFlavorPricesProps {
  flavors: ProductFlavor[];
  defaultPrice: string | number;
  defaultOriginalPrice?: string | number;
  flavorPrices: Record<string, ProductSizeFlavorPrice>;
  onChange: (updated: Record<string, ProductSizeFlavorPrice>) => void;
}

function formatRawInput(val?: number): string {
  if (!val || val <= 0) return '';
  return val.toLocaleString('en-US');
}

export function ProductSizeFlavorPrices({
  flavors,
  defaultPrice,
  defaultOriginalPrice,
  flavorPrices,
  onChange,
}: ProductSizeFlavorPricesProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!flavors || flavors.length === 0) return null;

  const customCount = Object.values(flavorPrices || {}).filter(
    (fp) => typeof fp?.price === 'number' && fp.price > 0
  ).length;

  const handlePriceChange = (flavorId: string, field: 'price' | 'originalPrice', rawInput: string) => {
    const digits = rawInput.replace(/\D/g, '');
    const numValue = digits ? Number(digits) : undefined;
    const current = flavorPrices[flavorId] || { price: 0 };
    const updated = { ...current, [field]: numValue };

    if (!updated.price && !updated.originalPrice) {
      const next = { ...flavorPrices };
      delete next[flavorId];
      onChange(next);
    } else {
      onChange({
        ...flavorPrices,
        [flavorId]: {
          price: updated.price || 0,
          originalPrice: updated.originalPrice,
        },
      });
    }
  };

  const handleReset = (flavorId: string) => {
    const next = { ...flavorPrices };
    delete next[flavorId];
    onChange(next);
  };

  const handleToggleStock = (flavorId: string) => {
    const current = flavorPrices[flavorId] || { price: 0 };
    const newInStock = current.inStock === false ? true : false;
    onChange({
      ...flavorPrices,
      [flavorId]: {
        ...current,
        inStock: newInStock,
      },
    });
  };

  const defaultPriceText = defaultPrice ? Number(defaultPrice).toLocaleString('en-US') : '0';
  const defaultOrigText = defaultOriginalPrice ? Number(defaultOriginalPrice).toLocaleString('en-US') : '';

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
      {/* Header Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-slate-700 text-xs">
            Thiết Lập Giá Riêng Cho Từng Vị ({flavors.length} vị)
          </span>
          {customCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{customCount} vị có giá riêng</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">
              (Mặc định tất cả các vị cùng chung giá size)
            </span>
          )}
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Compact Variant Table (No internal scrollbar) */}
      {isOpen && (
        <div className="p-3 border-t border-slate-100 bg-white space-y-2">
          <p className="text-[11px] text-slate-500">
            💡 Để trống để tự động áp dụng giá chung của size (<strong className="text-slate-700">{formatPrice(Number(defaultPrice || 0))}</strong>). Chỉ nhập khi muốn bán rẻ hơn hoặc đổi giá cho vị đó.
          </p>

          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                  <th className="py-1.5 px-3">Hương Vị</th>
                  <th className="py-1.5 px-2 text-center w-24">Kho Size Này</th>
                  <th className="py-1.5 px-3 w-36">Giá Bán Riêng (VNĐ)</th>
                  <th className="py-1.5 px-3 w-36">Giá Gốc Niêm Yết</th>
                  <th className="py-1.5 px-2 text-center w-14">Xóa Giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flavors.map((flv) => {
                  const current = flavorPrices[flv.id];
                  const hasCustom = Boolean(current && current.price > 0);
                  const isFlavorInStock = current?.inStock !== false;

                  return (
                    <tr
                      key={flv.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !isFlavorInStock ? 'bg-rose-50/30' : hasCustom ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* 1. Flavor Name */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: flv.colorHex || '#0071e3' }}
                          />
                          <span className={`font-semibold text-xs truncate ${!isFlavorInStock ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {flv.name}
                          </span>
                        </div>
                      </td>

                      {/* 1.5. Stock Status Toggle for this Size */}
                      <td className="py-1.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(flv.id)}
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-2xs cursor-pointer ${
                            isFlavorInStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                          title={`Bấm để chuyển thành ${isFlavorInStock ? 'Hết hàng' : 'Còn hàng'} cho vị này ở size này`}
                        >
                          {isFlavorInStock ? 'Còn' : 'Hết'}
                        </button>
                      </td>

                      {/* 2. Custom Price Input */}
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatRawInput(current?.price)}
                          onChange={(e) => handlePriceChange(flv.id, 'price', e.target.value)}
                          placeholder={defaultPriceText}
                          className={`w-full px-2.5 py-1 text-xs rounded-md border font-medium transition-all ${
                            hasCustom
                              ? 'border-amber-400 bg-white text-amber-900 font-bold focus:ring-2 focus:ring-amber-200'
                              : 'border-slate-200 bg-slate-50/60 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500'
                          }`}
                        />
                      </td>

                      {/* 3. Original Price Input */}
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatRawInput(current?.originalPrice)}
                          onChange={(e) => handlePriceChange(flv.id, 'originalPrice', e.target.value)}
                          placeholder={defaultOrigText || 'Không có'}
                          className="w-full px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-slate-50/60 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500"
                        />
                      </td>

                      {/* 4. Action */}
                      <td className="py-1.5 px-2 text-center">
                        {hasCustom ? (
                          <button
                            type="button"
                            onClick={() => handleReset(flv.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa giá riêng, quay về mặc định"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
