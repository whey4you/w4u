'use server';

import { revalidatePath } from 'next/cache';
import {
  validateAndCalculateCoupon,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponActive,
  deleteCoupon,
} from '@/services/coupon.service';
import { CreateCouponInput, CouponValidationResult, Coupon } from '@/types/coupon';
import { assertAdminSession } from '@/lib/auth/admin-guard';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { headers } from 'next/headers';

async function getActionIp(): Promise<string> {
  try {
    const h = await headers();
    const f = h.get('x-forwarded-for');
    if (f) return f.split(',')[0].trim();
    const r = h.get('x-real-ip');
    if (r) return r.trim();
    return '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}

export async function applyCouponAction(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const ip = await getActionIp();
  const rateCheck = checkRateLimit(`coupon_check:${ip}`, 10, 5 * 60 * 1000);
  if (!rateCheck.allowed) {
    return { valid: false, error: 'Bạn đã thử nhập mã quá nhiều lần. Vui lòng đợi 5 phút để thử lại.' };
  }

  if (!code || !code.trim()) {
    return { valid: false, error: 'Vui lòng nhập mã giảm giá.' };
  }
  return validateAndCalculateCoupon(code, subtotal);
}

export async function getAdminCouponsAction(): Promise<Coupon[]> {
  if (!(await assertAdminSession())) {
    return [];
  }
  return getAdminCoupons();
}

export async function createCouponAction(
  input: CreateCouponInput
): Promise<{ success: boolean; coupon?: Coupon; error?: string }> {
  if (!(await assertAdminSession())) {
    return { success: false, error: 'Không có quyền thực hiện: Yêu cầu phiên đăng nhập quản trị.' };
  }
  const result = await createCoupon(input);
  if (result.success) {
    revalidatePath('/admin/coupons');
  }
  return result;
}

export async function toggleCouponAction(
  id: string,
  isActive: boolean
): Promise<{ success: boolean }> {
  if (!(await assertAdminSession())) {
    return { success: false };
  }
  const success = await toggleCouponActive(id, isActive);
  if (success) {
    revalidatePath('/admin/coupons');
  }
  return { success };
}

export async function updateCouponAction(
  id: string,
  input: Partial<CreateCouponInput>
): Promise<{ success: boolean; coupon?: Coupon; error?: string }> {
  if (!(await assertAdminSession())) {
    return { success: false, error: 'Không có quyền thực hiện: Yêu cầu phiên đăng nhập quản trị.' };
  }
  const result = await updateCoupon(id, input);
  if (result.success) {
    revalidatePath('/admin/coupons');
  }
  return result;
}

export async function deleteCouponAction(
  id: string
): Promise<{ success: boolean }> {
  if (!(await assertAdminSession())) {
    return { success: false };
  }
  const success = await deleteCoupon(id);
  if (success) {
    revalidatePath('/admin/coupons');
  }
  return { success };
}
