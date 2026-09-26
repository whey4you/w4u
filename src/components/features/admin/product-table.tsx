'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { Product } from '@/types/product';
import { toggleProductStock } from '@/services/product.mutations';
import { formatPrice } from '@/lib/utils';
import { ProductModal } from './product-modal';
import { ProductMobileCard } from './product-mobile-card';

interface ProductTableProps {
  products: Product[];
  onRefresh: () => void;
}

export function ProductTable({ products, onRefresh }: ProductTableProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStock = async (product: Product) => {
    setLoadingId(product.id);
    const newStatus = !product.inStock;
    const res = await toggleProductStock(product.id, newStatus);
    setLoadingId(null);
    if (res.success) {
      onRefresh();
    } else {
      alert(res.error || 'Không thể cập nhật trạng thái kho.');
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center text-slate-400">
        <p className="text-sm">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card List (hiển thị trên màn hình nhỏ < md) */}
      <div className="md:hidden space-y-3">
        {products.map((p) => (
          <ProductMobileCard
            key={p.id}
            product={p}
            isLoading={loadingId === p.id}
            onToggleStock={handleToggleStock}
            onEdit={openEdit}
          />
        ))}
      </div>

      {/* Desktop Table (hiển thị từ tablet/desktop >= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-6">Sản Phẩm</th>
              <th className="py-3.5 px-4">Danh Mục</th>
              <th className="py-3.5 px-4">Giá Bán</th>
              <th className="py-3.5 px-4">Macros</th>
              <th className="py-3.5 px-4 text-center">Trạng Thái Kho</th>
              <th className="py-3.5 px-6 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const isLoading = loadingId === p.id;
              return (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200/60">
                        <Image
                          src={p.defaultImage}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate max-w-xs">{p.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{p.brand}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
                      {p.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{formatPrice(p.price)}</p>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <p className="text-[11px] text-slate-400 line-through">
                        {formatPrice(p.originalPrice)}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-semibold text-blue-600">
                      {p.macros?.protein?.toLowerCase().includes('protein') || p.category === 'whey'
                        ? (p.macros?.protein?.toLowerCase().includes('protein') ? p.macros.protein : `${p.macros?.protein || '25g'} Protein`)
                        : (p.macros?.protein || `${p.macros?.servings} servings`)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {p.macros?.servings} {p.macros?.servingsLabel?.toLowerCase() || 'servings'}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleStock(p)}
                      disabled={isLoading}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-2xs ${
                        p.inStock
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      } ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                      title="Bấm để chuyển trạng thái Còn / Hết hàng tức thì"
                    >
                      {p.inStock ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Còn hàng</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Hết hàng</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors shadow-2xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Chỉnh sửa</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

    <ProductModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSuccess={onRefresh}
      product={editingProduct}
    />
  </>
);
}
