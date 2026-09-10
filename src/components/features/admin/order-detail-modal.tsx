'use client';

import React from 'react';
import { X, MapPin, Phone, User, FileText, ShoppingCart } from 'lucide-react';
import { Order } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Chi Tiết Đơn Hàng</h2>
              <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {order.order_code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Customer Info Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2.5">
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Thông Tin Người Nhận
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-semibold">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <a href={`tel:${order.customer_phone}`} className="text-blue-600 font-semibold hover:underline">
                  {order.customer_phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>{order.customer_address}</span>
            </div>
            {order.notes && (
              <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60 text-slate-500 italic">
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>Ghi chú: {order.notes}</span>
              </div>
            )}
          </div>

          {/* Items List */}
          <div>
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-3 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Danh Sách Sản Phẩm Đặt Mua</span>
            </h3>

            {(!order.order_items || order.order_items.length === 0) ? (
              <p className="text-slate-400 italic">Chưa có dữ liệu danh sách sản phẩm chi tiết.</p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {order.order_items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{item.product_name}</p>
                      {item.flavor_name && (
                        <p className="text-[11px] text-slate-500">Hương vị: {item.flavor_name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                      <p className="text-[11px] font-semibold text-blue-600">
                        = {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total & Summary */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
            <span className="font-bold text-slate-700">Tổng Giá Trị Đơn Hàng:</span>
            <span className="text-lg font-black text-blue-600">
              {formatPrice(Number(order.total_amount))}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
}
