-- ==============================================================================
-- WHEY4YOU - MIGRATION 17: TIERED COUPONS SYSTEM
-- Thêm cột tiers (JSONB) cho bảng coupons để hỗ trợ giảm giá đa bậc theo giá trị đơn
-- ==============================================================================

-- 1. Bổ sung cột tiers
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS tiers JSONB DEFAULT '[]'::jsonb;

-- 2. Comment mô tả cột
COMMENT ON COLUMN public.coupons.tiers IS 'Danh sách các bậc giảm giá theo giá trị đơn hàng [{id, min_order_value, max_order_value, discount_type, discount_value, max_discount_amount}]';
