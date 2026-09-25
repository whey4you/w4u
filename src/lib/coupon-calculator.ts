import { Coupon, CouponValidationResult, AppliedCoupon } from '@/types/coupon';
import { formatPrice } from '@/lib/utils';

export function validateCouponRules(coupon: Coupon, subtotal: number): { valid: boolean; error?: string } {
  if (!coupon.is_active) {
    return { valid: false, error: 'Mã giảm giá này hiện không còn hoạt động.' };
  }

  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    return { valid: false, error: 'Mã giảm giá chưa đến thời gian áp dụng.' };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, error: 'Mã giảm giá đã hết hạn sử dụng.' };
  }

  if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, error: 'Mã giảm giá đã hết lượt sử dụng.' };
  }

  if (coupon.min_order_value && subtotal < Number(coupon.min_order_value)) {
    return {
      valid: false,
      error: `Đơn hàng cần tối thiểu ${formatPrice(Number(coupon.min_order_value))} để áp dụng mã này.`,
    };
  }

  return { valid: true };
}

export function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
  if (subtotal <= 0) return 0;

  let discount = 0;
  if (coupon.discount_type === 'fixed') {
    discount = Number(coupon.discount_value);
  } else if (coupon.discount_type === 'percent') {
    const rawDiscount = (subtotal * Number(coupon.discount_value)) / 100;
    if (coupon.max_discount_amount && Number(coupon.max_discount_amount) > 0) {
      discount = Math.min(rawDiscount, Number(coupon.max_discount_amount));
    } else {
      discount = rawDiscount;
    }
  }

  // Giảm tối đa không vượt quá giá trị tiền hàng
  return Math.max(0, Math.min(Math.round(discount), subtotal));
}

export function evaluateCoupon(coupon: Coupon, subtotal: number): CouponValidationResult {
  const ruleCheck = validateCouponRules(coupon, subtotal);
  if (!ruleCheck.valid) {
    return { valid: false, error: ruleCheck.error };
  }

  const discountAmount = calculateCouponDiscount(coupon, subtotal);
  const appliedCoupon: AppliedCoupon = {
    code: coupon.code.toUpperCase(),
    discountType: coupon.discount_type,
    discountValue: Number(coupon.discount_value),
    discountAmount,
    description: coupon.description || undefined,
    minOrderValue: Number(coupon.min_order_value || 0),
    maxDiscountAmount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
  };

  return {
    valid: true,
    discountAmount,
    appliedCoupon,
  };
}
