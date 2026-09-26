'use client';

import React from 'react';
import { X, MapPin, Phone, User, FileText, ShoppingCart, Edit3 } from 'lucide-react';
import { Order } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onEdit?: () => void;
}

export function OrderDetailModal({ isOpen, onClose, order, onEdit }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Chi Tiết Đơn Hàng</h2>
              <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {order.order_code}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 text-xs flex-1">
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

          {/* Shipping & Payment Info */}
          <div className="bg-orange-50/70 rounded-xl p-4 border border-orange-200/80 space-y-2">
            <h3 className="font-bold text-orange-900 uppercase tracking-wider text-[10px]">
              Vận Chuyển & Thanh Toán ({order.carrier_name || 'Đơn vị vận chuyển'})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-500">Đơn vị vận chuyển: </span>
                <span className="font-bold text-slate-900">{order.carrier_name || 'Vận chuyển tiêu chuẩn'}</span>
              </div>
              <div>
                <span className="text-slate-500">Mã vận đơn: </span>
                {order.tracking_code || order.allingo_track_id ? (
                  <a
                    href={order.tracking_url || `https://business.allingo.vn/track/${order.allingo_track_id || order.tracking_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold text-blue-600 hover:underline"
                  >
                    {order.tracking_code || order.allingo_track_id} ↗
                  </a>

                ) : (
                  <span className="text-slate-400 italic">Chưa phát sinh</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-orange-200/60 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-slate-500">Phương thức: </span>
                <span className="font-semibold text-slate-800">
                  {order.payment_method === 'payos' ? 'VietQR / PayOS (Đã thanh toán 100%)' :
                   order.payment_method === 'bank_transfer' ? 'Chuyển khoản bank ngoài (Đã thanh toán 100%)' :
                   order.payment_method === 'cash' ? 'Tiền mặt (Đã thanh toán 100%)' :
                   `COD (Đã cọc ${formatPrice(Number(order.deposit_amount || 0))})`}
                </span>
              </div>
              {order.payment_method === 'cod' && (
                <div className="text-right">
                  <span className="text-slate-500">Tiền thu hộ khi giao (COD): </span>
                  <span className="font-bold text-amber-700">
                    {formatPrice(typeof order.cod_remaining === 'number' ? order.cod_remaining : Math.max(0, Number(order.total_amount) - Number(order.deposit_amount || 0)))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Total & Summary */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            {Number(order.discount_amount || 0) > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                <span>Mã giảm giá ({order.coupon_code || 'Voucher'}):</span>
                <span>-{formatPrice(Number(order.discount_amount))}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-700">Tổng Giá Trị Đơn Hàng:</span>
              <span className="text-lg font-black text-blue-600">
                {formatPrice(Number(order.total_amount))}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <div>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh Sửa</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
