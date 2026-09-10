/**
 * Module quản lý và tối ưu hóa nguồn nghiên cứu khoa học y sinh quốc tế uy tín.
 * Ưu tiên: PubMed, ISSN/JISSN, ScienceDaily, Examine, Frontiers, ScienceDirect.
 * Loại bỏ: Báo chí lá cải, tin tức giật gân, diễn đàn không chuyên.
 */

// Danh sách các tên miền học thuật và tạp chí y học thể thao được bình duyệt uy tín
export const TRUSTED_SCIENTIFIC_DOMAINS = [
  'pubmed.ncbi.nlm.nih.gov',
  'ncbi.nlm.nih.gov',
  'jissn.biomedcentral.com',
  'sportsnutritionsociety.org',
  'sciencedaily.com',
  'examine.com',
  'frontiersin.org',
  'sciencedirect.com',
  'nature.com',
  'cell.com',
  'springer.com',
  'cochranelibrary.com',
  'acsm.org',
  'journals.lww.com',
  'academic.oup.com',
  'bmj.com',
  'mdpi.com',
  'clinicaltrials.gov',
] as const;

// Danh sách các nguồn báo chí đại chúng, tin tức giật gân, diễn đàn hoặc mạng xã hội cần loại trừ
export const UNTRUSTED_GENERAL_DOMAINS = [
  'dailymail.co.uk',
  'thesun.co.uk',
  'mirror.co.uk',
  'buzzfeed.com',
  'pinterest.com',
  'tiktok.com',
  'facebook.com',
  'instagram.com',
  'quora.com',
  'reddit.com',
  'kenh14.vn',
  'vietnamnet.vn',
  'vnexpress.net',
  'dantri.com.vn',
  'soha.vn',
  'zingnews.vn',
  'znews.vn',
] as const;

const SCIENTIFIC_KEYWORDS = [
  'randomized controlled',
  'clinical trial',
  'meta-analysis',
  'systematic review',
  'double-blind',
  'placebo-controlled',
  'human trial',
  'issn',
  'pubmed',
  'pmid',
  'doi',
  'muscle protein synthesis',
  'bioavailability',
  'pharmacokinetics',
];

const VIETNAMESE_BIOMEDICAL_MAP: Record<string, string> = {
  'thời điểm': 'nutrient timing',
  'uống': 'supplementation intake',
  'dùng': 'supplementation intake',
  'bổ sung': 'supplementation',
  'hại thận': 'renal function kidney safety',
  'thận': 'renal function kidney',
  'hại gan': 'liver hepatic function safety',
  'rụng tóc': 'hair loss DHT follicle',
  'tăng cơ': 'muscle protein synthesis hypertrophy',
  'phục hồi': 'muscle recovery adaptation',
  'giảm mỡ': 'fat oxidation body composition',
  'sức mạnh': 'muscular strength power output',
  'sức bền': 'endurance aerobic performance',
  'dạ dày': 'gastric emptying gastrointestinal',
  'tiêu hóa': 'digestion absorption kinetics',
  'hấp thu': 'bioavailability absorption rate',
  'kháng viêm': 'anti-inflammatory biomarkers',
  'liều dùng': 'dosage protocol efficacy',
  'tác dụng phụ': 'adverse effects safety profile',
  'nam giới': 'men male endocrine testosterone',
  'nữ giới': 'women female performance',
};

/** Kiểm tra đường dẫn có thuộc danh sách nguồn không tin cậy */
export function isUntrustedSource(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return UNTRUSTED_GENERAL_DOMAINS.some((domain) => lowerUrl.includes(domain));
}

/** Chấm điểm độ tin cậy và thẩm quyền khoa học của tài liệu */
export function scoreScientificAuthority(url: string, title = '', snippet = ''): number {
  if (isUntrustedSource(url)) return -1000;

  let score = 0;
  const lowerUrl = url.toLowerCase();
  const text = `${title} ${snippet}`.toLowerCase();

  // Điểm cộng lớn nếu xuất phát từ cơ sở dữ liệu hoặc tạp chí khoa học quốc tế uy tín
  if (TRUSTED_SCIENTIFIC_DOMAINS.some((domain) => lowerUrl.includes(domain))) {
    score += 100;
  } else if (lowerUrl.endsWith('.gov') || lowerUrl.includes('.gov/')) {
    score += 60;
  } else if (lowerUrl.includes('.edu') || lowerUrl.includes('.ac.uk')) {
    score += 50;
  }

  // Điểm cộng cho phương pháp luận nghiên cứu và thuật ngữ lâm sàng
  for (const kw of SCIENTIFIC_KEYWORDS) {
    if (text.includes(kw)) score += 15;
  }

  return score;
}

/** Xây dựng truy vấn tìm kiếm tiếng Anh chuẩn y sinh từ chủ đề tiếng Việt */
export function buildScientificQuery(topic: string, keywords = '', year?: number): string {
  const targetYear = year || new Date().getFullYear();
  let mappedTerms = '';

  const lowerTopic = `${topic} ${keywords}`.toLowerCase();
  for (const [vi, en] of Object.entries(VIETNAMESE_BIOMEDICAL_MAP)) {
    if (lowerTopic.includes(vi)) {
      mappedTerms += ` ${en}`;
    }
  }

  // Giữ lại các thuật ngữ tiếng Anh đã có sẵn trong topic (vd: creatine, whey, isolate, bcaa, eaa...)
  const englishWords = topic.match(/\b[A-Za-z0-9-]{3,}\b/g) || [];
  const cleanEnglish = englishWords.join(' ');

  const primarySearchTerms = `${cleanEnglish} ${mappedTerms}`.trim() || topic;
  return `${primarySearchTerms} sports nutrition exercise physiology pubmed issn clinical trial meta-analysis ${targetYear}`.replace(/\s+/g, ' ').trim();
}

/** Xây dựng truy vấn tìm kiếm chuyên sâu thông số, nhãn phụ và kiểm định quốc tế cho sản phẩm */
export function buildProductReviewQuery(productName: string, brand = '', keywords = ''): string {
  const cleanName = productName.trim();
  const cleanBrand = brand.trim();
  const cleanKw = keywords.trim();
  const base = [cleanName, cleanBrand, cleanKw].filter(Boolean).join(' ');
  return `${base} supplement facts ingredients review lab test analysis amino acid profile clinical`.replace(/\s+/g, ' ').trim();
}

