'use client';

import React, { useState } from 'react';
import { ProductSize, ProductFlavor } from '@/types/product';
import { ProductSizeItem } from './product-size-item';
import { ProductSizeAddForm } from './product-size-add-form';

interface ProductFormSizesProps {
  sizes: ProductSize[];
  setSizes: React.Dispatch<React.SetStateAction<ProductSize[]>>;
  flavors?: ProductFlavor[];
}

export function ProductFormSizes({ sizes, setSizes, flavors = [] }: ProductFormSizesProps) {
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

  const handleSetAllSizesStock = (inStock: boolean) => {
    setSizes((prev) => prev.map((s) => ({ ...s, inStock })));
  };

  const inStockSizesCount = sizes.filter((s) => s.inStock !== false).length;

  return (
    <div className="space-y-4 text-xs">
      {/* Current Sizes List */}
      <div>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">
              Các Kích Cỡ & Giá Bán ({sizes.length})
            </label>
            {sizes.length > 0 && (
              <span className="text-[11px] font-medium text-slate-500">
                (Còn {inStockSizesCount}/{sizes.length} size)
              </span>
            )}
          </div>
          {sizes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSetAllSizesStock(false)}
                className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded border border-rose-200 transition-colors cursor-pointer"
                title="Đánh dấu tất cả các kích cỡ là Hết hàng"
              >
                Hết hàng tất cả size
              </button>
              <button
                type="button"
                onClick={() => handleSetAllSizesStock(true)}
                className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer"
                title="Đánh dấu tất cả các kích cỡ là Còn hàng"
              >
                Còn hàng tất cả size
              </button>
            </div>
          )}
        </div>

        {sizes.length === 0 ? (
          <p className="text-slate-400 italic p-3 rounded-xl border border-dashed border-slate-200 text-center">
            Chưa có kích cỡ nào. Vui lòng bấm &ldquo;Thêm Kích Cỡ Mới&rdquo; ở nút bên dưới để thiết lập.
          </p>
        ) : (
          <div className="space-y-2.5">
            {sizes.map((s, index) => (
              <ProductSizeItem
                key={s.id}
                size={s}
                flavors={flavors}
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
      <ProductSizeAddForm existingCount={sizes.length} flavors={flavors} onAdd={handleAddSize} />
    </div>
  );
}
