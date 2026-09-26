export type DiscountType = 'fixed' | 'percent';

export interface CouponTier {
  id: string;
  min_order_value: number;
  max_order_value?: number | null;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_amount?: number | null;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  used_count: number;
  is_active: boolean;
  start_date: string;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  tiers?: CouponTier[] | null;
}

export interface AppliedCouponNextTier {
  minOrderValue: number;
  discountType: DiscountType;
  discountValue: number;
  amountNeeded: number;
}

export interface AppliedCoupon {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  description?: string;
  minOrderValue: number;
  maxDiscountAmount?: number | null;
  isTiered?: boolean;
  activeTier?: CouponTier;
  nextTier?: AppliedCouponNextTier | null;
  tiers?: CouponTier[];
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  discountAmount?: number;
  appliedCoupon?: AppliedCoupon;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value?: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  is_active?: boolean;
  expires_at?: string | null;
  tiers?: CouponTier[] | null;
}

