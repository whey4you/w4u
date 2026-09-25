import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateProductData } from '@/lib/ai/product-generator';
import { assertAdminSession } from '@/lib/auth/admin-guard';

const requestSchema = z.object({
  productName: z.string().trim().min(2).max(250),
  brand: z.string().trim().optional(),
  category: z.string().optional(),
  targetField: z
    .enum(['all', 'ingredients', 'allergens', 'description', 'howToUse', 'macros'])
    .optional()
    .default('all'),
});

export async function POST(req: NextRequest) {
  if (!(await assertAdminSession())) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Yêu cầu quyền quản trị viên.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Tên sản phẩm không hợp lệ.' }, { status: 400 });
    }

    const data = await generateProductData({
      ...parsed.data,
      signal: req.signal,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[API /api/admin/ai/product] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo nội dung sản phẩm bằng AI. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
