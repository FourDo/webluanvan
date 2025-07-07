export interface Variant {
  ma_bien_the: number;
  hex_code: string;
  ten_mau_sac: string;
  ten_kich_thuoc: string;
  gia_ban: number;
  so_luong_ton: number;
  trang_thai_hoat_dong_btsp: string;
  hinh_anh: string[];
  ngay_tao: string;
  ngay_cap_nhat: string;
}

export interface VariantResponse {
  success: boolean;
  data: Variant | Variant[];
  message?: string;
}
