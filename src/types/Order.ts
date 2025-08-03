export type Order = {
  ma_don_hang: number;
  ma_nguoi_dung: number;
  ten_khach_hang: string;
  email: string;
  so_dien_thoai: string;
  dia_chi: string;
  tong_tien: number;
  trang_thai: string;
  phuong_thuc_thanh_toan: string;
  ghi_chu?: string;
  ngay_tao: string;
  ngay_cap_nhat: string;
};

export type OrderDetail = {
  ma_chi_tiet: number;
  ma_don_hang: number;
  ma_san_pham: number;
  ten_san_pham: string;
  hinh_anh?: string;
  so_luong: number;
  gia: number;
  thanh_tien: number;
  mau_sac?: string;
  kich_thuoc?: string;
};

export type OrderWithDetails = {
  don_hang: Order;
  chi_tiet_don_hang: OrderDetail[];
};
