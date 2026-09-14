import { supabase } from '@/lib/supabase/client';
import { BlogPost, BlogSource } from '@/types/blog';
import { slugify, extractProductIdsFromContent } from '@/lib/utils';

export interface RawBlogRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author: string | null;
  category: string | null;
  read_time: string | null;
  published_at: string | null;
  featured?: boolean | null;
  key_takeaways?: string[] | null;
  related_product_ids?: string[] | null;
  author_role?: string | null;
  author_avatar?: string | null;
  author_verified?: boolean | null;
  sources?: BlogSource[] | null;
}

interface ExtMetadata {
  keyTakeaways?: string[];
  relatedProductIds?: string[];
  authorRole?: string;
  authorAvatar?: string;
  authorVerified?: boolean;
  featured?: boolean;
  sources?: BlogSource[];
}

export function mapRowToBlogPost(row: RawBlogRow): BlogPost {
  let cleanContent = row.content || '';
  let ext: ExtMetadata = {};

  const extMatch = cleanContent.match(/^<!--METADATA_EXT:([\s\S]*?)-->\s*/);
  if (extMatch) {
    try {
      ext = JSON.parse(extMatch[1]);
      cleanContent = cleanContent.replace(extMatch[0], '');
    } catch {
      // Ignored if malformed
    }
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    content: cleanContent,
    category: (row.category === 'Chính Hãng' ? 'Review' : (row.category as BlogPost['category'])) || 'Khoa Học',
    readTime: row.read_time || '4 phút đọc',
    date: row.published_at ? new Date(row.published_at).toLocaleDateString('vi-VN') : 'Mới cập nhật',
    image: row.cover_image || '/blogs/whey-timing.jpg',
    featured: ext.featured ?? Boolean(row.featured),
    author: {
      name: row.author || 'WHEY4YOU',
      role: ext.authorRole || row.author_role || 'Chuyên gia Dinh dưỡng Thể thao',
      avatar: ext.authorAvatar || row.author_avatar || undefined,
      verified: ext.authorVerified ?? (row.author_verified !== false),
    },
    keyTakeaways: ext.keyTakeaways || row.key_takeaways || [],
    relatedProductIds: Array.from(
      new Set([
        ...(ext.relatedProductIds || row.related_product_ids || []).filter(
          (id) => typeof id === 'string' && id && !id.includes('id-san-pham')
        ),
        ...extractProductIdsFromContent(cleanContent),
      ])
    ),
    sources: ext.sources || (row.sources as BlogSource[]) || [],
  };
}


export async function getBlogs(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return (data as RawBlogRow[]).map(mapRowToBlogPost);
  } catch (err) {
    console.error('[BlogService] getBlogs error:', err);
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const cleanSlug = slugify(slug);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapRowToBlogPost(data as RawBlogRow);
  } catch (err) {
    console.error('[BlogService] getBlogBySlug error:', err);
    return null;
  }
}

export async function saveBlog(post: BlogPost): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanSlug = slugify(post.slug || post.title || 'bai-viet-moi');
    const id = post.id || cleanSlug;
    const publishedAt = new Date().toISOString();
    const contentProductIds = extractProductIdsFromContent(post.content);
    const validExplicit = (post.relatedProductIds || []).filter(
      (id) => typeof id === 'string' && id && !id.includes('id-san-pham')
    );
    const mergedRelatedProductIds = Array.from(new Set([...validExplicit, ...contentProductIds]));

    // 1. Thử lưu dạng mở rộng (nếu database đã chạy migration đầy đủ)
    const fullPayload = {
      id,
      title: post.title,
      slug: cleanSlug,
      excerpt: post.excerpt,
      content: post.content || '',
      cover_image: post.image || '/blogs/whey-timing.jpg',
      author: post.author?.name || 'Whey4You Expert',
      author_role: post.author?.role || 'Chuyên gia Dinh dưỡng Thể thao',
      author_avatar: post.author?.avatar || '',
      author_verified: post.author?.verified ?? true,
      category: post.category,
      read_time: post.readTime,
      featured: Boolean(post.featured),
      key_takeaways: post.keyTakeaways || [],
      related_product_ids: mergedRelatedProductIds,
      sources: post.sources || [],
      published_at: publishedAt,
    };

    const firstTry = await supabase.from('blogs').upsert(fullPayload, { onConflict: 'slug' });
    if (!firstTry.error) {
      return { success: true };
    }

    // 2. Fallback an toàn: Database Supabase dùng schema cơ bản
    // Mã hóa các trường mở rộng vào thẻ METADATA_EXT ở đầu content
    const extData: ExtMetadata = {
      keyTakeaways: post.keyTakeaways,
      relatedProductIds: mergedRelatedProductIds,
      authorRole: post.author?.role,
      authorAvatar: post.author?.avatar,
      authorVerified: post.author?.verified,
      featured: post.featured,
      sources: post.sources,
    };


    const corePayload = {
      id,
      title: post.title,
      slug: cleanSlug,
      excerpt: post.excerpt,
      content: `<!--METADATA_EXT:${JSON.stringify(extData)}-->\n\n${post.content || ''}`,
      cover_image: post.image || '/blogs/whey-timing.jpg',
      author: post.author?.name || 'Whey4You Expert',
      category: post.category,
      read_time: post.readTime,
      published_at: publishedAt,
    };

    const secondTry = await supabase.from('blogs').upsert(corePayload, { onConflict: 'slug' });
    if (secondTry.error) {
      throw secondTry.error;
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Không thể lưu bài viết';
    console.error('[BlogService] saveBlog error:', message);
    return { success: false, error: message };
  }
}

export async function deleteBlog(slug: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('blogs').delete().eq('slug', slug);
    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Không thể xóa bài viết';
    console.error('[BlogService] deleteBlog error:', message);
    return { success: false, error: message };
  }
}
