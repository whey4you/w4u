import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { getPolicyBySlug, getAllPolicies } from '@/data/policies';
import { PolicyNavTabs } from '@/components/features/policy/policy-nav-tabs';
import { PolicyWarningCard } from '@/components/features/policy/policy-warning-card';
import { ChevronRight, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPolicies().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = getPolicyBySlug(slug);

  if (!policy) {
    return { title: 'Chính Sách Không Tồn Tại | WHEY4YOU' };
  }

  const policyUrl = `https://whey4you.net/policy/${policy.slug}`;

  return {
    title: `${policy.title} | WHEY4YOU`,
    description: policy.description,
    alternates: {
      canonical: policyUrl,
    },
    openGraph: {
      title: `${policy.title} | WHEY4YOU`,
      description: policy.description,
      url: policyUrl,
      siteName: 'WHEY4YOU',
      locale: 'vi_VN',
      type: 'article',
    },
  };
}

export default async function PolicyDetailPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = getPolicyBySlug(slug);

  if (!policy) {
    notFound();
  }

  return (
    <div className="bg-[#fbfbfd] min-h-screen pt-4 pb-20 sm:pb-28">
      <Container className="max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 py-3 mb-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
          <Link href="/policy" className="hover:text-neutral-900 transition-colors">Chính sách</Link>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
          <span className="text-neutral-900 font-medium truncate">{policy.shortTitle}</span>
        </nav>

        {/* Header Header */}
        <div className="space-y-3 mb-6 sm:mb-8 border-b border-neutral-200/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-white">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{policy.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
            {policy.title}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">
            {policy.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Cập nhật lần cuối: {policy.lastUpdated}</span>
          </div>
        </div>

        {/* Policy Tab Switcher */}
        <PolicyNavTabs currentSlug={policy.slug} />

        {/* Warning Callout Box (if applicable) */}
        {policy.warningNotice && (
          <PolicyWarningCard
            title={policy.warningNotice.title}
            description={policy.warningNotice.description}
          />
        )}

        {/* Policy Sections */}
        <div className="space-y-6 sm:space-y-8">
          {policy.sections.map((section) => (
            <section
              key={section.id}
              className={`rounded-2xl p-5 sm:p-7 border transition-all ${
                section.highlight
                  ? 'bg-white border-neutral-900/40 shadow-sm ring-1 ring-neutral-900/10'
                  : 'bg-white border-neutral-200/80 shadow-xs'
              }`}
            >
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
                <span>{section.title}</span>
              </h2>
              <ul className="space-y-3">
                {section.content.map((paragraph, index) => (
                  <li key={index} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{paragraph}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
