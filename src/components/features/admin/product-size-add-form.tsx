'use client';

import React, { useState } from 'react';
import { Plus, Scale } from 'lucide-react';
import { ProductSize } from '@/types/product';
import { PriceInput } from '@/components/ui/price-input';

interface ProductSizeAddFormProps {
  existingCount: number;
  onAdd: (size: ProductSize) => void;
}

export function ProductSizeAddForm({ existingCount, onAdd }: ProductSizeAddFormProps) {
  const [sizeName, setSizeName] = useState('');
  const [servings, setServings] = useState('70');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');

  const handleAdd = () => {
    if (!sizeName.trim() || !price) {
      alert('Vui lòng nhập tên kích cỡ và giá bán!');
      return;
    }

    onAdd({
      id: `size-${Date.now()}`,
      name: sizeName.trim(),
      servings: Number(servings) || 60,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      inStock: true,
      sortOrder: existingCount,
    });

    setSizeName('');
    setPrice('');
    setOriginalPrice('');
  };

  return (
    <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
      <span className="font-semibold text-blue-900 flex items-center gap-1">
        <Scale className="w-3.5 h-3.5" />
        <span>Thêm Kích Cỡ Mới</span>
      </span>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tên Kích Cỡ / Trọng Lượng</label>
          <input
            type="text"
            value={sizeName}
            onChange={(e) => setSizeName(e.target.value)}
            placeholder="VD: 5lbs (2.27kg)"
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Số Lần Dùng (Servings)</label>
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
