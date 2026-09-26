'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Tag, CheckCircle2, Ticket } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import { CouponTable } from './coupon-table';
import { CouponCreateModal } from './coupon-create-modal';
import { CouponEditModal } from './coupon-edit-modal';

interface CouponManagerProps {
  initialCoupons: Coupon[];
}

export function CouponManager({ initialCoupons }: CouponManagerProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const totalCoupons = initialCoupons.length;
  const activeCoupons = initialCoupons.filter((c) => c.is_active).length;
  const totalUses = initialCoupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

  const filteredCoupons = initialCoupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return c.is_active;
    if (statusFilter === 'inactive') return !c.is_active;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số mã</p>
            <p className="text-lg sm:text-xl font-black text-slate-900">{totalCoupons}</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang kích hoạt</p>
            <p className="text-lg sm:text-xl font-black text-emerald-700">{activeCoupons}</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng lượt đã dùng</p>
            <p className="text-lg sm:text-xl font-black text-purple-700">{totalUses}</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã hoặc mô tả..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-slate-900 shadow-2xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 sm:px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-slate-900 text-slate-700 shadow-2xs shrink-0 max-w-[130px] sm:max-w-none"
          >
            <option value="all">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm dừng</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mã mới</span>
        </button>
      </div>

      {/* Table */}
      <CouponTable
        coupons={filteredCoupons}
        onRefresh={() => router.refresh()}
        onEdit={(coupon) => setEditingCoupon(coupon)}
      />

      {/* Modal Create */}
      <CouponCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      {/* Modal Edit */}
      <CouponEditModal
        isOpen={Boolean(editingCoupon)}
        coupon={editingCoupon}
        onClose={() => setEditingCoupon(null)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
