'use client';

import React, { useState } from 'react';
import { Trash2, GripVertical, ChevronUp, ChevronDown, CheckCircle2, Pencil } from 'lucide-react';
import { ProductSize } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { ProductSizeEditInline } from './product-size-edit-inline';

interface ProductSizeItemProps {
  size: ProductSize;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isDragging: boolean;
  onDragStart: () => void;
  onDrop: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: (id: string) => void;
  onUpdate: (updated: ProductSize) => void;
}

export function ProductSizeItem({
  size,
  isFirst,
  isLast,
  isDragging,
  onDragStart,
  onDrop,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdate,
}: ProductSizeItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ProductSizeEditInline
        size={size}
        onSave={(updated) => {
          onUpdate(updated);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        isDragging ? 'opacity-40 border-blue-400 bg-blue-50' : ''
      } ${
        isFirst
          ? 'border-emerald-200 bg-emerald-50/40 shadow-2xs'
          : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
          <GripVertical className="w-4 h-4" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{size.name}</span>
            {isFirst && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Mặc Định (#1)</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {size.servings} lần dùng • Giá: <strong className="text-blue-600 font-bold">{formatPrice(size.price)}</strong>
            {size.originalPrice && size.originalPrice > size.price && (
              <span className="text-slate-400 line-through ml-2">{formatPrice(size.originalPrice)}</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={isFirst}
          onClick={onMoveUp}
          className="p-1 text-slate-400 hover:text-apple-blue hover:bg-white rounded disabled:opacity-20 disabled:pointer-events-none"
          title="Di chuyển lên trên"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={onMoveDown}
          className="p-1 text-slate-400 hover:text-apple-blue hover:bg-white rounded disabled:opacity-20 disabled:pointer-events-none"
          title="Di chuyển xuống dưới"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded ml-0.5"
          title="Chỉnh sửa kích cỡ & giá này"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(size.id)}
          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded ml-0.5"
          title="Xóa kích cỡ này"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
