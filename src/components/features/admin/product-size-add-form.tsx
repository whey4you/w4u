'use client';

import React, { useState } from 'react';
import { Plus, Scale } from 'lucide-react';
import { ProductSize, ProductFlavor, ProductSizeFlavorPrice } from '@/types/product';
import { PriceInput } from '@/components/ui/price-input';
import { ProductSizeFlavorPrices } from './product-size-flavor-prices';
import { parseWeightKgFromText } from '@/lib/weight-helper';

interface ProductSizeAddFormProps {
  existingCount: number;
  flavors?: ProductFlavor[];
  onAdd: (size: ProductSize) => void;
}

export function ProductSizeAddForm({ existingCount, flavors = [], onAdd }: ProductSizeAddFormProps) {
  const [sizeName, setSizeName] = useState('');
  const [servings, setServings] = useState('70');
  const [weightKg, setWeightKg] = useState('1.0');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [flavorPrices, setFlavorPrices] = useState<Record<string, ProductSizeFlavorPrice>>({});

  const handleSizeNameChange = (val: string) => {
    setSizeName(val);
    const detected = parseWeightKgFromText(val);
    if (detected !== null) {
      setWeightKg(String(detected));
    }
  };

  const handleAdd = () => {
    if (!sizeName.trim() || !price) {
      alert('Vui lòng nhập tên kích cỡ và giá bán!');
      return;
    }

    onAdd({
      id: `size-${Date.now()}`,
      name: sizeName.trim(),
      servings: Number(servings) || 60,
      weightKg: Number(weightKg) > 0 ? Number(weightKg) : 1.0,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      flavorPrices: Object.keys(flavorPrices).length > 0 ? flavorPrices : undefined,
      inStock: true,
      sortOrder: existingCount,
    });

    setSizeName('');
    setServings('70');
    setWeightKg('1.0');
    setPrice('');
    setOriginalPrice('');
    setFlavorPrices({});
  };

  return (
    <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
      <span className="font-semibold text-blue-900 flex items-center gap-1">
        <Scale className="w-3.5 h-3.5" />
        <span>Thêm Kích Cỡ / Quy Cách Mới</span>
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Tên Kích Cỡ / Số Viên *
          </label>
          <input
            type="text"
            value={sizeName}
            onChange={(e) => handleSizeNameChange(e.target.value)}
            placeholder="VD: 2,56kg, 5lbs hoặc 60 viên"
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900"
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
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold text-blue-600"
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
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <PriceInput
          label="Giá Bán Cho Size Này (VNĐ)"
          value={price}
          onChange={(val) => setPrice(val)}
          placeholder="1,550,000"
        />
        <PriceInput
          label="Giá Gốc / Niêm Yết"
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

      <div className="pt-1 flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm Kích Cỡ</span>
        </button>
      </div>
    </div>
  );
}
