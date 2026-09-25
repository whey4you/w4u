import { allingoFetch } from './client';
import { AllinGoGsoLocation } from './types';

interface LocationsResponse {
  data: AllinGoGsoLocation[];
}

const cache = {
  provinces: null as AllinGoGsoLocation[] | null,
  districts: new Map<string, AllinGoGsoLocation[]>(),
  wards: new Map<string, AllinGoGsoLocation[]>(),
};

/**
 * Lấy danh sách 63 Tỉnh / Thành phố Việt Nam (chuẩn mã GSO)
 */
export async function getAllinGoProvinces(): Promise<AllinGoGsoLocation[]> {
  if (cache.provinces && cache.provinces.length > 0) {
    return cache.provinces;
  }

  try {
    const res = await allingoFetch<LocationsResponse>('/locations/provinces', {
      method: 'GET',
      next: { revalidate: 86400 },
    });

    if (Array.isArray(res?.data)) {
      cache.provinces = res.data;
      return res.data;
    }
    return [];
  } catch (err) {
    console.error('[AllinGo Locations] Lỗi tải tỉnh thành:', err);
    return [];
  }
}

/**
 * Lấy danh sách Quận / Huyện theo mã Tỉnh / Thành phố
 */
export async function getAllinGoDistricts(provinceCode: string): Promise<AllinGoGsoLocation[]> {
  if (!provinceCode) return [];
  const key = String(provinceCode);
  if (cache.districts.has(key)) {
    return cache.districts.get(key)!;
  }

  try {
    const res = await allingoFetch<LocationsResponse>(`/locations/districts?province_code=${encodeURIComponent(key)}`, {
      method: 'GET',
      next: { revalidate: 86400 },
    });

    if (Array.isArray(res?.data)) {
      cache.districts.set(key, res.data);
      return res.data;
    }
    return [];
  } catch (err) {
    console.error(`[AllinGo Locations] Lỗi tải quận huyện cho tỉnh ${provinceCode}:`, err);
    return [];
  }
}

/**
 * Lấy danh sách Phường / Xã theo mã Quận / Huyện
 */
export async function getAllinGoWards(districtCode: string): Promise<AllinGoGsoLocation[]> {
  if (!districtCode) return [];
  const key = String(districtCode);
  if (cache.wards.has(key)) {
    return cache.wards.get(key)!;
  }

  try {
    const res = await allingoFetch<LocationsResponse>(`/locations/wards?district_code=${encodeURIComponent(key)}`, {
      method: 'GET',
      next: { revalidate: 86400 },
    });

    if (Array.isArray(res?.data)) {
      cache.wards.set(key, res.data);
      return res.data;
    }
    return [];
  } catch (err) {
    console.error(`[AllinGo Locations] Lỗi tải phường xã cho huyện ${districtCode}:`, err);
    return [];
  }
}
