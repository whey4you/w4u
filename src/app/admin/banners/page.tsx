import React from 'react';
import { AdminHeader } from '@/components/features/admin/admin-header';
import { AdminBannerManager } from '@/components/features/admin/banner/admin-banner-manager';
import { getHeroBanners } from '@/services/banner.service';
import { getAdminProducts } from '@/services/product.service';

export const revalidate = 0;

export const metadata = {
  title: 'Quản Lý Hero Banner | Whey4You Admin',
  description: 'Thiết lập ảnh, liên kết điều hướng tới sản phẩm, vitamins hoặc blog trên trang chủ.',
};

export default async function AdminBannersPage() {
  const [banners, products] = await Promise.all([
    getHeroBanners(),
    getAdminProducts(),
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Quản Lý Hero Banner Trang Chủ"
        subtitle="Thiết lập hình ảnh, link điều hướng (sản phẩm, vitamins, blog) và thứ tự hiển thị của slide banner"
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
        <AdminBannerManager initialBanners={banners} products={products} />
      </main>
    </div>
  );
}
