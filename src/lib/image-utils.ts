import { supabase } from '@/lib/supabase/client';

export async function convertToWebP(
  file: File,
  quality = 0.88,
  maxWidth = 1400
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Nếu tệp đã là webp và dung lượng nhỏ hợp lý (< 400KB), giữ nguyên
    if (file.type === 'image/webp' && file.size <= 400 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Bật thuật toán làm mịn cao cấp (Bicubic) để giữ nguyên độ sắc nét
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const webpFile = new File([blob], newName, { type: 'image/webp' });
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Không thể tải ảnh để nén WebP'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'));
    reader.readAsDataURL(file);
  });
}

export function sanitizeFileName(name: string): string {
  const base = name.replace(/\.[^/.]+$/, '');
  const normalized = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return normalized || 'image';
}

export async function uploadProductImage(file: File): Promise<string> {
  try {
    const webpFile = await convertToWebP(file);
    const cleanBaseName = sanitizeFileName(webpFile.name);
    const fileName = `${Date.now()}-${cleanBaseName}.webp`;
    const filePath = `uploads/${fileName}`;

    let bucketName = 'products';
    let { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, webpFile, {
        contentType: 'image/webp',
        upsert: true,
      });

    // Fallback sang bucket banners nếu bucket products gặp trục trặc
    if (error && (error.message.includes('not found') || error.message.includes('Bucket'))) {
      bucketName = 'banners';
      const fallbackResult = await supabase.storage
        .from(bucketName)
        .upload(`products/${fileName}`, webpFile, {
          contentType: 'image/webp',
          upsert: true,
        });
      error = fallbackResult.error;
    }

    if (error) {
      console.error('Lỗi upload ảnh lên Supabase Storage:', error);
      throw new Error(error.message || 'Lỗi khi tải ảnh lên kho lưu trữ');
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi khi nén và tải ảnh';
    console.error('Lỗi khi nén và tải ảnh:', message);
    throw new Error(message);
  }
}

