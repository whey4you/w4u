import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Kiểm tra tính hợp lệ của chữ ký Webhook AllinGo (Chuẩn HMAC-SHA256 Stripe)
 * Ngăn chặn giả mạo và chống replay attack trong cửa sổ 5 phút.
 */
export function verifyAllinGoWebhook(
  rawBody: string,
  signatureHeader: string | null,
  secret?: string
): boolean {
  const webhookSecret = secret || process.env.ALLINGO_WEBHOOK_SECRET;
  if (!webhookSecret || !signatureHeader || !rawBody) {
    return false;
  }

  try {
    const parts = Object.fromEntries(
      signatureHeader.split(',').map((kv) => kv.trim().split('='))
    );
    const t = Number(parts.t);
    const v1 = parts.v1;

    if (!t || !v1) return false;

    // Giới hạn cửa sổ replay attack trong vòng 300 giây (5 phút)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - t) > 300) {
      console.warn('[AllinGo Webhook] Chữ ký hết hạn replay window (> 300s)');
      return false;
    }

    const expected = createHmac('sha256', webhookSecret)
      .update(`${t}.${rawBody}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'hex');
    const signatureBuf = Buffer.from(v1, 'hex');

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return timingSafeEqual(expectedBuf, signatureBuf);
  } catch (err) {
    console.error('[AllinGo Webhook Verify Error]:', err);
    return false;
  }
}
