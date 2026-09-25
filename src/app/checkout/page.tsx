import type { Metadata } from 'next';
import { CheckoutPageContent } from '@/components/checkout/checkout-page-content';

export const metadata: Metadata = {
  title: 'Thanh toán đơn hàng an toàn | Whey4You',
  description: 'Quy trình thanh toán đơn hàng Whey4You bảo mật, tiện lợi với VietQR PayOS và giao hàng tiêu chuẩn toàn quốc.',
};


export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
