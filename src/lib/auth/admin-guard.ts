import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from './admin-auth';

/**
 * Kiểm tra phiên đăng nhập quản trị viên cho Server Actions và API Routes.
 * Trả về true nếu token hợp lệ và còn thời hạn, ngược lại trả về false.
 */
export async function assertAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return await verifyAdminSessionToken(token);
  } catch {
    return false;
  }
}
