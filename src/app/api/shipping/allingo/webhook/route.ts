import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/server';
import { verifyAllinGoWebhook, AllinGoWebhookPayload } from '@/lib/allingo';

export async function POST(req: NextRequest) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ success: false, error: 'Supabase admin chưa cấu hình.' }, { status: 500 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('X-AllinGo-Signature');

    // Xác thực chữ ký HMAC-SHA256 (bỏ qua nếu ở local dev không có secret)
    const isWebhookConfigured = Boolean(process.env.ALLINGO_WEBHOOK_SECRET);
    if (isWebhookConfigured && !verifyAllinGoWebhook(rawBody, signature)) {
      console.warn('[AllinGo Webhook] Chữ ký không hợp lệ.');
      return NextResponse.json({ success: false, error: 'Chữ ký webhook không hợp lệ' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as AllinGoWebhookPayload;
    const { type, data } = payload;
    const deliveryObj = data?.object;
    const orderRef = deliveryObj?.external_reference;
    const trackId = deliveryObj?.track_id;
    const partnerTrackId = deliveryObj?.delivery?.partner_track_id;

    // Tìm đơn hàng tương ứng
    let query = supabaseAdmin.from('orders').select('id, order_code, status, notes');
    if (orderRef) {
      query = query.eq('order_code', orderRef);
    } else if (trackId) {
      query = query.or(`allingo_track_id.eq.${trackId},tracking_code.eq.${trackId}`);
    } else if (partnerTrackId) {
      query = query.eq('tracking_code', partnerTrackId);
    } else {
      return NextResponse.json({ success: false, error: 'Không thể xác định đơn hàng' }, { status: 400 });
    }

    const { data: order, error: findError } = await query.maybeSingle();

    if (findError || !order) {
      console.warn(`[AllinGo Webhook] Bỏ qua vì không tìm thấy đơn: ref=${orderRef}, track=${trackId}`);
      return NextResponse.json({ success: true, message: 'Order ignored' }, { status: 200 });
    }

    let newStatus = order.status;
    const currentDeliveryStatus = deliveryObj?.delivery?.status || data?.new_status;

    if (type === 'delivery.completed' || currentDeliveryStatus === 'completed') {
      newStatus = 'completed';
    } else if (type === 'delivery.cancelled' || type === 'delivery.failed' || currentDeliveryStatus === 'canceled') {
      newStatus = 'cancelled';
    } else if (type === 'delivery.status_changed' || currentDeliveryStatus === 'in_transit' || currentDeliveryStatus === 'picked_up') {
      newStatus = 'shipping';
    }

    const timestamp = new Date().toLocaleString('vi-VN');
    const carrierName = deliveryObj?.delivery?.partner?.name || 'AllinGo';
    const logNote = `[${carrierName}: ${type} (${currentDeliveryStatus || 'cập nhật'}) lúc ${timestamp}]`;
    const updatedNotes = order.notes ? `${order.notes} | ${logNote}` : logNote;

    const updatePayload: Record<string, any> = {
      status: newStatus,
      notes: updatedNotes,
      updated_at: new Date().toISOString(),
    };

    if (partnerTrackId) updatePayload.tracking_code = partnerTrackId;
    if (deliveryObj?.delivery?.track_link) updatePayload.tracking_url = deliveryObj.delivery.track_link;

    await supabaseAdmin.from('orders').update(updatePayload).eq('id', order.id);

    console.log(`[AllinGo Webhook] Đơn ${order.order_code} chuyển sang trạng thái: ${newStatus}`);
    return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 });
  } catch (err: any) {
    console.error('[AllinGo Webhook Error]:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Lỗi xử lý webhook' }, { status: 400 });
  }
}
