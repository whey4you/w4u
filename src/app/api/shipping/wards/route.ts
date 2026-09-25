import { NextRequest, NextResponse } from 'next/server';
import { getAllinGoWards } from '@/lib/allingo';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtId = searchParams.get('districtId');

  if (!districtId) {
    return NextResponse.json(
      { success: false, error: 'Thiếu tham số districtId.' },
      { status: 400 }
    );
  }

  try {
    const wards = await getAllinGoWards(districtId);
    const data = wards.map((w) => ({
      id: w.code,
      name: w.full_name || w.name,
      code: w.code,
    }));
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('[API Shipping Wards Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Không thể lấy danh sách phường xã.' },
      { status: 500 }
    );
  }
}

