'use client';

import React, { useState } from 'react';
import { Trash2, GripVertical, ChevronUp, ChevronDown, CheckCircle2, XCircle, Pencil, Tag } from 'lucide-react';
import { ProductSize, ProductFlavor } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { countCustomFlavorPrices } from '@/lib/product-pricing';
import { ProductSizeEditInline } from './product-size-edit-inline';

interface ProductSizeItemProps {
  size: ProductSize;
  flavors?: ProductFlavor[];
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
  flavors = [],
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
  const customFlavorCount = countCustomFlavorPrices(size);
  const isInStock = size.inStock !== false;

  if (isEditing) {
    return (
      <ProductSizeEditInline
        size={size}
        flavors={flavors}
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
        !isInStock
          ? 'border-rose-200 bg-rose-50/30 opacity-80'
          : isFirst
          ? 'border-emerald-200 bg-emerald-50/40 shadow-2xs'
          : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
          <GripVertical className="w-4 h-4" />
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold ${isInStock ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
              {size.name}
            </span>
            {isFirst && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Mặc Định (#1)</span>
              </span>
            )}
            {customFlavorCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                <Tag className="w-2.5 h-2.5" />
                <span>{customFlavorCount} vị có giá riêng</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
              <span>⚖️ {size.weightKg ? `${size.weightKg}kg` : '1.0kg'}</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {size.servings} lần dùng • Giá: <strong className="text-blue-600 font-bold">{formatPrice(size.price)}</strong>
            {size.originalPrice && size.originalPrice > size.price && (
              <span className="text-slate-400 line-through ml-2">{formatPrice(size.originalPrice)}</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Toggle Còn / Hết hàng cho riêng Size này */}
        <button
          type="button"
          onClick={() => onUpdate({ ...size, inStock: !isInStock })}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shadow-2xs cursor-pointer ${
            isInStock
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
          }`}
          title="Bấm để bật/tắt Còn / Hết hàng cho kích cỡ này"
        >
          {isInStock ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Còn hàng</span>
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 text-rose-600" />
              <span>Hết hàng</span>
            </>
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

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
          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded cursor-pointer"
          title="Chỉnh sửa kích cỡ & giá này"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(size.id)}
          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded"
          title="Xóa kích cỡ này"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
