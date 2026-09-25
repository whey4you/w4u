import { NextRequest, NextResponse } from 'next/server';
import { getAllShippingQuotesFormatted } from '@/lib/allingo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cityId, districtId, wardId, weightGrams = 1000, amount = 500000 } = body;

    if (!cityId || !districtId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã Tỉnh/Thành hoặc Quận/Huyện để tính cước.' },
        { status: 400 }
      );
    }

    const safeWeight = Math.max(100, Number(weightGrams) || 1000);
    const rates = await getAllShippingQuotesFormatted({
      provinceCode: String(cityId),
      districtCode: String(districtId),
      wardCode: wardId ? String(wardId) : undefined,
      weightGrams: safeWeight,
      amount: Number(amount) || 500000,
    });

    const defaultRate = rates[0] || null;

    return NextResponse.json({
      success: true,
      rates,
      rate: defaultRate, // Giữ tương thích ngược với code cũ
    });
  } catch (error: any) {
    console.error('[API Shipping Rates Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Không thể tính phí vận chuyển lúc này.' },
      { status: 500 }
    );
  }
}

