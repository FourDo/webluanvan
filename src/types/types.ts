export interface SanPham {
  width: number;
  length: number;
  weight: number;
  chieuRong: number;
  chieuDai: number;
  chieuCao: number;
  khoiLuong: number;
  description: any;
  category: any;
  image: any;
  date: any;
  price: any;
  name: any;
  id: number;
  ten: string;
  loai: string;
  gia: number;
  hinhAnh: string;
  moTa: string;
  conHang: boolean;
  mauSac?: string;
  kichThuoc?: string;
  ma_bien_the?: number; // Thêm trường này
}

export interface SanPhamGioHang {
  sanPham: SanPham;
  soLuong: number;
}
