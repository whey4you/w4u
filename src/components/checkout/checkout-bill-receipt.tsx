'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Printer, ArrowRight, Package } from 'lucide-react';
import { CheckoutResult, PaymentMethod } from '@/types/checkout';
import { CartItem } from '@/types/product';
import { CheckoutCustomerData } from '@/hooks/use-checkout-flow';
import { SelectedAddressData } from './address-selector';
import { CheckoutBillVietQr } from './checkout-bill-vietqr';
import { CheckoutReceiptCard } from './checkout-receipt-card';
import { CheckoutCancelConfirmModal } from './checkout-cancel-confirm-modal';
import { cancelPendingCheckoutAction } from '@/app/actions/order.actions';

interface CheckoutBillReceiptProps {
  result: Extract<CheckoutResult, { success: true }>;
  items: CartItem[];
  customer: CheckoutCustomerData;
  addressData: SelectedAddressData | null;
  paymentMethod: PaymentMethod;
  shippingFee: number;
  onPaidSuccess?: () => void;
}

export function CheckoutBillReceipt({
  result,
  items,
  customer,
  addressData,
  paymentMethod,
  shippingFee,
  onPaidSuccess,
}: CheckoutBillReceiptProps) {
  const router = useRouter();
  const [isPaid, setIsPaid] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<{
    trackingCode?: string | null;
    carrierName?: string | null;
    trackingUrl?: string | null;
  } | null>(null);

  const isCod = paymentMethod === 'cod';
  const remainingCod = isCod ? Math.max(0, result.totalAmount - (result.depositAmount || 100000)) : 0;

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    await cancelPendingCheckoutAction(result.orderCode);
    router.push('/cart');
  };

  // Cảnh báo người dùng khi reload hoặc đóng tab trước khi thanh toán
  useEffect(() => {
    if (isPaid) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPaid]);

  // Chặn vuốt chuột quay lại (Swipe back / Browser Back) để tránh mất đơn
  useEffect(() => {
    if (isPaid) return;
    window.history.pushState({ billPending: true }, '', window.location.href);

    const handlePopState = () => {
      setShowCancelModal(true);
      window.history.pushState({ billPending: true }, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isPaid]);

  // Tự động kiểm tra nạp mã vận đơn SPX ngay khi thanh toán thành công nếu AllinGo đang xử lý
  useEffect(() => {
    if (!isPaid || trackingInfo?.trackingCode) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/orders/${result.orderCode}/status`);
        const json = await res.json();
        if (json.success && json.trackingCode) {
          setTrackingInfo({
            trackingCode: json.trackingCode,
            carrierName: json.carrierName,
            trackingUrl: json.trackingUrl,
          });
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Lỗi lấy mã vận đơn SPX:', err);
      }
      if (attempts >= 10) clearInterval(interval);
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaid, result.orderCode, trackingInfo?.trackingCode]);

  return (
    <div className="space-y-5 max-w-2xl mx-auto print:max-w-none print:m-0 print:p-0">
      {/* 1. MÃ VIETQR THANH TOÁN (NẰM TRÊN CÙNG KHI CHƯA THANH TOÁN) */}
      {result.payos && !isPaid && (
        <div className="print:hidden">
          <CheckoutBillVietQr
            orderCode={result.orderCode}
            payos={result.payos}
            isPaid={isPaid}
            onPaidSuccess={(data) => {
              setIsPaid(true);
              if (data?.trackingCode) {
                setTrackingInfo(data);
              }
              onPaidSuccess?.();
            }}
          />
        </div>
      )}

      {/* 2. HÓA ĐƠN XÁC NHẬN CHI TIẾT (NẰM BÊN DƯỚI) */}
      <CheckoutReceiptCard
        result={result}
        items={items}
        customer={customer}
        addressData={addressData}
        paymentMethod={paymentMethod}
        shippingFee={shippingFee}
        isPaid={isPaid}
        remainingCod={remainingCod}
        trackingCode={trackingInfo?.trackingCode}
        carrierName={trackingInfo?.carrierName}
        trackingUrl={trackingInfo?.trackingUrl}
      />

      {/* 3. HỖ TRỢ ĐỔI THÔNG TIN / ĐƠN VỊ VẬN CHUYỂN KHI VỪA THANH TOÁN */}
      {isPaid && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs print:hidden animate-in fade-in duration-300">
          <div className="space-y-0.5">
            <p className="font-bold text-amber-950 flex items-center gap-1.5 text-xs sm:text-sm">
              💬 Cần đổi địa chỉ hoặc đơn vị vận chuyển?
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Đơn hàng đang trong khâu đóng gói. Nếu quý khách cần đổi sang Hỏa Tốc hoặc sửa địa chỉ nhận hàng, hãy nhắn Shop qua Zalo ngay nhé!
            </p>
          </div>
          <a
            href="https://zalo.me/0559959433"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            <span>Nhắn Zalo Shop hỗ trợ</span>
          </a>
        </div>
      )}

      {/* Action Navigation Footer - CHỈ HIỂN THỊ SAU KHI ĐÃ THANH TOÁN THÀNH CÔNG */}
      {isPaid ? (
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-full border border-neutral-300 text-neutral-800 hover:bg-neutral-50 text-xs py-3 px-5 font-bold flex items-center gap-2 transition-all shadow-xs active:scale-[0.99]"
            >
              <Printer className="h-4 w-4 text-neutral-600" />
              <span>In hóa đơn xác nhận</span>
            </button>

            <Link href={`/orders?code=${result.orderCode}`}>
              <button
                type="button"
                className="rounded-full border border-neutral-300 text-neutral-800 hover:bg-neutral-50 text-xs py-3 px-5 font-bold flex items-center gap-2 transition-all shadow-xs active:scale-[0.99]"
              >
                <Package className="h-4 w-4 text-neutral-600" />
                <span>Tra cứu vận đơn</span>
              </button>
            </Link>
          </div>

          <Link href="/products">
            <button
              type="button"
              className="rounded-full bg-neutral-900 hover:bg-black text-white text-xs px-7 py-3 font-bold flex items-center gap-2 transition-all shadow-sm active:scale-[0.99]"
            >
              <span>Tiếp tục mua sắm</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="text-center print:hidden pt-1 pb-4">
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="text-xs text-neutral-400 hover:text-rose-600 transition-colors underline underline-offset-4"
          >
            Hủy đơn hàng này & Quay lại giỏ hàng
          </button>
        </div>
      )}

      {/* Popup xác nhận hủy đơn khi click quay lại hoặc thoát */}
      <CheckoutCancelConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={handleConfirmCancel}
        isCancelling={isCancelling}
      />
    </div>
  );
}
