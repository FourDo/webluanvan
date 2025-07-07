import axios from "axios";

const BASE_URL = "https://luanvan-7wv1.onrender.com/api";

export interface ChiTietDonHang {
  ma_bien_the: number;
  ten_san_pham: string;
  mau_sac: string;
  kich_thuoc: string;
  so_luong: number;
  gia_goc: number;
  loai_khuyen_mai: string;
  gia_khuyen_mai: number;
  gia_sau_km: number;
}

export interface DonHangPayload {
  ma_nguoi_dung: number | null;
  ten_nguoi_nhan: string;
  so_dien_thoai: string;
  dia_chi_giao: string;
  hinh_thuc_thanh_toan: string;
  tong_tien: number;
  phi_van_chuyen: number;
  tong_thanh_toan: number;
  ghi_chu?: string;
  chi_tiet: ChiTietDonHang[];
}

export async function createOrder(payload: DonHangPayload) {
  const response = await axios.post(`${BASE_URL}/don-hang`, payload);
  return response.data;
} 