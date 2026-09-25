'use client';

import { FormEvent, useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createOrderAction } from '@/app/actions/order.actions';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types/product';
import { CheckoutResult, PaymentMethod, PayOSPaymentData } from '@/types/checkout';
import { formatPrice } from '@/lib/utils';
import { PaymentMethodSelector } from './payment-method-selector';
import { PayosQrModal } from './payos-qr-modal';
import { AddressSelector, SelectedAddressData } from './address-selector';
import { CheckoutOrderSummary } from './checkout-order-summary';

interface CheckoutFormProps {
  items: CartItem[];
  onBack: () => void;
  onComplete: () => void;
  onSuccess: () => void;
}

export function CheckoutForm({ items, onBack, onComplete, onSuccess }: CheckoutFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payos');
  const [addressData, setAddressData] = useState<SelectedAddressData | null>(null);
  const [payosModalData, setPayosModalData] = useState<{ orderCode: string; data: PayOSPaymentData } | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWeightGrams = items.reduce((sum, item) => {
    const itemWeight = Math.round(Number(item.size?.weightKg ?? item.weightKg ?? 1.0) * 1000);
    return sum + itemWeight * item.quantity;
  }, 0);

  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [carrierName, setCarrierName] = useState('Vận chuyển tiêu chuẩn');

  useEffect(() => {
    if (!addressData?.cityId || !addressData?.districtId) {
      setShippingFee(null);
      return;
    }

    let isMounted = true;
    setLoadingShipping(true);

    fetch('/api/shipping/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cityId: addressData.cityId,
        districtId: addressData.districtId,
        weightGrams: totalWeightGrams,
        amount: subtotal,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.rate) {
          setShippingFee(data.rate.totalFee);
          if (data.rate.carrierName) setCarrierName(data.rate.carrierName);
        }
      })
      .catch((err) => console.error('[Fetch Shipping Fee Error]:', err))
      .finally(() => {
        if (isMounted) setLoadingShipping(false);
      });

    return () => {
      isMounted = false;
    };
  }, [addressData?.cityId, addressData?.districtId, totalWeightGrams, subtotal]);

  // Tiền thanh toán cho Shop là tiền hàng (khách trả phí ship cho shipper khi nhận hàng)
  const effectiveTotal = subtotal;
  const depositAmount = paymentMethod === 'cod' ? Math.min(100000, effectiveTotal) : effectiveTotal;
  const remainingCod = paymentMethod === 'cod' ? Math.max(0, effectiveTotal - depositAmount) : 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!addressData || !addressData.cityId || !addressData.districtId || !addressData.wardId || !addressData.streetAddress) {
      setResult({ success: false, error: 'Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã và Số nhà tên đường.' });
      return;
    }

    setSubmitting(true);
    setResult(null);
    const form = new FormData(event.currentTarget);
    const response = await createOrderAction({
      customerName: String(form.get('customerName') || ''),
      customerPhone: String(form.get('customerPhone') || ''),
      customerEmail: String(form.get('customerEmail') || ''),
      customerAddress: addressData.fullAddress,
      cityId: addressData.cityId,
      cityName: addressData.cityName,
      districtId: addressData.districtId,
      districtName: addressData.districtName,
      wardId: addressData.wardId,
      wardName: addressData.wardName,
      streetAddress: addressData.streetAddress,
      notes: String(form.get('notes') || ''),
      website_hp: String(form.get('website_hp') || ''),
      paymentMethod,
      items: items.map((item) => ({
        productId: item.productId,
        flavorId: item.flavor.id,
        sizeId: item.size?.id,
        quantity: item.quantity,
      })),
    });

    setSubmitting(false);

    if (response.success) {
      if (response.payos) {
        setPayosModalData({ orderCode: response.orderCode, data: response.payos });
        setResult(response);
      } else {
        setResult(response);
        onSuccess();
      }
    } else {
      setResult(response);
    }
  };

  const handlePayosPaid = () => {
    setPayosModalData(null);
    onSuccess();
  };

  if (result?.success && !payosModalData) {
    const isCod = result.paymentMethod === 'cod';
    const remainingCod = isCod ? Math.max(0, result.totalAmount - (result.depositAmount || 100000)) : 0;

    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" aria-hidden="true" />
        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">Đặt hàng thành công</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Mã đơn hàng của bạn</p>
        <p className="mt-1 font-mono text-lg font-semibold text-apple-blue">{result.orderCode}</p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-700 w-full max-w-sm space-y-1.5">
          <div className="flex justify-between">
            <span>Tổng giá trị đơn:</span>
            <span className="font-semibold">{formatPrice(result.totalAmount)}</span>
          </div>
          {isCod ? (
            <>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Đã cọc VietQR:</span>
                <span>{formatPrice(result.depositAmount || 100000)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5">
                <span>Thu COD khi nhận (gồm ship):</span>
                <span className="text-amber-600">{formatPrice(remainingCod)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Trạng thái:</span>
              <span>Đã thanh toán 100%</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-200">
            <span>Đơn vị giao hàng:</span>
            <span className="font-medium text-slate-800">{carrierName}</span>
          </div>
        </div>

        <Button type="button" onClick={onComplete} className="mt-6 w-full max-w-sm">Tiếp tục mua sắm</Button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        {/* Honeypot field for bot trap - completely invisible to human users */}
        <div style={{ position: 'absolute', opacity: 0, zIndex: -1, width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
          <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
          <button type="button" onClick={onBack} className="grid h-11 w-11 place-items-center" aria-label="Quay lại giỏ hàng">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="font-semibold text-slate-950">Thông tin nhận hàng</h2>
            <p className="text-xs text-slate-500">
              Giao nhanh toàn quốc
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          <Field label="Họ và tên người nhận" name="customerName" autoComplete="name" minLength={2} />
          <Field label="Số điện thoại" name="customerPhone" type="tel" autoComplete="tel" inputMode="tel" />
          <Field label="Email nhận hóa đơn điện tử" name="customerEmail" type="email" autoComplete="email" required />
          
          {/* Bộ chọn địa chính 3 cấp tương thích chuẩn AllinGo */}
          <AddressSelector onChange={setAddressData} disabled={submitting} />

          <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod} />

          {/* Tóm tắt đơn hàng, khối lượng và cước AllinGo thời gian thực (KHÔNG FREESHIP) */}
          <CheckoutOrderSummary
            subtotal={subtotal}
            totalWeightGrams={totalWeightGrams}
            shippingFee={shippingFee}
            loadingShipping={loadingShipping}
            carrierName={carrierName}
            paymentMethod={paymentMethod}
            depositAmount={depositAmount}
            remainingCod={remainingCod}
          />

          <label className="block text-sm font-medium text-slate-800">
            Ghi chú giao hàng <span className="font-normal text-slate-400">(không bắt buộc)</span>
            <textarea
              name="notes"
              rows={2}
              placeholder="Lời nhắn cho shipper hoặc thời gian nhận hàng thuận tiện..."
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/15"
            />
          </label>

          {result && !result.success && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{result.error}</p>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <Button type="submit" size="lg" isLoading={submitting} className="w-full rounded-xl bg-apple-dark hover:bg-black text-white">
            {paymentMethod === 'payos'
              ? `Thanh toán ${shippingFee !== null ? formatPrice(effectiveTotal) : ''} qua VietQR`
              : 'Đặt hàng & Cọc 100.000đ qua VietQR'}
          </Button>
        </div>
      </form>

      {payosModalData && (
        <PayosQrModal
          orderCode={payosModalData.orderCode}
          payosData={payosModalData.data}
          onSuccess={handlePayosPaid}
          onClose={() => setPayosModalData(null)}
        />
      )}
    </>
  );
}


interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

function Field({ label, name, ...props }: FieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-800">
      {label}
      <input
        {...props}
        name={name}
        required
        className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/15"
      />
    </label>
  );
}
