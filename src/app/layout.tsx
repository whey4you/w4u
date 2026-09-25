import type { Metadata } from 'next';
import { Inter, Lora, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/cart-context';
import { StoreShell } from '@/components/layout/store-shell';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-invoice',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WHEY4YOU | Fuel Your Goals - Dinh Dưỡng Thể Hình Chuẩn Mực',
  description:
    'Whey4You - Hệ thống thực phẩm bổ sung dinh dưỡng thể hình chất lượng, đồng hành cùng mục tiêu rèn luyện và phát triển thể chất của gymer.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${lora.variable} ${ibmPlexSans.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-apple-canvas text-apple-dark antialiased">
        <CartProvider>
          <StoreShell>{children}</StoreShell>
        </CartProvider>
      </body>
    </html>
  );
}
