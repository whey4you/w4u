import { describe, it, expect } from 'vitest';
import { renderInvoiceEmailHtml, renderInvoiceEmailPlainText, InvoiceEmailData } from '@/services/email/invoice-email-template';
import { sendOrderInvoiceEmail } from '@/services/email/resend-email.service';

describe('Invoice Email System', () => {
  const sampleData: InvoiceEmailData = {
    orderCode: 'W4U-998877',
    customerName: 'Nguyễn Văn Test',
    customerPhone: '0901234567',
    customerEmail: 'test@example.com',
    customerAddress: '123 Đường Số 1, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    items: [
      {
        product_name: 'Rule 1 Proteins R1 Protein 5lbs',
        flavor_name: 'Chocolate Fudge',
        price: 1550000,
        quantity: 2,
      },
      {
        product_name: 'Creatine Monohydrate 300g',
        flavor_name: 'Unflavored',
        price: 450000,
        quantity: 1,
      },
    ],
    subtotal: 3550000,
    discountAmount: 100000,
    couponCode: 'WHEY10',
    shippingFee: 30000,
    totalAmount: 3480000,
    depositAmount: 100000,
    codRemaining: 3380000,
    paymentMethod: 'cod',
    carrierName: 'SPX Express',
    appUrl: 'https://whey4you.vn',
  };

  it('renderInvoiceEmailHtml generates valid HTML with order and customer info', () => {
    const html = renderInvoiceEmailHtml(sampleData);

    expect(html).toContain('W4U-998877');
    expect(html).toContain('Nguyễn Văn Test');
    expect(html).toContain('test@example.com');
    expect(html).toContain('Rule 1 Proteins R1 Protein 5lbs');
    expect(html).toContain('Chocolate Fudge');
    expect(html).toContain('WHEY10');
    expect(html).toContain('SPX Express');
    expect(html).toContain('https://whey4you.vn/orders?code=W4U-998877&amp;invoice=true'.replace('&amp;', '&'));
  });

  it('renderInvoiceEmailPlainText generates valid plain text fallback', () => {
    const text = renderInvoiceEmailPlainText(sampleData);

    expect(text).toContain('W4U-998877');
    expect(text).toContain('Nguyễn Văn Test');
    expect(text).toContain('Rule 1 Proteins R1 Protein 5lbs');
    expect(text).toContain('Chocolate Fudge');
    expect(text).toContain('WHEY10');
    expect(text).toContain('SPX Express');
  });

  it('sendOrderInvoiceEmail safely rejects invalid email without crashing', async () => {
    const res = await sendOrderInvoiceEmail({
      ...sampleData,
      customerEmail: 'invalid-email',
    });
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('sendOrderInvoiceEmail handles missing credentials gracefully', async () => {
    const originalKey = process.env.RESEND_API_KEY;
    const originalGmailUser = process.env.GMAIL_USER;
    const originalGmailPass = process.env.GMAIL_APP_PASSWORD;

    delete process.env.RESEND_API_KEY;
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;

    const res = await sendOrderInvoiceEmail(sampleData);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();

    if (originalKey) process.env.RESEND_API_KEY = originalKey;
    if (originalGmailUser) process.env.GMAIL_USER = originalGmailUser;
    if (originalGmailPass) process.env.GMAIL_APP_PASSWORD = originalGmailPass;
  });
});
