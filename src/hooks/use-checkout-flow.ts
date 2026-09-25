'use client';

import { useState, useEffect } from 'react';
import { CartItem } from '@/types/product';
import { CheckoutResult, PaymentMethod } from '@/types/checkout';
import { SelectedAddressData } from '@/components/checkout/address-selector';
import { createOrderAction } from '@/app/actions/order.actions';

import { FormattedShippingRate } from '@/lib/allingo';

export type CheckoutStep = 1 | 2 | 3 | 4;

export interface CheckoutCustomerData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
}

export interface CarrierInfo {
  serviceId?: string;
  carrierName: string;
  service?: string;
  expected?: string;
  totalFee?: number;
  tag?: string;
  logo?: string;
}

export function useCheckoutFlow(
  items: CartItem[],
  totalAmount: number,
  clearCart: () => void,
  couponCode?: string,
  discountAmount?: number
) {
  const [step, setStep] = useState<CheckoutStep>(1);
  const [customer, setCustomer] = useState<CheckoutCustomerData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
  });
  const [addressData, setAddressData] = useState<SelectedAddressData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payos');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);

  // Tính tổng khối lượng thực tế của giỏ hàng (grams)
  const totalWeightGrams = items.reduce((sum, item) => {
    const itemWeight = Math.round(Number(item.size?.weightKg ?? item.weightKg ?? 1.0) * 1000);
    return sum + itemWeight * item.quantity;
  }, 0);

  // Phí vận chuyển và thông tin hãng vận chuyển động từ AllinGo
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [availableRates, setAvailableRates] = useState<FormattedShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<FormattedShippingRate | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [carrierInfo, setCarrierInfo] = useState<CarrierInfo>({
    carrierName: 'Giao hàng tiêu chuẩn',
    service: 'Tiêu chuẩn',
    expected: 'Dự kiến giao 1-3 ngày',
  });

  const selectRate = (rate: FormattedShippingRate) => {
    setSelectedRate(rate);
    setShippingFee(rate.totalFee);
    setCarrierInfo({
      serviceId: rate.id,
      carrierName: rate.carrierName,
      service: rate.serviceName,
      expected: rate.expected,
      totalFee: rate.totalFee,
      tag: rate.tag,
      logo: rate.logo,
    });
  };

  // Tự động gọi API AllinGo tính cước khi có Tỉnh/Thành và Quận/Huyện
  useEffect(() => {
    if (!addressData?.cityId || !addressData?.districtId) {
      setShippingFee(null);
      setAvailableRates([]);
      setSelectedRate(null);
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
        wardId: addressData.wardId,
        weightGrams: totalWeightGrams,
        amount: totalAmount,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const rateList: FormattedShippingRate[] = Array.isArray(data.rates) && data.rates.length > 0
          ? data.rates
          : (data.rate ? [data.rate] : []);

        if (rateList.length > 0) {
          setAvailableRates(rateList);
          const initialRate = rateList[0];
          setSelectedRate(initialRate);
          setShippingFee(initialRate.totalFee);
          setCarrierInfo({
            serviceId: initialRate.id,
            carrierName: initialRate.carrierName,
            service: initialRate.serviceName,
            expected: initialRate.expected,
            totalFee: initialRate.totalFee,
            tag: initialRate.tag,
            logo: initialRate.logo,
          });
        }
      })
      .catch((err) => {
        console.error('[AllinGo Rates Error]:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingShipping(false);
      });

    return () => {
      isMounted = false;
    };
  }, [addressData?.cityId, addressData?.districtId, addressData?.wardId, totalWeightGrams, totalAmount]);


  const effectiveShipping = shippingFee ?? 0;
  const effectiveDiscount = discountAmount ?? 0;
  // Tổng thanh toán đơn hàng (gồm tiền hàng - giảm giá + phí vận chuyển)
  const grandTotal = Math.max(0, totalAmount - effectiveDiscount) + effectiveShipping;

  const validateStep1 = () => {
    if (customer.customerName.trim().length < 2) {
      setErrorMsg('Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự).');
      return false;
    }
    const phone = customer.customerPhone.replace(/[\s.-]/g, '');
    if (!/^(?:\+84|0)\d{9}$/.test(phone)) {
      setErrorMsg('Số điện thoại chưa đúng định dạng di động Việt Nam (10 số).');
      return false;
    }
    const email = customer.customerEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ để nhận hóa đơn điện tử.');
      return false;
    }
    if (!addressData || !addressData.cityId || !addressData.districtId || !addressData.wardId || !addressData.streetAddress) {
      setErrorMsg('Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã và Số nhà tên đường.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const goToNextStep = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const goToStep = (targetStep: CheckoutStep) => {
    if (targetStep !== 4) {
      setErrorMsg(null);
      setStep(targetStep);
    }
  };

  const submitOrder = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const response = await createOrderAction({
      customerName: customer.customerName.trim(),
      customerPhone: customer.customerPhone.trim(),
      customerEmail: customer.customerEmail.trim(),
      customerAddress: addressData!.fullAddress,
      cityId: addressData!.cityId,
      cityName: addressData!.cityName,
      districtId: addressData!.districtId,
      districtName: addressData!.districtName,
      wardId: addressData!.wardId,
      wardName: addressData!.wardName,
      streetAddress: addressData!.streetAddress,
      notes: customer.notes.trim(),
      paymentMethod,
      shippingServiceId: selectedRate?.id,
      carrierName: selectedRate?.carrierName,
      shippingFee: selectedRate?.totalFee,
      couponCode: couponCode || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        flavorId: item.flavor.id,
        sizeId: item.size?.id,
        quantity: item.quantity,
      })),
    });

    setSubmitting(false);

    if (response.success) {
      setOrderedItems([...items]);
      setResult(response);
      // Giữ nguyên giỏ hàng khi chưa thanh toán; chỉ clear khi thanh toán thành công
      setStep(4);
    } else {
      setErrorMsg(response.error);
    }
  };

  return {
    step,
    customer,
    setCustomer,
    addressData,
    setAddressData,
    paymentMethod,
    setPaymentMethod,
    submitting,
    errorMsg,
    setErrorMsg,
    result,
    orderedItems,
    shippingFee,
    loadingShipping,
    carrierInfo,
    availableRates,
    selectedRate,
    selectRate,
    totalWeightGrams,
    grandTotal,
    goToNextStep,
    goToStep,
    submitOrder,
  };
}
