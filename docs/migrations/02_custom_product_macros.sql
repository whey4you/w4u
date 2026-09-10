-- ==============================================================================
-- WHEY4YOU - MIGRATION 02: CUSTOM PRODUCT MACROS & NUTRITION TABLE
-- Chạy script này trong Supabase Dashboard > SQL Editor
-- ==============================================================================

ALTER TABLE public.product_macros
  ADD COLUMN IF NOT EXISTS protein_label TEXT DEFAULT 'Protein',
  ADD COLUMN IF NOT EXISTS bcaa_label TEXT DEFAULT 'BCAA',
  ADD COLUMN IF NOT EXISTS calories_label TEXT DEFAULT 'Năng lượng',
  ADD COLUMN IF NOT EXISTS sugar_label TEXT DEFAULT 'Đường',
  ADD COLUMN IF NOT EXISTS servings_label TEXT DEFAULT 'Lần dùng',
  ADD COLUMN IF NOT EXISTS nutrition_table JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS ingredients TEXT,
  ADD COLUMN IF NOT EXISTS allergens TEXT;

COMMENT ON COLUMN public.product_macros.protein_label IS 'Tùy biến tiêu đề ô 1 (mặc định: Protein hoặc Creatine/Vitamin)';
COMMENT ON COLUMN public.product_macros.bcaa_label IS 'Tùy biến tiêu đề ô 2 (mặc định: BCAA hoặc Độ tinh khiết)';
COMMENT ON COLUMN public.product_macros.nutrition_table IS 'Bảng thành phần dinh dưỡng chi tiết dạng mảng JSON: [{name, perServing, per100g}]';
