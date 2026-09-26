'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle2, ShieldCheck, MapPin, Truck,
  Copy, Check, ExternalLink, Loader2, Phone, Mail,
} from 'lucide-react';
import { CheckoutResult, PaymentMethod } from '@/types/checkout';
import { CartItem } from '@/types/product';
import { Order } from '@/services/order.service';
import { formatPrice } from '@/lib/utils';
import { CheckoutCustomerData } from '@/hooks/use-checkout-flow';
import { SelectedAddressData } from './address-selector';

export interface CheckoutReceiptCardProps {
  order?: Order;
  result?: Extract<CheckoutResult, { success: true }>;
  items?: CartItem[];
  customer?: CheckoutCustomerData;
  addressData?: SelectedAddressData | null;
  paymentMethod?: PaymentMethod;
  shippingFee?: number;
  isPaid?: boolean;
  remainingCod?: number;
  trackingCode?: string | null;
  carrierName?: string | null;
  trackingUrl?: string | null;
  children?: React.ReactNode;
}

// ─── Seller constants ────────────────────────────────────────────────
const SELLER = {
  name: 'WHEY4YOU',
  tagline: 'Thực Phẩm Bổ Sung Chính Hãng',
  address: 'TP. Hồ Chí Minh, Việt Nam',
  hotline: '0909 123 456',
  website: 'whey4you.vn',
};

