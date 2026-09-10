'use client';

import React, { useState } from 'react';
import { ProductSize } from '@/types/product';
import { ProductSizeItem } from './product-size-item';
import { ProductSizeAddForm } from './product-size-add-form';

interface ProductFormSizesProps {
  sizes: ProductSize[];
  setSizes: React.Dispatch<React.SetStateAction<ProductSize[]>>;
}

export function ProductFormSizes({ sizes, setSizes }: ProductFormSizesProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const moveSize = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sizes.length) return;
    setSizes((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleAddSize = (newSize: ProductSize) => {
    setSizes((prev) => [...prev, newSize]);
  };

  const handleRemoveSize = (id: string) => {
    setSizes((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSize = (updatedSize: ProductSize) => {
    setSizes((prev) => prev.map((s) => (s.id === updatedSize.id ? updatedSize : s)));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Current Sizes List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-semibold text-slate-700">
            Các Kích Cỡ & Giá Bán ({sizes.length})
          </label>
          <span className="text-[11px] text-slate-400">
            Kéo thả hoặc dùng ⬆️ ⬇️ để đổi thứ tự hiển thị
          </span>
        </div>

        {sizes.length === 0 ? (
          <p className="text-slate-400 italic p-3 rounded-xl border border-dashed border-slate-200 text-center">
            Chưa có kích cỡ nào. Vui lòng thêm ít nhất một kích cỡ kèm giá bán ở form bên dưới.
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {sizes.map((s, index) => (
              <ProductSizeItem
                key={s.id}
                size={s}
                index={index}
                isFirst={index === 0}
                isLast={index === sizes.length - 1}
                isDragging={draggedIndex === index}
                onDragStart={() => setDraggedIndex(index)}
                onDrop={() => {
                  if (draggedIndex !== null && draggedIndex !== index) {
                    moveSize(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                }}
                onMoveUp={() => moveSize(index, index - 1)}
                onMoveDown={() => moveSize(index, index + 1)}
                onRemove={handleRemoveSize}
                onUpdate={handleUpdateSize}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add New Size Subform */}
      <ProductSizeAddForm existingCount={sizes.length} onAdd={handleAddSize} />
    </div>
  );
}
