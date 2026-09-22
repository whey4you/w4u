import { Product } from '@/types/product';

export interface BlogPromptParams {
  topic: string;
  articleType?: 'scientific' | 'product_review';
  targetProductId?: string;
  tone?: string;
  keywords?: string;
}

export function buildBlogSystemPrompt(isReview: boolean): string {
  return `
<role>
Bạn là Bác sĩ Sinh lý học Vận động kiêm Chuyên gia Dinh dưỡng Thể thao (Ph.D. Sports Nutritionist).
Nhiệm vụ của bạn là biên soạn bài viết chuyên khảo y sinh chuẩn E-E-A-T và chuẩn SEO Google hàng đầu.
</role>

<core_principles>
1. 100% DỰA TRÊN THỰC CHỨNG (EVIDENCE-BASED): Dẫn chứng cơ chế phân tử (mTORC1, Leucine trigger, AMPK, glycogen resynthesis, độ trơ cơ bắp muscle-full effect) từ nghiên cứu khoa học có sẵn.
2. PHONG CÁCH HỌC THUẬT & KHÁCH QUAN: Tuyệt đối KHÔNG PR, không dùng văn phong quảng cáo, không tâng bốc thương hiệu.
3. TIẾNG VIỆT HỌC THUẬT TỰ NHIÊN: Văn phong lưu loát, thuật ngữ tiếng Anh giải thích chuẩn xác trong ngoặc đơn.
4. TỐI ƯU SEO & GOOGLE FEATURED SNIPPET: Tiêu đề chứa từ khóa chính, các đề mục H2/H3 chia theo ý định tìm kiếm (Search Intent), có bảng so sánh số liệu định lượng rõ ràng.
</core_principles>

<formatting_and_pacing_rules>
QUY TẮC BẮT BUỘC VỀ TRÌNH BÀY & NHỊP ĐIỆU BÀI VIẾT (CHỐNG VIẾT CỤM ĐẶC QUÁNH):
1. TUYỆT ĐỐI KHÔNG VIẾT DẠNG CỤM VĂN BẢN DÀY ĐẶC (WALL OF TEXT):
   - Mỗi đoạn văn tối đa từ 2 đến 3 câu (khoảng 35–50 từ).
   - BẮT BUỘC xuống dòng cách đôi giữa các đoạn văn để tạo khoảng thở, tối ưu trải nghiệm đọc trên điện thoại (mobile scanning).
2. TỐI ĐA HÓA DANH SÁCH GẠCH ĐẦU DÒNG (- HOẶC *):
   - Mọi cơ chế, bước chuyển hóa, số liệu lâm sàng, ưu/nhược điểm, hướng dẫn liều dùng đều phải tách thành các gạch đầu dòng riêng rẽ thay vì viết gộp.
   - Mỗi gạch đầu dòng BẮT BUỘC in đậm từ khóa mở đầu (VD: "- **Ngưỡng kích hoạt Leucine (Leucine Trigger):** Cần đạt...").
3. CẤU TRÚC THỊ GIÁC ĐA TẦNG DỄ QUÉT MẮT:
   - Dùng ## cho 3 phần lớn khoa học, ### cho các nhánh nhỏ.
   - Dùng > cho trích dẫn thử nghiệm lâm sàng (VD: > **Bằng chứng lâm sàng (ISSN/PubMed):** ...).
   - Bắt buộc có Bảng Markdown so sánh trực quan.
   - Dưới mỗi bảng so sánh, dùng 2–3 gạch đầu dòng để tóm tắt ý nghĩa thực tiễn quan trọng nhất.
</formatting_and_pacing_rules>
`.trim();
}

