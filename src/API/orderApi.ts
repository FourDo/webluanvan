import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api";

export interface ChiTietDonHang {
  id: number;
  ma_don_hang: number;
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

export interface DonHang {
  ma_don_hang: number;
  ma_nguoi_dung: number;
  ten_nguoi_nhan: string;
  so_dien_thoai: string;
  dia_chi_giao: string;
  hinh_thuc_thanh_toan: string;
  tong_tien: string;
  phi_van_chuyen: string;
  tong_thanh_toan: string;
  ghi_chu?: string;
  trang_thai: string;
  Ngay_Tao: string;
  Ngay_Cap_Nhat: string;
  ngay_thanh_toan: string;
  da_thanh_toan: number;
  don_vi_van_chuyen?: string;
  ma_van_don?: string;
  ngay_du_kien_giao?: string;
}

export interface OrderDetailResponse {
  message: string;
  don_hang: DonHang;
  chi_tiet: ChiTietDonHang[];
}

export interface ChiTietDonHangPayload {
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
  ma_nguoi_dung: number;
  ten_nguoi_nhan: string;
  so_dien_thoai: string;
  dia_chi_giao: string;
  hinh_thuc_thanh_toan: string;
  tong_tien: number;
  phi_van_chuyen: number;
  tong_thanh_toan: number;
  ghi_chu?: string;
  chi_tiet: ChiTietDonHangPayload[];
}

export async function createOrder(payload: DonHangPayload) {
  const response = await axios.post(`${BASE_URL}/don-hang`, payload);
  return response.data;
}

// Lấy chi tiết đơn hàng theo ID
export async function getOrderDetail(
  orderId: string | number
): Promise<OrderDetailResponse> {
  const response = await axios.get(
    `${BASE_URL}/donhang/chitietdonhang/${orderId}`
  );
  return response.data;
}
