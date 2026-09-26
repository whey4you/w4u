import { NextRequest, NextResponse } from 'next/server';
import { getPayOS, isPayOSConfigured } from '@/lib/payos';
import { isSupabaseAdminConfigured } from '@/lib/supabase/server';
import { commitPaidOrder } from '@/services/checkout-committer.service';

export async function POST(req: NextRequest) {
  if (!isPayOSConfigured || !isSupabaseAdminConfigured) {
    return NextResponse.json(
      { success: false, error: 'Hệ thống chưa cấu hình PayOS hoặc Supabase.' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const payos = getPayOS();

    // Xác thực chữ ký số HMAC từ PayOS
    const webhookData = await payos.webhooks.verify(body);

    if (!webhookData) {
      return NextResponse.json({ success: false, error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
    }

    const { orderCode, code } = webhookData;

    // code === '00' biểu thị giao dịch thanh toán thành công
    if (code === '00') {
      const commitRes = await commitPaidOrder(orderCode);
      if (!commitRes.success) {
        console.error('[PayOS Webhook] Lỗi lưu đơn hàng:', commitRes.error);
      } else {
        console.log(`[PayOS Webhook] Đơn hàng ${commitRes.orderCode || `W4U-${orderCode}`} đã được lưu chính thức vào orders và kích hoạt AllinGo!`);
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 });
  } catch (error: any) {
    console.error('[PayOS Webhook Error]:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Xác thực webhook thất bại' },
      { status: 400 }
    );
  }
}
