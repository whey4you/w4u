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
  customerEmail: string;
  customerAddress: string;
  cityId?: string;
  cityName?: string;
  districtId?: string;
  districtName?: string;
  wardId?: string;
  wardName?: string;
  streetAddress?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  shippingServiceId?: string;
  carrierName?: string;
  shippingFee?: number;
  couponCode?: string;
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
      subtotal?: number;
      shippingFee?: number;
      couponCode?: string;
      discountAmount?: number;
      paymentMethod: PaymentMethod;
      depositAmount?: number;
      payos?: PayOSPaymentData;
    }
  | { success: false; error: string };


