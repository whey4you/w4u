/**
 * Cấu hình danh sách Banner cho Hero Section trên Trang chủ
 * 
 * Hướng dẫn sử dụng:
 * - Để thêm banner mới: Thêm 1 object vào mảng HERO_BANNERS bên dưới.
 * - `image`: Đường dẫn ảnh trong thư mục `public/banners/...` hoặc link ảnh trực tiếp.
 * - `href`: Trang bạn muốn điều hướng tới khi người dùng bấm vào banner:
 *    + Điều hướng tới 1 sản phẩm: ví dụ '/products/iso-xp-100-whey-isolate' hoặc '/products/rule-1-protein'
 *    + Điều hướng tới trang Vitamins: ví dụ '/products?category=vitamins'
 *    + Điều hướng tới Blog / Cẩm nang: ví dụ '/blog' hoặc '/blog/dinh-duong-the-hinh'
 *    + Điều hướng tới link ngoài: ví dụ 'https://...'
 */

export interface HeroBannerItem {
  id: string;
  title: string;
  image: string;
  media_type?: 'image' | 'video';
  video_url?: string;
  href: string;
}

export const HERO_BANNERS: HeroBannerItem[] = [
  {
    id: 'banner-whey-isolate',
    title: 'Whey Isolate Cao Cấp - Tinh Khiết & Hấp Thu Cực Nhanh',
    image: '/banners/main-banner-1.jpg',
    // Điều hướng tới danh mục whey hoặc sản phẩm whey cụ thể:
    href: '/products?category=whey',
  },
  {
    id: 'banner-vitamins',
    title: 'Vitamin & Khoáng Chất Thiết Yếu Phục Hồi Cơ Bắp',
    image: '/banners/main-banner-2.jpg',
    // Điều hướng tới trang vitamins:
    href: '/products?category=vitamins',
  },
  {
    id: 'banner-nutrition-blog',
    title: 'Cẩm Nang Dinh Dưỡng Khoa Học & Lịch Trình Tập Luyện',
    image: '/banners/hero-banner.jpg',
    // Điều hướng tới chuyên trang Blog kiến thức:
    href: '/blog',
  },
];
