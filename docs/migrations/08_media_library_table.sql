-- Migration 08: Tạo bảng lưu trữ Thư Viện Ảnh (media_library)
-- Cho phép admin lưu trữ các liên kết ảnh để tái sử dụng nhanh chóng

CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'custom',
    source TEXT DEFAULT 'Thư viện link',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chỉ mục hỗ trợ tìm kiếm nhanh theo URL và Danh mục
CREATE INDEX IF NOT EXISTS idx_media_library_category ON public.media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_url ON public.media_library(url);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON public.media_library(created_at DESC);

-- Thiết lập RLS (Row Level Security)
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai (để lấy ảnh hiển thị)
CREATE POLICY "Public Read Access for media_library"
ON public.media_library
FOR SELECT
USING (true);

-- Cho phép thao tác toàn quyền qua service role hoặc anon nếu cấu hình admin
CREATE POLICY "Full Access for Admin on media_library"
ON public.media_library
FOR ALL
USING (true)
WITH CHECK (true);
