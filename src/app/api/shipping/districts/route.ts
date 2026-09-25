import { NextRequest, NextResponse } from 'next/server';
import { getAllinGoDistricts } from '@/lib/allingo';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get('cityId');

  if (!cityId) {
    return NextResponse.json(
      { success: false, error: 'Thiếu tham số cityId.' },
      { status: 400 }
    );
  }

  try {
    const districts = await getAllinGoDistricts(cityId);
    const data = districts.map((d) => ({
      id: d.code,
      name: d.full_name || d.name,
      code: d.code,
    }));
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('[API Shipping Districts Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Không thể lấy danh sách quận huyện.' },
      { status: 500 }
    );
  }
}

