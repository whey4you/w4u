'use client';

import { FormEvent, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createOrderAction } from '@/app/actions/order.actions';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types/product';
import { CheckoutResult, PaymentMethod, PayOSPaymentData } from '@/types/checkout';
import { formatPrice } from '@/lib/utils';
import { PaymentMethodSelector } from './payment-method-selector';
import { PayosQrModal } from './payos-qr-modal';

interface CheckoutFormProps {
  items: CartItem[];
  onBack: () => void;
  onComplete: () => void;
  onSuccess: () => void;
}

export function CheckoutForm({ items, onBack, onComplete, onSuccess }: CheckoutFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payos');
  const [payosModalData, setPayosModalData] = useState<{ orderCode: string; data: PayOSPaymentData } | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);
    const form = new FormData(event.currentTarget);
    const response = await createOrderAction({
      customerName: String(form.get('customerName') || ''),
      customerPhone: String(form.get('customerPhone') || ''),
      customerAddress: String(form.get('customerAddress') || ''),
      notes: String(form.get('notes') || ''),
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
      if (response.paymentMethod === 'payos' && response.payos) {
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
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" aria-hidden="true" />
        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">Đặt hàng thành công</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Mã đơn hàng của bạn</p>
        <p className="mt-1 font-mono text-lg font-semibold text-apple-blue">{result.orderCode}</p>
        <p className="mt-3 text-sm text-slate-600">Tổng tiền: {formatPrice(result.totalAmount)}</p>
        <Button type="button" onClick={onComplete} className="mt-6 w-full">Tiếp tục mua sắm</Button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
          <button type="button" onClick={onBack} className="grid h-11 w-11 place-items-center" aria-label="Quay lại giỏ hàng">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="font-semibold text-slate-950">Thông tin nhận hàng</h2>
            <p className="text-xs text-slate-500">
              {paymentMethod === 'payos' ? 'Thanh toán qua VietQR PayOS' : 'Thanh toán khi nhận hàng (COD)'}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          <Field label="Họ và tên" name="customerName" autoComplete="name" minLength={2} />
          <Field label="Số điện thoại" name="customerPhone" type="tel" autoComplete="tel" inputMode="tel" />
          <label className="block text-sm font-medium text-slate-800">
            Địa chỉ giao hàng
            <textarea
              name="customerAddress"
              required
              minLength={10}
              rows={2}
              autoComplete="street-address"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-base outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/15"
            />
          </label>

          <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod} />

          <label className="block text-sm font-medium text-slate-800">
            Ghi chú <span className="font-normal text-slate-400">(không bắt buộc)</span>
            <textarea
              name="notes"
              rows={2}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-base outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/15"
            />
          </label>
          {result && !result.success && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{result.error}</p>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <Button type="submit" size="lg" isLoading={submitting} className="w-full rounded-xl bg-apple-dark hover:bg-black text-white">
            {paymentMethod === 'payos' ? 'Tạo mã QR thanh toán' : 'Xác nhận đặt hàng'}
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
