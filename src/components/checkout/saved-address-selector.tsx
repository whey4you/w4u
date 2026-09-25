'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Trash2, ChevronDown, Check } from 'lucide-react';
import { SavedDeliveryProfile } from '@/types/saved-address';

interface SavedAddressSelectorProps {
  profiles: SavedDeliveryProfile[];
  selectedId: string | null;
  onSelect: (profile: SavedDeliveryProfile) => void;
  onAddNew: () => void;
  onDelete: (id: string) => void;
}

export function SavedAddressSelector({
  profiles,
  selectedId,
  onSelect,
  onAddNew,
  onDelete,
}: SavedAddressSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (profiles.length === 0) return null;

  const currentProfile = profiles.find((p) => p.id === selectedId);

  return (
    <div className="relative mb-5 rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-3 sm:p-3.5 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700">
          <MapPin className="h-3.5 w-3.5 text-neutral-900" />
          <span>Sổ địa chỉ đã lưu</span>
          <span className="rounded-full bg-neutral-200 px-1.5 py-0.2 text-[10px] font-semibold text-neutral-700">
            {profiles.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            onAddNew();
            setIsOpen(false);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-black transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>Nhập địa chỉ mới</span>
        </button>
      </div>

      {/* Dropdown trigger button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-left text-xs border border-neutral-200 hover:border-neutral-400 transition-all shadow-sm"
        >
          <div className="min-w-0 flex-1">
            {currentProfile ? (
              <div className="truncate">
                <span className="font-bold text-neutral-900">{currentProfile.customerName}</span>
                <span className="text-neutral-500 font-normal"> · {currentProfile.customerPhone}</span>
                <p className="truncate text-[11px] text-neutral-600 mt-0.5">{currentProfile.addressData.fullAddress}</p>
              </div>
            ) : (
              <span className="text-neutral-500 italic">Chọn địa chỉ đã lưu hoặc bấm nhập mới...</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-neutral-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-xl bg-white border border-neutral-200 shadow-xl overflow-hidden py-1 divide-y divide-neutral-100">
            {profiles.map((profile) => {
              const isSelected = profile.id === selectedId;
              return (
                <div
                  key={profile.id}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-neutral-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-neutral-50/80 font-medium' : ''
                  }`}
                  onClick={() => {
                    onSelect(profile);
                    setIsOpen(false);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">{profile.customerName}</span>
                      <span className="text-xs text-neutral-500 font-normal">({profile.customerPhone})</span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <Check className="h-2.5 w-2.5" /> Đang chọn
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-600 truncate mt-0.5">{profile.addressData.fullAddress}</p>
                  </div>

                  <button
                    type="button"
                    title="Xoá địa chỉ này khỏi máy"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(profile.id);
                    }}
                    className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => {
                onAddNew();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-neutral-600" />
              <span>Giao đến một địa chỉ mới khác</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
