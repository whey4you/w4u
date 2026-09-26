import type { Metadata, Viewport } from 'next';
import { Inter, Lora, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/cart-context';
import { StoreShell } from '@/components/layout/store-shell';
import { OrganizationSchema } from '@/components/seo/organization-schema';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://whey4you.net'),
  title: {
    default: 'WHEY4YOU | Fuel Your Goals - Dinh Dưỡng Thể Hình Chuẩn Mực',
    template: '%s | WHEY4YOU',
  },
  description:
    'Whey4You - Hệ thống thực phẩm bổ sung dinh dưỡng thể hình chất lượng cao, Whey Isolate, Creatine, Mass Gainer chính hãng cho gymer và vận động viên thể thao.',
  keywords: [
    'whey protein',
    'whey isolate',
    'thực phẩm bổ sung',
    'dinh dưỡng thể hình',
    'creatine',
    'mass gainer',
    'whey4you',
    'sữa tăng cơ',
    'gymer',
  ],
  authors: [{ name: 'Whey4You Team', url: 'https://whey4you.net' }],
  creator: 'Whey4You',
  publisher: 'Whey4You',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://whey4you.net',
    siteName: 'WHEY4YOU',
    title: 'WHEY4YOU | Fuel Your Goals - Dinh Dưỡng Thể Hình Chuẩn Mực',
    description:
      'Hệ thống thực phẩm bổ sung dinh dưỡng thể hình chất lượng cao, 100% nhập khẩu chính hãng, đồng hành cùng mục tiêu phát triển thể chất của gymer.',
    images: [
      {
        url: '/preview-social.jpg',
        width: 1200,
        height: 630,
        alt: 'WHEY4YOU - Dinh Dưỡng Thể Hình Chuẩn Mực',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WHEY4YOU | Fuel Your Goals - Dinh Dưỡng Thể Hình Chuẩn Mực',
    description:
      'Hệ thống thực phẩm bổ sung dinh dưỡng thể hình chất lượng cao, 100% nhập khẩu chính hãng.',
    images: ['/preview-social.jpg'],
  },
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
      <head>
        <OrganizationSchema />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-apple-canvas text-apple-dark antialiased">
        <CartProvider>
          <StoreShell>{children}</StoreShell>
        </CartProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
