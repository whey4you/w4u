export interface AllinGoLocationCoords {
  lat: number;
  lng: number;
}

export interface AllinGoAddress {
  contact_name: string;
  contact_phone: string;
  address_line: string;
  ward?: string;
  district?: string;
  province?: string;
  location: AllinGoLocationCoords;
  note?: string;
}

export interface AllinGoPackageItem {
  name: string;
  quantity: number;
  price: number;
  weight?: number; // kg
}

export interface AllinGoPackage {
  weight: number; // kg
  length: number; // cm
  width: number;  // cm
  height: number; // cm
  declared_value?: number;
  is_fragile?: boolean;
  items?: AllinGoPackageItem[];
}

export interface AllinGoQuotePartner {
  id: string;
  name: string;
}

export interface AllinGoQuote {
  service_id: string;
  service_name: string;
  partner: AllinGoQuotePartner;
  price: number;
  estimated_delivery_at?: string | null;
  estimated_minutes?: number | null;
  estimated_delivery_range?: string | null;
  available: boolean;
  error_code?: string | null;
  currency: string;
}

export interface AllinGoInquiriesResponse {
  quotes: AllinGoQuote[];
}

export interface AllinGoGsoLocation {
  code: string;
  name: string;
  name_en?: string | null;
  full_name?: string | null;
  full_name_en?: string | null;
}

export interface AllinGoOrderResponse {
  id: string;
  track_id: string;
  status: string;
  external_reference?: string | null;
  delivery?: {
    id: string;
    track_id?: string | null;
    partner_track_id?: string | null;
    partner?: { id: string; name: string };
    service?: { id: string; name: string };
    status?: string | null;
    track_link?: string | null;
    partner_track_link?: string | null;
  } | null;
  fee?: {
    delivery: number;
    insurance: number;
    cod: number;
    total: number;
    currency: string;
  };
}

export interface AllinGoWebhookPayload {
  id: string;
  type: string;
  api_version: string;
  created: number;
  livemode: boolean;
  data: {
    object: {
      id: string;
      track_id: string;
      status: string;
      external_reference?: string | null;
      delivery?: {
        id: string;
        partner_track_id?: string | null;
        partner?: { id: string; name: string };
        status?: string | null;
        track_link?: string | null;
        partner_track_link?: string | null;
      };
      fee?: { total: number };
    };
    previous_status?: string;
    new_status?: string;
  };
}
