export interface Event {
  ten_su_kien: any;
  su_kien_id: number;
  tieu_de: string;
  noi_dung: string;
  anh_banner: string;
  slug?: string;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  loai_su_kien: string;
  duong_dan?: string;
  uu_tien: number;
  hien_thi: number;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface EventProduct {
  gia_sau_khuyen_mai: any;
  ma_san_pham: number;
  phan_tram_giam: number;
  ghi_chu: string;
}

export interface EventProductRequest {
  su_kien_id: number;
  ma_san_pham: number;
  gia_sau_khuyen_mai: number;
  phan_tram_giam: number;
  ghi_chu: string;
}
