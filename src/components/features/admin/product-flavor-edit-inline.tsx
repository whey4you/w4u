'use client';

import React, { useState } from 'react';
import { Check, X, Tag } from 'lucide-react';
import { ProductFlavor } from '@/types/product';
import { FlavorImageSelector } from './flavor-image-selector';

export const FLAVOR_PRESET_COLORS = [
  { name: 'Chocolate', hex: '#4A2810' },
  { name: 'Vanilla', hex: '#EED9A4' },
  { name: 'Dâu', hex: '#E25565' },
  { name: 'Cookies & Cream', hex: '#6B6865' },
  { name: 'Chuối', hex: '#F7D070' },
  { name: 'Matcha', hex: '#6B8E23' },
  { name: 'Cam', hex: '#FF8C00' },
];

interface ProductFlavorEditInlineProps {
  flavor: ProductFlavor;
  availableImages?: string[];
  onSave: (updated: ProductFlavor) => void;
  onCancel: () => void;
}

export function ProductFlavorEditInline({
  flavor,
  availableImages = [],
  onSave,
  onCancel,
}: ProductFlavorEditInlineProps) {
  const [name, setName] = useState(flavor.name);
  const [colorHex, setColorHex] = useState(flavor.colorHex || '#4A2810');
  const [imageUrl, setImageUrl] = useState(flavor.image || '');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên hương vị!');
      return;
    }

    onSave({
      ...flavor,
      name: name.trim(),
      colorHex,
      image: imageUrl.trim() || undefined,
    });
  };

  return (
    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-blue-900 flex items-center gap-1 text-[11px]">
          <Tag className="w-3.5 h-3.5" />
          <span>Chỉnh Sửa Hương Vị</span>
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
          title="Đóng chế độ sửa"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên vị (VD: Chocolate Fudge)"
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:border-blue-500"
        />
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="h-8 w-10 rounded cursor-pointer border border-slate-200 p-0.5"
          />
          <div className="flex items-center gap-1 flex-wrap">
            {FLAVOR_PRESET_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColorHex(c.hex)}
                className="w-3.5 h-3.5 rounded-full border border-black/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bộ chọn ảnh thông minh */}
      <FlavorImageSelector
        value={imageUrl}
        onChange={setImageUrl}
        availableImages={availableImages}
      />

      <div className="pt-1 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Lưu Thay Đổi</span>
        </button>
      </div>
    </div>
  );
}
