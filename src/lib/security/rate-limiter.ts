import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Dọn dẹp định kỳ các bản ghi hết hạn để tránh rò rỉ bộ nhớ
let lastCleanup = Date.now();
function cleanupExpiredRecords(now: number) {
  if (now - lastCleanup < 60000) return; // Dọn dẹp tối đa 1 lần mỗi phút
  lastCleanup = now;
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Trích xuất địa chỉ IP của Client an toàn từ Request Headers
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}

/**
 * Kiểm tra giới hạn tần suất theo chìa khóa (IP/Hành động)
 * @param key Định danh người dùng (thường là ip + action)
 * @param limit Số lượt tối đa được phép trong khoảng thời gian
 * @param windowMs Khoảng thời gian tính bằng mili-giây (ví dụ 60000 = 1 phút)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  cleanupExpiredRecords(now);

  const record = memoryStore.get(key);

  if (!record || record.resetAt <= now) {
    // Phiên mới hoặc cửa sổ cũ đã hết hạn
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetAt };
}
