import type { Metadata } from 'next';
import { CartPageContent } from '@/components/cart/cart-page-content';

export const metadata: Metadata = {
  title: 'Giỏ hàng của bạn | Whey4You',
  description: 'Xem lại và quản lý danh sách sản phẩm dinh dưỡng thể hình đã chọn trong giỏ hàng Whey4You.',
};

export default function CartPage() {
  return <CartPageContent />;
}
