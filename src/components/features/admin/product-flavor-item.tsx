'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2, Pencil, CheckCircle2, XCircle } from 'lucide-react';
import { ProductFlavor } from '@/types/product';
import { ProductFlavorEditInline } from './product-flavor-edit-inline';

interface ProductFlavorItemProps {
  flavor: ProductFlavor;
  availableImages?: string[];
  onUpdate: (updated: ProductFlavor) => void;
  onRemove: (id: string) => void;
}

export function ProductFlavorItem({
  flavor,
  availableImages = [],
  onUpdate,
  onRemove,
}: ProductFlavorItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isInStock = flavor.inStock !== false;

  if (isEditing) {
    return (
      <ProductFlavorEditInline
        flavor={flavor}
        availableImages={availableImages}
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
      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
        !isInStock
          ? 'border-rose-200 bg-rose-50/30 opacity-80'
          : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-4 h-4 rounded-full border border-black/20 flex-shrink-0"
          style={{ backgroundColor: flavor.colorHex }}
        />
        {flavor.image ? (
          <div className="relative w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0">
            <Image
              src={flavor.image}
              alt={flavor.name}
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
            Dùng ảnh mặc định
          </span>
        )}
        <span className={`font-semibold ${isInStock ? 'text-slate-800' : 'text-slate-500 line-through'}`}>
          {flavor.name}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onUpdate({ ...flavor, inStock: !isInStock })}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shadow-2xs cursor-pointer ${
            isInStock
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
          }`}
          title="Bấm để bật/tắt Còn / Hết hàng cho hương vị này"
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
          onClick={() => setIsEditing(true)}
          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors cursor-pointer"
          title="Chỉnh sửa hương vị này"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(flavor.id)}
          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer"
          title="Xóa hương vị này"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
