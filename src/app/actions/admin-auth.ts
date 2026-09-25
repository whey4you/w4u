'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  verifyAdminPassword,
} from '@/lib/auth/admin-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';

export interface AdminLoginState {
  success: boolean;
  error?: string;
}

async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = h.get('x-real-ip');
    if (realIp) return realIp.trim();
    return '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}

export async function loginAdminAction(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  // Chống brute-force: Tối đa 5 lần thử sai / 15 phút trên mỗi IP
  const ip = await getClientIp();
  const rateLimitKey = `admin_login:${ip}`;
  const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng đợi 15 phút để thử lại.',
    };
  }

  const password = formData.get('password');

  if (!password || typeof password !== 'string' || password.trim() === '') {
    return { success: false, error: 'Vui lòng nhập mật khẩu quản trị.' };
  }

  const isValid = verifyAdminPassword(password);
  if (!isValid) {
    // Độ trễ trừng phạt 1.2s để vô hiệu hóa tool brute-force tốc độ cao
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { success: false, error: 'Mật khẩu quản trị không chính xác.' };
  }

  const token = await createAdminSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 ngày
  });

  return { success: true };
}

export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect('/admin/login');
}
