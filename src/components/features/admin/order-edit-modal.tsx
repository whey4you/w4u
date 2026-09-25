'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, RefreshCw, Truck } from 'lucide-react';
import { Order, OrderStatus } from '@/services/order.service';
import { Product } from '@/types/product';
import { OrderItemPicker } from './order-item-picker';
import { AddressSelector, SelectedAddressData } from '@/components/checkout/address-selector';
import { updateAdminOrderAction, cancelAllinGoShipmentAction, fulfillManualOrderAction, AdminOrderItemInput } from '@/app/actions/admin-order.actions';
import { formatPrice } from '@/lib/utils';
import { OrderCodInput } from './order-cod-input';

interface OrderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  products: Product[];
  onSuccess: () => void;
}

export function OrderEditModal({ isOpen, onClose, order, products, onSuccess }: OrderEditModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [addressData, setAddressData] = useState<SelectedAddressData | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [codAmount, setCodAmount] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [carrierName, setCarrierName] = useState<string>('');
  const [expectedDelivery, setExpectedDelivery] = useState<string>('');
  const [loadingShipping, setLoadingShipping] = useState<boolean>(false);
  const [items, setItems] = useState<AdminOrderItemInput[]>([]);

  const [saving, setSaving] = useState(false);
  const [cancellingShipment, setCancellingShipment] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
  const [currentTrackingCode, setCurrentTrackingCode] = useState<string | null>(order?.tracking_code || order?.allingo_track_id || null);
  const [currentAllingoOrderId, setCurrentAllingoOrderId] = useState<string | null>(order?.allingo_order_id || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setCurrentTrackingCode(order.tracking_code || order.allingo_track_id || null);
      setCurrentAllingoOrderId(order.allingo_order_id || null);
      setCustomerName(order.customer_name || '');
      setCustomerPhone(order.customer_phone || '');
      setCustomerEmail(order.customer_email || '');
      setCustomerAddress(order.customer_address || '');
      const cityId = order.province_code || order.city_id || '';
      const districtId = order.district_code || order.district_id || '';
      const wardId = order.ward_code || order.ward_id || '';
      setAddressData({
        cityId,
        cityName: '',
        districtId,
        districtName: '',
        wardId,
        wardName: '',
        streetAddress: order.customer_address || '',
        fullAddress: order.customer_address || '',
      });
      setNotes(order.notes || '');
      setStatus(order.status || 'pending');
      setShippingFee(Number(order.shipping_fee || 0));
      setCarrierName(order.carrier_name || '');
      const initialCod = order.cod_remaining !== undefined && order.cod_remaining !== null
        ? Number(order.cod_remaining)
        : (order.payment_method === 'cod' ? Math.max(0, Number(order.total_amount) - Number(order.deposit_amount || 0)) : 0);
      setCodAmount(initialCod);
      setItems(
        (order.order_items || []).map((it) => ({
          product_id: it.product_id,
          product_name: it.product_name,
          flavor_name: it.flavor_name,
          price: Number(it.price),
          quantity: Number(it.quantity),
          image: it.image,
        }))
      );
      setErrorMsg(null);
    }
  }, [order]);

  const subtotal = items.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);

  // Tự động tra cước vận chuyển AllinGo khi thay đổi địa chỉ hoặc danh sách mặt hàng
  useEffect(() => {
    if (!addressData?.cityId || !addressData?.districtId) return;

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
          const best = data.rates.find((r: any) => r.tag === 'cheapest') || data.rates[0];
          setShippingFee(best.totalFee);
          setCarrierName(best.carrierName);
          setExpectedDelivery(best.expected || '');
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

  if (!isOpen || !order) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Vui lòng điền tên và số điện thoại khách hàng.');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Đơn hàng phải có ít nhất 1 sản phẩm.');
      return;
    }

    const finalAddress = addressData?.fullAddress?.trim() || customerAddress.trim();
    if (!finalAddress) {
      setErrorMsg('Vui lòng chọn hoặc nhập địa chỉ giao hàng.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const res = await updateAdminOrderAction({
      orderId: order.id,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress: finalAddress,
      provinceCode: addressData?.cityId || order.province_code,
      districtCode: addressData?.districtId || order.district_code,
      wardCode: addressData?.wardId || order.ward_code,
      notes,
      status,
      codAmount: Number(codAmount),
      shippingFee,
      carrierName,
      items,
    });

    setSaving(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Cập nhật đơn hàng thất bại.');
    }
  };

  const handleCancelShipment = async () => {
    if (!confirm('Bạn có chắc muốn hủy vận đơn AllinGo này để cập nhật đơn?')) return;
    setCancellingShipment(true);
    setErrorMsg(null);
    const res = await cancelAllinGoShipmentAction(order.id);
    setCancellingShipment(false);
    if (res.success) {
      setCurrentTrackingCode(null);
      setCurrentAllingoOrderId(null);
      await onSuccess();
    } else {
      setErrorMsg(res.error || 'Không thể hủy vận đơn AllinGo.');
    }
  };

  const handleFulfillNow = async () => {
    setFulfilling(true);
    setErrorMsg(null);
    const res = await fulfillManualOrderAction(order.id);
    setFulfilling(false);
    if (res.success) {
      setCurrentTrackingCode(res.trackingNumber || 'Đã tạo vận đơn');
      await onSuccess();
    } else {
      setErrorMsg(res.error || 'Không thể tạo vận đơn AllinGo.');
    }
  };

  const totalToCollect = Number(codAmount) + (shippingFee || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Chỉnh Sửa Đơn Hàng</h2>
              <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {order.order_code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Cập nhật thông tin nhận hàng, sản phẩm hoặc điều phối AllinGo</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form id="edit-order-form" onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
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
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="chua_co@gmail.com"
                className="w-full p-2 rounded-lg border border-slate-200 focus:border-blue-500 font-medium text-sm"
              />
            </div>
          </div>

          {/* Detailed Address Selector */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
            <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
              Địa chỉ giao hàng chi tiết (Chuẩn AllinGo)
            </label>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <AddressSelector
                value={addressData}
                onChange={(data) => {
                  setAddressData(data);
                  setCustomerAddress(data.fullAddress);
                }}
              />
            </div>

            {/* Báo tiền ship trực tiếp */}
            {loadingShipping ? (
              <div className="flex items-center gap-2 p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-700 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang tra cước vận chuyển AllinGo...</span>
              </div>
            ) : shippingFee > 0 ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">{carrierName || 'Vận chuyển AllinGo'}</span>
                    {expectedDelivery && <span className="text-slate-500 ml-1.5 font-normal">({expectedDelivery})</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 text-sm">{formatPrice(shippingFee)}</span>
                  <span className="block text-[10px] text-slate-500">Khách trả shipper khi nhận</span>
                </div>
              </div>
            ) : addressData?.cityId ? (
              <p className="text-[11px] text-slate-400 italic">Chọn đầy đủ Quận/Huyện để tính cước AllinGo</p>
            ) : null}
          </div>

          {/* Items Selector */}
          <div>
            <OrderItemPicker products={products} items={items} onChange={setItems} />
          </div>

          {/* Status & Simple COD Input */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Trạng thái đơn hàng</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full sm:w-64 p-2 rounded-lg border border-slate-200 font-medium"
              >
                <option value="pending">Chờ duyệt</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipping">Đang giao</option>
                <option value="completed">Hoàn tất</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Ô nhập COD đơn giản hoá */}
            <OrderCodInput
              key={order.id}
              subtotal={subtotal}
              shippingFee={shippingFee}
              value={codAmount}
              onChange={setCodAmount}
              initialDeposit={order.deposit_amount}
            />
          </div>

          {/* Shipping management */}
          <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-orange-950 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-orange-600" />
                Vận chuyển AllinGo: {currentTrackingCode ? `Mã ${currentTrackingCode}` : 'Chưa lên vận đơn'}
              </p>
              <p className="text-[11px] text-orange-800 mt-0.5">
                {currentTrackingCode || currentAllingoOrderId ? 'Đã có vận đơn trên sàn logistics.' : 'Bạn có thể tự đẩy sang AllinGo bất cứ lúc nào.'}
              </p>
            </div>
            {currentTrackingCode || currentAllingoOrderId ? (
              <button
                type="button"
                disabled={cancellingShipment}
                onClick={handleCancelShipment}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs whitespace-nowrap transition-colors cursor-pointer"
              >
                {cancellingShipment ? 'Đang hủy...' : 'Hủy Vận Đơn Để Sửa'}
              </button>
            ) : (
              <button
                type="button"
                disabled={fulfilling}
                onClick={handleFulfillNow}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs whitespace-nowrap transition-colors cursor-pointer"
              >
                {fulfilling ? 'Đang lên đơn...' : 'Lên Vận Đơn AllinGo'}
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ghi chú đơn hàng</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú nội bộ hoặc yêu cầu của khách..."
              className="w-full p-2 rounded-lg border border-slate-200 focus:border-blue-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs space-y-0.5">
            <div>
              <span className="text-slate-500">Tiền hàng: </span>
              <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
              {shippingFee > 0 && (
                <span className="text-slate-500 ml-2">
                  • Cước ship: <span className="font-bold text-slate-800">{formatPrice(shippingFee)}</span>
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-500">Tổng shipper thu khi giao: </span>
              <span className="text-base font-black text-blue-600">{formatPrice(totalToCollect)}</span>
              {Number(codAmount) === 0 && <span className="text-[11px] text-emerald-600 font-semibold ml-1">(Chỉ thu cước ship)</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="edit-order-form"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
