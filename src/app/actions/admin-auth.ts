'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  verifyAdminPassword,
} from '@/lib/auth/admin-auth';

export interface AdminLoginState {
  success: boolean;
  error?: string;
}

export async function loginAdminAction(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const password = formData.get('password');

  if (!password || typeof password !== 'string' || password.trim() === '') {
    return { success: false, error: 'Vui lòng nhập mật khẩu quản trị.' };
  }

  const isValid = verifyAdminPassword(password);
  if (!isValid) {
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
