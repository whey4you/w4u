export interface BlogSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'Dinh Dưỡng' | 'Tập Luyện' | 'Review' | 'Khoa Học';
  readTime: string;
  date: string;
  image: string;
  featured?: boolean;
  content?: string;
  author?: {
    name: string;
    role: string;
    avatar?: string;
    verified?: boolean;
  };
  keyTakeaways?: string[];
  relatedProductIds?: string[];
  sources?: BlogSource[];
}
