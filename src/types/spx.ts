export type SPXStatusCategory = 'preparing' | 'in_transit' | 'delivered' | 'returned' | 'unknown';

export interface SPXLocation {
  location_name?: string;
  location_type_name?: string;
  full_address?: string;
}

export interface SPXTrackingRecord {
  tracking_code: string;
  tracking_name: string;
  buyer_description: string;
  seller_description?: string;
  description?: string;
  actual_time: number; // unix timestamp in seconds
  milestone_code: number;
  milestone_name: string;
  current_location?: SPXLocation;
  next_location?: SPXLocation;
}

export interface SPXEddInfo {
  edd_min?: number;
  edd_max?: number;
}

export interface SPXTrackingResult {
  success: boolean;
  tracking_number: string;
  sls_tn?: string;
  status_category: SPXStatusCategory;
  status_label: string;
  latest_record?: SPXTrackingRecord;
  edd_info?: SPXEddInfo;
  records: SPXTrackingRecord[];
  error_message?: string;
}
