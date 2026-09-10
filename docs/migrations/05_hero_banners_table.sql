-- Migration 05: Bảng lưu trữ Hero Banner trên Supabase
-- Chạy script này trong Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Tạo bảng hero_banners
CREATE TABLE IF NOT EXISTS public.hero_banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  href TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai (trang chủ cần đọc banner)
CREATE POLICY "Public read hero_banners"
  ON public.hero_banners FOR SELECT
  USING (true);

-- Cho phép ghi (dành cho admin - dùng anon key tạm thời)
CREATE POLICY "Admin write hero_banners"
  ON public.hero_banners FOR ALL
  USING (true);

-- Seed dữ liệu mẫu ban đầu (thứ tự giữ nguyên như cấu hình hiện tại)
INSERT INTO public.hero_banners (id, title, image, href, order_index) VALUES
  ('banner-whey-isolate',    'Whey Isolate Cao Cấp - Tinh Khiết & Hấp Thu Cực Nhanh',    'https://bizweb.dktcdn.net/100/517/390/files/20250707-140913.jpg?v=1751879076107',  '/products/optimum-nutrition-micronized-creatine-300g', 0),
  ('banner-vitamins',        'Vitamin & Khoáng Chất Thiết Yếu Phục Hồi Cơ Bắp',           'https://bizweb.dktcdn.net/100/517/390/files/20251231-111346.jpg?v=1767156519636', '/products?category=vitamins', 1),
  ('banner-nutrition-blog',  'Cẩm Nang Dinh Dưỡng Khoa Học & Lịch Trình Tập Luyện',       '/banners/hero-banner.jpg',                                                        '/blog', 2)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  image = EXCLUDED.image,
  href  = EXCLUDED.href,
  order_index = EXCLUDED.order_index,
  updated_at  = NOW();
