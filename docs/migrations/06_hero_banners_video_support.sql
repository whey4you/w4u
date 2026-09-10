-- Migration 06: Bổ sung hỗ trợ Video cho Hero Banner và nâng cấp Supabase Storage
-- Chạy trong Supabase SQL Editor nếu thiết lập môi trường mới

-- 1. Thêm cột media_type và video_url vào bảng hero_banners
ALTER TABLE public.hero_banners 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';

ALTER TABLE public.hero_banners 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 2. Nâng cấp cấu hình bucket 'banners': Hỗ trợ video tối đa 50MB và các định dạng MP4, WebM, MOV
UPDATE storage.buckets 
SET file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime'
    ]
WHERE id = 'banners';
