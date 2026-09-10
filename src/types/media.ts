export type MediaCategory = 'all' | 'custom' | 'product' | 'banner' | 'blog';

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  category: 'custom' | 'product' | 'banner' | 'blog';
  source: string;
  createdAt?: string;
  isDeletable?: boolean;
}

export interface AddMediaPayload {
  title: string;
  url: string;
  category?: 'custom' | 'product' | 'banner' | 'blog';
}

export interface MediaFilterState {
  category: MediaCategory;
  searchQuery: string;
}
