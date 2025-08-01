export interface Product {
  ma_san_pham: number;
  ten_san_pham: string;
  thuong_hieu: string;
  mo_ta_ngan: string;
  chat_lieu: string;
  trang_thai_hoat_dong: string;
  ma_khuyen_mai: number | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  ten_danh_muc: string | null;
  bienthe: Variant[];
}

export interface Variant {
  ten_cac_bien_the?: string;
  ma_bien_the?: number;
  id?: number;
  ten_mau_sac: string;
  hex_code: string;
  ten_kich_thuoc: string;
  gia_ban: string; // API trả về string, nhưng gửi đi cần number
  so_luong_ton: number;
  trang_thai_hoat_dong_btsp: string;
  hinh_anh: string[];
}

export interface InputProduct {
  ten_san_pham: string;
  thuong_hieu: string;
  mo_ta_ngan: string;
  chat_lieu: string;
  trang_thai_hoat_dong: string;
  ma_khuyen_mai: number | null;
  ten_danh_muc: string | null;
  bienthe: InputVariant[];
}

export interface InputVariant {
  ten_mau_sac: string;
  hex_code: string;
  ten_kich_thuoc: string;
  gia_ban: number;
  so_luong_ton: number;
  trang_thai_hoat_dong_btsp: string;
  hinh_anh: string[];
}

export interface ProductResponse {
  message: string;
  data: Product[] | Product;
}

export interface VariantForEdit {
  ma_bien_the?: number; // Cập nhật từ ma_bien_the_san_pham thành ma_bien_the
  ten_cac_bien_the?: string; // Backend trả về tên màu + size trong 1 string
  ten_mau_sac: string;
  hex_code: string;
  ten_kich_thuoc: string;
  gia_ban: number; // << Khác biệt chính
  so_luong_ton: number;
  trang_thai_hoat_dong_btsp: string;
  hinh_anh: string[];
  ngay_tao?: string; // Thêm field này từ API response
}

/**
 * Kiểu dữ liệu cho sản phẩm khi đang ở trong state của component EditProduct.
 */
export interface ProductForEdit extends Omit<Product, "bienthe"> {
  bienthe: VariantForEdit[];
}
