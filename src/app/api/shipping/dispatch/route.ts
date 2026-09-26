import { NextRequest, NextResponse } from 'next/server';
import { verifyDispatchToken } from '@/lib/security/dispatch-token';
import { supabaseAdmin } from '@/lib/supabase/server';
import { fulfillOrderWithAllinGo } from '@/services/allingo-fulfillment.service';
import { getAllinGoWaybillPdfWithRetry } from '@/lib/allingo';
import { sendTelegramShipmentDispatchedNotice } from '@/services/telegram-notification.service';

function renderHtmlResponse(title: string, message: string, detailHtml: string, isSuccess: boolean = true) {
  const accentColor = isSuccess ? '#16a34a' : '#dc2626';
  const icon = isSuccess ? '🚀' : '⚠️';

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - Whey4You AllinGo Dispatch</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background-color: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #ffffff; border-radius: 24px; padding: 32px 24px; max-width: 440px; width: 100%; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); text-align: center; border: 1px solid #e2e8f0; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: ${accentColor}; }
    p { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 20px; }
    .box { background: #f1f5f9; border-radius: 16px; padding: 16px; margin-bottom: 24px; text-align: left; font-size: 13px; line-height: 1.8; color: #334155; }
    .box b { color: #0f172a; }
    .btn { display: inline-block; width: 100%; padding: 14px 20px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 100px; font-size: 14px; font-weight: 600; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${detailHtml}
    <a href="https://whey4you.vn/admin/orders" class="btn">Mở quản lý đơn hàng</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: isSuccess ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');

  if (!orderId || !token || !verifyDispatchToken(orderId, token)) {
    return renderHtmlResponse(
      'Liên kết không hợp lệ',
      'Yêu cầu gọi xe không hợp lệ hoặc đã hết hạn bảo mật.',
      '',
      false
    );
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_code, carrier_name, tracking_code, allingo_order_id, allingo_track_id, status')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return renderHtmlResponse('Không tìm thấy đơn hàng', 'Đơn hàng không tồn tại trong hệ thống.', '', false);
    }

    // Nếu đơn đã có mã vận đơn trước đó
    if (order.tracking_code || order.allingo_order_id) {
      const trackingCode = order.tracking_code || 'Đã tạo vận đơn';
      return renderHtmlResponse(
        'Đơn hàng đã được điều xe',
        'Vận đơn cho đơn hàng này đã được tạo trước đó. Tài xế đang trên đường tới lấy hàng.',
        `<div class="box">
          <div><b>Mã đơn:</b> #${order.order_code}</div>
          <div><b>Hãng vận chuyển:</b> ${order.carrier_name || 'AllinGo'}</div>
          <div><b>Mã vận đơn:</b> <code>${trackingCode}</code></div>
        </div>`,
        true
      );
    }

    // Thực hiện điều xe AllinGo
    const fulfillResult = await fulfillOrderWithAllinGo(order.id);

    if (!fulfillResult.success || !fulfillResult.trackingNumber) {
      return renderHtmlResponse(
        'Điều xe thất bại',
        fulfillResult.error || 'Không thể tạo vận đơn trên AllinGo. Vui lòng kiểm tra số dư ví AllinGo hoặc thử lại.',
        `<div class="box"><b>Mã đơn:</b> #${order.order_code}</div>`,
        false
      );
    }

    // Lấy link PDF vận đơn (nếu có)
    let waybillPdfUrl: string | undefined;
    if (fulfillResult.allingoOrderId) {
      const pdfRes = await getAllinGoWaybillPdfWithRetry(fulfillResult.allingoOrderId, 1, 2000);
      if (pdfRes.success && pdfRes.url) {
        waybillPdfUrl = pdfRes.url;
      }
    }

    // Bắn thông báo xác nhận thành công kèm PDF về Telegram
    void sendTelegramShipmentDispatchedNotice(
      order.order_code,
      fulfillResult.carrierName || order.carrier_name || 'Hỏa tốc AllinGo',
      fulfillResult.trackingNumber,
      fulfillResult.trackingUrl,
      waybillPdfUrl
    );

    return renderHtmlResponse(
      'Đã điều xe thành công!',
      'Hệ thống đã bắn cuốc sang hãng vận chuyển. Tài xế đang trên đường đến kho lấy hàng giao cho khách.',
      `<div class="box">
        <div><b>Mã đơn hàng:</b> #${order.order_code}</div>
        <div><b>Hãng vận chuyển:</b> ${fulfillResult.carrierName || order.carrier_name || 'AllinGo'}</div>
        <div><b>Mã vận đơn:</b> <code>${fulfillResult.trackingNumber}</code></div>
      </div>`,
      true
    );
  } catch (err: any) {
    console.error('[Dispatch Order Route Exception]:', err);
    return renderHtmlResponse(
      'Đã xảy ra lỗi',
      err?.message || 'Không thể hoàn tất điều xe lúc này.',
      '',
      false
    );
  }
}
