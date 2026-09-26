'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Truck } from 'lucide-react';
import { Product } from '@/types/product';
import { OrderItemPicker } from './order-item-picker';
import { AddressSelector, SelectedAddressData } from '@/components/checkout/address-selector';
import { createManualOrderAction, AdminOrderItemInput } from '@/app/actions/admin-order.actions';
import { formatPrice } from '@/lib/utils';
import { OrderCodInput } from './order-cod-input';
import { FormattedShippingRate } from '@/lib/allingo';
import { OrderCarrierSelector } from './order-carrier-selector';

interface OrderCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSuccess: () => void;
}

export function OrderCreateModal({ isOpen, onClose, products, onSuccess }: OrderCreateModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [addressData, setAddressData] = useState<SelectedAddressData | null>(null);
  const [codAmount, setCodAmount] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [carrierName, setCarrierName] = useState<string>('');
  const [expectedDelivery, setExpectedDelivery] = useState<string>('');
  const [availableRates, setAvailableRates] = useState<FormattedShippingRate[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [loadingShipping, setLoadingShipping] = useState<boolean>(false);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<AdminOrderItemInput[]>([]);

  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subtotal = items.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);

  const handleSelectRate = (rate: FormattedShippingRate) => {
    setSelectedServiceId(rate.id);
    setShippingFee(rate.totalFee);
    setCarrierName(rate.carrierName);
    setExpectedDelivery(rate.expected || '');
  };

  // Tự động tra cước AllinGo khi chọn địa chỉ hoặc thay đổi sản phẩm
  useEffect(() => {
    if (!addressData?.cityId || !addressData?.districtId) {
      setAvailableRates([]);
      setSelectedServiceId('');
      setShippingFee(0);
      setCarrierName('');
      setExpectedDelivery('');
      return;
    }

    let isMounted = true;
    setLoadingShipping(true);
    const totalWeightGrams = items.reduce((sum, it) => sum + (it.weight_grams || 1000) * Number(it.quantity || 1), 0);

    fetch('/api/shipping/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cityId: addressData.cityId,
        districtId: addressData.districtId,
        wardId: addressData.wardId,
        weightGrams: Math.max(100, totalWeightGrams),
        amount: subtotal || 500000,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.rates) && data.rates.length > 0) {
          const ratesList: FormattedShippingRate[] = data.rates;
          setAvailableRates(ratesList);

          // Giữ lại hãng đang chọn nếu vẫn hợp lệ, hoặc chọn gói tiết kiệm nhất
          const existing = ratesList.find((r) => r.id === selectedServiceId);
          const chosen = existing || ratesList.find((r) => r.tag === 'cheapest') || ratesList[0];

          setSelectedServiceId(chosen.id);
          setShippingFee(chosen.totalFee);
          setCarrierName(chosen.carrierName);
          setExpectedDelivery(chosen.expected || '');
        } else {
          setAvailableRates([]);
          setSelectedServiceId('');
          setShippingFee(0);
          setCarrierName('');
          setExpectedDelivery('');
        }
      })
      .catch((err) => console.error('[Shipping Rates Error]:', err))
      .finally(() => {
        if (isMounted) setLoadingShipping(false);
      });

    return () => {
      isMounted = false;
    };
  }, [addressData?.cityId, addressData?.districtId, addressData?.wardId, items.length, subtotal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Vui lòng điền tên và số điện thoại khách hàng.');
      return;
    }
    if (!addressData?.cityId || !addressData?.streetAddress.trim()) {
      setErrorMsg('Vui lòng chọn Tỉnh/Thành, Quận/Huyện, Phường/Xã và nhập Số nhà, tên đường.');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 sản phẩm cho đơn hàng.');
      return;
    }

    setCreating(true);
    setErrorMsg(null);

    const res = await createManualOrderAction({
      customerName,
      customerPhone,
      customerEmail: customerEmail.trim() || undefined,
      customerAddress: addressData.fullAddress,
      provinceCode: addressData.cityId,
      districtCode: addressData.districtId,
      wardCode: addressData.wardId,
      codAmount: Number(codAmount),
      shippingFee,
      carrierName,
      shippingServiceId: selectedServiceId || undefined,
      fulfillWithAllinGo: true,
      notes,
      items,
    });

    setCreating(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Tạo đơn hàng thủ công thất bại.');
    }
  };

  const totalToCollect = Number(codAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/50 gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                <Truck className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">Lên Đơn Giao Hàng</h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">Tạo đơn khi khách chuyển khoản riêng hoặc mua trực tiếp</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 shrink-0 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form id="create-order-form" onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tên khách hàng *</label>
              <input
                type="text"
                value={customerName}
                placeholder="VD: Anh Nam"
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 focus:border-blue-500 font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Số điện thoại *</label>
              <input
                type="text"
                value={customerPhone}
                placeholder="VD: 0901234567"
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 focus:border-blue-500 font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email nhận hóa đơn</label>
              <input
                type="email"
                value={customerEmail}
                placeholder="VD: anhnam@gmail.com"
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 focus:border-blue-500 font-medium text-sm"
              />
            </div>
          </div>

          {/* Detailed Delivery Address */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
              Địa Chỉ Giao Hàng Chi Tiết (Chuẩn AllinGo)
            </label>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <AddressSelector
                value={addressData}
                onChange={setAddressData}
              />
            </div>

            {/* Danh sách toàn bộ đơn vị vận chuyển khả dụng */}
            <OrderCarrierSelector
              rates={availableRates}
              selectedRateId={selectedServiceId}
              loading={loadingShipping}
              hasAddress={Boolean(addressData?.cityId && addressData?.districtId)}
              onSelectRate={handleSelectRate}
            />
          </div>

          {/* Items Selector */}
          <div>
            <OrderItemPicker products={products} items={items} onChange={setItems} />
          </div>

          {/* Simple COD Input */}
          <OrderCodInput subtotal={subtotal} shippingFee={shippingFee} value={codAmount} onChange={setCodAmount} />

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ghi chú đơn hàng</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Khách nhắn qua Zalo, đã chuyển khoản qua Vietcombank..."
              className="w-full p-2 rounded-lg border border-slate-200 focus:border-blue-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div>
              <span className="text-slate-500">Tiền hàng: </span>
              <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
              {shippingFee > 0 && (
                <span className="text-slate-500 ml-2">
                  • Ship: <span className="font-bold text-slate-800">{formatPrice(shippingFee)}</span>
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-500">Thu khi giao (COD): </span>
              <span className="text-sm sm:text-base font-black text-blue-600">{formatPrice(totalToCollect)}</span>
              {Number(codAmount) === 0 && <span className="text-[11px] text-emerald-600 font-semibold ml-1">(Đã thanh toán 100%)</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer text-center"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="create-order-form"
              disabled={creating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              {creating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{creating ? 'Đang tạo...' : 'Xác Nhận Tạo Đơn'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
