'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, X, PackagePlus } from 'lucide-react';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface BlogProductSelectorProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (productId: string) => void;
}

export function BlogProductSelector({
  products,
  isOpen,
  onClose,
  onSelect,
}: BlogProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Chèn Thẻ Sản Phẩm Vào Bài Viết</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm sản phẩm theo tên, hãng..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Product List */}
        <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">Không tìm thấy sản phẩm phù hợp.</p>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer"
                onClick={() => {
                  onSelect(product.id);
                  onClose();
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                    <Image
                      src={product.defaultImage || '/products/r1-protein.jpg'}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="44px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {product.brand} • <span className="text-emerald-600 font-medium">{formatPrice(product.price)}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex-shrink-0 ml-2"
                >
                  Chèn
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
