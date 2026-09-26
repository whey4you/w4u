import { supabase } from '@/lib/supabase/client';
import { convertToWebP } from '@/lib/image-utils';

/**
 * Tiêu chuẩn kích thước và dung lượng tối ưu cho Hero Banner trên Trang Chủ
 */
export const OPTIMAL_BANNER_SPEC = {
  width: 1920,
  height: 640,
  aspectRatio: '3:1 (hoặc 2.8:1)',
  format: 'WebP (tự động nén)',
  maxRecommendedSizeKB: 500,
  description: '1920 × 640 px (chuẩn nét cao từ màn hình 2K/4K đến Mobile, không bị vỡ nét)',
};

/**
 * Tải ảnh Banner lên Supabase Storage với tính năng tự động tối ưu hóa WebP
 */
export async function uploadBannerImage(file: File): Promise<string> {
  try {
    // 1. Tối ưu ảnh: Resize về chiều ngang chuẩn tối đa 1920px và nén chất lượng WebP 0.88
    const webpFile = await convertToWebP(file, 0.88, OPTIMAL_BANNER_SPEC.width);
    const cleanName = webpFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${cleanName}`;

    // 2. Thử upload lên bucket 'banners' trước
    let bucketName = 'banners';
    let filePath = `hero/${fileName}`;

    let { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, webpFile, {
        contentType: 'image/webp',
        upsert: true,
      });

    // Nếu bucket 'banners' chưa được tạo trên Supabase, tự động fallback sang bucket 'products'
    if (error && (error.message.includes('not found') || error.message.includes('Bucket'))) {
      console.warn('[BannerStorage] Bucket banners chưa sẵn sàng, dùng fallback sang bucket products/banners');
      bucketName = 'products';
      filePath = `banners/${fileName}`;

      const fallbackResult = await supabase.storage
        .from(bucketName)
        .upload(filePath, webpFile, {
          contentType: 'image/webp',
          upsert: true,
        });

      error = fallbackResult.error;
    }

    if (error) {
      throw new Error(`Lỗi tải ảnh lên Supabase: ${error.message}`);
    }

    // 3. Lấy URL công khai
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định khi upload ảnh';
    console.error('[BannerStorage] uploadBannerImage error:', message);
    throw new Error(message);
  }
}

export const OPTIMAL_VIDEO_SPEC = {
  format: 'MP4 / WebM',
  maxSizeMB: 50,
  maxRecommendedSizeMB: 25,
  aspectRatio: '3:1 hoặc 16:9',
  codec: 'H.264 / AAC',
  description: 'Video ngắn lặp lại (10-30s), tỉ lệ 3:1 hoặc 16:9, tối đa 50MB (khuyên dùng dưới 25MB để tải nhanh nhất)',
};

/**
 * Tải file Video Banner lên Supabase Storage
 */
export async function uploadBannerVideo(file: File): Promise<string> {
  try {
    const maxBytes = OPTIMAL_VIDEO_SPEC.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error(`Dung lượng video (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn cho phép ${OPTIMAL_VIDEO_SPEC.maxSizeMB}MB.`);
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${cleanName}`;
    let bucketName = 'banners';
    let filePath = `hero/videos/${fileName}`;

    const contentType = file.type || 'video/mp4';

    let { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType,
        upsert: true,
      });

    // Fallback nếu bucket 'banners' gặp lỗi
    if (error && (error.message.includes('not found') || error.message.includes('Bucket'))) {
      console.warn('[BannerStorage] Bucket banners chưa sẵn sàng, dùng fallback sang bucket products');
      bucketName = 'products';
      filePath = `banners/videos/${fileName}`;

      const fallbackResult = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType,
          upsert: true,
        });

      error = fallbackResult.error;
    }

    if (error) {
      throw new Error(`Lỗi tải video lên Supabase: ${error.message}`);
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định khi upload video';
    console.error('[BannerStorage] uploadBannerVideo error:', message);
    throw new Error(message);
  }
}

/**
 * Xóa tệp media (ảnh hoặc video) Banner khỏi Supabase Storage
 */
export async function deleteBannerMedia(publicUrl: string): Promise<boolean> {
  try {
    if (!publicUrl || !publicUrl.includes('supabase.co/storage/v1/object/public/')) {
      return false;
    }

    // 1. Nếu đang ở môi trường trình duyệt: Gọi qua Admin API đã xác thực quyền để xóa an toàn bằng Service Role
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/admin/media?url=${encodeURIComponent(publicUrl)}`, {
          method: 'DELETE',
        });
        if (res.ok) return true;
      } catch {
        // Fallback sang phương thức xóa trực tiếp nếu API lỗi
      }
    }

    // 2. Fallback: Xóa trực tiếp qua Supabase Storage client
    const parts = publicUrl.split('/storage/v1/object/public/');
    if (parts.length < 2) return false;

    const [bucket, ...pathParts] = parts[1].split('/');
    const filePath = pathParts.join('/');

    if (!bucket || !filePath) return false;

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      console.error('[BannerStorage] Lỗi xóa media Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[BannerStorage] Lỗi ngoại lệ khi xóa media:', err);
    return false;
  }
}

// Giữ lại tên cũ để đảm bảo backward compatibility
export const deleteBannerImage = deleteBannerMedia;

