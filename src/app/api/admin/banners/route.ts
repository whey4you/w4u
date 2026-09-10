import { NextResponse } from 'next/server';
import { getHeroBanners, saveHeroBanners, deleteHeroBanner } from '@/services/banner.service';
import { HeroBannerItem } from '@/config/hero-banners';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banners = await getHeroBanners();
    return NextResponse.json({ success: true, data: banners });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách banner' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { banners } = body as { banners: HeroBannerItem[] };

    if (!Array.isArray(banners)) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu banners không hợp lệ' },
        { status: 400 }
      );
    }

    const saved = await saveHeroBanners(banners);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Lỗi khi lưu vào Supabase. Vui lòng kiểm tra bảng hero_banners.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã lưu cấu hình banner lên Supabase thành công',
      data: banners,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID banner cần xóa' },
        { status: 400 }
      );
    }

    const ok = await deleteHeroBanner(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Không thể xóa banner trên Supabase' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa banner vĩnh viễn trên Supabase thành công',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi xóa banner' },
      { status: 500 }
    );
  }
}
