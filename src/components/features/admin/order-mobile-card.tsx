'use client';

import React from 'react';
import { Eye, Edit3, Trash2, Phone, MapPin, Truck, AlertTriangle } from 'lucide-react';
import { Order, OrderStatus } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';

interface OrderMobileCardProps {
  order: Order;
  isUpdating: boolean;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onSelect: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
  statusOptions: { value: OrderStatus; label: string; bg: string }[];
}

export function OrderMobileCard({
  order,
  isUpdating,
  onStatusChange,
  onSelect,
  onEdit,
  onDelete,
  statusOptions,
}: OrderMobileCardProps) {
  const currentStatusBg =
    statusOptions.find((s) => s.value === order.status)?.bg || 'bg-slate-100 text-slate-700';

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
      {/* Top row: Order Code, Payment Badge & Date */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono font-bold text-sm text-blue-600">
            {order.order_code}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5" suppressHydrationWarning>
            {new Date(order.created_at).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <span
          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${
            order.payment_method === 'payos'
              ? 'bg-blue-100 text-blue-800'
              : order.payment_method === 'bank_transfer'
              ? 'bg-indigo-100 text-indigo-800'
              : order.payment_method === 'cash'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {order.payment_method === 'payos'
            ? '⚡ VietQR'
            : order.payment_method === 'bank_transfer'
            ? '🏦 CK Bank'
            : order.payment_method === 'cash'
            ? '💵 Tiền mặt'
            : '📦 COD'}
        </span>
      </div>

      {/* Customer Info: Name & Phone with quick call */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900">{order.customer_name}</span>
          <a
            href={`tel:${order.customer_phone}`}
            className="inline-flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg active:scale-95 transition-transform"
          >
            <Phone className="w-3 h-3" />
            <span>{order.customer_phone}</span>
          </a>
        </div>

        {order.customer_address && (
          <p className="text-[11px] text-slate-500 line-clamp-1 flex items-start gap-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
            <span>{order.customer_address}</span>
          </p>
        )}

        {(order.tracking_code || order.allingo_track_id) && (
          <a
            href={
              order.tracking_url ||
              `https://business.allingo.vn/track/${order.allingo_track_id || order.tracking_code}`
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
          >
            <Truck className="w-3 h-3" />
            <span>
              {order.carrier_name || 'Vận chuyển'}: {order.tracking_code || order.allingo_track_id}
            </span>
          </a>
        )}

        {!order.tracking_code && !order.allingo_order_id && Boolean(order.notes && (order.notes.includes('Insufficient wallet balance') || order.notes.includes('API 402'))) && (
          <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 w-fit">
            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
            <span>Ví AllinGo thiếu tiền ({formatPrice(Number(order.shipping_fee || 15000))})</span>
          </div>
        )}
      </div>

      {/* Price & Status row */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Tổng tiền</p>
          <p className="text-sm font-bold text-slate-900">
            {formatPrice(Number(order.total_amount))}
          </p>
          {order.payment_method === 'cod' && (
            <p className="text-[10px] text-amber-600 font-medium">
              Thu: {formatPrice(Math.max(0, Number(order.total_amount) - Number(order.deposit_amount || 0)))}
            </p>
          )}
        </div>

        <div>
          <select
            disabled={isUpdating}
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none transition-colors cursor-pointer ${currentStatusBg} ${
              isUpdating ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-slate-800 font-normal">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onSelect(order)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Chi tiết</span>
        </button>

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(order)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Sửa</span>
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(order)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Xóa</span>
          </button>
        )}
      </div>
    </div>
  );
}
