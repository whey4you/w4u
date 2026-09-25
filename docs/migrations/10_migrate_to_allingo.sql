-- ==============================================================================
-- WHEY4YOU - NÂNG CẤP BẢNG ORDERS ĐỒNG BỘ VẬN CHUYỂN ALLINGO LOGISTICS
-- Chạy script này trong Supabase Dashboard > SQL Editor
-- ==============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS allingo_order_id TEXT,
  ADD COLUMN IF NOT EXISTS allingo_track_id TEXT,
  ADD COLUMN IF NOT EXISTS allingo_carrier_id TEXT,
  ADD COLUMN IF NOT EXISTS allingo_service_id TEXT,
  ADD COLUMN IF NOT EXISTS province_code TEXT,
  ADD COLUMN IF NOT EXISTS district_code TEXT,
  ADD COLUMN IF NOT EXISTS ward_code TEXT;

-- Bổ sung index để tra cứu đơn theo allingo_track_id hoặc allingo_order_id nhanh chóng
CREATE INDEX IF NOT EXISTS idx_orders_allingo_track_id ON public.orders (allingo_track_id);
CREATE INDEX IF NOT EXISTS idx_orders_allingo_order_id ON public.orders (allingo_order_id);
