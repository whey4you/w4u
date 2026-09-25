import { NextResponse } from 'next/server';
import { getAllinGoProvinces } from '@/lib/allingo';

export async function GET() {
  try {
    const provinces = await getAllinGoProvinces();
    const data = provinces.map((p) => ({
      id: p.code,
      name: p.full_name || p.name,
      code: p.code,
    }));
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('[API Shipping Cities Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Không thể lấy danh sách tỉnh thành.' },
      { status: 500 }
    );
  }
}

