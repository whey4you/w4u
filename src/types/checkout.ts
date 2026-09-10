export interface CheckoutItemInput {
  productId: string;
  flavorId: string;
  sizeId?: string;
  quantity: number;
}

export interface CheckoutInput {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  items: CheckoutItemInput[];
}

export type CheckoutResult =
  | { success: true; orderCode: string; totalAmount: number }
  | { success: false; error: string };
