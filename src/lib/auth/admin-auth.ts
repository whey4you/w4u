/**
 * Module quản lý xác thực phiên làm việc Admin Panel.
 * Sử dụng Web Crypto API (tương thích cả Edge Runtime Middleware và Node.js Server Actions).
 */

export const ADMIN_COOKIE_NAME = 'whey4you_admin_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret && process.env.NODE_ENV === 'production') {
    console.warn('[SECURITY WARNING] Biến ADMIN_SECRET_KEY chưa được cấu hình trên Production! Đang dùng fallback tạm thời.');
  }
  return secret || 'whey4you_admin_2026';
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Kiểm tra mật khẩu quản trị viên
 */
export function verifyAdminPassword(password: string): boolean {
  const configuredSecret = getAdminSecret();
  return password.trim() === configuredSecret.trim();
}

/**
 * Tạo token phiên đăng nhập Admin có chữ ký số HMAC-SHA256
 */
export async function createAdminSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const secret = getAdminSecret();
  const key = await getCryptoKey(secret);
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp));
  const signatureHex = bufferToHex(signatureBuffer);
  return `${timestamp}.${signatureHex}`;
}

/**
 * Xác minh tính hợp lệ và thời hạn của token phiên đăng nhập
 */
export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signatureHex] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  const now = Date.now();
  // Kiểm tra thời hạn 7 ngày và kiểm tra lệch giờ đồng hồ (quá 5 phút trong tương lai)
  if (now - timestamp > SESSION_MAX_AGE_MS || timestamp > now + 300000) {
    return false;
  }

  try {
    const secret = getAdminSecret();
    const key = await getCryptoKey(secret);
    const encoder = new TextEncoder();
    const signatureBytes = hexToUint8Array(signatureHex);

    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      encoder.encode(timestampStr)
    );
  } catch {
    return false;
  }
}
