import { formatPrice } from '@/lib/utils';
import { generateDispatchToken } from '@/lib/security/dispatch-token';

export interface TelegramOrderAlertItem {
  product_name: string;
  flavor_name?: string | null;
  price: number;
  quantity: number;
}

export interface TelegramOrderAlertPayload {
  orderId?: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress: string;
  totalAmount: number;
  subtotal?: number;
  discountAmount?: number;
  couponCode?: string | null;
  shippingFee?: number;
  paymentMethod?: string;
  depositAmount?: number;
  codRemaining?: number;
  carrierName?: string | null;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  allingoOrderId?: string | null;
  notes?: string | null;
  items: TelegramOrderAlertItem[];
  waybillPdfUrl?: string | null;
  isInstantDelivery?: boolean;
}

function escapeHtml(text?: string | null): string {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildOrderMessage(payload: TelegramOrderAlertPayload): string {
  const isCod = payload.paymentMethod === 'cod';
  const codRemain = typeof payload.codRemaining === 'number' ? payload.codRemaining : 0;
  const deposit = payload.depositAmount || 0;

  let payStatus = '💳 Đã thanh toán 100% qua VietQR';
  if (isCod) {
    payStatus = deposit > 0
      ? `💵 COD (Đã cọc ${formatPrice(deposit)} qua VietQR - Thu còn lại: ${formatPrice(codRemain)})`
      : `💵 COD (Thu đủ 100%: ${formatPrice(codRemain || payload.totalAmount)})`;
  }

  const itemsList = payload.items && payload.items.length > 0
    ? payload.items.map((it) => {
        const flavor = it.flavor_name ? ` (Vị: ${escapeHtml(it.flavor_name)})` : '';
        return `• <b>${escapeHtml(it.product_name)}</b>${flavor} x <b>${it.quantity}</b>: <i>${formatPrice(it.price * it.quantity)}</i>`;
      }).join('\n')
    : '• <i>Không có dữ liệu sản phẩm</i>';

  const carrierInfo = payload.carrierName || 'AllinGo';
  const isInstantAwaiting = Boolean(payload.isInstantDelivery && !payload.trackingCode);
  const trackingInfo = payload.trackingCode
    ? `<code>${escapeHtml(payload.trackingCode)}</code>`
    : (isInstantAwaiting ? '⏳ <i>Chờ Shop bấm gọi xe...</i>' : '<i>Đang cập nhật...</i>');

  const headerTitle = isInstantAwaiting
    ? `⚡ <b>CÓ ĐƠN HỎA TỐC MỚI #${escapeHtml(payload.orderCode)}</b>`
    : `🔔 <b>CÓ ĐƠN HÀNG MỚI #${escapeHtml(payload.orderCode)}</b>`;

  return `${headerTitle}
━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> ${escapeHtml(payload.customerName)}
📱 <b>Số điện thoại:</b> <code>${escapeHtml(payload.customerPhone)}</code>
📍 <b>Địa chỉ:</b> ${escapeHtml(payload.customerAddress)}
${payload.customerEmail ? `✉️ <b>Email:</b> ${escapeHtml(payload.customerEmail)}\n` : ''}
📦 <b>DANH SÁCH SẢN PHẨM:</b>
${itemsList}

💰 <b>CHI TIẾT THANH TOÁN:</b>
• Tiền hàng: ${formatPrice(payload.subtotal || payload.totalAmount)}
${payload.discountAmount ? `• Giảm giá (${escapeHtml(payload.couponCode || 'Voucher')}): -${formatPrice(payload.discountAmount)}\n` : ''}• Phí vận chuyển: ${payload.shippingFee ? formatPrice(payload.shippingFee) : 'Miễn phí'}
👉 <b>TỔNG THANH TOÁN:</b> <b>${formatPrice(payload.totalAmount)}</b>
• <b>Trạng thái:</b> ${payStatus}

🚚 <b>VẬN CHUYỂN:</b>
• Đối tác: <b>${escapeHtml(carrierInfo)}</b>
• Mã vận đơn: ${trackingInfo}
${payload.notes ? `📝 <b>Ghi chú shipper:</b> <i>${escapeHtml(payload.notes)}</i>\n` : ''}${isInstantAwaiting ? '\n⚠️ <b>LƯU Ý:</b> Shop hãy đóng gói hàng xong, rồi bấm nút <b>[⚡ BẤM GỌI XE ALLINGO]</b> ngay bên dưới để tài xế tới lấy!' : ''}`;
}

async function sendTelegramDoc(token: string, chatId: string, pdfUrl: string, filename: string, caption?: string) {
  try {
    const fileRes = await fetch(pdfUrl);
    if (fileRes.ok) {
      const arrayBuffer = await fileRes.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('document', blob, filename);
      if (caption) formData.append('caption', caption);

      return await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
        method: 'POST',
        body: formData,
      });
    }
  } catch (err) {
    console.warn('[Telegram Stream Doc Warn]:', err);
  }

  // Fallback gửi qua URL trực tiếp
  return await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, document: pdfUrl, caption }),
  });
}

