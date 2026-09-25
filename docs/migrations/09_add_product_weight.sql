-- ==============================================================================
-- BỔ SUNG CỘT KHỐI LƯỢNG SẢN PHẨM (KG) CHO BẢNG PRODUCTS
-- Chạy script này trong Supabase Dashboard > SQL Editor
-- ==============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC DEFAULT 1.0;

ALTER TABLE public.product_sizes
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC DEFAULT 1.0;

COMMENT ON COLUMN public.products.weight_kg IS 'Khối lượng đóng gói mặc định của sản phẩm (kg)';
COMMENT ON COLUMN public.product_sizes.weight_kg IS 'Khối lượng đóng gói tương ứng với từng kích cỡ/số viên (kg), dùng để tính phí vận chuyển Goship/SPX';
