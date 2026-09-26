'use client';

import { useEffect, useState, useCallback } from 'react';

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

  // 1. Tải danh sách Tỉnh / Thành phố khi mount
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

  // 2. Tải danh sách Quận / Huyện khi selectedCityId thay đổi hoặc khi mount có sẵn selectedCityId
  useEffect(() => {
    if (!selectedCityId) {
      setDistricts([]);
      return;
    }

    let isMounted = true;
    setLoadingDistricts(true);
    fetch(`/api/shipping/districts?cityId=${selectedCityId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setDistricts(data.data);
        }
      })
      .catch((err) => console.error('Lỗi tải quận huyện:', err))
      .finally(() => {
        if (isMounted) setLoadingDistricts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCityId]);

  // 3. Tải danh sách Phường / Xã khi selectedDistrictId thay đổi hoặc khi mount có sẵn selectedDistrictId
  useEffect(() => {
    if (!selectedDistrictId) {
      setWards([]);
      return;
    }

    let isMounted = true;
    setLoadingWards(true);
    fetch(`/api/shipping/wards?districtId=${selectedDistrictId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setWards(data.data);
        }
      })
      .catch((err) => console.error('Lỗi tải phường xã:', err))
      .finally(() => {
        if (isMounted) setLoadingWards(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDistrictId]);

  // 4. Đồng bộ state khi prop `value` thay đổi từ bên ngoài (ví dụ chọn từ sổ địa chỉ)
  useEffect(() => {
    if (!value) {
      setSelectedCityId('');
      setSelectedDistrictId('');
      setSelectedWardId('');
      setStreet('');
      return;
    }

    if (value.cityId !== selectedCityId) {
      setSelectedCityId(value.cityId || '');
    }
    if (value.districtId !== selectedDistrictId) {
      setSelectedDistrictId(value.districtId || '');
    }
    if (value.wardId !== selectedWardId) {
      setSelectedWardId(value.wardId || '');
    }
    if (value.streetAddress !== street) {
      setStreet(value.streetAddress || '');
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hàm phát tán sự kiện onChange về component cha
  const emitChange = useCallback(
    (
      cityId: string,
      cityName: string,
      districtId: string,
      districtName: string,
      wardId: string,
      wardName: string,
      streetAddress: string
    ) => {
      const parts = [streetAddress.trim(), wardName, districtName, cityName].filter(Boolean);
      const fullAddress = parts.join(', ');

      onChange({
        cityId,
        cityName,
        districtId,
        districtName,
        wardId,
        wardName,
        streetAddress,
        fullAddress,
      });
    },
    [onChange]
  );

  // 5. Bổ sung tên Tỉnh/Quận/Phường nếu dữ liệu ban đầu chỉ có ID mà thiếu tên
  useEffect(() => {
    if (!selectedCityId || !value) return;
    const cName = cities.find((c) => c.id === selectedCityId)?.name;
    const dName = districts.find((d) => d.id === selectedDistrictId)?.name;
    const wName = wards.find((w) => String(w.id) === String(selectedWardId))?.name;

    const needsCityUpdate = cName && !value.cityName;
    const needsDistrictUpdate = dName && !value.districtName;
    const needsWardUpdate = wName && !value.wardName;

    if (needsCityUpdate || needsDistrictUpdate || needsWardUpdate) {
      emitChange(
        selectedCityId,
        cName || value.cityName || '',
        selectedDistrictId,
        dName || value.districtName || '',
        selectedWardId,
        wName || value.wardName || '',
        street
      );
    }
  }, [cities, districts, wards, selectedCityId, selectedDistrictId, selectedWardId, value, street, emitChange]);

  const handleCityChange = (newCityId: string) => {
    setSelectedCityId(newCityId);
    setSelectedDistrictId('');
    setSelectedWardId('');

    const cityName = cities.find((c) => c.id === newCityId)?.name || '';
    emitChange(newCityId, cityName, '', '', '', '', street);
  };

  const handleDistrictChange = (newDistrictId: string) => {
    setSelectedDistrictId(newDistrictId);
    setSelectedWardId('');

    const cityName = cities.find((c) => c.id === selectedCityId)?.name || value?.cityName || '';
    const districtName = districts.find((d) => d.id === newDistrictId)?.name || '';
    emitChange(selectedCityId, cityName, newDistrictId, districtName, '', '', street);
  };

  const handleWardChange = (newWardId: string) => {
    setSelectedWardId(newWardId);

    const cityName = cities.find((c) => c.id === selectedCityId)?.name || value?.cityName || '';
    const districtName = districts.find((d) => d.id === selectedDistrictId)?.name || value?.districtName || '';
    const wardName = wards.find((w) => String(w.id) === String(newWardId))?.name || '';
    emitChange(selectedCityId, cityName, selectedDistrictId, districtName, newWardId, wardName, street);
  };

  const handleStreetChange = (newStreet: string) => {
    setStreet(newStreet);

    const cityName = cities.find((c) => c.id === selectedCityId)?.name || value?.cityName || '';
    const districtName = districts.find((d) => d.id === selectedDistrictId)?.name || value?.districtName || '';
    const wardName = wards.find((w) => String(w.id) === String(selectedWardId))?.name || value?.wardName || '';
    emitChange(selectedCityId, cityName, selectedDistrictId, districtName, selectedWardId, wardName, newStreet);
  };

  const selectStyle =
    'w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400';

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="cityId" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
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
          {!cities.some((c) => c.id === selectedCityId) && selectedCityId && (
            <option value={selectedCityId}>{value?.cityName || 'Đang tải tỉnh/thành...'}</option>
          )}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="districtId" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
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
            {!districts.some((d) => d.id === selectedDistrictId) && selectedDistrictId && (
              <option value={selectedDistrictId}>{value?.districtName || 'Đang tải quận/huyện...'}</option>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="wardId" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
            Phường / Xã <span className="text-rose-500">*</span>
          </label>
          <select
            id="wardId"
            name="wardId"
            value={selectedWardId}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={disabled || !selectedDistrictId || loadingWards}
            className={selectStyle}
            required
          >
            <option value="">{loadingWards ? 'Đang tải...' : '-- Chọn Phường / Xã --'}</option>
            {wards.map((w) => (
              <option key={w.id} value={String(w.id)}>{w.name}</option>
            ))}
            {!wards.some((w) => String(w.id) === String(selectedWardId)) && selectedWardId && (
              <option value={selectedWardId}>{value?.wardName || 'Đang tải phường/xã...'}</option>
            )}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="streetAddress" className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
          Số nhà, tên đường <span className="text-rose-500">*</span>
        </label>
        <input
          id="streetAddress"
          name="streetAddress"
          type="text"
          value={street}
          onChange={(e) => handleStreetChange(e.target.value)}
          onBlur={() => {
            const trimmed = street.trim();
            if (trimmed !== street) {
              handleStreetChange(trimmed);
            }
          }}
          placeholder="Nhập số nhà, tên đường, căn hộ..."
          disabled={disabled}
          className={selectStyle}
          required
        />
      </div>
    </div>
  );
}
