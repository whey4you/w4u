'use server';

import { revalidatePath } from 'next/cache';
import { assertAdminSession } from '@/lib/auth/admin-guard';
import {
  getWarehouseConfig,
  updateWarehouseConfig,
  WarehouseConfig,
} from '@/services/store-settings.service';

/**
 * Lấy cấu hình kho phục vụ trang quản trị
 */
export async function getAdminWarehouseConfigAction(): Promise<{
  success: boolean;
  data?: WarehouseConfig;
  error?: string;
}> {
  const isAdmin = await assertAdminSession();
  if (!isAdmin) {
    return { success: false, error: 'Bạn không có quyền quản trị.' };
  }

  try {
    const config = await getWarehouseConfig();
    return { success: true, data: config };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi lấy cấu hình';
    return { success: false, error: message };
  }
}

/**
 * Cập nhật thông tin kho hàng và người gửi AllinGo
 */
export async function updateAdminWarehouseConfigAction(
  payload: Partial<WarehouseConfig>
): Promise<{ success: boolean; data?: WarehouseConfig; error?: string }> {
  const isAdmin = await assertAdminSession();
  if (!isAdmin) {
    return { success: false, error: 'Phiên làm việc hết hạn hoặc không có quyền quản trị.' };
  }

  if (!payload.sender_name?.trim()) {
    return { success: false, error: 'Vui lòng nhập tên người gửi / tên kho hàng.' };
  }

  if (!payload.sender_phone?.trim()) {
    return { success: false, error: 'Vui lòng nhập số điện thoại người liên hệ.' };
  }

  if (!payload.street_address?.trim()) {
    return { success: false, error: 'Vui lòng nhập địa chỉ chi tiết (số nhà, đường).' };
  }

  if (!payload.province_code || !payload.province_name) {
    return { success: false, error: 'Vui lòng chọn Tỉnh / Thành phố kho hàng.' };
  }

  if (!payload.district_code || !payload.district_name) {
    return { success: false, error: 'Vui lòng chọn Quận / Huyện kho hàng.' };
  }

  const result = await updateWarehouseConfig(payload);
  if (result.success) {
    revalidatePath('/admin/settings');
    revalidatePath('/checkout');
  }

  return result;
}
