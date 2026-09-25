-- ==============================================================================
-- WHEY4YOU - MIGRATION 13: COUPONS & DISCOUNT SYSTEM
-- Bảng quản lý mã giảm giá và bổ sung cột lưu trữ cho đơn hàng
-- ==============================================================================

-- 1. BẢNG MÃ GIẢM GIÁ (COUPONS)
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percent')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_value NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC DEFAULT NULL,
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BỔ SUNG CỘT CHO PENDING_CHECKOUTS
ALTER TABLE public.pending_checkouts
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- 3. BỔ SUNG CỘT CHO ORDERS
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- 4. TẠO INDEXES TỐI ƯU TRA CỨU
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON public.orders(coupon_code);

-- 5. BẬT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES
DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;
CREATE POLICY "Public can read active coupons" ON public.coupons FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access coupons" ON public.coupons;
CREATE POLICY "Admin full access coupons" ON public.coupons FOR ALL USING (true);

-- 7. SEED DATA KHỞI TẠO (MÃ MẪU)
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_value, max_discount_amount, is_active)
VALUES
  ('WHEY4YOU', 'Giảm 50.000đ cho đơn hàng từ 500.000đ', 'fixed', 50000, 500000, NULL, true),
  ('WHEY10', 'Giảm 10% tối đa 100.000đ cho đơn hàng từ 300.000đ', 'percent', 10, 300000, 100000, true)
ON CONFLICT (code) DO NOTHING;
