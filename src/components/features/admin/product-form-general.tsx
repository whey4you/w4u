'use client';

import React from 'react';
import { slugify, formatPrice } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { ProductImageManager } from './product-image-manager';
import { ProductSize } from '@/types/product';

interface ProductFormGeneralProps {
  name: string;
  setName: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  category: 'whey' | 'strength' | 'vitamins';
  setCategory: (val: 'whey' | 'strength' | 'vitamins') => void;
  sizes?: ProductSize[];
  badge: string;
  setBadge: (val: string) => void;
  defaultImage: string;
  setDefaultImage: (val: string) => void;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ProductFormGeneral({
  name,
  setName,
  slug,
  setSlug,
  brand,
  setBrand,
  category,
  setCategory,
  sizes = [],
  badge,
  setBadge,
  defaultImage,
  setDefaultImage,
  images,
  setImages,
}: ProductFormGeneralProps) {
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val));
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Tên Sản Phẩm *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900"
          placeholder="VD: Rule 1 Protein Isolate 5lbs"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-semibold text-slate-700">Đường Dẫn Slug (Tối Ưu SEO) *</label>
          <button
            type="button"
            onClick={() => setSlug(slugify(name))}
            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
          >
            <Sparkles className="w-3 h-3" />
            <span>Tạo tự động từ tên</span>
          </button>
        </div>
        <input
          type="text"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 font-mono text-slate-900"
          placeholder="rule-1-protein-isolate-5lbs"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Thương Hiệu *</label>
          <input
            type="text"
            required
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900"
            placeholder="VD: RULE ONE PROTEINS"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Danh Mục *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900"
          >
            <option value="whey">Whey Protein</option>
            <option value="strength">Sức Mạnh / Tăng Cân</option>
            <option value="vitamins">Vitamins & Khoáng Chất</option>
          </select>
        </div>
      </div>

      {/* Thông tin giá bán quản lý theo Kích Cỡ */}
      <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900 text-xs">
            💰 Giá bán sản phẩm được quản lý theo Kích Cỡ
          </p>
          <p className="text-[11px] text-slate-500">
            {sizes && sizes.length > 0 ? (
              <>
                Giá hiển thị chính: <strong className="text-blue-600 font-bold">{formatPrice(sizes[0].price)}</strong> (theo size mặc định: <em>{sizes[0].name}</em>)
              </>
            ) : (
              'Chưa có kích cỡ nào. Vui lòng thiết lập giá bán chi tiết tại tab "Kích Cỡ & Giá".'
            )}
          </p>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-full shadow-2xs">
          {sizes?.length || 0} Kích Cỡ
        </span>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Huy Hiệu (Badge)</label>
        <input
          type="text"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900"
          placeholder="VD: Bán Chạy Nhất"
        />
      </div>

      {/* Quản lý toàn bộ hình ảnh sản phẩm (ảnh đầu tiên là đại diện) */}
      <ProductImageManager
        defaultImage={defaultImage}
        setDefaultImage={setDefaultImage}
        images={images}
        setImages={setImages}
      />
    </div>
  );
}
