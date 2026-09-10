-- Migration: Thiết lập Supabase Storage Bucket cho Banner Quảng Cáo
-- Chạy script này trong Supabase SQL Editor nếu muốn tạo bucket 'banners' riêng biệt

-- 1. Tạo bucket 'banners' với chế độ công khai (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Cho phép công khai đọc (Public Read) mọi ảnh trong bucket 'banners'
CREATE POLICY "Public Read Banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- 3. Cho phép Upload ảnh vào bucket 'banners' (cho cả người dùng nặc danh/admin)
CREATE POLICY "Public Upload Banners"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners');

-- 4. Cho phép Update ảnh trong bucket 'banners'
CREATE POLICY "Public Update Banners"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banners');

-- 5. Cho phép Xóa ảnh trong bucket 'banners'
CREATE POLICY "Public Delete Banners"
ON storage.objects FOR DELETE
USING (bucket_id = 'banners');
