-- ==============================================================================
-- WHEY4YOU - MIGRATION 18: Thêm trạng thái còn/hết hàng cho hương vị (in_stock)
-- ==============================================================================

ALTER TABLE public.product_flavors
  ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
