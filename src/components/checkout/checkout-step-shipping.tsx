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
  const { savedProfiles, isLoaded, latestProfile, storedEmail, saveEmail, saveProfile, deleteProfile } = useSavedAddresses();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Tự động điền địa chỉ gần nhất và email đã lưu khi khách vào lại trang
  useEffect(() => {
    if (!isLoaded) return;

    if (latestProfile && !customer.customerName && !customer.customerPhone && !addressData?.cityId) {
      setSelectedProfileId(latestProfile.id);
      setCustomer({
        customerName: latestProfile.customerName,
        customerPhone: latestProfile.customerPhone,
        customerEmail: latestProfile.customerEmail || storedEmail || '',
        notes: latestProfile.notes || '',
      });
      onAddressChange(latestProfile.addressData);
    } else if (!customer.customerEmail && storedEmail) {
      setCustomer((prev) => ({ ...prev, customerEmail: storedEmail }));
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tự động nhận diện profile đã lưu tương ứng khi quay lại bước 1
  useEffect(() => {
    if (!selectedProfileId && addressData?.cityId && savedProfiles.length > 0) {
      const match = savedProfiles.find(
        (p) =>
          p.addressData.cityId === addressData.cityId &&
          p.addressData.districtId === addressData.districtId &&
          p.addressData.wardId === addressData.wardId &&
          p.addressData.streetAddress.trim() === addressData.streetAddress.trim()
      );
      if (match) {
        setSelectedProfileId(match.id);
      }
    }
  }, [addressData, savedProfiles, selectedProfileId]);

  const handleSelectProfile = (profile: SavedDeliveryProfile) => {
    setSelectedProfileId(profile.id);
    setCustomer({
      customerName: profile.customerName,
      customerPhone: profile.customerPhone,
      customerEmail: profile.customerEmail || storedEmail || '',
      notes: profile.notes || '',
    });
    onAddressChange(profile.addressData);
  };

  const handleAddNew = () => {
    setSelectedProfileId(null);
    setCustomer((prev) => ({
      customerName: '',
      customerPhone: '',
      customerEmail: prev.customerEmail || storedEmail || '',
      notes: '',
    }));
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
    const cleanEmail = customer.customerEmail.trim();
    if (cleanEmail) {
      saveEmail(cleanEmail);
    }
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
        customerEmail: cleanEmail,
        notes: customer.notes.trim(),
        addressData,
      });
    }
    onNext();
  };

  // Collapsed Completed State (Nike Pattern)
  if (!isActive && isCompleted) {
    return (
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-neutral-200/90 shadow-2xs transition-all">
        {/* Header row: Checkmark + Step Title (Left) & Chỉnh sửa (Right) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white text-[10px] font-bold">
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 truncate">
              1. Địa chỉ giao hàng
            </h3>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-semibold text-neutral-900 underline underline-offset-4 hover:text-black shrink-0"
          >
            Chỉnh sửa
          </button>
        </div>

        {/* Content body row */}
        <div className="pt-2 pl-7 text-xs text-neutral-600 space-y-0.5">
          <p className="font-semibold text-neutral-900 truncate">
            {customer.customerName}
            {customer.customerPhone && <span> · {customer.customerPhone}</span>}
          </p>
          {customer.customerEmail && (
            <p className="text-neutral-500 truncate">{customer.customerEmail}</p>
          )}
          <p className="text-neutral-600 line-clamp-2 leading-relaxed">
            {addressData?.fullAddress || addressData?.streetAddress}
          </p>
          {customer.notes?.trim() && (
            <p className="text-neutral-500 italic text-[11px] truncate pt-0.5">
              📝 Lời nhắn shipper: &ldquo;{customer.notes.trim()}&rdquo;
            </p>
          )}
        </div>
      </div>
    );
  }

  // Active Expanded Form
  return (
    <div className={`rounded-2xl bg-white p-4 sm:p-7 border ${isActive ? 'border-neutral-900 ring-1 ring-neutral-900 shadow-sm' : 'border-neutral-200'}`}>
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">
          1
        </span>
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-900">
          Địa chỉ giao hàng
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
              placeholder="Nhập họ và tên"
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
              placeholder="Nhập số điện thoại"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>
        </div>

        {/* Email Address for Electronic Invoice */}
        <div>
          <label htmlFor="customerEmail" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
            Email nhận hóa đơn điện tử <span className="text-rose-500">*</span>
          </label>
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
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                  saveEmail(val);
                }
              }}
              placeholder="Nhập địa chỉ email"
              className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-neutral-400" />
            Vui lòng nhập mail để nhận hoá đơn điện tử
          </p>
        </div>

        {/* AllinGo 3-level Address Selector */}
        <div className="pt-2 border-t border-neutral-100">
          <AddressSelector onChange={onAddressChange} value={addressData} />
        </div>

        {/* Delivery Note for Shipper */}
        <div>
          <label htmlFor="customerNotes" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
            Ghi chú cho shipper <span className="text-neutral-400 font-normal lowercase">(không bắt buộc)</span>
          </label>
          <input
            id="customerNotes"
            name="notes"
            type="text"
            value={customer.notes}
            onChange={(e) => setCustomer((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Ví dụ: Giao sau 18h, gọi trước khi đến, gửi lễ tân/bảo vệ..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            Lời nhắn này sẽ được gửi trực tiếp đến bưu tá/tài xế khi giao hàng.
          </p>
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
