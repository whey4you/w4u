import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { HeroBannerItem } from '@/config/hero-banners';

interface HeroBannerRow {
  id: string;
  title: string;
  image: string;
  media_type?: 'image' | 'video';
  video_url?: string;
  href: string;
  order_index: number;
}

/**
 * Lấy danh sách Hero Banner từ Supabase (sắp xếp theo order_index)
 */
export async function getHeroBanners(): Promise<HeroBannerItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('id, title, image, media_type, video_url, href, order_index')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    return (data as HeroBannerRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      image: row.image,
      media_type: (row.media_type as 'image' | 'video') || 'image',
      video_url: row.video_url || undefined,
      href: row.href,
    }));
  } catch (err) {
    console.error('[BannerService] getHeroBanners error:', err);
    return [];
  }
}

/**
 * Xóa một Hero Banner trực tiếp trên Supabase theo ID
 */
export async function deleteHeroBanner(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('hero_banners').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[BannerService] deleteHeroBanner error:', err);
    return false;
  }
}

/**
 * Lưu toàn bộ danh sách Hero Banner vào Supabase
 * - Dùng upsert để thêm mới hoặc cập nhật theo id
 * - Xóa các banner đã bị loại khỏi danh sách
 */
export async function saveHeroBanners(banners: HeroBannerItem[]): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('[BannerService] Supabase chưa được cấu hình, không thể lưu banner');
    return false;
  }

  try {
    if (banners.length === 0) {
      // Nếu danh sách rỗng, xóa toàn bộ banner hiện có trong bảng
      const { error: delAllErr } = await supabase
        .from('hero_banners')
        .delete()
        .neq('id', '___NON_EXISTENT_ID___');
      if (delAllErr) throw delAllErr;
      return true;
    }

    // 1. Upsert toàn bộ banners mới (kèm order_index theo vị trí trong mảng)
    const rows = banners.map((b, idx) => ({
      id: b.id,
      title: b.title,
      image: b.image,
      media_type: b.media_type || 'image',
      video_url: b.video_url || null,
      href: b.href,
      order_index: idx,
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('hero_banners')
      .upsert(rows, { onConflict: 'id' });

    if (upsertError) throw upsertError;

    // 2. Xóa banner không còn trong danh sách mới (cú pháp PostgREST in.(id1,id2))
    const keepIds = banners.map((b) => b.id);
    const { error: deleteError } = await supabase
      .from('hero_banners')
      .delete()
      .not('id', 'in', `(${keepIds.join(',')})`);

    if (deleteError) throw deleteError;

    return true;
  } catch (err: unknown) {
    console.error('[BannerService] saveHeroBanners error:', err);
    return false;
  }
}
