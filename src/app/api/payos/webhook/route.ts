import { NextRequest, NextResponse } from 'next/server';
import { getPayOS, isPayOSConfigured } from '@/lib/payos';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/server';

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
      const orderSearchCode = `W4U-${orderCode}`;

      // Tìm đơn hàng tương ứng theo order_code
      const { data: order, error: findError } = await supabaseAdmin
        .from('orders')
        .select('id, status, notes')
        .eq('order_code', orderSearchCode)
        .maybeSingle();

      if (findError) {
        console.error('[PayOS Webhook] Lỗi truy vấn đơn hàng:', findError);
      }

      if (order && order.status === 'pending') {
        const updatedNotes = order.notes
          ? `${order.notes} | [PayOS: Đã nhận thanh toán qua VietQR lúc ${new Date().toLocaleString('vi-VN')}]`
          : `[PayOS: Đã nhận thanh toán qua VietQR lúc ${new Date().toLocaleString('vi-VN')}]`;

        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'processing',
            notes: updatedNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        if (updateError) {
          console.error('[PayOS Webhook] Lỗi cập nhật trạng thái đơn:', updateError);
        } else {
          console.log(`[PayOS Webhook] Đơn hàng ${orderSearchCode} đã chuyển sang "processing"`);
        }
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
