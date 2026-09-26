import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';

export function AppleFooter() {
  return (
    <footer className="bg-apple-canvas text-apple-subhead text-[11px] border-t border-black/[0.08] pt-6 sm:pt-8 lg:pt-10 pb-16 lg:pb-12 print:hidden">
      <Container className="space-y-6">
        {/* Footnotes / Disclaimers */}
        <div className="space-y-2 border-b border-black/[0.08] pb-6 leading-relaxed">
          <p>
            * Các thông tin dinh dưỡng và bài viết chia sẻ trên website mang tính chất tham khảo kiến thức thể thao, không thay thế cho chẩn đoán y khoa chuyên sâu.
          </p>
          <p>
            * Whey4You nỗ lực mang đến những sản phẩm dinh dưỡng thể thao chất lượng, đồng hành cùng mục tiêu phát triển thể chất của cộng đồng gymer.
          </p>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
          <div className="space-y-2.5">
            <h4 className="font-semibold text-apple-dark">Dòng Sản Phẩm</h4>
            <ul className="space-y-2">
              <li><Link href="/products?category=whey" className="hover:text-apple-dark hover:underline">Whey Protein</Link></li>
              <li><Link href="/products?category=strength" className="hover:text-apple-dark hover:underline">Sức Mạnh & Sức Bền</Link></li>
              <li><Link href="/products?category=vitamins" className="hover:text-apple-dark hover:underline">Vitamins & Khoáng Chất</Link></li>
              <li><Link href="/products" className="hover:text-apple-dark hover:underline">Tất Cả Sản Phẩm</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-apple-dark">Kiến Thức Dinh Dưỡng</h4>
            <ul className="space-y-2">
              <li><Link href="/blog" className="hover:text-apple-dark hover:underline">Cẩm Nang Khoa Học</Link></li>
              <li><Link href="/blog" className="hover:text-apple-dark hover:underline">Thời Điểm & Hấp Thu</Link></li>
              <li><Link href="/blog" className="hover:text-apple-dark hover:underline">Phân Biệt Sản Phẩm</Link></li>
              <li><Link href="/orders" className="hover:text-apple-dark hover:underline">Tra Cứu Vận Đơn</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-apple-dark">Chính Sách & Hỗ Trợ</h4>
            <ul className="space-y-2">
              <li><Link href="/policy/chinh-sach-doi-tra" className="hover:text-apple-dark hover:underline">Đổi Trả & Video Mở Hàng</Link></li>
              <li><Link href="/policy/chinh-sach-giao-hang" className="hover:text-apple-dark hover:underline">Giao Hàng & Đồng Kiểm</Link></li>
              <li><Link href="/policy/dieu-khoan-dich-vu" className="hover:text-apple-dark hover:underline">Điều Khoản Dịch Vụ</Link></li>
              <li><Link href="/policy/chinh-sach-bao-mat" className="hover:text-apple-dark hover:underline">Chính Sách Bảo Mật</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-apple-dark">Hệ Thống Whey4You</h4>
            <ul className="space-y-2">
              <li>Kênh hỗ trợ: <a href="https://zalo.me/g/hqwqsqcnpgik9n3zo0nk" target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:underline">Cộng đồng Zalo Whey4You</a></li>
              <li>Fanpage: <a href="https://www.facebook.com/people/Whey4You/61563177707517/" target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:underline">Whey4You Official</a></li>
              <li>Trợ lý AI: <span className="text-apple-dark">Tư vấn dinh dưỡng 24/7</span></li>
              <li>Giao hàng toàn quốc: <Link href="/orders" className="text-apple-blue hover:underline">Tra cứu vận đơn / Đơn hàng</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-black/[0.08] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-apple-subhead">
          <p>© {new Date().getFullYear()} WHEY4YOU Inc. Bản quyền được bảo lưu.</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <Link href="/policy/chinh-sach-doi-tra" className="hover:text-apple-dark hover:underline">Đổi Trả</Link>
            <span>•</span>
            <Link href="/policy/chinh-sach-giao-hang" className="hover:text-apple-dark hover:underline">Giao Nhận</Link>
            <span>•</span>
            <Link href="/policy/dieu-khoan-dich-vu" className="hover:text-apple-dark hover:underline">Điều Khoản</Link>
            <span>•</span>
            <Link href="/policy/chinh-sach-bao-mat" className="hover:text-apple-dark hover:underline">Bảo Mật</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
