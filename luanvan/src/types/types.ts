export interface SanPham {
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
}

export interface SanPhamGioHang {
  sanPham: SanPham;
  soLuong: number;
}