export function CheckoutReceiptCard({
  order,
  result,
  items,
  customer,
  addressData,
  paymentMethod: propPaymentMethod,
  shippingFee: propShippingFee,
  isPaid: propIsPaid,
  remainingCod: propRemainingCod,
  trackingCode: propTrackingCode,
  carrierName: propCarrierName,
  trackingUrl: propTrackingUrl,
  children,
}: CheckoutReceiptCardProps) {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const orderCode = order ? order.order_code : (result?.orderCode || '');
  const totalAmount = order ? order.total_amount : (result?.totalAmount || 0);
  const paymentMethod: PaymentMethod = order
    ? (order.payment_method === 'cod' ? 'cod' : 'payos')
    : (propPaymentMethod || 'payos');
  const isCod = paymentMethod === 'cod';
  const shippingFee = order ? (order.shipping_fee ?? 30000) : (propShippingFee || 0);
  const isCancelled = order?.status === 'cancelled';
  const isPaid = order ? (order.status !== 'cancelled') : (propIsPaid ?? false);

  const displayItems = order?.order_items
    ? order.order_items.map((it) => ({
        name: it.product_name,
        flavorName: it.flavor_name,
        sizeName: undefined as string | undefined,
        quantity: it.quantity,
        price: it.price,
      }))
    : (items || []).map((it) => ({
        name: it.productName,
        flavorName: it.flavor?.name,
        sizeName: it.size?.name,
        quantity: it.quantity,
        price: it.price,
      }));

  const calculatedSubtotal = displayItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const couponCode = order?.coupon_code || result?.couponCode || null;
  const discountAmount = Number(order?.discount_amount ?? result?.discountAmount ?? 0);
  const effectiveSubtotal = result?.subtotal ?? (calculatedSubtotal > 0 ? calculatedSubtotal : Math.max(0, totalAmount + discountAmount - shippingFee));
  const paidAmount = order
    ? (order.deposit_amount || (isCod ? Math.min(100000, totalAmount) : totalAmount))
    : (isCod ? (result?.depositAmount || 100000) : totalAmount);
  const remainingCod = order
    ? (order.cod_remaining ?? (isCod ? Math.max(0, totalAmount - paidAmount) : 0))
    : (propRemainingCod ?? 0);

  const customerName = order ? order.customer_name : (customer?.customerName || '');
  const customerPhone = order ? order.customer_phone : (customer?.customerPhone || '');
  const customerEmail = order ? order.customer_email : (customer?.customerEmail || '');
  const fullAddress = order ? order.customer_address : (addressData?.fullAddress || '');
  const customerNotes = order ? (order.notes?.includes('[CityID:') ? undefined : order.notes) : customer?.notes;

  const effectiveTrackingCode = order?.tracking_code || propTrackingCode || null;
  const rawCarrierName = order?.carrier_name || propCarrierName || 'SPX Express';
  const effectiveCarrierName = rawCarrierName.toLowerCase().includes('partner') ? 'SPX Express' : rawCarrierName;
  const effectiveTrackingUrl = order?.tracking_url || propTrackingUrl || (effectiveTrackingCode ? `https://spx.vn/track?bill=${effectiveTrackingCode}` : null);


  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };


  const issuedAt = order?.created_at ? new Date(order.created_at) : new Date();
  const dateFormatted = issuedAt.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const timeFormatted = issuedAt.toLocaleTimeString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
  });

  const qrTrackingUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://whey4you.vn/orders?code=${orderCode}`)}`;

  const statusLabel = isCancelled
    ? 'ĐÃ HỦY'
    : isPaid
    ? 'ĐÃ THANH TOÁN'
    : 'CHỜ THANH TOÁN';

  const statusBadgeClass = isCancelled
    ? 'bg-red-50 text-red-700 border-red-200'
    : isPaid
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-amber-50 text-amber-800 border-amber-200';

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-lg font-[family-name:var(--font-invoice)] print:shadow-none print:border-none print:rounded-none print:overflow-visible print:w-full">

      {/* ══ HEADER: Logo + Seller | Invoice Title + Meta ══ */}
      <div className="px-4 py-4 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-neutral-200 print:px-0 print:py-4">
        {/* Left: Brand identity */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Image
              src="/logo.webp"
              alt="Whey4You Logo"
              width={48}
              height={48}
              className="h-11 w-11 object-contain print:h-9 print:w-9"
              unoptimized
            />
          </div>
          <div>
            <p className="text-base font-black tracking-tight text-neutral-950">{SELLER.name}</p>
            <p className="text-[11px] text-neutral-500 leading-tight">{SELLER.tagline}</p>
            <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
              {SELLER.address}<br />
              ĐT: {SELLER.hotline} · {SELLER.website}
            </p>
          </div>
        </div>

        {/* Right: Invoice title & metadata */}
        <div className="sm:text-right flex-shrink-0">
          <h1 className="text-xl font-black uppercase tracking-widest text-neutral-950 print:text-lg">Hóa Đơn</h1>
          <p className="text-[11px] text-neutral-400 mt-0.5">Bán hàng</p>
          <div className="mt-2 space-y-0.5 text-xs">
            <div className="flex sm:justify-end items-center gap-2">
              <span className="text-neutral-400">Số HĐ:</span>
              <span className="font-mono font-bold text-neutral-900">{orderCode}</span>
            </div>
            <div className="flex sm:justify-end items-center gap-2">
              <span className="text-neutral-400">Ngày:</span>
              <span className="font-semibold text-neutral-700">{dateFormatted} · {timeFormatted}</span>
            </div>
            <div className="flex sm:justify-end items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${statusBadgeClass}`}>
                {isPaid && !isCancelled && <CheckCircle2 className="h-2.5 w-2.5" />}
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CUSTOMER & SHIPPING INFO + TRACKING ══ */}
      <div className="px-4 sm:px-8 py-4 border-b border-neutral-100 bg-neutral-50/40 print:px-0 print:py-3 space-y-3">
        {/* 2-col: Buyer + Delivery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400">Thông Tin Người Mua</p>
            <p className="text-sm font-bold text-neutral-900">{customerName}</p>
            <p className="text-xs text-neutral-600 flex items-center gap-1">
              <Phone className="h-3 w-3 text-neutral-400 flex-shrink-0" />
              <span>{customerPhone}</span>
            </p>
            {customerEmail && (
              <p className="text-xs text-neutral-600 flex items-center gap-1">
                <Mail className="h-3 w-3 text-neutral-400 flex-shrink-0" />
                <span className="truncate">{customerEmail}</span>
              </p>
            )}
            {customerNotes && (
              <p className="text-[11px] text-neutral-500 italic">Ghi chú: {customerNotes}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400">Địa Chỉ Giao Hàng</p>
            <p className="text-xs text-neutral-700 flex items-start gap-1 leading-relaxed">
              <MapPin className="h-3 w-3 text-neutral-400 flex-shrink-0 mt-0.5" />
              <span>{fullAddress}</span>
            </p>
            <p className="text-[11px] text-neutral-500">
              Thanh toán:{' '}
              <span className="font-semibold text-neutral-700">
                {isCod ? 'COD (Thu khi nhận)' : 'Chuyển khoản VietQR'}
              </span>
            </p>
          </div>
        </div>

        {/* Tracking row — hiện khi đã paid */}
        {isPaid && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-200/70">
            <div className="flex items-center gap-2 min-w-0">
              <Truck className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-neutral-600 flex-shrink-0">{effectiveCarrierName}</span>
              {effectiveTrackingCode ? (
                <span className="font-mono text-xs font-bold text-neutral-900 truncate">{effectiveTrackingCode}</span>
              ) : (
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin text-orange-400" />
                  Đang cấp mã…
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {effectiveTrackingCode && (
                <button
                  type="button"
                  onClick={() => handleCopyTracking(effectiveTrackingCode)}
                  className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-800 px-2 py-1 rounded-md hover:bg-neutral-100 transition-colors print:hidden"
                >
                  {copiedTracking
                    ? <><Check className="h-3 w-3 text-emerald-600" /><span className="text-emerald-700">Đã chép</span></>
                    : <><Copy className="h-3 w-3" /><span>Sao chép</span></>}
                </button>
              )}
              {effectiveTrackingUrl && (
                <a
                  href={effectiveTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-0.5 text-[11px] font-medium text-orange-600 hover:text-orange-800 print:hidden"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ PRODUCT TABLE ══ */}
      {displayItems.length > 0 && (
        <div className="px-4 sm:px-8 py-4 border-b border-neutral-100 print:px-0 print:py-3">
          <div className="mb-2.5">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400">Chi Tiết Sản Phẩm</p>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 scrollbar-thin">
            <div className="min-w-[480px]">
              {/* Column headings */}
              <div className="grid grid-cols-[1.5rem_1fr_2.5rem_6.5rem_6.5rem] gap-x-3 text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 pb-1.5 border-b border-neutral-200">
                <span>#</span>
                <span>Sản Phẩm</span>
                <span className="text-center">SL</span>
                <span className="text-right">Đơn Giá</span>
                <span className="text-right">Thành Tiền</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-neutral-50">
                {displayItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1.5rem_1fr_2.5rem_6.5rem_6.5rem] gap-x-3 py-2.5 text-xs items-start"
                  >
                    <span className="text-neutral-400 text-[11px] pt-0.5">{idx + 1}</span>
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-neutral-900 leading-tight">{item.name}</p>
                      {(item.flavorName || item.sizeName) && (
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {item.flavorName ? `Vị: ${item.flavorName}` : ''}
                          {item.sizeName ? ` · ${item.sizeName}` : ''}
                        </p>
                      )}
                    </div>
                    <span className="text-center font-semibold text-neutral-700">{item.quantity}</span>
                    <span className="text-right text-neutral-500 text-[11px] tabular-nums">{formatPrice(item.price)}</span>
                    <span className="text-right font-semibold text-neutral-900 tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ FINANCIAL SUMMARY ══ */}
      <div className="px-4 sm:px-8 py-5 border-b border-neutral-100 print:px-0 print:py-4">
        <div className="flex justify-end">
          <div className="w-full sm:w-72 font-[family-name:var(--font-invoice)]">

            {/* Sub-rows */}
            <div className="space-y-2.5 text-sm text-neutral-600">
              <div className="flex justify-between items-center">
                <span>Tiền hàng</span>
                <span className="font-medium text-neutral-800 tabular-nums">{formatPrice(effectiveSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-medium">
                  <span>Giảm giá voucher {couponCode ? `(${couponCode})` : ''}</span>
                  <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-neutral-800 tabular-nums">
                  {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline mt-4 pt-3.5 border-t-2 border-neutral-900">
              <span className="text-sm font-bold uppercase tracking-wider text-neutral-900">Tổng Cộng</span>
              <span className="text-lg font-bold tabular-nums text-neutral-950">{formatPrice(totalAmount)}</span>
            </div>

            {/* Payment breakdown */}
            <div className="mt-4 pt-4 border-t border-dashed border-neutral-200 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Chi Tiết Thanh Toán</p>

              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">{isCod ? 'Cọc qua VietQR' : 'Thanh toán VietQR'}</span>
                <span className={`font-semibold tabular-nums ${isPaid ? 'text-emerald-700' : 'text-neutral-700'}`}>
                  {formatPrice(paidAmount)}{isPaid ? ' ✓' : ''}
                </span>
              </div>

              {isCod && (
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <span className="text-neutral-500 block">Shipper thu khi nhận (COD)</span>
                    <span className="text-[10px] text-neutral-400">Đã bao gồm tiền hàng & cước ship</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold tabular-nums text-neutral-800 block">
                      {formatPrice(remainingCod)}
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>



      {/* VietQR payment section (injected) */}
      {children && (
        <div className="px-6 sm:px-8 py-4 border-b border-neutral-100 print:hidden">
          {children}
        </div>
      )}

      {/* ══ FOOTER: Guarantee + QR ══ */}
      <div className="px-4 sm:px-8 py-4 print:px-0 print:py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-bold text-neutral-800">Bảo hiểm 100% giá trị bưu kiện</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Đồng kiểm khi nhận hàng · Hỗ trợ: <strong className="text-neutral-600">{SELLER.hotline}</strong>
          </p>
          <p className="text-[10px] text-neutral-400">Cảm ơn Quý khách đã tin chọn {SELLER.name}!</p>
        </div>

        <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrTrackingUrl} alt="QR tra cứu đơn hàng" className="h-10 w-10 rounded" />
          <div className="text-[10px] space-y-0.5">
            <span className="font-bold text-neutral-800 block uppercase tracking-wider">Tra cứu đơn</span>
            <span className="text-neutral-400 block font-mono">{SELLER.website}/orders</span>
          </div>
        </div>
      </div>

      {/* Print-only document note */}
      <div className="hidden print:block text-center py-2 border-t border-dashed border-neutral-200">
        <p className="text-[9px] text-neutral-400 uppercase tracking-widest">
          Hóa đơn điện tử · Xuất tự động từ hệ thống {SELLER.website}
        </p>
      </div>
    </div>
  );
}
