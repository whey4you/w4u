import React from 'react';
import { AdminHeader } from '@/components/features/admin/admin-header';
import { CouponManager } from '@/components/features/admin/coupons/coupon-manager';
import { getAdminCoupons } from '@/services/coupon.service';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Quản Lý Mã Giảm Giá"
        subtitle="Thiết lập các chương trình khuyến mãi, voucher giảm giá và theo dõi lượt sử dụng"
      />

      <main className="p-8 max-w-7xl w-full mx-auto">
        <CouponManager initialCoupons={coupons} />
      </main>
    </div>
  );
}
