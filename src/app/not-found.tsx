import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Không tìm thấy trang | WHEY4YOU',
  description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di dời.',
};

export default function NotFound() {
  return (
    <section className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto text-center flex flex-col items-center">
        <div className="relative w-full max-w-sm sm:max-w-md aspect-[1723/913] mb-6 sm:mb-8 select-none">
          <Image
            src="/404.webp"
            alt="404 - Không tìm thấy trang"
            fill
            sizes="(max-width: 640px) 320px, 450px"
            priority
            className="object-contain"
          />
        </div>

        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-brand-600 bg-brand-50 border border-brand-100 mb-3">
          Lỗi 404
        </span>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-apple-dark mb-3">
          Trang không tồn tại
        </h1>

        <p className="text-sm sm:text-base text-apple-subhead max-w-md mx-auto mb-8 leading-relaxed">
          Địa chỉ bạn đang tìm kiếm có thể đã bị thay đổi, gỡ bỏ hoặc tạm thời không khả dụng. Hãy quay về trang chủ để tiếp tục mua sắm nhé!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-medium text-white bg-apple-blue hover:bg-apple-blue-hover rounded-full transition-all duration-200 shadow-xs active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-medium text-apple-dark bg-white hover:bg-slate-100 border border-slate-200 rounded-full transition-all duration-200 shadow-2xs active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Xem sản phẩm</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
