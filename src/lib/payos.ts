import { PayOS } from '@payos/node';

const clientId = process.env.PAYOS_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

export const isPayOSConfigured = Boolean(clientId && apiKey && checksumKey);

let payosInstance: PayOS | null = null;

export function getPayOS(): PayOS {
  if (!isPayOSConfigured) {
    throw new Error('PayOS chưa được cấu hình. Vui lòng kiểm tra các biến môi trường PAYOS_* trong .env.local');
  }

  if (!payosInstance) {
    payosInstance = new PayOS({
      clientId: clientId!,
      apiKey: apiKey!,
      checksumKey: checksumKey!,
    });
  }

  return payosInstance;
}
