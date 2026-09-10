'use client';

import React from 'react';
import Image from 'next/image';
import { Trash2, Star, ChevronLeft, ChevronRight, GripHorizontal } from 'lucide-react';

interface ProductImageCardProps {
  image: string;
  index: number;
  totalCount: number;
  isPrimary: boolean;
  isDragging: boolean;
  onDragStart: () => void;
  onDrop: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSetPrimary: () => void;
  onRemove: () => void;
}

export function ProductImageCard({
  image,
  index,
  totalCount,
  isPrimary,
  isDragging,
  onDragStart,
  onDrop,
  onMoveLeft,
  onMoveRight,
  onSetPrimary,
  onRemove,
}: ProductImageCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`relative group rounded-xl border overflow-hidden bg-white flex flex-col p-1.5 transition-all ${
        isDragging ? 'opacity-40 border-blue-500 bg-blue-50 ring-2 ring-blue-300' : ''
      } ${
        isPrimary
          ? 'border-emerald-400 ring-2 ring-emerald-100 shadow-2xs'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Image Preview Container */}
      <div className="relative w-full aspect-square rounded-lg bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing">
        <Image
          src={image}
          alt={`Product image ${index + 1}`}
          fill
          className="object-contain p-1 pointer-events-none"
          sizes="120px"
        />

        {/* Index / Primary Badge */}
        {isPrimary ? (
          <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-current" />
            <span>Đại Diện (#1)</span>
          </span>
        ) : (
          <span className="absolute top-1 left-1 bg-slate-900/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
            #{index + 1}
          </span>
        )}

        {/* Drag icon hint on hover */}
        <div className="absolute top-1 right-1 bg-white/80 backdrop-blur-xs p-0.5 rounded text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripHorizontal className="w-3 h-3" />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between mt-1.5 px-0.5 gap-1 text-[10px]">
        {!isPrimary ? (
          <button
            type="button"
            onClick={onSetPrimary}
            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
            title="Đặt làm ảnh đại diện chính"
          >
            <Star className="w-3 h-3" />
            <span>Đại diện</span>
          </button>
        ) : (
          <span className="font-bold text-emerald-700">Ảnh chính</span>
        )}

        <div className="flex items-center gap-0.5 ml-auto">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveLeft}
            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded disabled:opacity-20 disabled:pointer-events-none"
            title="Di chuyển sang trái"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalCount - 1}
            onClick={onMoveRight}
            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded disabled:opacity-20 disabled:pointer-events-none"
            title="Di chuyển sang phải"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors ml-0.5"
            title="Xóa ảnh này"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
