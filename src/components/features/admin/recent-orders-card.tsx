'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Order, OrderStatus } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';

interface RecentOrdersCardProps {
  orders: Order[];
}

const STATUS_LABELS: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  processing: { label: 'Đang chuẩn bị', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipping: { label: 'Đang giao', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  completed: { label: 'Hoàn tất', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Đã hủy', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  const displayOrders = orders.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Đơn Hàng Gần Đây</h2>
          <p className="text-xs text-slate-500">Các đơn hàng mới phát sinh cần theo dõi</p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs font-semibold text-apple-blue hover:text-apple-blue-hover flex items-center gap-1 group"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {displayOrders.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-xs">Chưa có đơn hàng nào được ghi nhận.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 font-semibold">Mã Đơn</th>
                <th className="pb-3 font-semibold">Khách Hàng</th>
                <th className="pb-3 font-semibold">Tổng Tiền</th>
                <th className="pb-3 font-semibold">Trạng Thái</th>
                <th className="pb-3 font-semibold text-right">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayOrders.map((order) => {
                const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                return (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-blue-600">{order.order_code}</td>
                    <td className="py-3">
                      <p className="font-semibold text-slate-800">{order.customer_name}</p>
                      <p className="text-[11px] text-slate-400">{order.customer_phone}</p>
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      {formatPrice(Number(order.total_amount))}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