/**
 * Gửi thông báo đơn hàng mới và file PDF vận đơn qua Telegram Bot
 */
export async function sendNewOrderTelegramAlert(
  payload: TelegramOrderAlertPayload
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { success: false, skipped: true };
  }

  try {
    const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const adminUrl = rawAppUrl.startsWith('http://localhost') || !rawAppUrl
      ? 'https://whey4you.vn/admin/orders'
      : `${rawAppUrl}/admin/orders`;

    const inlineKeyboard: Array<Array<{ text: string; url: string }>> = [];

    // Nếu là đơn Hỏa Tốc đang chờ Shop đóng gói -> thêm nút gọi xe lên đầu
    if (payload.isInstantDelivery && !payload.trackingCode && payload.orderId) {
      const baseUrl = rawAppUrl.startsWith('http') ? rawAppUrl : 'https://whey4you.vn';
      const dispatchUrl = `${baseUrl}/api/shipping/dispatch?orderId=${encodeURIComponent(payload.orderId)}&token=${generateDispatchToken(payload.orderId)}`;
      inlineKeyboard.push([{ text: '⚡ BẤM GỌI XE ALLINGO NGAY', url: dispatchUrl }]);
    }

    const actionRow = [];
    if (payload.trackingUrl && payload.trackingUrl.startsWith('http')) {
      actionRow.push({ text: '🚚 Tra cứu AllinGo', url: payload.trackingUrl });
    }
    actionRow.push({ text: '📦 Mở đơn Admin', url: adminUrl });
    inlineKeyboard.push(actionRow);

    if (payload.customerPhone) {
      const cleanPhone = payload.customerPhone.replace(/\D/g, '');
      if (cleanPhone) {
        inlineKeyboard.push([{ text: `💬 Nhắn Zalo khách (${payload.customerPhone})`, url: `https://zalo.me/${cleanPhone}` }]);
      }
    }

    // 1. Gửi tin nhắn tóm tắt đơn hàng (HTML)
    const msgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildOrderMessage(payload),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: inlineKeyboard },
      }),
    });

    if (!msgRes.ok) {
      const errText = await msgRes.text();
      console.error('[Telegram sendMessage Error]:', errText);
    }

    // 2. Gửi tệp PDF vận đơn nếu có
    if (payload.waybillPdfUrl) {
      const fileName = `VanDon_${payload.trackingCode || payload.orderCode}.pdf`;
      const caption = `📄 Vận đơn ${payload.carrierName || 'AllinGo'} - Đơn ${payload.orderCode}`;
      await sendTelegramDoc(token, chatId, payload.waybillPdfUrl, fileName, caption);
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Telegram Alert Exception]:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Gửi thông báo xác nhận đã điều xe thành công từ nút Telegram
 */
export async function sendTelegramShipmentDispatchedNotice(
  orderCode: string,
  carrierName: string,
  trackingCode: string,
  trackingUrl?: string,
  waybillPdfUrl?: string
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = `🚀 <b>ĐÃ ĐIỀU XE ALLINGO THÀNH CÔNG CHO ĐƠN #${escapeHtml(orderCode)}!</b>
━━━━━━━━━━━━━━━━━━━━
🚚 <b>Hãng vận chuyển:</b> ${escapeHtml(carrierName)}
📦 <b>Mã vận đơn:</b> <code>${escapeHtml(trackingCode)}</code>
⏱️ Tài xế đang trên đường tới kho nhận hàng để giao hỏa tốc cho khách!`;

  const inlineKeyboard: Array<Array<{ text: string; url: string }>> = [];
  if (trackingUrl && trackingUrl.startsWith('http')) {
    inlineKeyboard.push([{ text: '🚚 Tra cứu AllinGo', url: trackingUrl }]);
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
    }),
  }).catch(() => null);

  if (waybillPdfUrl) {
    const fileName = `VanDon_${trackingCode || orderCode}.pdf`;
    const caption = `📄 Vận đơn ${carrierName} - Đơn ${orderCode}`;
    await sendTelegramDoc(token, chatId, waybillPdfUrl, fileName, caption).catch(() => null);
  }
}
