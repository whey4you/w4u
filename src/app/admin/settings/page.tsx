import React from 'react';
import { AdminHeader } from '@/components/features/admin/admin-header';
import { WarehouseSettingsForm } from '@/components/features/admin/settings/warehouse-settings-form';
import { getWarehouseConfig } from '@/services/store-settings.service';

export const revalidate = 0;

export const metadata = {
  title: 'Cấu Hình Kho & Vận Chuyển | Admin WHEY4YOU',
};

export default async function AdminSettingsPage() {
  const warehouseConfig = await getWarehouseConfig();

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Cấu Hình Kho & Vận Chuyển"
        subtitle="Thiết lập địa chỉ lấy hàng AllinGo, thông tin người gửi trực tiếp lưu trữ trên Supabase"
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto">
        <WarehouseSettingsForm initialConfig={warehouseConfig} />
      </main>
    </div>
  );
}
