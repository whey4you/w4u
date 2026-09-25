import { AllinGoLocationCoords } from './types';

// Toạ độ trung tâm mặc định của các tỉnh thành lớn (mã GSO)
const PROVINCE_CENTROIDS: Record<string, AllinGoLocationCoords> = {
  '01': { lat: 21.028511, lng: 105.854167 }, // Hà Nội
  '79': { lat: 10.776889, lng: 106.700806 }, // TP. Hồ Chí Minh
  '48': { lat: 16.054407, lng: 108.202167 }, // Đà Nẵng
  '31': { lat: 20.844912, lng: 106.688084 }, // Hải Phòng
  '92': { lat: 10.045162, lng: 105.746857 }, // Cần Thơ
  '77': { lat: 10.345986, lng: 107.084305 }, // Bà Rịa - Vũng Tàu
  '74': { lat: 10.980461, lng: 106.651871 }, // Bình Dương
  '75': { lat: 10.942761, lng: 106.816696 }, // Đồng Nai
  '49': { lat: 15.880058, lng: 108.338047 }, // Quảng Nam
  '46': { lat: 16.463713, lng: 107.590866 }, // Thừa Thiên Huế
  '56': { lat: 12.238791, lng: 109.196749 }, // Khánh Hòa
  '68': { lat: 11.940419, lng: 108.458313 }, // Lâm Đồng
  '80': { lat: 10.533333, lng: 106.400000 }, // Long An
  '82': { lat: 10.366667, lng: 106.366667 }, // Tiền Giang
  '89': { lat: 10.033333, lng: 105.783333 }, // An Giang
  '91': { lat: 10.016667, lng: 105.083333 }, // Kiên Giang
  '26': { lat: 20.933333, lng: 107.033333 }, // Quảng Ninh
  '27': { lat: 21.133333, lng: 106.066667 }, // Bắc Ninh
  '30': { lat: 20.933333, lng: 106.316667 }, // Hải Dương
};

// Toạ độ mặc định dự phòng (TP.HCM)
const DEFAULT_COORDS: AllinGoLocationCoords = {
  lat: 10.776889,
  lng: 106.700806,
};

/**
 * Trả về toạ độ đại diện gần nhất theo mã Tỉnh/Thành GSO.
 * Đảm bảo AllinGo API không bị lỗi validation khi không có GPS thời gian thực.
 */
export function getCentroidByLocation(provinceCode?: string): AllinGoLocationCoords {
  if (!provinceCode) return DEFAULT_COORDS;
  const cleanCode = String(provinceCode).trim();
  return PROVINCE_CENTROIDS[cleanCode] || DEFAULT_COORDS;
}
