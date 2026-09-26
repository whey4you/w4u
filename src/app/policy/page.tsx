import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { getAllPolicies } from '@/data/policies';
import { RotateCcw, Truck, FileText, ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trung Tâm Chính Sách & Pháp Lý | WHEY4YOU',
  description: 'Tổng hợp chính sách đổi trả, quy định video khui hàng, quy trình giao nhận đồng kiểm, bảo mật dữ liệu và điều khoản dịch vụ tại Whey4You.',
  alternates: {
    canonical: 'https://whey4you.net/policy',
  },
};

const ICON_MAP = {
  RotateCcw,
  Truck,
  FileText,
  ShieldCheck,
};

export default function PolicyHubPage() {
  const policies = getAllPolicies();

  return (
    <div className="bg-[#fbfbfd] min-h-screen pt-4 pb-20 sm:pb-28">
      <Container className="max-w-4xl">
        <div className="text-center space-y-3 py-8 sm:py-12 border-b border-neutral-200/80 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-white">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Minh Bạch & Pháp Lý</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Trung Tâm Chính Sách WHEY4YOU
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto">
            Cam kết minh bạch về quy trình vận chuyển, điều kiện đổi trả với video khui hàng và bảo mật thông tin khách hàng.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {policies.map((policy) => {
            const Icon = ICON_MAP[policy.iconName] || FileText;

            return (
              <Link
                key={policy.slug}
                href={`/policy/${policy.slug}`}
                className="group relative flex flex-col justify-between rounded-2xl bg-white border border-neutral-200/80 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-neutral-900/60 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-neutral-100 p-2.5 text-neutral-800 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                      {policy.badge}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-900">
                    {policy.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed line-clamp-3">
                    {policy.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-900 group-hover:translate-x-0.5 transition-transform">
                  <span>Xem chi tiết quy định</span>
                  <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900" />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
