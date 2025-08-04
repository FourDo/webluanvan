import apiClient from "../ultis/apiClient";

export interface Voucher {
  ma_voucher?: number;
  ma_giam_gia: string;
  mo_ta: string;
  ma_san_pham?: number | null;
  ma_danh_muc?: number | null;
  ap_dung_toan_bo: boolean; // tinyint -> boolean
  loai_khuyen_mai: "%" | "tien"; // enum('%','tien')
  gia_tri_giam: number; // bigint
  don_toi_thieu: number; // bigint
  giam_toi_da: number; // bigint
  gioi_han_su_dung: number; // int
  ngay_bat_dau: string; // timestamp
  ngay_ket_thuc: string; // timestamp
  ngay_tao?: string; // timestamp
  ngay_cap_nhat?: string; // timestamp
  trang_thai: "hoat_dong" | "het_han" | "vo_hieu"; // enum
}

export interface VoucherCreate {
  ma_giam_gia: string;
  mo_ta: string;
  ma_san_pham?: number | null;
  ma_danh_muc?: number | null;
  ap_dung_toan_bo: boolean;
  loai_khuyen_mai: "%" | "tien";
  gia_tri_giam: number;
  don_toi_thieu: number;
  giam_toi_da: number;
  gioi_han_su_dung: number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  trang_thai: "hoat_dong" | "het_han" | "vo_hieu";
}

export const voucherApi = {
  // Lấy danh sách voucher
  fetchVouchers: () =>
    apiClient
      .get<{ data: Voucher[] }>("/voucher")
      .then((res) => res.data.data || res.data)
      .catch(() => {
        throw new Error("Lấy danh sách voucher thất bại.");
      }),

  // Tạo voucher mới
  createVoucher: (voucherData: VoucherCreate) =>
    apiClient
      .post<Voucher>("/voucher", voucherData)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Tạo voucher thất bại.");
      }),

  // Cập nhật voucher
  updateVoucher: (id: number, voucherData: Partial<VoucherCreate>) =>
    apiClient
      .put<Voucher>(`/voucher/${id}`, voucherData)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Cập nhật voucher thất bại.");
      }),

  // Xóa voucher
  deleteVoucher: (id: number) =>
    apiClient
      .delete(`/voucher/${id}`)
      .then(() => {})
      .catch(() => {
        throw new Error("Xóa voucher thất bại.");
      }),

  // Lấy chi tiết voucher
  getVoucherById: (id: number) =>
    apiClient
      .get<Voucher>(`/voucher/${id}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy thông tin voucher thất bại.");
      }),

  // Chuyển đổi trạng thái voucher
  toggleVoucherStatus: (id: number, newStatus: "hoat_dong" | "vo_hieu") =>
    apiClient
      .post(`voucher/chuyendoi/${id}`, { trang_thai: newStatus })
      .then((res) => res.data)
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message ||
          "Chuyển đổi trạng thái voucher thất bại.";
        throw new Error(errorMessage);
      }),
};

export default voucherApi;
