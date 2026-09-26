'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { WarehouseConfig } from '@/services/store-settings.service';
import { updateAdminWarehouseConfigAction } from '@/app/actions/admin-settings.actions';
import {
  Building2,
  Phone,
  User,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
} from 'lucide-react';

interface LocationItem {
  id: string;
  name: string;
  code: string;
}

interface WarehouseSettingsFormProps {
  initialConfig: WarehouseConfig;
}

export function WarehouseSettingsForm({ initialConfig }: WarehouseSettingsFormProps) {
  const [formData, setFormData] = useState<WarehouseConfig>(initialConfig);
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // 1. Tải danh sách tỉnh thành AllinGo
  useEffect(() => {
    fetch('/api/shipping/cities')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setProvinces(res.data);
        }
      })
      .catch((err) => console.error('Lỗi tải tỉnh thành:', err));
  }, []);

  // 2. Tải quận huyện khi province_code thay đổi
  useEffect(() => {
    if (!formData.province_code) {
      setDistricts([]);
      return;
    }
    setLoadingLocations(true);
    fetch(`/api/shipping/districts?cityId=${encodeURIComponent(formData.province_code)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setDistricts(res.data);
        }
      })
      .finally(() => setLoadingLocations(false));
  }, [formData.province_code]);

  // 3. Tải phường xã khi district_code thay đổi
  useEffect(() => {
    if (!formData.district_code) {
      setWards([]);
      return;
    }
    fetch(`/api/shipping/wards?districtId=${encodeURIComponent(formData.district_code)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setWards(res.data);
        }
      });
  }, [formData.district_code]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = provinces.find((p) => p.code === code);
    setFormData((prev) => ({
      ...prev,
      province_code: code,
      province_name: selected?.name || '',
      district_code: '',
      district_name: '',
      ward_code: '',
      ward_name: '',
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = districts.find((d) => d.code === code);
    setFormData((prev) => ({
      ...prev,
      district_code: code,
      district_name: selected?.name || '',
      ward_code: '',
      ward_name: '',
    }));
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = wards.find((w) => w.code === code);
    setFormData((prev) => ({
      ...prev,
      ward_code: code,
      ward_name: selected?.name || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const res = await updateAdminWarehouseConfigAction(formData);
      if (res.success && res.data) {
        setFormData(res.data);
        setStatusMessage({ type: 'success', text: 'Đã lưu cấu hình kho hàng thành công vào Supabase!' });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Có lỗi xảy ra khi lưu cấu hình.' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Thông tin liên hệ kho */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Thông Tin Người Gửi & Kho Hàng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Tên Người Gửi / Tên Kho <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.sender_name}
                onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                placeholder="VD: LONG Whey4You"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Số Điện Thoại Lấy Hàng <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={formData.sender_phone}
                onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })}
                placeholder="VD: 0559959433"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Địa chỉ kho hàng AllinGo */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Địa Chỉ Kho Hàng (AllinGo Lấy Hàng)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tỉnh / Thành Phố *</label>
            <select
              required
              value={formData.province_code}
              onChange={handleProvinceChange}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Chọn Tỉnh / Thành --</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quận / Huyện *</label>
            <select
              required
              disabled={!formData.province_code || loadingLocations}
              value={formData.district_code}
              onChange={handleDistrictChange}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            >
              <option value="">-- Chọn Quận / Huyện --</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phường / Xã</label>
            <select
              disabled={!formData.district_code}
              value={formData.ward_code || ''}
              onChange={handleWardChange}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            >
              <option value="">-- Chọn Phường / Xã --</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Số Nhà, Tên Đường <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.street_address}
            onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
            placeholder="VD: 123 Nguyễn Thị Minh Khai, Phường Bến Thành"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Xem trước nhãn gửi hàng */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
          <PackageCheck className="w-4 h-4" />
          Xem Trước Nhãn Gửi Hàng AllinGo
        </div>
        <div className="bg-slate-800/80 p-4 rounded-xl text-sm border border-slate-700/60 space-y-1">
          <div className="font-semibold text-white">
            {formData.sender_name || '(Chưa nhập tên kho)'} - {formData.sender_phone || '(Chưa có SĐT)'}
          </div>
          <div className="text-slate-300 text-xs">
            {formData.street_address || ''}
            {formData.ward_name ? `, ${formData.ward_name}` : ''}
            {formData.district_name ? `, ${formData.district_name}` : ''}
            {formData.province_name ? `, ${formData.province_name}` : ''}
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/50 mt-2">
            Mã định danh AllinGo: Tỉnh ({formData.province_code || '---'}), Huyện ({formData.district_code || '---'}), Xã ({formData.ward_code || '---'})
          </div>
        </div>
      </div>

      {/* Nút lưu */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isPending ? 'Đang lưu vào Supabase...' : 'Lưu Cấu Hình Kho Hàng'}</span>
        </button>
      </div>
    </form>
  );
}
