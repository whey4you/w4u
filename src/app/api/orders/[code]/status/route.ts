import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/server';

interface Params {
  params: Promise<{ code: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ success: false, error: 'Chưa cấu hình Supabase' }, { status: 500 });
  }

  const { code } = await params;
  const cleanCode = decodeURIComponent(code).trim();

  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('order_code, status, payment_method, total_amount')
      .or(`order_code.eq.${cleanCode},order_code.eq.W4U-${cleanCode}`)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const isPaid = order.status !== 'pending' && order.status !== 'cancelled';

    return NextResponse.json({
      success: true,
      orderCode: order.order_code,
      status: order.status,
      paymentMethod: order.payment_method,
      isPaid,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Lỗi kiểm tra trạng thái' },
      { status: 500 }
    );
  }
}
