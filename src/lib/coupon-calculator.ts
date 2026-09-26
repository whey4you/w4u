import { Coupon, CouponValidationResult, AppliedCoupon, CouponTier, AppliedCouponNextTier, DiscountType } from '@/types/coupon';
import { formatPrice } from '@/lib/utils';

export function calculateDiscountAmount(
  discountType: DiscountType,
  discountValue: number,
  maxDiscountAmount: number | null | undefined,
  subtotal: number
): number {
  if (subtotal <= 0) return 0;
  let discount = 0;
  if (discountType === 'fixed') {
    discount = Number(discountValue);
  } else if (discountType === 'percent') {
    const rawDiscount = (subtotal * Number(discountValue)) / 100;
    if (maxDiscountAmount && Number(maxDiscountAmount) > 0) {
      discount = Math.min(rawDiscount, Number(maxDiscountAmount));
    } else {
      discount = rawDiscount;
    }
  }
  return Math.max(0, Math.min(Math.round(discount), subtotal));
}

export function findMatchingTier(
  tiers: CouponTier[],
  subtotal: number
): { activeTier?: CouponTier; nextTier?: AppliedCouponNextTier | null } {
  if (!tiers || tiers.length === 0) return { activeTier: undefined, nextTier: null };

  const sortedTiers = [...tiers].sort((a, b) => Number(a.min_order_value) - Number(b.min_order_value));

  // Tìm bậc thoả mãn khoảng giá trị
  let matched: CouponTier | undefined = undefined;
  for (const tier of sortedTiers) {
    const minVal = Number(tier.min_order_value || 0);
    const maxVal = tier.max_order_value !== null && tier.max_order_value !== undefined ? Number(tier.max_order_value) : null;

    if (subtotal >= minVal) {
      if (maxVal === null || maxVal === 0 || subtotal <= maxVal) {
        matched = tier;
      }
    }
  }

  // Nếu không khớp theo khoảng khép kín nhưng đơn lớn hơn min_order_value lớn nhất
  if (!matched) {
    const qualifiedTiers = sortedTiers.filter((t) => subtotal >= Number(t.min_order_value || 0));
    if (qualifiedTiers.length > 0) {
      matched = qualifiedTiers[qualifiedTiers.length - 1];
    }
  }

  // Tìm bậc kế tiếp để hiển thị gợi ý mua thêm (Upsell)
  let nextTierInfo: AppliedCouponNextTier | null = null;
  const higherTiers = sortedTiers.filter((t) => Number(t.min_order_value || 0) > subtotal);
  if (higherTiers.length > 0) {
    const nextTier = higherTiers[0];
    const nextMin = Number(nextTier.min_order_value || 0);
    nextTierInfo = {
      minOrderValue: nextMin,
      discountType: nextTier.discount_type,
      discountValue: Number(nextTier.discount_value),
      amountNeeded: Math.max(0, nextMin - subtotal),
    };
  }

  return { activeTier: matched, nextTier: nextTierInfo };
}

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

  // Kiểm tra điều kiện giá trị đơn hàng
  if (coupon.tiers && coupon.tiers.length > 0) {
    const minTierVal = Math.min(...coupon.tiers.map((t) => Number(t.min_order_value || 0)));
    if (subtotal < minTierVal) {
      return {
        valid: false,
        error: `Đơn hàng cần tối thiểu ${formatPrice(minTierVal)} để áp dụng mã giảm giá này.`,
      };
    }
  } else if (coupon.min_order_value && subtotal < Number(coupon.min_order_value)) {
    return {
      valid: false,
      error: `Đơn hàng cần tối thiểu ${formatPrice(Number(coupon.min_order_value))} để áp dụng mã này.`,
    };
  }

  return { valid: true };
}

export function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
  if (subtotal <= 0) return 0;

  if (coupon.tiers && coupon.tiers.length > 0) {
    const { activeTier } = findMatchingTier(coupon.tiers, subtotal);
    if (!activeTier) return 0;
    return calculateDiscountAmount(
      activeTier.discount_type,
      activeTier.discount_value,
      activeTier.max_discount_amount,
      subtotal
    );
  }

  return calculateDiscountAmount(
    coupon.discount_type,
    coupon.discount_value,
    coupon.max_discount_amount,
    subtotal
  );
}

export function evaluateCoupon(coupon: Coupon, subtotal: number): CouponValidationResult {
  const ruleCheck = validateCouponRules(coupon, subtotal);
  if (!ruleCheck.valid) {
    return { valid: false, error: ruleCheck.error };
  }

  const isTiered = Boolean(coupon.tiers && coupon.tiers.length > 0);
  let discountAmount = 0;
  let activeTier: CouponTier | undefined = undefined;
  let nextTier: AppliedCouponNextTier | null = null;

  if (isTiered && coupon.tiers) {
    const matchResult = findMatchingTier(coupon.tiers, subtotal);
    activeTier = matchResult.activeTier;
    nextTier = matchResult.nextTier || null;

    if (!activeTier) {
      const minTierVal = Math.min(...coupon.tiers.map((t) => Number(t.min_order_value || 0)));
      return {
        valid: false,
        error: `Đơn hàng cần tối thiểu ${formatPrice(minTierVal)} để hưởng ưu đãi từ mã này.`,
      };
    }

    discountAmount = calculateDiscountAmount(
      activeTier.discount_type,
      activeTier.discount_value,
      activeTier.max_discount_amount,
      subtotal
    );
  } else {
    discountAmount = calculateCouponDiscount(coupon, subtotal);
  }

  const appliedCoupon: AppliedCoupon = {
    code: coupon.code.toUpperCase(),
    discountType: activeTier ? activeTier.discount_type : coupon.discount_type,
    discountValue: activeTier ? Number(activeTier.discount_value) : Number(coupon.discount_value),
    discountAmount,
    description: coupon.description || undefined,
    minOrderValue: activeTier ? Number(activeTier.min_order_value) : Number(coupon.min_order_value || 0),
    maxDiscountAmount: activeTier
      ? (activeTier.max_discount_amount ? Number(activeTier.max_discount_amount) : null)
      : (coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null),
    isTiered,
    activeTier,
    nextTier,
    tiers: coupon.tiers || undefined,
  };

  return {
    valid: true,
    discountAmount,
    appliedCoupon,
  };
}

