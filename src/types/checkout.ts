export interface CheckoutItemInput {
  productId: string;
  flavorId: string;
  sizeId?: string;
  quantity: number;
}

export type PaymentMethod = 'cod' | 'payos';

export interface CheckoutInput {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  items: CheckoutItemInput[];
}

export interface PayOSPaymentData {
  checkoutUrl: string;
  qrCode: string;
  accountNumber: string;
  accountName: string;
  bin: string;
  numericOrderCode: number;
  amount: number;
  description: string;
}

export type CheckoutResult =
  | {
      success: true;
      orderCode: string;
      totalAmount: number;
      paymentMethod: PaymentMethod;
      payos?: PayOSPaymentData;
    }
  | { success: false; error: string };

