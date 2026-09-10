-- Migration: 03_blogs_enhancement.sql
-- Nâng cấp cấu trúc bảng blogs để lưu trữ đầy đủ thuộc tính chuẩn E-E-A-T

ALTER TABLE public.blogs 
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS key_takeaways TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS related_product_ids TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'Chuyên gia Dinh dưỡng Thể thao',
  ADD COLUMN IF NOT EXISTS author_avatar TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS author_verified BOOLEAN DEFAULT true;

-- Đảm bảo index cho slug và ngày xuất bản
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON public.blogs(published_at DESC);
