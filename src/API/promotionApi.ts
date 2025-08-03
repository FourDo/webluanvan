import apiClient from "../ultis/apiClient";

// Định nghĩa kiểu dữ liệu cho Voucher theo bảng SQL
export type Voucher = {
  ma_voucher: number; // AI PK
  ma_giam_gia: string; // varchar(50)
  mo_ta: string; // text
  ap_dung_toan_bo: boolean; // tinyint (0/1)
  loai_khuyen_mai: "%" | "tien"; // enum
  gia_tri_giam: number; // bigint
  don_toi_thieu: number; // bigint
  giam_toi_da: number; // bigint
  gioi_han_su_dung: number; // int
  ngay_bat_dau: string; // timestamp
  ngay_ket_thuc: string; // timestamp
  ngay_tao: string; // timestamp
  trang_thai: "hoat_dong" | "het_han" | "vo_hieu"; // enum
  ngay_cap_nhat: string; // timestamp
};

export type VoucherFormData = {
  ma_giam_gia: string;
  mo_ta: string;
  loai_khuyen_mai: "%" | "tien";
  gia_tri_giam: string | number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  trang_thai: "hoat_dong" | "het_han" | "vo_hieu";
};

export const voucherApi = {
  fetchVouchers: () =>
    apiClient
      .get("/voucher")
      .then((res) => {
        console.log("API Response:", res.data); // Debug log
        // Kiểm tra nếu response có cấu trúc data
        const data = res.data.data || res.data;
        return Array.isArray(data) ? data : [];
      })
      .catch((error) => {
        console.error("Fetch vouchers error:", error);
        throw new Error("Lấy danh sách voucher thất bại.");
      }),

  getVoucherDetail: (id: number) =>
    apiClient
      .get(`/voucher/${id}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy chi tiết voucher thất bại.");
      }),

  createVoucher: (formData: VoucherFormData) =>
    apiClient
      .post("/voucher", {
        ma_giam_gia: formData.ma_giam_gia,
        mo_ta: formData.mo_ta,
        loai_khuyen_mai: formData.loai_khuyen_mai,
        gia_tri_giam: Number(formData.gia_tri_giam),
        ngay_bat_dau: formData.ngay_bat_dau,
        ngay_ket_thuc: formData.ngay_ket_thuc,
        trang_thai: formData.trang_thai,
      })
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Tạo voucher mới thất bại.");
      }),

  updateVoucher: (id: number, formData: VoucherFormData) =>
    apiClient
      .put(`/voucher/${id}`, {
        ma_giam_gia: formData.ma_giam_gia,
        mo_ta: formData.mo_ta,
        loai_khuyen_mai: formData.loai_khuyen_mai,
        gia_tri_giam: Number(formData.gia_tri_giam),
        ngay_bat_dau: formData.ngay_bat_dau,
        ngay_ket_thuc: formData.ngay_ket_thuc,
        trang_thai: formData.trang_thai,
      })
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Cập nhật voucher thất bại.");
      }),

  deleteVoucher: (id: number) =>
    apiClient
      .delete(`/voucher/${id}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Xóa voucher thất bại.");
      }),

  saveVoucher: (formData: VoucherFormData, editingId: number | null = null) => {
    if (editingId) {
      return voucherApi.updateVoucher(editingId, formData);
    } else {
      return voucherApi.createVoucher(formData);
    }
  },
};

// Backward compatibility - export individual functions
export const fetchVouchers = voucherApi.fetchVouchers;
export const getVoucherDetail = voucherApi.getVoucherDetail;
export const createVoucher = voucherApi.createVoucher;
export const updateVoucher = voucherApi.updateVoucher;
export const deleteVoucher = voucherApi.deleteVoucher;
export const saveVoucher = voucherApi.saveVoucher;

export default voucherApi;
