'use client';

import React from 'react';
import { DollarSign, Clock, Package, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface DashboardStatsProps {
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  outOfStockCount: number;
}

export function DashboardStats({
  totalRevenue,
  pendingOrders,
  totalProducts,
  outOfStockCount,
}: DashboardStatsProps) {
  const cards = [
    {
      title: 'Doanh Thu Tạm Tính',
      value: formatPrice(totalRevenue),
      subtitle: 'Từ các đơn thành công & đang giao',
      icon: DollarSign,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Đơn Hàng Chờ Xử Lý',
      value: pendingOrders,
      subtitle: pendingOrders > 0 ? 'Cần xác nhận ngay' : 'Đã xử lý hết',
      icon: Clock,
      iconBg: pendingOrders > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500',
      badge: pendingOrders > 0 ? 'Cần duyệt' : undefined,
    },
    {
      title: 'Tổng Số Sản Phẩm',
      value: totalProducts,
      subtitle: 'Đang lưu trữ trong Supabase',
      icon: Package,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Sản Phẩm Tạm Hết Hàng',
      value: outOfStockCount,
      subtitle: outOfStockCount > 0 ? 'Cần cập nhật nhập kho' : 'Kho đầy đủ',
      icon: AlertCircle,
      iconBg: outOfStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
                {card.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
