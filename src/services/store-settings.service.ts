import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/server';
import { revalidateTag, unstable_cache } from 'next/cache';

export interface WarehouseConfig {
  sender_name: string;
  sender_phone: string;
  street_address: string;
  province_code: string;
  province_name: string;
  district_code: string;
  district_name: string;
  ward_code?: string;
  ward_name?: string;
  updated_at?: string;
}

export const DEFAULT_WAREHOUSE_CONFIG: WarehouseConfig = {
  sender_name: 'LONG Whey4You',
  sender_phone: '0559959433',
  street_address: '123 Nguyễn Thị Minh Khai, Phường Bến Thành',
  province_code: '79',
  province_name: 'Thành phố Hồ Chí Minh',
  district_code: '760',
  district_name: 'Quận 1',
  ward_code: '26743',
  ward_name: 'Phường Bến Thành',
};

const WAREHOUSE_CACHE_TAG = 'warehouse_config';

/**
 * Đọc cấu hình kho trực tiếp từ Supabase DB
 */
async function fetchWarehouseConfigFromDb(): Promise<WarehouseConfig> {
  if (!isSupabaseAdminConfigured) {
    return DEFAULT_WAREHOUSE_CONFIG;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('*')
      .eq('id', 'warehouse_config')
      .maybeSingle();

    if (error || !data) {
      if (error && error.code !== 'PGRST116') {
        console.warn('[StoreSettings] Không đọc được cấu hình kho từ DB, sử dụng mặc định:', error.message);
      }
      return DEFAULT_WAREHOUSE_CONFIG;
    }

    return {
      sender_name: data.sender_name || DEFAULT_WAREHOUSE_CONFIG.sender_name,
      sender_phone: data.sender_phone || DEFAULT_WAREHOUSE_CONFIG.sender_phone,
      street_address: data.street_address || DEFAULT_WAREHOUSE_CONFIG.street_address,
      province_code: data.province_code || DEFAULT_WAREHOUSE_CONFIG.province_code,
      province_name: data.province_name || DEFAULT_WAREHOUSE_CONFIG.province_name,
      district_code: data.district_code || DEFAULT_WAREHOUSE_CONFIG.district_code,
      district_name: data.district_name || DEFAULT_WAREHOUSE_CONFIG.district_name,
      ward_code: data.ward_code || DEFAULT_WAREHOUSE_CONFIG.ward_code,
      ward_name: data.ward_name || DEFAULT_WAREHOUSE_CONFIG.ward_name,
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.error('[StoreSettings] Lỗi khi truy vấn cấu hình kho:', err);
    return DEFAULT_WAREHOUSE_CONFIG;
  }
}

/**
 * Lấy cấu hình kho lưu trữ (có gắn cache để tối ưu tốc độ checkout)
 */
export const getWarehouseConfig = unstable_cache(
  async () => fetchWarehouseConfigFromDb(),
  ['warehouse_config_cache'],
  {
    tags: [WAREHOUSE_CACHE_TAG],
    revalidate: 3600, // Tự động làm mới sau 1 giờ nếu không có biến động
  }
);

/**
 * Lưu hoặc cập nhật cấu hình kho vào Supabase và giải phóng cache
 */
export async function updateWarehouseConfig(
  config: Partial<WarehouseConfig>
): Promise<{ success: boolean; data?: WarehouseConfig; error?: string }> {
  if (!isSupabaseAdminConfigured) {
    return { success: false, error: 'Chưa cấu hình Supabase Admin Service Key.' };
  }

  const payload = {
    id: 'warehouse_config',
    sender_name: config.sender_name?.trim() || DEFAULT_WAREHOUSE_CONFIG.sender_name,
    sender_phone: config.sender_phone?.trim() || DEFAULT_WAREHOUSE_CONFIG.sender_phone,
    street_address: config.street_address?.trim() || DEFAULT_WAREHOUSE_CONFIG.street_address,
    province_code: config.province_code?.trim() || DEFAULT_WAREHOUSE_CONFIG.province_code,
    province_name: config.province_name?.trim() || DEFAULT_WAREHOUSE_CONFIG.province_name,
    district_code: config.district_code?.trim() || DEFAULT_WAREHOUSE_CONFIG.district_code,
    district_name: config.district_name?.trim() || DEFAULT_WAREHOUSE_CONFIG.district_name,
    ward_code: config.ward_code?.trim() || null,
    ward_name: config.ward_name?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error('[StoreSettings] Lỗi upsert cấu hình kho:', error);
      return { success: false, error: error.message };
    }

    // Làm mới cache Next.js ngay lập tức
    try {
      revalidateTag(WAREHOUSE_CACHE_TAG);
    } catch {
      // Bỏ qua nếu chạy trong ngữ cảnh không có cache revalidate
    }

    return {
      success: true,
      data: {
        sender_name: data.sender_name,
        sender_phone: data.sender_phone,
        street_address: data.street_address,
        province_code: data.province_code,
        province_name: data.province_name,
        district_code: data.district_code,
        district_name: data.district_name,
        ward_code: data.ward_code,
        ward_name: data.ward_name,
        updated_at: data.updated_at,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định khi lưu cấu hình';
    console.error('[StoreSettings] Ngoại lệ lưu cấu hình:', err);
    return { success: false, error: message };
  }
}
