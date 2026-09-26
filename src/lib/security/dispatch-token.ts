import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.TELEGRAM_BOT_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY || 'whey4you-shipping-dispatch-secret';

/**
 * Tạo token HMAC bảo mật cho link gọi xe từ Telegram
 */
export function generateDispatchToken(orderId: string): string {
  return createHmac('sha256', SECRET).update(`dispatch-${orderId}`).digest('hex').slice(0, 24);
}

/**
 * Xác thực token gọi xe
 */
export function verifyDispatchToken(orderId: string, token: string): boolean {
  if (!orderId || !token) return false;
  const expected = generateDispatchToken(orderId);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
