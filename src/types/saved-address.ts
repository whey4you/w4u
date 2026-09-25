import { SelectedAddressData } from '@/components/checkout/address-selector';

export interface SavedDeliveryProfile {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  addressData: SelectedAddressData;
  updatedAt: number;
}
