'use client';

import React, { useState } from 'react';
import { Check, X, Scale } from 'lucide-react';
import { ProductSize, ProductFlavor, ProductSizeFlavorPrice } from '@/types/product';
import { PriceInput } from '@/components/ui/price-input';
import { ProductSizeFlavorPrices } from './product-size-flavor-prices';
import { parseWeightKgFromText } from '@/lib/weight-helper';

interface ProductSizeEditInlineProps {
  size: ProductSize;
  flavors?: ProductFlavor[];
  onSave: (updated: ProductSize) => void;
  onCancel: () => void;
}

export function ProductSizeEditInline({ size, flavors = [], onSave, onCancel }: ProductSizeEditInlineProps) {
  const [sizeName, setSizeName] = useState(size.name);
  const [servings, setServings] = useState(String(size.servings));
  const [weightKg, setWeightKg] = useState(
    size.weightKg !== undefined && size.weightKg !== null ? String(size.weightKg) : '1.0'
  );
  const [price, setPrice] = useState(String(size.price));
  const [originalPrice, setOriginalPrice] = useState(
    size.originalPrice ? String(size.originalPrice) : ''
  );
  const [flavorPrices, setFlavorPrices] = useState<Record<string, ProductSizeFlavorPrice>>(
    size.flavorPrices || {}
  );

  const handleSizeNameChange = (val: string) => {
    setSizeName(val);
    const detected = parseWeightKgFromText(val);
    if (detected !== null) {
      setWeightKg(String(detected));
    }
  };

  const handleSave = () => {
    if (!sizeName.trim() || !price) {
      alert('Vui lòng nhập tên kích cỡ và giá bán!');
      return;
    }

    onSave({
      ...size,
      name: sizeName.trim(),
      servings: Number(servings) || size.servings,
      weightKg: Number(weightKg) > 0 ? Number(weightKg) : 1.0,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      flavorPrices: Object.keys(flavorPrices).length > 0 ? flavorPrices : undefined,
    });
  };

  return (
    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-blue-900 flex items-center gap-1 text-[11px]">
          <Scale className="w-3.5 h-3.5" />
          <span>Chỉnh Sửa Kích Cỡ & Giá</span>
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
          title="Đóng chế độ sửa"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Tên Kích Cỡ / Quy Cách *
          </label>
          <input
            type="text"
            value={sizeName}
            onChange={(e) => handleSizeNameChange(e.target.value)}
            placeholder="VD: 2,56kg, 5lbs hoặc 60 viên"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Khối Lượng Đóng Gói (kg) *
          </label>
          <input
            type="number"
            step="0.05"
            min="0.05"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="VD: 2.3"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-semibold text-blue-600 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Số Lần Dùng (Servings)
          </label>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="71"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PriceInput
          label="Giá Bán (VNĐ)"
          value={price}
          onChange={(val) => setPrice(val)}
          placeholder="1,550,000"
        />
        <PriceInput
          label="Giá Gốc Niêm Yết"
          value={originalPrice}
          onChange={(val) => setOriginalPrice(val)}
          placeholder="1,750,000"
        />
      </div>

      {flavors.length > 0 && (
        <ProductSizeFlavorPrices
          flavors={flavors}
          defaultPrice={price}
          defaultOriginalPrice={originalPrice}
          flavorPrices={flavorPrices}
          onChange={setFlavorPrices}
        />
      )}

      <div className="pt-1 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Lưu Thay Đổi</span>
        </button>
      </div>
    </div>
  );
}
