'use client';

import React, { useState, useEffect } from 'react';
import { Check, Mail } from 'lucide-react';
import { AddressSelector, SelectedAddressData } from './address-selector';
import { SavedAddressSelector } from './saved-address-selector';
import { useSavedAddresses } from '@/hooks/use-saved-addresses';
import { SavedDeliveryProfile } from '@/types/saved-address';
import { CheckoutCustomerData } from '@/hooks/use-checkout-flow';

const EMPTY_ADDRESS: SelectedAddressData = {
  cityId: '',
  cityName: '',
  districtId: '',
  districtName: '',
  wardId: '',
  wardName: '',
  streetAddress: '',
  fullAddress: '',
};

interface CheckoutStepShippingProps {
  isActive: boolean;
  isCompleted: boolean;
  customer: CheckoutCustomerData;
  setCustomer: React.Dispatch<React.SetStateAction<CheckoutCustomerData>>;
  addressData: SelectedAddressData | null;
  onAddressChange: (data: SelectedAddressData) => void;
  onNext: () => void;
  onEdit: () => void;
  errorMsg: string | null;
}

export function CheckoutStepShipping({
  isActive,
  isCompleted,
  customer,
  setCustomer,
  addressData,
  onAddressChange,
  onNext,
  onEdit,
  errorMsg,
}: CheckoutStepShippingProps) {
  const { savedProfiles, isLoaded, latestProfile, saveProfile, deleteProfile } = useSavedAddresses();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Tự động điền địa chỉ gần nhất khi khách vào lại trang (nếu form đang trống)
  useEffect(() => {
    if (isLoaded && latestProfile) {
      if (!customer.customerName && !customer.customerPhone && !addressData?.cityId) {
        setSelectedProfileId(latestProfile.id);
        setCustomer({
          customerName: latestProfile.customerName,
          customerPhone: latestProfile.customerPhone,
          customerEmail: latestProfile.customerEmail || '',
          notes: latestProfile.notes || '',
        });
        onAddressChange(latestProfile.addressData);
      }
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectProfile = (profile: SavedDeliveryProfile) => {
    setSelectedProfileId(profile.id);
    setCustomer({
      customerName: profile.customerName,
      customerPhone: profile.customerPhone,
      customerEmail: profile.customerEmail || '',
      notes: profile.notes || '',
    });
    onAddressChange(profile.addressData);
  };

  const handleAddNew = () => {
    setSelectedProfileId(null);
    setCustomer({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      notes: '',
    });
    onAddressChange(EMPTY_ADDRESS);
  };

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id);
    if (selectedProfileId === id) {
      setSelectedProfileId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      customer.customerName.trim() &&
      customer.customerPhone.trim() &&
      addressData?.cityId &&
      addressData?.districtId &&
      addressData?.wardId &&
      addressData?.streetAddress
    ) {
      saveProfile({
        customerName: customer.customerName.trim(),
        customerPhone: customer.customerPhone.trim(),
        customerEmail: customer.customerEmail.trim(),
        notes: customer.notes.trim(),
        addressData,
      });
    }
    onNext();
  };

  // Collapsed Completed State (Nike Pattern)
  if (!isActive && isCompleted) {
    return (
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-neutral-200/90 transition-all flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white text-[11px] font-bold">
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              1. Địa chỉ giao hàng & Email nhận hóa đơn
            </h3>
          </div>
          <div className="pl-7 text-xs text-neutral-600 leading-relaxed">
            <p className="font-semibold text-neutral-900">
              {customer.customerName} · {customer.customerPhone}
              {customer.customerEmail && <span className="font-normal text-neutral-600"> · {customer.customerEmail}</span>}
            </p>
            <p className="truncate text-neutral-600">{addressData?.fullAddress}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-neutral-900 underline underline-offset-4 hover:text-black flex-shrink-0 pt-0.5"
        >
          Chỉnh sửa
        </button>
      </div>
    );
  }

  // Active Expanded Form
  return (
    <div className={`rounded-2xl bg-white p-5 sm:p-7 border ${isActive ? 'border-neutral-900 ring-1 ring-neutral-900 shadow-sm' : 'border-neutral-200'}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">
          1
        </span>
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-900">
          Thông tin người nhận & Địa chỉ giao hàng
        </h2>
      </div>

      {/* Sổ địa chỉ đã lưu (Dropdown chọn nhanh) */}
      <SavedAddressSelector
        profiles={savedProfiles}
        selectedId={selectedProfileId}
        onSelect={handleSelectProfile}
        onAddNew={handleAddNew}
        onDelete={handleDeleteProfile}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="customerName" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              required
              value={customer.customerName}
              onChange={(e) => {
                setSelectedProfileId(null);
                setCustomer((prev) => ({ ...prev, customerName: e.target.value }));
              }}
              placeholder="Nguyễn Văn A"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="customerPhone" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Số điện thoại <span className="text-rose-500">*</span>
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              required
              value={customer.customerPhone}
              onChange={(e) => {
                setSelectedProfileId(null);
                setCustomer((prev) => ({ ...prev, customerPhone: e.target.value }));
              }}
              placeholder="0912 345 678"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>
        </div>

        {/* Email Address for Electronic Invoice */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="customerEmail" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
              Email nhận hóa đơn điện tử <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Gửi hóa đơn tự động
            </span>
          </div>
          <div className="relative">
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              required
              value={customer.customerEmail}
              onChange={(e) => {
                setSelectedProfileId(null);
                setCustomer((prev) => ({ ...prev, customerEmail: e.target.value }));
              }}
              placeholder="vidu@gmail.com"
              className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Hóa đơn VAT và thông tin bảo hành đơn hàng sẽ được gửi ngay đến email này khi thanh toán hoàn tất.
          </p>
        </div>

        {/* AllinGo 3-level Address Selector */}
        <div className="pt-2 border-t border-neutral-100">
          <AddressSelector onChange={onAddressChange} value={addressData} />
        </div>

        {/* Delivery Note */}
        <div>
          <label htmlFor="customerNotes" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
            Ghi chú giao hàng <span className="text-neutral-400 font-normal lowercase">(không bắt buộc)</span>
          </label>
          <input
            id="customerNotes"
            type="text"
            value={customer.notes}
            onChange={(e) => setCustomer((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Lời nhắn cho shipper (ví dụ: giao giờ hành chính)..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
          />
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 border border-rose-200">
            {errorMsg}
          </div>
        )}

        {/* Integrated Primary CTA Button directly inside Step 1 */}
        <button
          type="submit"
          className="w-full mt-6 py-3.5 rounded-full bg-neutral-900 hover:bg-black text-white font-semibold text-sm transition-all active:scale-[0.99] shadow-sm flex items-center justify-center gap-2"
        >
          Tiếp tục đến phương thức vận chuyển
        </button>
      </form>
    </div>
  );
}
