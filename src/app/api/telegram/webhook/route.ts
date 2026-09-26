import { NextRequest, NextResponse } from 'next/server';
import { sendAllinGoFinanceReport } from '@/services/telegram-finance.service';

/**
 * Xử lý webhook từ Telegram Bot
 * Hỗ trợ các lệnh: /sodu, /vi, /allingo, /wallet, /taichinh, /topup, /help
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: 'Empty body' }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const allowedChatId = process.env.TELEGRAM_CHAT_ID;

    // 1. Xử lý nút bấm Inline Keyboard Callback (ví dụ: nút "Làm mới số dư")
    if (body.callback_query) {
      const cb = body.callback_query;
      const chatId = String(cb.message?.chat?.id || '');

      if (token && cb.id) {
        // Trả lời callback ngay để Telegram tắt hiệu ứng xoay loading của nút
        void fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: cb.id, text: 'Đang cập nhật số dư AllinGo...' }),
        }).catch(() => null);
      }

      if (cb.data === 'allingo_refresh_wallet' && (!allowedChatId || chatId === allowedChatId)) {
        await sendAllinGoFinanceReport(chatId);
      }
      return NextResponse.json({ ok: true });
    }

    // 2. Xử lý tin nhắn chat từ người dùng
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat?.id || '');
    const rawText = String(message.text).trim().toLowerCase();
    const command = rawText.split(' ')[0].replace(/@\w+$/, ''); // Bỏ @bot_name nếu gõ trong nhóm

    // Bảo mật: Chỉ cho phép admin / chat_id đã cấu hình truy vấn tài chính
    if (allowedChatId && chatId !== allowedChatId) {
      if (['/sodu', '/vi', '/allingo', '/wallet', '/taichinh'].includes(command)) {
        if (token) {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '⛔ <i>Bạn không có quyền truy cập thông tin tài chính của cửa hàng.</i>',
              parse_mode: 'HTML',
            }),
          });
        }
      }
      return NextResponse.json({ ok: true });
    }

    if (['/sodu', '/vi', '/allingo', '/wallet', '/taichinh'].includes(command)) {
      await sendAllinGoFinanceReport(chatId);
      return NextResponse.json({ ok: true });
    }

    if (command === '/topup' || command === '/naptien') {
      const topupMsg = `💳 <b>NẠP TIỀN VÍ VẬN CHUYỂN ALLINGO</b>
━━━━━━━━━━━━━━━━━━━━
Để nạp tiền vào ví cước AllinGo:
1. Mở trang quản lý tài chính AllinGo bên dưới.
2. Chọn <b>Ví / Nạp tiền</b> (Top-up qua VietQR hoặc chuyển khoản).
3. Tiền sẽ được cộng tức thì vào số dư cước để tiếp tục gọi xe.

👉 <a href="https://business.allingo.vn/wallet"><b>Bấm vào đây để nạp tiền AllinGo</b></a>`;

      if (token) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: topupMsg,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (command === '/start' || command === '/help') {
      const helpMsg = `🤖 <b>WHEY4YOU TELEGRAM BOT</b>
━━━━━━━━━━━━━━━━━━━━
Danh sách lệnh tra cứu nhanh:
• <code>/sodu</code> hoặc <code>/vi</code>: Báo cáo số dư ví cước & COD AllinGo
• <code>/topup</code>: Link nạp tiền cước vận chuyển AllinGo
• <code>/help</code>: Xem hướng dẫn sử dụng bot

<i>Bot tự động cảnh báo khi ví cước AllinGo rơi xuống dưới 100.000 ₫ hoặc khi có đơn hàng mới.</i>`;

      if (token) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: helpMsg,
            parse_mode: 'HTML',
          }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Telegram Webhook Handler Error]:', err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Whey4You Telegram Bot Webhook',
    timestamp: new Date().toISOString(),
  });
}
