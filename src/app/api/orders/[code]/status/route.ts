import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/server';
import { getPayOS, isPayOSConfigured } from '@/lib/payos';
import { commitPaidOrder } from '@/services/checkout-committer.service';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';

interface Params {
  params: Promise<{ code: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const clientIp = getClientIp(_req);
  const rateCheck = checkRateLimit(`order_status:${clientIp}`, 40, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, error: 'Quá nhiều yêu cầu kiểm tra trạng thái. Vui lòng thử lại sau.' },
      { status: 429 }
    );
  }

  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ success: false, error: 'Chưa cấu hình Supabase' }, { status: 500 });
  }

  const { code } = await params;
  const cleanCode = decodeURIComponent(code).trim();
  const numericCode = extractNumericCode(cleanCode);

  try {
    // 1. Kiểm tra đơn hàng chính thức trong bảng orders
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, order_code, status, payment_method, total_amount, tracking_code, carrier_name, tracking_url')
      .or(`order_code.eq.${cleanCode},order_code.eq.W4U-${cleanCode}`)
      .maybeSingle();

    if (order) {
      if (order.status !== 'pending' && order.status !== 'cancelled') {
        const trackingCode = order.tracking_code || null;
        const carrierName = order.carrier_name || 'SPX Express';
        const trackingUrl = order.tracking_url || (trackingCode ? `https://spx.vn/track?bill=${trackingCode}` : null);

        return NextResponse.json({
          success: true,
          orderCode: order.order_code,
          status: order.status,
          paymentMethod: order.payment_method,
          isPaid: true,
          trackingCode,
          carrierName,
          trackingUrl,
        });
      }
    }

    // 2. Nếu chưa có trong orders, kiểm tra bản ghi chờ thanh toán trong pending_checkouts
    if (numericCode) {
      const { data: draft } = await supabaseAdmin
        .from('pending_checkouts')
        .select('id, order_code, numeric_code, payment_method')
        .eq('numeric_code', numericCode)
        .maybeSingle();

      if (draft && isPayOSConfigured) {
        try {
          const payos = getPayOS();
          const paymentInfo = await payos.paymentRequests.get(numericCode);

          if (paymentInfo && paymentInfo.status === 'PAID') {
            // PayOS xác nhận đã chuyển tiền -> commit ngay vào bảng orders
            await commitPaidOrder(numericCode);

            // Truy vấn lấy mã vận đơn SPX vừa được tạo
            const { data: committedOrder } = await supabaseAdmin
              .from('orders')
              .select('tracking_code, carrier_name, tracking_url')
              .eq('order_code', draft.order_code)
              .maybeSingle();

            const trackingCode = committedOrder?.tracking_code || null;
            const carrierName = committedOrder?.carrier_name || 'SPX Express';
            const trackingUrl = committedOrder?.tracking_url || (trackingCode ? `https://spx.vn/track?bill=${trackingCode}` : null);

            return NextResponse.json({
              success: true,
              orderCode: draft.order_code,
              status: 'processing',
              paymentMethod: draft.payment_method,
              isPaid: true,
              trackingCode,
              carrierName,
              trackingUrl,
            });
          }
        } catch (payosErr: any) {
          console.warn('[OrderStatus Polling] PayOS check warn:', payosErr?.message);
        }

        // Vẫn đang chờ khách chuyển tiền
        return NextResponse.json({
          success: true,
          orderCode: draft.order_code,
          status: 'pending',
          paymentMethod: draft.payment_method,
          isPaid: false,
        });
      }
    }

    if (!order) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      orderCode: order.order_code,
      status: order.status,
      paymentMethod: order.payment_method,
      isPaid: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Lỗi kiểm tra trạng thái' },
      { status: 500 }
    );
  }
}

/** Trích xuất mã số từ chuỗi code (Ví dụ: "W4U-12345678" -> 12345678) */
function extractNumericCode(orderCode: string): number | null {
  const match = orderCode.match(/\d+/);
  return match ? Number(match[0]) : null;
}
