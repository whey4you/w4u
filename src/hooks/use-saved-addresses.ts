'use client';

import { useState, useEffect, useCallback } from 'react';
import { SavedDeliveryProfile } from '@/types/saved-address';

const STORAGE_KEY = 'w4u_saved_delivery_profiles';
const MAX_PROFILES = 5;

export function useSavedAddresses() {
  const [savedProfiles, setSavedProfiles] = useState<SavedDeliveryProfile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load danh sách từ localStorage khi mount trên client
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedProfiles(parsed);
        }
      }
    } catch (e) {
      console.error('[useSavedAddresses] Lỗi đọc localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Lưu danh sách vào localStorage
  const persist = useCallback((list: SavedDeliveryProfile[]) => {
    setSavedProfiles(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('[useSavedAddresses] Lỗi lưu localStorage:', e);
    }
  }, []);

  // Thêm hoặc cập nhật địa chỉ đã dùng
  const saveProfile = useCallback(
    (profile: Omit<SavedDeliveryProfile, 'id' | 'updatedAt'>) => {
      if (!profile.customerName || !profile.customerPhone || !profile.addressData?.fullAddress) {
        return;
      }

      setSavedProfiles((prev) => {
        const cleanPhone = profile.customerPhone.replace(/[\s.-]/g, '');
        const cleanAddress = profile.addressData.fullAddress.trim().toLowerCase();

        // Kiểm tra xem đã có địa chỉ tương tự chưa (cùng SĐT và cùng địa chỉ)
        const existingIndex = prev.findIndex(
          (p) =>
            p.customerPhone.replace(/[\s.-]/g, '') === cleanPhone &&
            p.addressData.fullAddress.trim().toLowerCase() === cleanAddress
        );

        let updated: SavedDeliveryProfile[];

        if (existingIndex >= 0) {
          // Cập nhật thông tin và đẩy lên đầu danh sách
          const item = {
            ...prev[existingIndex],
            customerName: profile.customerName.trim(),
            customerPhone: profile.customerPhone.trim(),
            customerEmail: profile.customerEmail?.trim() || prev[existingIndex].customerEmail,
            notes: profile.notes?.trim() || '',
            addressData: profile.addressData,
            updatedAt: Date.now(),
          };
          const rest = prev.filter((_, idx) => idx !== existingIndex);
          updated = [item, ...rest];
        } else {
          // Thêm mới vào đầu danh sách
          const newProfile: SavedDeliveryProfile = {
            id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            customerName: profile.customerName.trim(),
            customerPhone: profile.customerPhone.trim(),
            customerEmail: profile.customerEmail?.trim(),
            notes: profile.notes?.trim() || '',
            addressData: profile.addressData,
            updatedAt: Date.now(),
          };
          updated = [newProfile, ...prev].slice(0, MAX_PROFILES);
        }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error('[useSavedAddresses] Lỗi lưu localStorage:', e);
        }

        return updated;
      });
    },
    []
  );

  // Xoá một địa chỉ khỏi danh sách lưu
  const deleteProfile = useCallback(
    (id: string) => {
      setSavedProfiles((prev) => {
        const next = prev.filter((p) => p.id !== id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('[useSavedAddresses] Lỗi lưu localStorage:', e);
        }
        return next;
      });
    },
    []
  );

  const latestProfile = savedProfiles.length > 0 ? savedProfiles[0] : null;

  return {
    savedProfiles,
    isLoaded,
    latestProfile,
    saveProfile,
    deleteProfile,
  };
}
