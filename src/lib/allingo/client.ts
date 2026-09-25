const BASE_URL = process.env.ALLINGO_BASE_URL || 'https://pro.allingo.vn/api/v1';

let cachedToken: string = '';
let tokenExpiresAt: number = 0; // Timestamp (giây)

export function getAllinGoConfig() {
  const mode = process.env.ALLINGO_MODE || 'test';
  const isLive = mode === 'live';
  const appId = isLive
    ? (process.env.ALLINGO_LIVE_APP_ID || process.env.ALLINGO_APP_ID || '')
    : (process.env.ALLINGO_APP_ID || '');
  const appSecret = isLive
    ? (process.env.ALLINGO_LIVE_SECRET || process.env.ALLINGO_APP_SECRET || '')
    : (process.env.ALLINGO_APP_SECRET || '');
  return { appId, appSecret, mode, isConfigured: Boolean(appId && appSecret) };
}


export async function authenticateAllinGo(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  // Tái sử dụng token nếu còn hạn (trừ hao 5 phút)
  if (cachedToken && tokenExpiresAt > now + 300) {
    return cachedToken;
  }

  const { appId, appSecret, isConfigured } = getAllinGoConfig();
  if (!isConfigured) {
    throw new Error('Thiếu cấu hình AllinGo API: ALLINGO_APP_ID hoặc ALLINGO_APP_SECRET chưa được thiết lập.');
  }

  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      app_id: appId,
      app_secret: appSecret,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.access_token) {
    const errorMsg = data?.error_description || data?.error || res.statusText;
    throw new Error(`[AllinGo Auth ${res.status}] Đăng nhập thất bại: ${errorMsg}`);
  }

  cachedToken = data.access_token;
  tokenExpiresAt = now + (Number(data.expires_in) || 3600);
  return cachedToken;
}

export async function allingoFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await authenticateAllinGo();
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = body?.error?.message || body?.message || response.statusText;
    throw new Error(`[AllinGo API ${response.status}] ${errorMsg}`);
  }

  return body as T;
}
