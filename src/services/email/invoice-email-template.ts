import { formatPrice } from '@/lib/utils';

export interface EmailOrderItem {
  product_name: string;
  flavor_name?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface InvoiceEmailData {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: EmailOrderItem[];
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  shippingFee: number;
  totalAmount: number;
  depositAmount?: number;
  codRemaining?: number;
  paymentMethod: string;
  carrierName?: string;
  trackingCode?: string;
  trackingUrl?: string;
  appUrl?: string;
  logoUrl?: string;
}

const DEFAULT_SUPABASE_LOGO_URL = 'https://cmpqiisqkmwrstpittlv.supabase.co/storage/v1/object/public/banners/brand/logo-brand.png';

export function renderInvoiceEmailHtml(data: InvoiceEmailData): string {
  const baseUrl = data.appUrl || 'https://whey4you.vn';
  const orderUrl = `${baseUrl}/orders?code=${encodeURIComponent(data.orderCode)}&invoice=true`;
  const isCod = data.paymentMethod === 'cod';
  const paidAmount = isCod ? (data.depositAmount || 100000) : data.totalAmount;
  const codRemaining = isCod ? (data.codRemaining ?? Math.max(0, data.totalAmount - paidAmount)) : 0;
  const logoSrc = data.logoUrl || DEFAULT_SUPABASE_LOGO_URL;

  const itemRows = data.items
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      return `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f2; vertical-align: middle;">
            <div style="font-weight: 600; color: #1d1d1f; font-size: 14px; line-height: 1.4;">${item.product_name}</div>
            ${item.flavor_name ? `<div style="font-size: 12px; color: #86868b; margin-top: 3px; font-weight: 500;">Vị: ${item.flavor_name}</div>` : ''}
          </td>
          <td style="padding: 14px 8px; border-bottom: 1px solid #f0f0f2; text-align: center; color: #515154; font-size: 13px; font-weight: 600; vertical-align: middle;">
            x${item.quantity}
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f2; text-align: right; font-weight: 700; color: #1d1d1f; font-size: 14px; vertical-align: middle;">
            ${formatPrice(lineTotal)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Hóa đơn điện tử ${data.orderCode} - Whey4You</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    @media (prefers-color-scheme: dark) {
      .brand-card {
        background-color: #ffffff !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1d1d1f; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e5ea; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    
    <!-- BRAND HEADER (Apple Minimalist style matching website) -->
    <div style="background-color: #ffffff; padding: 26px 32px 22px; text-align: center; border-bottom: 1px solid #f0f0f2;">
      <div class="brand-card" style="display: inline-block; background-color: #ffffff; padding: 12px 24px; border-radius: 14px; border: 1px solid #ebebed; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 8px;">
        <img src="${logoSrc}" alt="Whey4You" width="165" style="display: block; margin: 0 auto; width: 165px; max-width: 100%; height: auto; border: 0; background-color: #ffffff;" />
      </div>
      <p style="margin: 0; font-size: 11px; font-weight: 600; color: #86868b; letter-spacing: 0.6px; text-transform: uppercase;">
        Thực Phẩm Bổ Sung Thể Thao Chính Hãng
      </p>
    </div>

    <!-- MAIN BODY -->
    <div style="padding: 32px 32px 28px;">
      
      <!-- STATUS BADGE & GREETING -->
      <div style="text-align: center; margin-bottom: 28px;">
        <span style="display: inline-block; background-color: #e8f5e9; color: #1b5e20; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 9999px; border: 1px solid #c8e6c9; text-transform: uppercase; letter-spacing: 0.5px;">
          ✓ Thanh toán thành công
        </span>
        <h2 style="margin: 16px 0 8px; font-size: 21px; font-weight: 800; color: #1d1d1f; letter-spacing: -0.3px;">
          CẢM ƠN BẠN ĐÃ ĐẶT HÀNG!
        </h2>
        <p style="margin: 0; font-size: 14px; color: #515154; line-height: 1.55;">
          Chào <strong>${data.customerName}</strong>, Whey4You đã nhận được thanh toán cho đơn hàng <strong>#${data.orderCode}</strong> và đang tiến hành đóng gói để giao đến bạn.
        </p>
      </div>

      <!-- INVOICE META BOX (Apple Rounded) -->
      <div style="background-color: #f5f5f7; border: 1px solid #e5e5ea; border-radius: 14px; padding: 18px 20px; margin-bottom: 26px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 5px 0; color: #86868b;">Mã đơn hàng:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: 800; color: #1d1d1f; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 14px;">${data.orderCode}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #86868b;">Thời gian:</td>
            <td style="padding: 5px 0; text-align: right; color: #1d1d1f; font-weight: 500;">${new Date().toLocaleString('vi-VN')}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #86868b;">Phương thức:</td>
            <td style="padding: 5px 0; text-align: right; color: #1d1d1f; font-weight: 700;">
              ${isCod ? 'COD (Đã nhận cọc 100.000đ qua VietQR)' : 'Thanh toán 100% qua VietQR'}
            </td>
          </tr>
          ${data.carrierName ? `
          <tr>
            <td style="padding: 5px 0; color: #86868b;">Đơn vị vận chuyển:</td>
            <td style="padding: 5px 0; text-align: right; color: #1d1d1f; font-weight: 600;">${data.carrierName}</td>
          </tr>` : ''}
        </table>
      </div>

      <!-- PRODUCTS TABLE -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #86868b; margin-bottom: 12px;">
          Chi tiết sản phẩm đã chọn
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1.5px solid #e5e5ea;">
              <th style="text-align: left; padding: 8px 0; font-size: 11px; text-transform: uppercase; color: #86868b; font-weight: 700;">Sản phẩm</th>
              <th style="text-align: center; padding: 8px; font-size: 11px; text-transform: uppercase; color: #86868b; font-weight: 700;">SL</th>
              <th style="text-align: right; padding: 8px 0; font-size: 11px; text-transform: uppercase; color: #888; font-weight: 700;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
      </div>

      <!-- SUMMARY TOTALS BOX -->
      <div style="background-color: #f5f5f7; border: 1px solid #e5e5ea; border-radius: 14px; padding: 18px 20px; margin-bottom: 26px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 4px 0; color: #6e6e73;">Tạm tính tiền hàng:</td>
            <td style="padding: 4px 0; text-align: right; color: #1d1d1f; font-weight: 600;">${formatPrice(data.subtotal)}</td>
          </tr>
          ${data.discountAmount && data.discountAmount > 0 ? `
          <tr>
            <td style="padding: 4px 0; color: #1b5e20; font-weight: 600;">Voucher giảm giá (${data.couponCode || 'Ưu đãi'}):</td>
            <td style="padding: 4px 0; text-align: right; color: #1b5e20; font-weight: 700;">-${formatPrice(data.discountAmount)}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 4px 0; color: #6e6e73;">Cước vận chuyển:</td>
            <td style="padding: 4px 0; text-align: right; color: #1d1d1f; font-weight: 600;">${formatPrice(data.shippingFee)}</td>
          </tr>
          <tr style="border-top: 1px solid #dcdce0; font-size: 15px;">
            <td style="padding: 12px 0 4px; font-weight: 800; color: #1d1d1f;">Tổng giá trị đơn hàng:</td>
            <td style="padding: 12px 0 4px; text-align: right; font-weight: 800; color: #1d1d1f; font-size: 16px;">${formatPrice(data.totalAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #1b5e20; font-weight: 700;">Đã thanh toán (VietQR):</td>
            <td style="padding: 4px 0; text-align: right; color: #1b5e20; font-weight: 800;">-${formatPrice(paidAmount)}</td>
          </tr>
          ${isCod ? `
          <tr style="border-top: 1px dashed #d1d5db;">
            <td style="padding: 10px 0 4px; color: #b45309; font-weight: 700;">Số tiền COD thu khi nhận:</td>
            <td style="padding: 10px 0 4px; text-align: right; color: #b45309; font-weight: 800; font-size: 15px;">${formatPrice(codRemaining)}</td>
          </tr>` : ''}
        </table>
      </div>

      <!-- DELIVERY INFO -->
      <div style="border-top: 1px solid #f0f0f2; padding-top: 20px; margin-bottom: 28px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #86868b; margin-bottom: 8px;">
          Thông tin nhận hàng
        </div>
        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #3a3a3c;">
          <strong>${data.customerName}</strong> · ${data.customerPhone}<br>
          ${data.customerAddress}<br>
          <span style="color: #86868b;">Email nhận hóa đơn: ${data.customerEmail}</span>
        </p>
      </div>

      <!-- CTA BUTTON (Apple Pill Style) -->
      <div style="text-align: center; margin: 30px 0 16px;">
        <a href="${orderUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 34px; border-radius: 9999px; letter-spacing: 0.2px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          Tra Cứu Đơn Hàng & Xem Hóa Đơn Trực Tuyến →
        </a>
      </div>

      <!-- NO REPLY NOTICE & SUPPORT CHANNELS -->
      <div style="background-color: #fefce8; border: 1px dashed #fde047; border-radius: 14px; padding: 16px 20px; text-align: center; font-size: 12.5px; color: #713f12; line-height: 1.6; margin-top: 24px;">
        ⚠️ <strong>Lưu ý:</strong> Đây là email thông báo tự động từ hệ thống máy chủ, vui lòng <strong>không trả lời (reply) trực tiếp</strong> vào email này.<br>
        Để được hỗ trợ nhanh nhất về đơn hàng, quý khách vui lòng kết nối qua:
        <div style="margin-top: 10px;">
          <a href="https://zalo.me/g/hqwqsqcnpgik9n3zo0nk" target="_blank" style="display: inline-block; background-color: #0068ff; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 7px 16px; border-radius: 9999px; margin: 3px 4px; box-shadow: 0 2px 6px rgba(0,104,255,0.25);">
            💬 Nhắn Zalo Hỗ Trợ
          </a>
          <a href="https://www.facebook.com/people/Whey4You/61563177707517/" target="_blank" style="display: inline-block; background-color: #1877f2; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 7px 16px; border-radius: 9999px; margin: 3px 4px; box-shadow: 0 2px 6px rgba(24,119,242,0.25);">
            🌐 Fanpage Facebook
          </a>
        </div>
      </div>
    </div>

    <!-- FOOTER (Apple Minimalist) -->
    <div style="background-color: #f5f5f7; border-top: 1px solid #e5e5ea; padding: 24px 32px; text-align: center; font-size: 12px; color: #86868b; line-height: 1.6;">
      <p style="margin: 0 0 6px; font-weight: 700; color: #1d1d1f;">WHEY4YOU - CAM KẾT 100% CHÍNH HÃNG</p>
      <p style="margin: 0 0 8px; font-size: 11px; color: #555558; line-height: 1.5;">
        Đồng kiểm ngoại quan cùng bưu tá · <strong>Lưu ý:</strong> Quý khách vui lòng <strong>quay video liền mạch khi mở kiện hàng</strong> để được hỗ trợ đổi trả 100% nếu có sự cố.
      </p>
      <p style="margin: 0 0 10px; font-size: 11px;">
        <a href="${baseUrl}/policy/chinh-sach-doi-tra" target="_blank" style="color: #0066cc; text-decoration: underline; font-weight: 600; margin: 0 4px;">Chính sách đổi trả & Video mở hàng</a> ·
        <a href="${baseUrl}/policy/chinh-sach-giao-hang" target="_blank" style="color: #0066cc; text-decoration: underline; font-weight: 600; margin: 0 4px;">Quy định đồng kiểm</a>
      </p>
      <p style="margin: 0; color: #86868b;">
        <a href="https://zalo.me/g/hqwqsqcnpgik9n3zo0nk" target="_blank" style="color: #0068ff; text-decoration: none; font-weight: 600; margin: 0 6px;">Cộng đồng Zalo</a> ·
        <a href="https://www.facebook.com/people/Whey4You/61563177707517/" target="_blank" style="color: #1877f2; text-decoration: none; font-weight: 600; margin: 0 6px;">Facebook Whey4You</a> ·
        <a href="${baseUrl}" style="color: #0066cc; text-decoration: none; font-weight: 600; margin: 0 6px;">Website whey4you.vn</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Tạo phiên bản plain-text chuẩn RFC multipart/alternative.
 * Giúp email vượt qua bộ lọc SpamAssassin, Google AI Filter và cải thiện tỷ lệ vào Inbox.
 */
export function renderInvoiceEmailPlainText(data: InvoiceEmailData): string {
  const baseUrl = data.appUrl || 'https://whey4you.vn';
  const orderUrl = `${baseUrl}/orders?code=${encodeURIComponent(data.orderCode)}&invoice=true`;
  const isCod = data.paymentMethod === 'cod';
  const paidAmount = isCod ? (data.depositAmount || 100000) : data.totalAmount;
  const codRemaining = isCod ? (data.codRemaining ?? Math.max(0, data.totalAmount - paidAmount)) : 0;

  const itemsText = data.items
    .map(
      (item) =>
        `- ${item.product_name}${item.flavor_name ? ` (Vị: ${item.flavor_name})` : ''} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`
    )
    .join('\n');

  return `
WHEY4YOU - HÓA ĐƠN XÁC NHẬN ĐƠN HÀNG #${data.orderCode}
--------------------------------------------------
Chào ${data.customerName},
Whey4You xin thông báo đơn hàng #${data.orderCode} đã được tiếp nhận và xử lý.

THÔNG TIN ĐƠN HÀNG:
- Mã đơn hàng: ${data.orderCode}
- Thời gian: ${new Date().toLocaleString('vi-VN')}
- Phương thức thanh toán: ${isCod ? 'COD (Đã nhận cọc 100.000đ qua VietQR)' : 'Thanh toán 100% qua VietQR'}
- Người nhận: ${data.customerName} - ${data.customerPhone}
- Địa chỉ giao hàng: ${data.customerAddress}
${data.carrierName ? `- Đơn vị vận chuyển: ${data.carrierName}\n` : ''}
CHI TIẾT SẢN PHẨM:
${itemsText}

TỔNG KẾT THANH TOÁN:
- Tạm tính tiền hàng: ${formatPrice(data.subtotal)}
${data.discountAmount && data.discountAmount > 0 ? `- Voucher giảm giá (${data.couponCode || 'Ưu đãi'}): -${formatPrice(data.discountAmount)}\n` : ''}- Phí vận chuyển: ${formatPrice(data.shippingFee)}
- Tổng giá trị đơn hàng: ${formatPrice(data.totalAmount)}
- Đã thanh toán (VietQR): -${formatPrice(paidAmount)}
${isCod ? `- Số tiền COD còn lại khi nhận: ${formatPrice(codRemaining)}\n` : ''}
Tra cứu đơn hàng trực tuyến & xuất hóa đơn:
${orderUrl}

LƯU Ý QUAN TRỌNG KHI NHẬN HÀNG:
- Quý khách vui lòng đồng kiểm cùng bưu tá và QUAY VIDEO LIỀN MẠCH KHI MỞ KIỆN HÀNG để được hỗ trợ bảo hành 100%.
- Hỗ trợ Zalo: https://zalo.me/g/hqwqsqcnpgik9n3zo0nk
- Hotline & Fanpage: https://www.facebook.com/people/Whey4You/61563177707517/
- Website: ${baseUrl}
--------------------------------------------------
Trân trọng cảm ơn quý khách!
Đội ngũ Whey4You
`.trim();
}

