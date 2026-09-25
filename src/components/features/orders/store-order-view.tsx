import React, { useState } from 'react';
import { Order } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';
import { User, Phone, MapPin, Receipt, FileText } from 'lucide-react';
import { OrderInvoiceModal } from './order-invoice-modal';

interface StoreOrderViewProps {
  order: Order;
  initialOpenInvoice?: boolean;
}

export function StoreOrderView({ order, initialOpenInvoice = false }: StoreOrderViewProps) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(initialOpenInvoice);

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
    <>
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

        {(order.tracking_code || order.allingo_track_id) && (
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-800">
                {order.carrier_name || 'Đơn vị vận chuyển'}: {order.tracking_code || order.allingo_track_id}
              </span>
              <p className="text-[11px] text-slate-500">Tra cứu hành trình vận chuyển thời gian thực</p>
            </div>
            <a
              href={order.tracking_url || `https://business.allingo.vn/track/${order.allingo_track_id || order.tracking_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-apple-blue text-white font-medium text-[11px] hover:bg-apple-blue-hover transition-colors shrink-0"
            >
              Xem lộ trình ↗
            </a>
          </div>
        )}

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

        {/* Nút hành động xem / lấy lại hóa đơn */}
        <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => setShowInvoiceModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
          >
            <Receipt className="w-4 h-4" />
            <span>Lấy lại hóa đơn đã thanh toán</span>
          </button>

          <span className="text-[11px] text-slate-400">
            Hóa đơn điện tử chính thức từ Whey4You
          </span>
        </div>
      </div>

      <OrderInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={order}
      />
    </>
  );
}
