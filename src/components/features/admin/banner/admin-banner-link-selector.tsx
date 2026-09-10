'use client';

import React from 'react';
import { Product } from '@/types/product';
import { Link2 } from 'lucide-react';

interface AdminBannerLinkSelectorProps {
  value: string;
  onChange: (href: string) => void;
  products: Product[];
}

const PRESET_LINKS = [
  { label: 'Whey Protein', href: '/products?category=whey' },
  { label: 'Vitamins', href: '/products?category=vitamins' },
  { label: 'Tăng Sức Mạnh', href: '/products?category=strength' },
  { label: 'Cẩm Nang Blog', href: '/blog' },
  { label: 'Tất Cả Sản Phẩm', href: '/products' },
];

export function AdminBannerLinkSelector({
  value,
  onChange,
  products,
}: AdminBannerLinkSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Link2 className="w-3.5 h-3.5 text-blue-600" />
          Link Điều Hướng Đến *
        </span>
      </label>
      <input
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/products?category=whey hoặc /products/ten-san-pham..."
        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-blue-500 text-xs font-mono"
      />

      {/* Phím tắt chọn link danh mục */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {PRESET_LINKS.map((preset) => (
          <button
            key={preset.href}
            type="button"
            onClick={() => onChange(preset.href)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
              value === preset.href
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Chọn nhanh theo sản phẩm cụ thể */}
      {products.length > 0 && (
        <div className="mt-2.5">
          <select
            onChange={(e) => {
              if (e.target.value) onChange(`/products/${e.target.value}`);
            }}
            defaultValue=""
            className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-blue-500"
          >
            <option value="" disabled>-- Hoặc chọn trực tiếp 1 sản phẩm cụ thể --</option>
            {products.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
