import React from 'react';
import { AdminHeader } from '@/components/features/admin/admin-header';
import { OrderManager } from '@/components/features/admin/order-manager';
import { getAdminOrders } from '@/services/order.service';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Quản Lý Đơn Hàng"
        subtitle="Tiếp nhận, duyệt đơn mới và cập nhật tiến trình vận chuyển theo thời gian thực"
      />

      <main className="p-8 max-w-7xl w-full mx-auto">
        <OrderManager initialOrders={orders} />
      </main>
    </div>
  );
}
