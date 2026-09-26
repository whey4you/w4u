import { allingoFetch } from './client';

export interface AllinGoWallet {
  delivery_credit: number;
  cod_outstanding?: number;
  cod_pending?: number;
  cod_approved?: number;
  cod_ready?: number;
  postpaid_active?: boolean;
  postpaid_limit?: number;
  postpaid_available?: number;
  postpaid_deposit_amount?: number;
  currency: string;
}

export interface AllinGoWalletResult {
  success: boolean;
  wallet?: AllinGoWallet;
  error?: string;
}

/**
 * Lấy thông tin số dư ví và trạng thái công nợ tài khoản AllinGo
 * Endpoint: GET /wallet
 */
export async function getAllinGoWallet(): Promise<AllinGoWalletResult> {
  try {
    const data = await allingoFetch<AllinGoWallet>('/wallet', {
      method: 'GET',
    });

    if (typeof data?.delivery_credit === 'number') {
      return {
        success: true,
        wallet: data,
      };
    }

    return {
      success: false,
      error: 'Không nhận được dữ liệu số dư hợp lệ từ AllinGo.',
    };
  } catch (err: any) {
    console.error('[AllinGo Wallet API Error]:', err);
    return {
      success: false,
      error: err?.message || 'Lỗi khi truy vấn số dư ví AllinGo.',
    };
  }
}
