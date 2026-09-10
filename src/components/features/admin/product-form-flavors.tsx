'use client';

import React, { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { ProductFlavor } from '@/types/product';
import { ProductFlavorItem } from './product-flavor-item';
import { FLAVOR_PRESET_COLORS } from './product-flavor-edit-inline';
import { FlavorImageSelector } from './flavor-image-selector';

interface ProductFormFlavorsProps {
  flavors: ProductFlavor[];
  setFlavors: React.Dispatch<React.SetStateAction<ProductFlavor[]>>;
  availableImages?: string[];
}

export function ProductFormFlavors({
  flavors,
  setFlavors,
  availableImages = [],
}: ProductFormFlavorsProps) {
  const [newFlavorName, setNewFlavorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#4A2810');
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleAddFlavor = () => {
    if (!newFlavorName.trim()) return;
    const newFlavor: ProductFlavor = {
      id: `flv-${Date.now()}`,
      name: newFlavorName.trim(),
      colorHex: newColorHex,
      image: newImageUrl.trim() || undefined,
    };
    setFlavors((prev) => [...prev, newFlavor]);
    setNewFlavorName('');
    setNewImageUrl('');
  };

  const handleUpdateFlavor = (updated: ProductFlavor) => {
    setFlavors((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleRemoveFlavor = (id: string) => {
    if (flavors.length <= 1) {
      alert('Sản phẩm cần có ít nhất một hương vị!');
      return;
    }
    setFlavors((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Current Flavors List */}
      <div>
        <label className="block font-semibold text-slate-700 mb-2">
          Danh Sách Hương Vị Đang Có ({flavors.length})
        </label>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {flavors.map((flv) => (
            <ProductFlavorItem
              key={flv.id}
              flavor={flv}
              availableImages={availableImages}
              onUpdate={handleUpdateFlavor}
              onRemove={handleRemoveFlavor}
            />
          ))}
        </div>
      </div>

      {/* Add New Flavor Card */}
      <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
        <span className="font-semibold text-blue-900 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5" />
          <span>Thêm Hương Vị & Gán Ảnh Riêng</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={newFlavorName}
            onChange={(e) => setNewFlavorName(e.target.value)}
            placeholder="Tên vị (VD: Chocolate Fudge)"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900"
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="h-8 w-10 rounded cursor-pointer border border-slate-200 p-0.5"
            />
            <div className="flex items-center gap-1 flex-wrap">
              {FLAVOR_PRESET_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setNewColorHex(c.hex)}
                  className="w-3.5 h-3.5 rounded-full border border-black/20 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Flavor Image Selector */}
        <FlavorImageSelector
          value={newImageUrl}
          onChange={setNewImageUrl}
          availableImages={availableImages}
        />

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={handleAddFlavor}
            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Vị</span>
          </button>
        </div>
      </div>
    </div>
  );
}
