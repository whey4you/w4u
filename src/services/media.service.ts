import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MediaItem, AddMediaPayload } from '@/types/media';
import { getAdminProducts } from './product.service';
import { getHeroBanners } from './banner.service';
import { getBlogs } from './blog.service';
import { deleteBannerMedia } from '@/lib/banner-storage';
import {
  getFallbackMediaItems,
  addFallbackMediaItem,
  deleteFallbackMediaItem,
  getDeletedMediaUrls,
  recordDeletedMediaUrl,
} from '@/lib/media-fallback';

/**
 * Lấy các ảnh được admin lưu riêng trong bảng media_library (kèm dự phòng fallback)
 */
export async function getCustomMediaItems(): Promise<MediaItem[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          title: row.title || 'Ảnh liên kết',
          url: row.url,
          category: (row.category as MediaItem['category']) || 'custom',
          source: row.source || 'Thư viện link',
          createdAt: row.created_at,
          isDeletable: true,
        }));
      }
    } catch {
      // Bỏ qua lỗi schema và chuyển sang fallback
    }
  }
  return getFallbackMediaItems();
}

/**
 * Thêm ảnh từ link vào bảng media_library (kèm fallback nếu chưa tạo bảng)
 */
export async function addMediaItem(payload: AddMediaPayload): Promise<MediaItem | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('media_library')
        .insert({
          title: payload.title.trim() || 'Ảnh liên kết',
          url: payload.url.trim(),
          category: payload.category || 'custom',
          source: 'Thư viện link',
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          url: data.url,
          category: data.category,
          source: data.source,
          createdAt: data.created_at,
          isDeletable: true,
        };
      }
    } catch {
      // Fallback
    }
  }
  return addFallbackMediaItem(payload);
}

/**
 * Xóa ảnh khỏi thư viện và xóa tệp gốc trên Supabase Storage nếu có
 */
export async function deleteMediaItem(id: string, url?: string): Promise<boolean> {
  if (url) {
    await recordDeletedMediaUrl(url);
    if (url.includes('supabase.co/storage/v1/object/public/')) {
      await deleteBannerMedia(url);
    }
  }

  if (isSupabaseConfigured && !id.startsWith('local-')) {
    try {
      await supabase.from('media_library').delete().eq('id', id);
    } catch {
      // Fallback
    }
  }

  await deleteFallbackMediaItem(id);
  return true;
}

/**
 * Thu thập toàn bộ ảnh trong hệ thống (ảnh từ link, ảnh sản phẩm, banner, blog)
 */
export async function getAllMediaItems(): Promise<MediaItem[]> {
  const [customItems, products, banners, blogs, deletedUrls] = await Promise.all([
    getCustomMediaItems(),
    getAdminProducts().catch(() => []),
    getHeroBanners().catch(() => []),
    getBlogs().catch(() => []),
    getDeletedMediaUrls().catch(() => new Set<string>()),
  ]);

  const seenUrls = new Set<string>();
  const allMedia: MediaItem[] = [];

  const isValidAndNotDeleted = (url: string | null | undefined) => {
    return Boolean(url && !seenUrls.has(url) && !deletedUrls.has(url));
  };

  // 1. Ảnh do admin tự lưu từ Link / Upload
  for (const item of customItems) {
    if (isValidAndNotDeleted(item.url)) {
      seenUrls.add(item.url);
      allMedia.push({ ...item, isDeletable: true });
    }
  }

  // 2. Gom ảnh từ Banners
  for (const b of banners) {
    if (isValidAndNotDeleted(b.image)) {
      seenUrls.add(b.image);
      allMedia.push({
        id: `banner-${b.id}`,
        title: b.title || 'Hero Banner',
        url: b.image,
        category: 'banner',
        source: `Banner: ${b.title || 'Slide'}`,
        isDeletable: true,
      });
    }
  }

  // 3. Gom ảnh từ Blogs
  for (const post of blogs) {
    if (isValidAndNotDeleted(post.image)) {
      seenUrls.add(post.image);
      allMedia.push({
        id: `blog-${post.id}`,
        title: post.title || 'Bài viết Blog',
        url: post.image,
        category: 'blog',
        source: `Blog: ${post.title}`,
        isDeletable: true,
      });
    }
  }

  // 4. Gom ảnh từ Sản Phẩm
  for (const p of products) {
    if (isValidAndNotDeleted(p.defaultImage)) {
      seenUrls.add(p.defaultImage);
      allMedia.push({
        id: `prod-def-${p.id}`,
        title: `${p.name} (Ảnh chính)`,
        url: p.defaultImage,
        category: 'product',
        source: `Sản phẩm: ${p.name}`,
        isDeletable: true,
      });
    }
    if (Array.isArray(p.images)) {
      p.images.forEach((img, idx) => {
        if (isValidAndNotDeleted(img)) {
          seenUrls.add(img);
          allMedia.push({
            id: `prod-gal-${p.id}-${idx}`,
            title: `${p.name} (Ảnh #${idx + 2})`,
            url: img,
            category: 'product',
            source: `Sản phẩm: ${p.name}`,
            isDeletable: true,
          });
        }
      });
    }
    if (Array.isArray(p.flavors)) {
      p.flavors.forEach((f, idx) => {
        if (isValidAndNotDeleted(f.image)) {
          seenUrls.add(f.image as string);
          allMedia.push({
            id: `prod-flav-${p.id}-${idx}`,
            title: `${p.name} - ${f.name}`,
            url: f.image as string,
            category: 'product',
            source: `Hương vị: ${p.name} (${f.name})`,
            isDeletable: true,
          });
        }
      });
    }
  }

  return allMedia;
}
