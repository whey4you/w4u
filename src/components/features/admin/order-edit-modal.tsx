'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, RefreshCw, Truck, FileText } from 'lucide-react';
import { Order, OrderStatus } from '@/services/order.service';
import { Product } from '@/types/product';
import { OrderItemPicker } from './order-item-picker';
import { AddressSelector, SelectedAddressData } from '@/components/checkout/address-selector';
import { updateAdminOrderAction, cancelAllinGoShipmentAction, fulfillManualOrderAction, getOrderWaybillPdfAction, AdminOrderItemInput } from '@/app/actions/admin-order.actions';
import { formatPrice } from '@/lib/utils';
import { OrderCodInput } from './order-cod-input';
import { FormattedShippingRate } from '@/lib/allingo';
import { OrderCarrierSelector } from './order-carrier-selector';

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
  const [availableRates, setAvailableRates] = useState<FormattedShippingRate[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [loadingShipping, setLoadingShipping] = useState<boolean>(false);
  const [items, setItems] = useState<AdminOrderItemInput[]>([]);

  const [saving, setSaving] = useState(false);
  const [cancellingShipment, setCancellingShipment] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [currentTrackingCode, setCurrentTrackingCode] = useState<string | null>(order?.tracking_code || order?.allingo_track_id || null);
  const [currentAllingoOrderId, setCurrentAllingoOrderId] = useState<string | null>(order?.allingo_order_id || null);
  const [reissueShipment, setReissueShipment] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectRate = (rate: FormattedShippingRate) => {
    setSelectedServiceId(rate.id);
    setShippingFee(rate.totalFee);
    setCarrierName(rate.carrierName);
    setExpectedDelivery(rate.expected || '');
    if (currentTrackingCode || currentAllingoOrderId) {
      setReissueShipment(true);
    }
  };

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
      const initialServiceId = order.notes?.match(/\[ServiceID:([^\]]+)\]/)?.[1] || '';
      setSelectedServiceId(initialServiceId);
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
    if (!addressData?.cityId || !addressData?.districtId) {
      setAvailableRates([]);
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

          const existing = ratesList.find((r) => r.id === selectedServiceId)
            || ratesList.find((r) => r.carrierName.toLowerCase() === carrierName.toLowerCase())
            || ratesList.find((r) => r.tag === 'cheapest')
            || ratesList[0];

          setSelectedServiceId(existing.id);
          setShippingFee(existing.totalFee);
          setCarrierName(existing.carrierName);
          setExpectedDelivery(existing.expected || '');
        } else {
          setAvailableRates([]);
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

    try {
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
        discountAmount: Number(order.discount_amount || 0),
        couponCode: order.coupon_code || undefined,
        paymentMethod: order.payment_method,
        carrierName,
        shippingServiceId: selectedServiceId || undefined,
        reissueShipment,
        items,
      });

      if (res.success) {
        if ((res as any).warning) {
          alert((res as any).warning);
        }
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || 'Cập nhật đơn hàng thất bại.');
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (
        err?.name === 'UnrecognizedActionError' ||
        errMsg.includes('Server Action') ||
        errMsg.includes('not found on the server') ||
        errMsg.includes('Failed to load resource')
      ) {
        setErrorMsg('Phiên bản web vừa được cập nhật. Đang tự động tải lại trang...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setErrorMsg(errMsg || 'Lỗi khi lưu đơn hàng.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelShipment = async () => {
    if (!confirm('Bạn có chắc muốn hủy vận đơn AllinGo này để cập nhật đơn?')) return;
    setCancellingShipment(true);
    setErrorMsg(null);
    try {
      const res = await cancelAllinGoShipmentAction(order.id);
      if (res.success) {
        setCurrentTrackingCode(null);
        setCurrentAllingoOrderId(null);
        await onSuccess();
      } else {
        setErrorMsg(res.error || 'Không thể hủy vận đơn AllinGo.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi khi hủy vận đơn AllinGo.');
    } finally {
      setCancellingShipment(false);
    }
  };

  const handleFulfillNow = async () => {
    setFulfilling(true);
    setErrorMsg(null);
    try {
      const res = await fulfillManualOrderAction(order.id);
      if (res.success) {
        setCurrentTrackingCode(res.trackingNumber || 'Đã tạo vận đơn');
        await onSuccess();
      } else {
        setErrorMsg(res.error || 'Không thể tạo vận đơn AllinGo. Vui lòng kiểm tra số dư ví AllinGo.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi khi lên đơn AllinGo.');
    } finally {
      setFulfilling(false);
    }
  };

  const handleViewWaybillPdf = async () => {
    if (!order?.id) return;
    setLoadingPdf(true);
    setErrorMsg(null);
    try {
      const res = await getOrderWaybillPdfAction(order.id);
      if (res.success && res.url) {
        window.open(res.url, '_blank', 'noopener,noreferrer');
      } else {
        setErrorMsg(res.error || 'Chưa có file PDF vận đơn từ nhà vận chuyển.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi khi tải file PDF vận đơn.');
    } finally {
      setLoadingPdf(false);
    }
  };

  const totalToCollect = Number(codAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">Chỉnh Sửa Đơn Hàng</h2>
              <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
                {order.order_code}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">Cập nhật thông tin nhận hàng, sản phẩm hoặc điều phối AllinGo</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 shrink-0 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form id="edit-order-form" onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
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
              discountAmount={Number(order.discount_amount || 0)}
              value={codAmount}
              onChange={setCodAmount}
              initialDeposit={order.deposit_amount}
            />
          </div>

          {/* Shipping management */}
          <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-2.5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-bold text-orange-950 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-orange-600" />
                  Vận chuyển AllinGo: {currentTrackingCode ? `Mã ${currentTrackingCode}` : 'Chưa lên vận đơn'}
                </p>
                <p className="text-[11px] text-orange-800 mt-0.5">
                  {currentTrackingCode || currentAllingoOrderId ? `Đơn vị hiện tại: ${carrierName || 'AllinGo'}` : 'Bạn có thể tự đẩy sang AllinGo bất cứ lúc nào.'}
                </p>
              </div>
              {currentTrackingCode || currentAllingoOrderId ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={loadingPdf}
                    onClick={handleViewWaybillPdf}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Mở hoặc in tệp PDF mã vận đơn bưu cục"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {loadingPdf ? 'Đang lấy...' : 'In Vận Đơn (PDF)'}
                  </button>
                  <button
                    type="button"
                    disabled={cancellingShipment}
                    onClick={handleCancelShipment}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {cancellingShipment ? 'Đang hủy...' : 'Hủy Vận Đơn'}
                  </button>
                </div>
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

            {/* Tùy chọn 1-Click: Tự động đổi hãng & cấp lại vận đơn AllinGo */}
            {(currentTrackingCode || currentAllingoOrderId) && (
              <div className="pt-2 border-t border-orange-200/60">
                <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] font-semibold text-orange-950">
                  <input
                    type="checkbox"
                    checked={reissueShipment}
                    onChange={(e) => setReissueShipment(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>🔄 Tự động hủy mã cũ và cấp lại vận đơn AllinGo mới với hãng: <b>{carrierName || 'Hãng đã chọn'}</b></span>
                </label>
                <p className="text-[10px] text-orange-700 pl-5 mt-0.5">
                  Ví AllinGo nhận hoàn tiền cước đơn cũ 100% (nếu bưu tá chưa lấy). Khoản cước chênh lệch với khách được xử lý trực tiếp ngoài web.
                </p>
              </div>
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
              {Number(order.discount_amount || 0) > 0 && (
                <span className="text-emerald-600 font-semibold ml-2">
                  • Giảm voucher ({order.coupon_code || 'Voucher'}): -{formatPrice(Number(order.discount_amount))}
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-500">Thu khi giao (COD): </span>
              <span className={`text-sm sm:text-base font-black ${Number(codAmount) === 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                {formatPrice(totalToCollect)}
              </span>
              {Number(codAmount) === 0 ? (
                <span className="text-[11px] text-emerald-600 font-semibold ml-1.5">
                  ✅ Đã thanh toán 100% (Shipper không thu tiền)
                </span>
              ) : (
                <span className="text-[11px] text-amber-600 font-semibold ml-1.5">
                  📦 Shipper thu khi nhận hàng
                </span>
              )}
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
              form="edit-order-form"
              disabled={saving}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
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
