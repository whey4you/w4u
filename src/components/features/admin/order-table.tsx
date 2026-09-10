'use client';

import React, { useState } from 'react';
import { Eye, Clock } from 'lucide-react';
import { Order, OrderStatus, updateOrderStatus } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';
import { OrderDetailModal } from './order-detail-modal';

interface OrderTableProps {
  orders: Order[];
  onRefresh: () => void;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string; bg: string }[] = [
  { value: 'pending', label: 'Chờ duyệt', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'processing', label: 'Đang xử lý', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'shipping', label: 'Đang giao', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'completed', label: 'Hoàn tất', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'cancelled', label: 'Đã hủy', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export function OrderTable({ orders, onRefresh }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const ok = await updateOrderStatus(orderId, newStatus);
    setUpdatingId(null);
    if (ok) {
      onRefresh();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-6">Mã Đơn</th>
              <th className="py-3.5 px-4">Khách Hàng</th>
              <th className="py-3.5 px-4">Số Điện Thoại</th>
              <th className="py-3.5 px-4">Tổng Tiền</th>
              <th className="py-3.5 px-4">Trạng Thái Đơn</th>
              <th className="py-3.5 px-4">Ngày Đặt</th>
              <th className="py-3.5 px-6 text-right">Chi Tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>Không có đơn hàng nào phù hợp với bộ lọc.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isUpdating = updatingId === order.id;
                return (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-600">
                      {order.order_code}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{order.customer_name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{order.customer_address}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {order.customer_phone}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatPrice(Number(order.total_amount))}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        disabled={isUpdating}
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none transition-colors cursor-pointer ${
                          STATUS_OPTIONS.find((s) => s.value === order.status)?.bg ||
                          'bg-slate-100 text-slate-700'
                        } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-white text-slate-800 font-normal">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <OrderDetailModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
