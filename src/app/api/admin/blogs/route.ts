import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBlogs, saveBlog, deleteBlog } from '@/services/blog.service';
import { BlogPost } from '@/types/blog';
import { slugify } from '@/lib/utils';

const blogSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1, 'Đường dẫn (slug) không được để trống').transform((val) => slugify(val)),
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  excerpt: z.string().optional().default(''),
  category: z.string().default('Khoa Học').transform((val) => {
    const map: Record<string, BlogPost['category']> = {
      'dinh dưỡng': 'Dinh Dưỡng',
      'tập luyện': 'Tập Luyện',
      'chính hãng': 'Review',
      'review': 'Review',
      'đánh giá': 'Review',
      'khoa học': 'Khoa Học',
    };
    return map[val.toLowerCase()] || 'Khoa Học';
  }),
  readTime: z.string().default('4 phút đọc'),
  date: z.string().optional(),
  image: z.string().optional().default('/blogs/whey-timing.jpg').transform((val) => val || '/blogs/whey-timing.jpg'),
  featured: z.boolean().optional().default(false),
  content: z.string().min(1, 'Nội dung bài viết không được để trống'),
  author: z.object({
    name: z.string().optional().default('Chuyên gia Whey4You'),
    role: z.string().optional().default('Chuyên gia Dinh dưỡng Thể thao'),
    avatar: z.string().optional(),
    verified: z.boolean().optional().default(true),
  }).optional(),
  keyTakeaways: z.array(z.string()).optional().default([]),
  relatedProductIds: z.array(z.string()).optional().default([]),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string().optional(),
    })
  ).optional().default([]),
});

export async function GET() {
  const blogs = await getBlogs();
  return NextResponse.json({ success: true, blogs });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = blogSchema.safeParse(json);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Dữ liệu bài viết không hợp lệ';
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const result = await saveBlog(parsed.data as BlogPost);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: parsed.data });
  } catch (error) {
    console.error('[API /api/admin/blogs] POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Missing slug parameter' }, { status: 400 });
    }

    const result = await deleteBlog(slug);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /api/admin/blogs] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
