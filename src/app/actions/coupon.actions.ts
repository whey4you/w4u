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

export async function applyCouponAction(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Vui lòng nhập mã giảm giá.' };
  }
  return validateAndCalculateCoupon(code, subtotal);
}

export async function getAdminCouponsAction(): Promise<Coupon[]> {
  return getAdminCoupons();
}

export async function createCouponAction(
  input: CreateCouponInput
): Promise<{ success: boolean; coupon?: Coupon; error?: string }> {
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
  const result = await updateCoupon(id, input);
  if (result.success) {
    revalidatePath('/admin/coupons');
  }
  return result;
}

export async function deleteCouponAction(
  id: string
): Promise<{ success: boolean }> {
  const success = await deleteCoupon(id);
  if (success) {
    revalidatePath('/admin/coupons');
  }
  return { success };
}
