import { formatPrice } from '@/lib/utils';
import { getAllinGoWallet } from '@/lib/allingo/wallet';

let lastAlertTime = 0;
let lastAlertBalance = -1;
const ALERT_COOLDOWN_MS = 30 * 60 * 1000; // 30 phút giãn cách giữa các lần cảnh báo tự động

function escapeHtml(text?: string | null): string {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Gửi tin nhắn trực tiếp qua Telegram Bot
 */
async function sendTelegramMessage(text: string, inlineButtons?: { text: string; url?: string; callback_data?: string }[][], targetChatId?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = targetChatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram Finance] Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID.');
    return false;
  }

  const payload: Record<string, any> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  if (inlineButtons && inlineButtons.length > 0) {
    payload.reply_markup = {
      inline_keyboard: inlineButtons,
    };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error('[Telegram Finance Send Message Error]:', err);
    return false;
  }
}

/**
 * Báo cáo tài chính chi tiết số dư ví & COD AllinGo về Telegram
 */
export async function sendAllinGoFinanceReport(targetChatId?: string): Promise<boolean> {
  const { success, wallet, error } = await getAllinGoWallet();

  if (!success || !wallet) {
    const errorMsg = `❌ <b>Không thể truy vấn ví AllinGo</b>\nChi tiết lỗi: <code>${escapeHtml(error || 'Lỗi kết nối API')}</code>`;
    return sendTelegramMessage(errorMsg, undefined, targetChatId);
  }

  const credit = wallet.delivery_credit || 0;
  const codTotal = wallet.cod_outstanding ?? 0;
  const codPending = wallet.cod_pending ?? 0;
  const codApproved = wallet.cod_approved ?? 0;
  const codReady = wallet.cod_ready ?? 0;
  const isLow = credit < 100000;

  const statusEmoji = isLow ? '⚠️' : '✅';
  const creditStatus = isLow ? ' <i>(Sắp hết cước - Cần nạp thêm!)</i>' : '';

  let message = `📊 <b>BÁO CÁO TÀI CHÍNH VÍ ALLINGO</b>
━━━━━━━━━━━━━━━━━━━━
${statusEmoji} <b>Số dư ví cước (trả trước):</b> <code>${formatPrice(credit)}</code>${creditStatus}

📦 <b>TIỀN THU HỘ COD CỦA BẠN:</b>
• Tổng COD chưa nhận: <b>${formatPrice(codTotal)}</b>
• Đang chuyển giao (chờ thu): <b>${formatPrice(codPending)}</b>
• Đã đối soát với đối tác: <b>${formatPrice(codApproved)}</b>
• Sẵn sàng chi trả về Bank: <b>${formatPrice(codReady)}</b>`;

  if (wallet.postpaid_active) {
    message += `\n\n📋 <b>CÔNG NỢ TRẢ SAU:</b>
• Hạn mức: <b>${formatPrice(wallet.postpaid_limit || 0)}</b>
• Còn khả dụng: <b>${formatPrice(wallet.postpaid_available || 0)}</b>`;
  }

  const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  message += `\n━━━━━━━━━━━━━━━━━━━━\n⏱️ <i>Cập nhật lúc: ${timestamp}</i>`;

  const buttons = [
    [
      { text: '🌐 Mở Portal AllinGo', url: 'https://business.allingo.vn/wallet' },
      { text: '🔄 Cập nhật lại', callback_data: 'allingo_refresh_wallet' },
    ],
  ];

  return sendTelegramMessage(message, buttons, targetChatId);
}

/**
 * Kiểm tra và cảnh báo khi số dư ví AllinGo xuống thấp hơn ngưỡng an toàn
 */
export async function checkAndAlertLowAllinGoBalance(
  threshold: number = 100000,
  force: boolean = false
): Promise<{ isLow: boolean; balance: number }> {
  try {
    const { success, wallet } = await getAllinGoWallet();
    if (!success || !wallet) {
      return { isLow: false, balance: 0 };
    }

    const balance = wallet.delivery_credit || 0;
    const isLow = balance < threshold;

    if (!isLow) {
      return { isLow: false, balance };
    }

    const now = Date.now();
    // Chống spam: Nếu vừa gửi trong vòng 30 phút và số dư không giảm sâu hơn, bỏ qua
    if (!force && now - lastAlertTime < ALERT_COOLDOWN_MS && balance >= lastAlertBalance) {
      return { isLow: true, balance };
    }

    lastAlertTime = now;
    lastAlertBalance = balance;

    const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const alertMsg = `🚨 <b>CẢNH BÁO: VÍ CƯỚC ALLINGO SẮP HẾT TIỀN!</b>
━━━━━━━━━━━━━━━━━━━━
⚠️ <b>Số dư ví hiện tại:</b> <code>${formatPrice(balance)}</code>
🛡️ <b>Ngưỡng an toàn tối thiểu:</b> <code>${formatPrice(threshold)}</code>

Số dư ví cước trả trước không còn nhiều. Khi hết tiền, việc tạo vận đơn và gọi xe sẽ bị từ chối!
👉 <b>Vui lòng nạp thêm tiền (Top-up) vào AllinGo</b> để giao vận được liên tục.
━━━━━━━━━━━━━━━━━━━━
⏱️ <i>Thời gian cảnh báo: ${timestamp}</i>`;

    const buttons = [
      [{ text: '💳 Nạp tiền vào AllinGo ngay', url: 'https://business.allingo.vn/wallet' }],
    ];

    await sendTelegramMessage(alertMsg, buttons);
    return { isLow: true, balance };
  } catch (err) {
    console.error('[Check Low Balance Error]:', err);
    return { isLow: false, balance: 0 };
  }
}

/**
 * Gửi cảnh báo khẩn cấp khi việc tạo đơn bị từ chối do hết tiền (Error 402)
 */
export async function sendAllinGoOutOfCreditAlert(orderCode: string, errorDetail?: string): Promise<boolean> {
  const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const text = `⛔ <b>LỖI HẾT TIỀN VÍ ALLINGO - KHÔNG THỂ TẠO ĐƠN!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Mã đơn hàng:</b> <code>#${escapeHtml(orderCode)}</code>
❌ <b>Nguyên nhân:</b> Ví AllinGo đã hết tiền cước (Lỗi: <code>${escapeHtml(errorDetail || 'insufficient_wallet_credit')}</code>).
👉 <b>Hành động:</b> Hãy nạp thêm tiền vào AllinGo ngay, sau đó vào Admin hoặc Telegram bấm gọi xe lại!
━━━━━━━━━━━━━━━━━━━━
⏱️ <i>Thời gian: ${timestamp}</i>`;

  const buttons = [
    [{ text: '💳 Nạp tiền vào AllinGo', url: 'https://business.allingo.vn/wallet' }],
  ];

  return sendTelegramMessage(text, buttons);
}
