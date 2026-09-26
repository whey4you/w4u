export interface PolicySection {
  id: string;
  title: string;
  highlight?: boolean;
  content: string[];
}

export interface PolicyItem {
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
  description: string;
  lastUpdated: string;
  iconName: 'RotateCcw' | 'Truck' | 'ShieldCheck' | 'FileText';
  warningNotice?: {
    title: string;
    description: string;
  };
  sections: PolicySection[];
}

export const POLICIES: PolicyItem[] = [
  {
    slug: 'chinh-sach-doi-tra',
    title: 'Chính Sách Đổi Trả & Video Khui Hàng',
    shortTitle: 'Chính sách đổi trả',
    badge: 'Quy Định Bắt Buộc',
    description: 'Quy định chi tiết về điều kiện đổi trả, quy trình tiếp nhận và bằng chứng video mở hộp bảo vệ quyền lợi hai bên.',
    lastUpdated: '26/09/2026',
    iconName: 'RotateCcw',
    warningNotice: {
      title: 'QUY ĐỊNH BẮT BUỘC: QUAY VIDEO MỞ HÀNG (UNBOXING)',
      description: 'Whey4You chỉ chấp nhận giải quyết khiếu nại (bể vỡ, giao sai, thiếu món) khi Quý khách cung cấp VIDEO QUAY LIỀN MẠCH 6 MẶT BƯU KIỆN từ trước khi rạch băng keo niêm phong cho đến khi kiểm tra sản phẩm. Mọi hình ảnh chụp tĩnh sau khi đã mở hộp đều không có giá trị đối soát.',
    },
    sections: [
      {
        id: 'dieu-kien-tien-quyet',
        title: '1. Tiêu Chuẩn Video Mở Hàng Hợp Lệ',
        highlight: true,
        content: [
          'Video phải được quay liền mạch, không cắt ghép, không chỉnh sửa tốc độ hoặc ngắt quãng.',
          'Ghi rõ 6 mặt bưu kiện còn nguyên băng keo niêm phong, không có dấu hiệu bị rạch hay dán đè trước khi mở.',
          'Quay cận cảnh mã vận đơn (Goship / SPX / Alligo) thể hiện rõ tên người nhận và mã đơn hàng.',
          'Mở hộp và kiểm tra trực tiếp số lượng, tem chống giả, màng seal và hạn sử dụng của từng sản phẩm ngay trên video.',
        ],
      },
      {
        id: 'truong-hop-chap-nhan',
        title: '2. Các Trường Hợp Được Tiếp Nhận Đổi Trả',
        content: [
          'Hàng bị nứt vỡ, móp méo nặng, bục seal giấy bạc do quá trình vận chuyển (bắt buộc kèm video khui hộp).',
          'Sản phẩm giao sai hương vị, sai phân loại kích cỡ hoặc giao thiếu so với đơn đặt hàng trên hệ thống.',
          'Lỗi chất lượng từ nhà sản xuất (như bột mốc đen, vón tảng ướt sũng khi vừa bóc màng seal mới).',
          'Thời hạn thông báo khiếu nại: Trong vòng 48 giờ kể từ khi bưu tá cập nhật giao hàng thành công.',
        ],
      },
      {
        id: 'truong-hop-tu-choi',
        title: '3. Các Trường Hợp Từ Chối Đổi Trả (Quy Định Đặc Thù TPCN)',
        highlight: true,
        content: [
          'Sản phẩm đã bóc seal, mở nắp hoặc đã qua sử dụng: Do đặc thù thực phẩm dinh dưỡng liên quan trực tiếp đến sức khỏe và vệ sinh an toàn thực phẩm, Whey4You miễn đổi trả dưới mọi hình thức một khi sản phẩm đã bị bóc seal.',
          'Tem cào điện tử / QR Code chống giả đã bị cào lớp phủ bạc.',
          'Lý do chủ quan hoặc cảm nhận cá nhân: Không hợp khẩu vị, thấy ngọt/nhạt hơn mong đợi, chán không muốn tập luyện, hoặc cơ địa sôi bụng do bất dung nạp đường sữa lactose.',
          'Đặc tính tự nhiên của sản phẩm: Muỗng (scoop) nằm chìm dưới đáy hộp bột do vận chuyển rung lắc (vui lòng dùng đũa/muỗng dài gắp lên); màng seal áp lực tự dính vào nắp ren khi vặn mở nắp lần đầu.',
          'Hư hỏng do bảo quản sai quy cách: Để nơi ẩm ướt, nhiệt độ cao hoặc không đậy kín nắp sau khi mở gây hút ẩm vón cục.',
        ],
      },
      {
        id: 'quy-trinh-xu-ly',
        title: '4. Quy Trình Tiếp Nhận & Hoàn Tiền',
        content: [
          'Bước 1: Quý khách gửi video khui hàng và mã đơn về Zalo hỗ trợ chính thức của Whey4You.',
          'Bước 2: Bộ phận CSKH tiếp nhận và đối soát với bộ phận đóng gói/vận chuyển trong vòng 4-12 giờ làm việc.',
          'Bước 3: Nếu đủ điều kiện, Whey4You gửi đơn vị vận chuyển đến thu hồi sản phẩm lỗi hoặc đổi mới 1-1 miễn phí.',
          'Bước 4: Trường hợp hoàn tiền, số tiền sẽ được chuyển khoản tự động qua VietQR trong vòng 24 giờ sau khi hoàn tất thủ tục.',
        ],
      },
    ],
  },
  {
    slug: 'chinh-sach-giao-hang',
    title: 'Chính Sách Giao Nhận & Đồng Kiểm',
    shortTitle: 'Chính sách giao hàng',
    badge: 'Vận Chuyển Toàn Quốc',
    description: 'Quy định phương thức vận chuyển qua Goship, SPX, Alligo và quyền đồng kiểm cùng bưu tá.',
    lastUpdated: '26/09/2026',
    iconName: 'Truck',
    warningNotice: {
      title: 'QUY TẮC ĐỒNG KIỂM CÙNG SHIPPER',
      description: 'Quý khách được quyền kiểm tra ngoại quan gói hàng (hộp nguyên vẹn, mã vận đơn, số lượng món). TUYỆT ĐỐI KHÔNG BÓC SEAL HỘP/HŨ SẢN PHẨM HOẶC DÙNG THỬ TRƯỚC KHI THANH TOÁN.',
    },
    sections: [
      {
        id: 'doi-tac-van-chuyen',
        title: '1. Đối Tác Vận Chuyển & Thời Gian Giao Hàng',
        content: [
          'Đơn vị vận chuyển: Whey4You hợp tác cùng cổng vận chuyển Goship, đơn vị SPX Express và các nhà xe/hỏa tốc uy tín.',
          'Nội thành TP.HCM: Giao hỏa tốc trong 2-4 giờ hoặc giao tiêu chuẩn trong 24 giờ.',
          'Các tỉnh/thành phố khác: Giao tiêu chuẩn từ 2 - 4 ngày làm việc tùy theo khu vực địa lý.',
          'Tra cứu hành trình đơn hàng trực tiếp 24/7 tại chuyên trang /orders trên website.',
        ],
      },
      {
        id: 'quy-dinh-dong-kiem',
        title: '2. Quy Định Đồng Kiểm Cùng Bưu Tá',
        highlight: true,
        content: [
          'Khách hàng được quyền kiểm tra số lượng kiện hàng, tình trạng hộp carton đóng gói bên ngoài và thông tin người nhận trước khi ký nhận/thanh toán.',
          'Khách hàng KHÔNG ĐƯỢC bóc seal sản phẩm, không mở nắp hũ, không cào mã tem chống giả hoặc nếm thử bột.',
          'Nếu bưu kiện có dấu hiệu bị móp méo nặng, ướt sũng, rách băng keo hoặc thủng bục, Quý khách cần từ chối nhận hàng và yêu cầu bưu tá ghi rõ lý do vào biên bản giao nhận.',
        ],
      },
      {
        id: 'bao-hiem-hang-hoa',
        title: '3. Bảo Hiểm Bưu Kiện 100%',
        content: [
          'Mọi đơn hàng xuất kho từ Whey4You đều được mua bảo hiểm hàng hóa nguyên giá trị.',
          'Trong trường hợp thất lạc hoặc hư hỏng do lỗi vận chuyển có biên bản xác nhận từ đơn vị vận chuyển, Whey4You cam kết gửi lại bưu kiện mới ngay lập tức mà không để khách hàng phải chờ đợi xử lý khiếu nại bồi thường.',
        ],
      },
    ],
  },
  {
    slug: 'dieu-khoan-dich-vu',
    title: 'Điều Khoản Dịch Vụ & Giao Dịch Chung',
    shortTitle: 'Điều khoản dịch vụ',
    badge: 'Pháp Lý Website',
    description: 'Quy chế giao dịch điện tử, quyền và nghĩa vụ của người mua và người bán trên nền tảng Whey4You.',
    lastUpdated: '26/09/2026',
    iconName: 'FileText',
    sections: [
      {
        id: 'nguyen-tac-chung',
        title: '1. Nguyên Tắc Chung & Xác Lập Hợp Đồng',
        content: [
          'Bằng việc nhấn nút "Đặt hàng" trên website, Quý khách xác nhận đã đọc, hiểu rõ và đồng ý vô điều kiện với các Điều khoản dịch vụ và Chính sách đổi trả của Whey4You.',
          'Hợp đồng mua bán điện tử có hiệu lực kể từ thời điểm hệ thống tạo mã đơn hàng và gửi xác nhận thành công tới email hoặc màn hình của Quý khách.',
        ],
      },
      {
        id: 'thanh-toan-va-dat-coc',
        title: '2. Quy Định Thanh Toán & Đặt Cọc COD',
        content: [
          'Thanh toán chuyển khoản VietQR: Khách hàng quét mã QR thanh toán 100% giá trị đơn hàng (bao gồm tiền hàng và phí vận chuyển) thông qua cổng PayOS.',
          'Thanh toán COD: Áp dụng đặt cọc trước 100.000đ qua VietQR để kích hoạt đơn và xác thực người nhận, số tiền COD còn lại sẽ thanh toán trực tiếp cho shipper khi nhận hàng.',
          'Trường hợp khách hàng hủy đơn khi hàng đã xuất kho hoặc không nhận hàng không có lý do chính đáng, khoản đặt cọc 100.000đ sẽ được dùng để bù đắp chi phí đóng gói và cước vận chuyển 2 chiều.',
        ],
      },
      {
        id: 'mien-tru-y-khoa',
        title: '3. Tuyên Bố Miễn Trừ Trách Nhiệm Y Khoa',
        highlight: true,
        content: [
          'Các sản phẩm Whey Protein, Creatine, Pre-workout, BCAA và Vitamin bán tại Whey4You là thực phẩm bổ sung dinh dưỡng thể thao, KHÔNG PHẢI LÀ THUỐC VÀ KHÔNG CÓ TÁC DỤNG THAY THẾ THUỐC CHỮA BỆNH.',
          'Các bài viết và thông tin chia sẻ kiến thức trên website mang tính chất tham khảo khoa học, không thay thế cho lời khuyên hoặc chẩn đoán từ bác sĩ chuyên khoa.',
          'Người dùng có bệnh lý nền (tim mạch, thận, phụ nữ mang thai hoặc cho con bú) cần tham khảo ý kiến chuyên gia y tế trước khi sử dụng bất kỳ thực phẩm bổ sung nào.',
        ],
      },
    ],
  },
  {
    slug: 'chinh-sach-bao-mat',
    title: 'Chính Sách Bảo Mật Dữ Liệu Khách Hàng',
    shortTitle: 'Chính sách bảo mật',
    badge: 'Nghị Định 13/2023/NĐ-CP',
    description: 'Cam kết bảo vệ dữ liệu cá nhân, thông tin đơn hàng và quyền riêng tư của người dùng.',
    lastUpdated: '26/09/2026',
    iconName: 'ShieldCheck',
    sections: [
      {
        id: 'muc-dich-thu-thap',
        title: '1. Mục Đích Thu Thập Dữ Liệu',
        content: [
          'Whey4You chỉ thu thập các thông tin cần thiết phục vụ xử lý đơn hàng gồm: Họ tên, số điện thoại, địa chỉ giao hàng và địa chỉ email.',
          'Thông tin được sử dụng để: Xử lý giao vận đơn hàng, gửi hóa đơn điện tử tự động, cập nhật tiến độ giao hàng và hỗ trợ hậu mãi/bảo hành.',
        ],
      },
      {
        id: 'pham-vi-chia-se',
        title: '2. Phạm Vi Chia Sẻ Thông Tin',
        content: [
          'Whey4You cam kết tuyệt đối không bán, trao đổi hoặc chia sẻ thông tin cá nhân của Quý khách cho bên thứ ba vì mục đích thương mại.',
          'Thông tin chỉ được cung cấp cho các đối tác trực tiếp thực hiện đơn hàng: Đơn vị vận chuyển (Goship, SPX, bưu tá) và cổng thanh toán ngân hàng (PayOS/VietQR) nhằm mục đích duy nhất là hoàn tất giao dịch.',
        ],
      },
      {
        id: 'bao-mat-va-quyen-khach-hang',
        title: '3. Bảo Mật & Quyền Của Khách Hàng',
        content: [
          'Dữ liệu được lưu trữ trên hạ tầng máy chủ cơ sở dữ liệu Supabase được mã hóa chuẩn cao.',
          'Khách hàng có toàn quyền yêu cầu kiểm tra, cập nhật hoặc xóa dữ liệu cá nhân đã lưu trữ bằng cách liên hệ bộ phận hỗ trợ chính thức của Whey4You.',
        ],
      },
    ],
  },
];

export function getPolicyBySlug(slug: string): PolicyItem | undefined {
  return POLICIES.find((p) => p.slug === slug);
}

export function getAllPolicies(): PolicyItem[] {
  return POLICIES;
}