export function buildBlogUserPrompt(
  params: BlogPromptParams,
  products: Product[],
  targetProd?: Product,
  searchEvidence = ''
): string {
  const isReview = params.articleType === 'product_review';
  const catalogSummary = products.slice(0, 8).map((p) => `- ID: "${p.id}", Tên: "${p.name}"`).join('\n');

  if (isReview) {
    const prodDetails = targetProd
      ? `Tên: ${targetProd.name}\nHãng: ${targetProd.brand}\nNhóm: ${targetProd.category}\nThành phần: ${targetProd.macros?.ingredients || 'N/A'}\nMacros: Protein: ${targetProd.macros?.protein || 'N/A'}, BCAA: ${targetProd.macros?.bcaa || 'N/A'}`
      : `Tên sản phẩm: ${params.topic}`;

    return `
<task>Biên soạn bài viết phân tích, mổ xẻ và đánh giá sản phẩm thực phẩm bổ sung chuẩn khoa học.</task>
<target_product>\n${prodDetails}\n</target_product>
${params.keywords ? `<focus_keywords>${params.keywords}</focus_keywords>` : ''}
<tone>${params.tone || 'Bóc tách Khách quan & Chuẩn Y sinh (Examine/Labdoor style)'}</tone>
<scientific_evidence>\n${searchEvidence || 'Phân tích dựa trên thông số nhãn gốc và tiêu chuẩn kỹ thuật quốc tế.'}\n</scientific_evidence>
<reference_product_id>${params.targetProductId ? `:::product{id="${params.targetProductId}"}:::` : ''}</reference_product_id>
<content_requirements>
1. Trình bày thoáng mắt: Đoạn văn ngắn 2-3 câu, tối đa hóa gạch đầu dòng (-) in đậm từ khóa, tuyệt đối không viết khối chữ cụm đặc quánh.
2. Mổ xẻ chi tiết công nghệ bào chế (CFM/Hydrolyzed), nguồn gốc hoạt chất, độ tinh khiết dạng danh sách gạch đầu dòng.
3. Ưu và nhược điểm thực tế (Pros & Cons) tách bạch từng gạch đầu dòng rõ ràng.
4. Bắt buộc có Bảng Markdown so sánh công thức với chuẩn ngành.
5. Bài viết 550-700 từ tiếng Việt, chia 3 phần ## khoa học, trả về đúng định dạng ---METADATA--- và ---CONTENT---.
</content_requirements>
${getOutputFormatTemplate()}`.trim();
  }

  const targetProductContext = params.targetProductId
    ? `\n[THẺ THAM KHẢO]: Gắn duy nhất thẻ :::product{id="${params.targetProductId}"}::: ở cuối bài. Tuyệt đối không PR.`
    : `\n[THẺ THAM KHẢO]: Có thể nhúng tối đa 1 thẻ :::product{id="..."}::: ở cuối bài nếu phù hợp.`;

  return `
<task>Biên soạn chuyên đề khoa học thể thao & sinh lý học vận động chuyên sâu.</task>
<topic>${params.topic}</topic>
${params.keywords ? `<keywords>${params.keywords}</keywords>` : ''}
<tone>${params.tone || 'Khoa học Y sinh & Nghiên cứu Thực chứng (ISSN / PubMed)'}</tone>
<scientific_evidence>\n${searchEvidence}\n</scientific_evidence>
<reference_product_instruction>${targetProductContext}</reference_product_instruction>
<catalog_reference_ids>\n${catalogSummary}\n</catalog_reference_ids>
<content_requirements>
1. Trình bày thoáng mắt: Tuyệt đối không viết cụm đặc quánh; ngắt đoạn 2-3 câu; tối đa hóa gạch đầu dòng (-) in đậm từ khóa đầu câu.
2. Giải thích cơ chế sinh học phân tử (MPS, thụ thể, chuyển hóa) chia thành các gạch đầu dòng bước phản ứng rõ ràng.
3. Phản biện các hiểu lầm phổ biến và phân tích liều lượng theo từng gạch đầu dòng độc lập.
4. Bắt buộc có Bảng Markdown so sánh các dạng hoạt chất hoặc thời điểm sinh lý, kèm tóm tắt đúc kết dưới bảng.
5. Dài 550-700 từ tiếng Việt, cấu trúc 3 phần ## khoa học, trả về đúng định dạng ---METADATA--- và ---CONTENT---.
</content_requirements>
${getOutputFormatTemplate()}`.trim();
}

function getOutputFormatTemplate(): string {
  return `
<output_format>
---METADATA---
{
  "title": "Tiêu đề khoa học chuẩn SEO chứa từ khóa chính bằng tiếng Việt",
  "slug": "tieu-de-khong-dau-chuan-seo",
  "category": "Dinh Dưỡng Thể Thao & Sinh Lý Vận Động",
  "readTime": "4 phút đọc",
  "excerpt": "Tóm tắt súc tích chuẩn SEO 140-160 ký tự về cơ chế sinh học phân tử.",
  "keyTakeaways": [
    "Khám phá y sinh cốt lõi 1 (ngắn gọn, dưới 25 từ)",
    "Khám phá y sinh cốt lõi 2",
    "Khám phá y sinh cốt lõi 3"
  ],
  "relatedProductIds": []
}
---CONTENT---
[Toàn bộ nội dung bài viết định dạng Markdown chất lượng cao với ##, ###, **, Bảng Markdown so sánh, nhiều gạch đầu dòng -, trích dẫn > và thẻ :::product{id="..."}:::]
</output_format>`;
}
