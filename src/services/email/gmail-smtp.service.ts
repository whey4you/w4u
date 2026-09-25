import nodemailer from 'nodemailer';
import { InvoiceEmailData, renderInvoiceEmailHtml } from './invoice-email-template';

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Gửi email hóa đơn trực tiếp từ tài khoản Gmail chính chủ qua Google App Password.
 * Gửi được đến bất kỳ email khách hàng nào (@gmail, @yahoo,...) mà không cần xác thực domain DNS.
 */
export async function sendGmailInvoiceEmail(data: InvoiceEmailData): Promise<SendEmailResult> {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, '');

  if (!user || !pass) {
    return { success: false, error: 'Chưa cấu hình GMAIL_USER hoặc GMAIL_APP_PASSWORD.' };
  }

  if (!data.customerEmail || !data.customerEmail.includes('@')) {
    return { success: false, error: 'Địa chỉ email người nhận không hợp lệ.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    const html = renderInvoiceEmailHtml(data);
    const subject = `[Whey4You] Cảm ơn bạn! Hóa đơn xác nhận đơn hàng #${data.orderCode}`;

    const info = await transporter.sendMail({
      from: `"Whey4You" <${user}>`,
      to: data.customerEmail.trim(),
      subject,
      html,
    });

    console.log(`[Gmail SMTP] Đã gửi thành công hóa đơn #${data.orderCode} đến ${data.customerEmail} (ID: ${info.messageId})`);
    return { success: true, id: info.messageId };
  } catch (err: any) {
    console.error('[Gmail SMTP Error]:', err);
    return { success: false, error: err?.message || 'Lỗi gửi mail qua Gmail SMTP.' };
  }
}
