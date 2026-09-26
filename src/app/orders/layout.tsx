import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tra Cứu Đơn Hàng & Vận Đơn | WHEY4YOU',
  description: 'Kiểm tra trạng thái đơn hàng và theo dõi lộ trình giao hàng thời gian thực tại Whey4You.',
  alternates: {
    canonical: '/orders',
  },
  openGraph: {
    title: 'Tra Cứu Đơn Hàng & Vận Đơn | WHEY4YOU',
    description: 'Kiểm tra trạng thái đơn hàng và theo dõi lộ trình vận chuyển thời gian thực tại Whey4You.',
    url: '/orders',
    siteName: 'WHEY4YOU',
    locale: 'vi_VN',
    type: 'website',
    images: ['/preview-social.jpg'],
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
