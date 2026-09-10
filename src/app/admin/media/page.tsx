import React from 'react';
import { AdminHeader } from '@/components/features/admin/admin-header';
import { MediaManager } from '@/components/features/admin/media/media-manager';
import { getAllMediaItems } from '@/services/media.service';

export const revalidate = 0;

export const metadata = {
  title: 'Thư Viện Ảnh & Tái Sử Dụng Link | Whey4You Admin',
  description: 'Quản lý toàn bộ ảnh sản phẩm, hero banner, blog và lưu trữ liên kết ảnh dùng chung.',
};

export default async function AdminMediaPage() {
  const mediaItems = await getAllMediaItems();

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Thư Viện Ảnh & Tái Sử Dụng Link"
        subtitle="Quản lý tập trung toàn bộ hình ảnh trong hệ thống, lưu link ảnh dùng chung và sao chép 1 chạm"
      />

      <main className="p-6 md:p-8 max-w-7xl w-full mx-auto">
        <MediaManager initialItems={mediaItems} />
      </main>
    </div>
  );
}
