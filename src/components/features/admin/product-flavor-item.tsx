'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2, Pencil } from 'lucide-react';
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
    <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-slate-300 transition-all">
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
        <span className="font-semibold text-slate-800">{flavor.name}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors"
          title="Chỉnh sửa hương vị này"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(flavor.id)}
          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
          title="Xóa hương vị này"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
