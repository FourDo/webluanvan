import apiClient from "../ultis/apiClient";

export interface Voucher {
  ma_voucher: number;
  ma_giam_gia: string;
  mo_ta: string;
  ma_san_pham: number | null;
  ma_danh_muc: number | null;
  ap_dung_toan_bo: boolean;
  loai_khuyen_mai: string;
  gia_tri_giam: number;
  don_toi_thieu: number;
  giam_toi_da: number;
  gioi_han_su_dung: number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai: string;
}

export interface VoucherListResponse {
  status: string;
  message: string;
  data: Voucher[];
}

export interface VoucherApplyRequest {
  ma_giam_gia: string;
  ma_nguoi_dung: number;
  tong_tien?: number;
  san_pham: {
    ma_san_pham: number;
    ma_danh_muc: number;
    ma_bien_the: number;
    so_luong: number;
  }[];
}

export interface VoucherApplyResponse {
  message: string;
  giam_gia: number;
  tong_tien_truoc_giam: number;
  tong_tien_sau_giam: number;
}

export const voucherApi = {
  // Lấy danh sách voucher đang hoạt động
  getActiveVouchers: (): Promise<VoucherListResponse> =>
    apiClient
      .get("/listactive/voucher")
      .then((res) => {
        console.log("📋 Response từ API getActiveVouchers:", res.data);
        return res.data;
      })
      .catch((error) => {
        console.error("❌ Lỗi khi lấy danh sách voucher:", error);
        throw new Error(
          error.response?.data?.message || "Lấy danh sách voucher thất bại."
        );
      }),

  // Áp dụng voucher
  applyVoucher: (payload: VoucherApplyRequest): Promise<VoucherApplyResponse> =>
    apiClient
      .post("/voucher/apply", payload)
      .then((res) => {
        console.log("✅ Response từ API applyVoucher:", res.data);
        return res.data;
      })
      .catch((error) => {
        console.error("❌ Lỗi khi áp dụng voucher:", error);

        // Trả về thông báo lỗi chi tiết
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }

        throw new Error("Áp dụng voucher thất bại.");
      }),
};

export default voucherApi;
