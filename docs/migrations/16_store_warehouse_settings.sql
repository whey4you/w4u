-- ==============================================================================
-- WHEY4YOU - MIGRATION 16: BẢNG CẤU HÌNH KHO HÀNG & THÔNG TIN GỬI HÀNG (ALLINGO)
-- Chạy script này trong Supabase Dashboard > SQL Editor
-- Giúp Admin thay đổi địa chỉ kho trực tiếp từ trang Admin mà không cần redeploy Vercel
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY,
  sender_name TEXT NOT NULL DEFAULT 'LONG Whey4You',
  sender_phone TEXT NOT NULL DEFAULT '0559959433',
  street_address TEXT NOT NULL DEFAULT '123 Nguyễn Thị Minh Khai, Phường Bến Thành',
  province_code TEXT NOT NULL DEFAULT '79',
  province_name TEXT NOT NULL DEFAULT 'Thành phố Hồ Chí Minh',
  district_code TEXT NOT NULL DEFAULT '760',
  district_name TEXT NOT NULL DEFAULT 'Quận 1',
  ward_code TEXT DEFAULT '26743',
  ward_name TEXT DEFAULT 'Phường Bến Thành',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kích hoạt Row-Level Security (RLS) bảo vệ dữ liệu
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Dọn dẹp policy cũ (nếu có)
DROP POLICY IF EXISTS "Service role full access store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Public read store_settings" ON public.store_settings;

-- Chỉ Service Role (Backend Server Actions & API) mới có toàn quyền Đọc/Ghi
CREATE POLICY "Service role full access store_settings"
  ON public.store_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Khởi tạo bản ghi cấu hình kho mặc định nếu chưa tồn tại
INSERT INTO public.store_settings (
  id,
  sender_name,
  sender_phone,
  street_address,
  province_code,
  province_name,
  district_code,
  district_name,
  ward_code,
  ward_name
) VALUES (
  'warehouse_config',
  'LONG Whey4You',
  '0559959433',
  '123 Nguyễn Thị Minh Khai, Phường Bến Thành',
  '79',
  'Thành phố Hồ Chí Minh',
  '760',
  'Quận 1',
  '26743',
  'Phường Bến Thành'
) ON CONFLICT (id) DO NOTHING;
