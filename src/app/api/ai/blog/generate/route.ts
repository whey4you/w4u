import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateBlogArticle } from '@/lib/ai/blog-generator';

const requestSchema = z.object({
  topic: z.string().trim().min(2).max(300),
  articleType: z.enum(['scientific', 'product_review']).optional().default('scientific'),
  targetProductId: z.string().optional(),
  tone: z.string().optional(),
  keywords: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Dữ liệu đầu vào không hợp lệ.' }, { status: 400 });
    }

    const blogData = await generateBlogArticle({
      ...parsed.data,
      signal: req.signal,
    });

    return NextResponse.json({
      success: true,
      data: blogData,
    });
  } catch (error) {
    console.error('[API /api/ai/blog/generate] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi khi tạo bài viết bằng AI' },
      { status: 500 }
    );
  }
}
