import { NextResponse } from 'next/server';
import { getAllMediaItems, addMediaItem, deleteMediaItem } from '@/services/media.service';
import { AddMediaPayload } from '@/types/media';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getAllMediaItems();
    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách ảnh thư viện' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AddMediaPayload;
    if (!body || !body.url) {
      return NextResponse.json(
        { success: false, error: 'Đường dẫn ảnh (URL) không được để trống' },
        { status: 400 }
      );
    }

    const created = await addMediaItem(body);
    if (!created) {
      return NextResponse.json(
        { success: false, error: 'Không thể lưu ảnh vào CSDL Supabase' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: created });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi thêm ảnh' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const url = searchParams.get('url');

    if (!id && !url) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin ảnh cần xóa' },
        { status: 400 }
      );
    }

    const ok = await deleteMediaItem(id || 'unknown', url || undefined);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Không thể xóa ảnh từ hệ thống' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Đã xóa ảnh thành công' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi xóa ảnh' },
      { status: 500 }
    );
  }
}
