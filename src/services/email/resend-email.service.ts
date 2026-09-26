import { InvoiceEmailData, renderInvoiceEmailHtml, renderInvoiceEmailPlainText } from './invoice-email-template';
import { sendGmailInvoiceEmail } from './gmail-smtp.service';

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Gửi email hóa đơn xác nhận đơn hàng:
 * 1. Ưu tiên Gmail SMTP (khi cấu hình GMAIL_APP_PASSWORD) để gửi trực tiếp từ whey4you.owner@gmail.com đến bất kỳ khách hàng nào.
 * 2. Fallback sang Resend API nếu cấu hình RESEND_API_KEY.
 */
export async function sendOrderInvoiceEmail(data: InvoiceEmailData): Promise<SendEmailResult> {
  if (!data.customerEmail || !data.customerEmail.includes('@')) {
    console.warn(`[Order Email] Bỏ qua gửi email: Địa chỉ email không hợp lệ (${data.customerEmail})`);
    return { success: false, error: 'Địa chỉ email người nhận không hợp lệ.' };
  }

  // 1. Ưu tiên gửi trực tiếp bằng tài khoản Gmail của Shop (qua App Password)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const gmailResult = await sendGmailInvoiceEmail(data);
      if (gmailResult.success) {
        return gmailResult;
      }
      console.warn('[Order Email] Gửi qua Gmail SMTP không thành công, thử fallback sang Resend...');
    } catch (gmailErr) {
      console.error('[Order Email] Lỗi Gmail SMTP:', gmailErr);
    }
  }

  // 2. Gửi qua Resend API
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || 'Whey4You <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn(
      `[Order Email] Chưa cấu hình GMAIL_APP_PASSWORD hoặc RESEND_API_KEY! Email hóa đơn đơn #${data.orderCode} đến ${data.customerEmail} chưa thể gửi qua mạng.`
    );
    return {
      success: false,
      error: 'Chưa cấu hình dịch vụ email (Gmail SMTP hoặc Resend API).',
    };
  }

  try {
    const html = renderInvoiceEmailHtml(data);
    const text = renderInvoiceEmailPlainText(data);
    const subject = `[Whey4You] Xác nhận đơn hàng #${data.orderCode}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [data.customerEmail.trim()],
        subject,
        text,
        html,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error('[Resend Email Error]:', resData);
      return {
        success: false,
        error: resData?.message || `Lỗi Resend API HTTP ${res.status}`,
      };
    }

    console.log(`[Resend Email] Đã gửi thành công hóa đơn #${data.orderCode} đến ${data.customerEmail} (ID: ${resData?.id})`);
    return {
      success: true,
      id: resData?.id,
    };
  } catch (err: any) {
    console.error('[Resend Email Exception]:', err);
    return {
      success: false,
      error: err?.message || 'Lỗi ngoại lệ khi gửi email qua Resend.',
    };
  }
}
