-- ==============================================================================
-- WHEY4YOU - NÂNG CẤP BẢNG ORDERS ĐỒNG BỘ VẬN CHUYỂN GOSHIP / SPX EXPRESS
-- Chạy script này trong Supabase Dashboard > SQL Editor
-- ==============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cod_remaining NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tracking_code TEXT,
  ADD COLUMN IF NOT EXISTS carrier_name TEXT,
  ADD COLUMN IF NOT EXISTS goship_order_id TEXT,
  ADD COLUMN IF NOT EXISTS tracking_url TEXT,
  ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS city_id TEXT,
  ADD COLUMN IF NOT EXISTS district_id TEXT,
  ADD COLUMN IF NOT EXISTS ward_id TEXT;

-- Bổ sung index để tra cứu đơn theo tracking_code hoặc goship_order_id nhanh chóng
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON public.orders (tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_goship_order_id ON public.orders (goship_order_id);
