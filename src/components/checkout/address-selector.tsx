'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';

export interface LocationOption {
  id: string;
  name: string;
}

export interface SelectedAddressData {
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  wardId: string;
  wardName: string;
  streetAddress: string;
  fullAddress: string;
}

interface AddressSelectorProps {
  onChange: (data: SelectedAddressData) => void;
  disabled?: boolean;
  value?: SelectedAddressData | null;
}

export function AddressSelector({ onChange, disabled, value }: AddressSelectorProps) {
  const [, startTransition] = useTransition();

  const [cities, setCities] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);

  const [selectedCityId, setSelectedCityId] = useState(value?.cityId || '');
  const [selectedDistrictId, setSelectedDistrictId] = useState(value?.districtId || '');
  const [selectedWardId, setSelectedWardId] = useState(value?.wardId || '');
  const [street, setStreet] = useState(value?.streetAddress || '');

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // 1. Tải danh sách Tỉnh / Thành phố
  useEffect(() => {
    let isMounted = true;
    setLoadingCities(true);
    fetch('/api/shipping/cities')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setCities(data.data);
        }
      })
      .catch((err) => console.error('Lỗi tải tỉnh thành:', err))
      .finally(() => {
        if (isMounted) setLoadingCities(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Đồng bộ khi prop `value` thay đổi từ bên ngoài (chọn địa chỉ đã lưu hoặc reset)
  useEffect(() => {
    if (!value) {
      setSelectedCityId('');
      setSelectedDistrictId('');
      setSelectedWardId('');
      setStreet('');
      setDistricts([]);
      setWards([]);
      return;
    }

    const isDifferent =
      value.cityId !== selectedCityId ||
      value.districtId !== selectedDistrictId ||
      value.wardId !== selectedWardId ||
      value.streetAddress !== street;

    if (!isDifferent) return;

    setSelectedCityId(value.cityId || '');
    setSelectedDistrictId(value.districtId || '');
    setSelectedWardId(value.wardId || '');
    setStreet(value.streetAddress || '');

    // Nạp lại danh sách quận huyện theo cityId của profile được chọn
    if (value.cityId) {
      setLoadingDistricts(true);
      fetch(`/api/shipping/districts?cityId=${value.cityId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setDistricts(data.data);
          }
        })
        .catch((err) => console.error('Lỗi tải quận huyện:', err))
        .finally(() => setLoadingDistricts(false));
    } else {
      setDistricts([]);
    }

    // Nạp lại danh sách phường xã theo districtId của profile được chọn
    if (value.districtId) {
      setLoadingWards(true);
      fetch(`/api/shipping/wards?districtId=${value.districtId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setWards(data.data);
          }
        })
        .catch((err) => console.error('Lỗi tải phường xã:', err))
        .finally(() => setLoadingWards(false));
    } else {
      setWards([]);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Xử lý khi người dùng trực tiếp thay đổi Tỉnh / Thành
  const handleCityChange = useCallback((newCityId: string) => {
    setSelectedCityId(newCityId);
    setSelectedDistrictId('');
    setSelectedWardId('');
    setWards([]);

    if (!newCityId) {
      setDistricts([]);
      return;
    }

    setLoadingDistricts(true);
    fetch(`/api/shipping/districts?cityId=${newCityId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setDistricts(data.data);
        }
      })
      .catch((err) => console.error('Lỗi tải quận huyện:', err))
      .finally(() => setLoadingDistricts(false));
  }, []);

  // 4. Xử lý khi người dùng trực tiếp thay đổi Quận / Huyện
  const handleDistrictChange = useCallback((newDistrictId: string) => {
    setSelectedDistrictId(newDistrictId);
    setSelectedWardId('');

    if (!newDistrictId) {
      setWards([]);
      return;
    }

    setLoadingWards(true);
    fetch(`/api/shipping/wards?districtId=${newDistrictId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setWards(data.data);
        }
      })
      .catch((err) => console.error('Lỗi tải phường xã:', err))
      .finally(() => setLoadingWards(false));
  }, []);

  // 5. Bắn sự kiện onChange về cha mỗi khi thông tin thay đổi
  useEffect(() => {
    const cityName = cities.find((c) => c.id === selectedCityId)?.name || value?.cityName || '';
    const districtName = districts.find((d) => d.id === selectedDistrictId)?.name || value?.districtName || '';
    const wardName = wards.find((w) => String(w.id) === String(selectedWardId))?.name || value?.wardName || '';

    const parts = [street.trim(), wardName, districtName, cityName].filter(Boolean);
    const fullAddress = parts.join(', ');

    startTransition(() => {
      onChange({
        cityId: selectedCityId,
        cityName,
        districtId: selectedDistrictId,
        districtName,
        wardId: selectedWardId,
        wardName,
        streetAddress: street.trim(),
        fullAddress,
      });
    });
  }, [selectedCityId, selectedDistrictId, selectedWardId, street, cities, districts, wards, value, onChange]);

  const selectStyle =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="cityId" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Tỉnh / Thành phố <span className="text-rose-500">*</span>
        </label>
        <select
          id="cityId"
          name="cityId"
          value={selectedCityId}
          onChange={(e) => handleCityChange(e.target.value)}
          disabled={disabled || loadingCities}
          className={selectStyle}
          required
        >
          <option value="">{loadingCities ? 'Đang tải...' : '-- Chọn Tỉnh / Thành phố --'}</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="districtId" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Quận / Huyện <span className="text-rose-500">*</span>
          </label>
          <select
            id="districtId"
            name="districtId"
            value={selectedDistrictId}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={disabled || !selectedCityId || loadingDistricts}
            className={selectStyle}
            required
          >
            <option value="">{loadingDistricts ? 'Đang tải...' : '-- Chọn Quận / Huyện --'}</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="wardId" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Phường / Xã <span className="text-rose-500">*</span>
          </label>
          <select
            id="wardId"
            name="wardId"
            value={selectedWardId}
            onChange={(e) => setSelectedWardId(e.target.value)}
            disabled={disabled || !selectedDistrictId || loadingWards}
            className={selectStyle}
            required
          >
            <option value="">{loadingWards ? 'Đang tải...' : '-- Chọn Phường / Xã --'}</option>
            {wards.map((w) => (
              <option key={w.id} value={String(w.id)}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="streetAddress" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Số nhà, tên đường <span className="text-rose-500">*</span>
        </label>
        <input
          id="streetAddress"
          name="streetAddress"
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Chung cư Topaz căn 402"
          disabled={disabled}
          className={selectStyle}
          required
        />
      </div>
    </div>
  );
}
