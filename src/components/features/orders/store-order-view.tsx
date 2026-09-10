import React from 'react';
import { Order } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';
import { Package, User, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';

interface StoreOrderViewProps {
  order: Order;
}

export function StoreOrderView({ order }: StoreOrderViewProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'shipping':
        return { label: 'Đang vận chuyển', color: 'bg-blue-50 text-apple-blue border-blue-200' };
      case 'processing':
        return { label: 'Đang xử lý', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Chờ tiếp nhận', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-100 animate-in fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đơn hàng Whey4You</span>
          <h3 className="text-base font-bold text-slate-900">{order.order_code}</h3>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-apple-blue flex-shrink-0" />
          <span>Khách hàng: <strong>{order.customer_name}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-apple-blue flex-shrink-0" />
          <span>SĐT: <strong>{order.customer_phone}</strong></span>
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <MapPin className="w-3.5 h-3.5 text-apple-blue flex-shrink-0" />
          <span className="truncate">Địa chỉ: {order.customer_address}</span>
        </div>
      </div>

      {order.order_items && order.order_items.length > 0 && (
        <div className="pt-3 border-t border-slate-200/60 space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Sản phẩm</span>
          {order.order_items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <span className="text-slate-800">
                {item.quantity}x {item.product_name} {item.flavor_name ? `(${item.flavor_name})` : ''}
              </span>
              <span className="font-semibold text-slate-900">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 font-bold text-sm text-slate-900 border-t border-dashed border-slate-200">
            <span>Tổng thanh toán:</span>
            <span className="text-apple-blue">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
