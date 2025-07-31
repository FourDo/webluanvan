import apiClient from "../ultis/apiClient";

// Interface cho response thống kê
export interface ThongKeResponse {
  status: boolean;
  [key: string]: any;
}

// Interface cho doanh thu
export interface DoanhThuData {
  tong_doanh_thu: number;
  so_don_hang: number;
  doanh_thu_trung_binh?: number;
  ngay_thang?: string;
}

// Interface cho doanh thu theo thời gian
export interface DoanhThuTheoThoiGianData {
  thang: string;
  nam: number;
  quy?: number;
  doanh_thu: number;
  don_hang: number;
  tang_truong?: number;
}

// Interface cho sản phẩm bán chạy
export interface SanPhamBanChayData {
  id: number;
  ten_san_pham: string;
  so_luong_ban: number;
  doanh_thu: number;
  ti_le_phan_tram: number;
  hinh_anh?: string;
}

// Interface cho hành vi khách hàng
export interface HanhViKhachHangData {
  khach_moi: number;
  khach_quay_lai: number;
  khach_trung_thanh: number;
  don_hang_trung_binh: number;
  gia_tri_trung_binh: number;
  thoi_gian_mua_sam_trung_binh: number;
}

// Interface cho thống kê đơn hàng
export interface ThongKeDonHangData {
  tong_don_hang: number;
  don_thanh_cong: number;
  don_huy: number;
  don_cho_xu_ly: number;
  don_dang_giao: number;
  ti_le_thanh_cong: number;
}

// Interface cho số lượng bán ra
export interface SoLuongBanRaData {
  tong_so_luong: number;
  so_san_pham: number;
}

// Interface cho đơn hoàn trả
export interface DonHoanTraData {
  so_don_hoan_tra: number;
  ti_le_hoan_tra: number;
  tong_don_hang: number;
}

// Interface tổng hợp thống kê
export interface ThongKeTongHopData {
  doanhThu: DoanhThuData;
  soLuongBanRa: SoLuongBanRaData;
  donHoanTra: DonHoanTraData;
  thongKeDonHang: ThongKeDonHangData;
  doanhThuTheoThang: DoanhThuTheoThoiGianData[];
  doanhThuTheoQuy: DoanhThuTheoThoiGianData[];
  doanhThuTheoNam: DoanhThuTheoThoiGianData[];
  sanPhamBanChay: SanPhamBanChayData[];
  hanhViKhachHang: HanhViKhachHangData;
}

const thongkeApi = {
  // Mock data fallback với dữ liệu chi tiết hơn
  getMockData: (): ThongKeTongHopData => ({
    doanhThu: {
      tong_doanh_thu: 24570000,
      so_don_hang: 156,
      doanh_thu_trung_binh: 1575000,
    },
    soLuongBanRa: {
      tong_so_luong: 850,
      so_san_pham: 45,
    },
    donHoanTra: {
      so_don_hoan_tra: 8,
      ti_le_hoan_tra: 5.1,
      tong_don_hang: 156,
    },
    thongKeDonHang: {
      tong_don_hang: 156,
      don_thanh_cong: 140,
      don_huy: 8,
      don_cho_xu_ly: 3,
      don_dang_giao: 5,
      ti_le_thanh_cong: 89.7,
    },
    doanhThuTheoThang: [
      {
        thang: "T1",
        nam: 2024,
        doanh_thu: 2500000,
        don_hang: 15,
        tang_truong: 5.2,
      },
      {
        thang: "T2",
        nam: 2024,
        doanh_thu: 3200000,
        don_hang: 22,
        tang_truong: 28.0,
      },
      {
        thang: "T3",
        nam: 2024,
        doanh_thu: 3570000,
        don_hang: 28,
        tang_truong: 11.6,
      },
      {
        thang: "T4",
        nam: 2024,
        doanh_thu: 4100000,
        don_hang: 35,
        tang_truong: 14.8,
      },
      {
        thang: "T5",
        nam: 2024,
        doanh_thu: 3800000,
        don_hang: 31,
        tang_truong: -7.3,
      },
      {
        thang: "T6",
        nam: 2024,
        doanh_thu: 4500000,
        don_hang: 42,
        tang_truong: 18.4,
      },
    ],
    doanhThuTheoQuy: [
      {
        thang: "Q1",
        nam: 2024,
        quy: 1,
        doanh_thu: 9270000,
        don_hang: 65,
        tang_truong: 15.2,
      },
      {
        thang: "Q2",
        nam: 2024,
        quy: 2,
        doanh_thu: 12400000,
        don_hang: 108,
        tang_truong: 33.8,
      },
      {
        thang: "Q3",
        nam: 2024,
        quy: 3,
        doanh_thu: 11200000,
        don_hang: 95,
        tang_truong: -9.7,
      },
      {
        thang: "Q4",
        nam: 2024,
        quy: 4,
        doanh_thu: 13500000,
        don_hang: 125,
        tang_truong: 20.5,
      },
    ],
    doanhThuTheoNam: [
      {
        thang: "2022",
        nam: 2022,
        doanh_thu: 35200000,
        don_hang: 280,
        tang_truong: 12.5,
      },
      {
        thang: "2023",
        nam: 2023,
        doanh_thu: 42800000,
        don_hang: 350,
        tang_truong: 21.6,
      },
      {
        thang: "2024",
        nam: 2024,
        doanh_thu: 46370000,
        don_hang: 393,
        tang_truong: 8.3,
      },
    ],
    sanPhamBanChay: [
      {
        id: 1,
        ten_san_pham: "Áo thun nam Premium",
        so_luong_ban: 125,
        doanh_thu: 3750000,
        ti_le_phan_tram: 18.5,
        hinh_anh: "/images/ao-thun-nam.jpg",
      },
      {
        id: 2,
        ten_san_pham: "Quần jean nữ Skinny",
        so_luong_ban: 98,
        doanh_thu: 5880000,
        ti_le_phan_tram: 15.8,
        hinh_anh: "/images/quan-jean-nu.jpg",
      },
      {
        id: 3,
        ten_san_pham: "Giày sneaker unisex",
        so_luong_ban: 87,
        doanh_thu: 6960000,
        ti_le_phan_tram: 14.2,
        hinh_anh: "/images/giay-sneaker.jpg",
      },
      {
        id: 4,
        ten_san_pham: "Áo khoác bomber",
        so_luong_ban: 65,
        doanh_thu: 4550000,
        ti_le_phan_tram: 11.8,
        hinh_anh: "/images/ao-khoac.jpg",
      },
      {
        id: 5,
        ten_san_pham: "Túi xách da nữ",
        so_luong_ban: 52,
        doanh_thu: 3120000,
        ti_le_phan_tram: 9.2,
        hinh_anh: "/images/tui-xach.jpg",
      },
    ],
    hanhViKhachHang: {
      khach_moi: 85,
      khach_quay_lai: 48,
      khach_trung_thanh: 23,
      don_hang_trung_binh: 2.8,
      gia_tri_trung_binh: 1575000,
      thoi_gian_mua_sam_trung_binh: 18.5,
    },
  }),

  // Lấy thống kê tổng doanh thu
  getTongDoanhThu: async (): Promise<DoanhThuData> => {
    try {
      const response = await apiClient.get<any>("/thongke/tongdoanhthu");

      // Xử lý response format mới
      if (response.data.status) {
        return {
          tong_doanh_thu: parseFloat(response.data.tong_doanh_thu) || 0,
          so_don_hang: response.data.so_don || 0,
          doanh_thu_trung_binh: response.data.doanh_thu_trung_binh || 0,
        };
      } else {
        throw new Error("API trả về status false");
      }
    } catch (error) {
      console.error("❌ Lỗi API getTongDoanhThu:", error);
      console.log("🔄 Sử dụng mock data cho doanh thu");
      return thongkeApi.getMockData().doanhThu;
    }
  },

  // Lấy thống kê tổng số lượng bán ra
  getTongSoLuongBanRa: async (): Promise<SoLuongBanRaData> => {
    try {
      const response = await apiClient.get<any>("/thongke/tongslbanra");

      if (response.data.status) {
        return {
          tong_so_luong: response.data.tong_so_luong || 0,
          so_san_pham: response.data.so_san_pham || 0,
        };
      } else {
        throw new Error("API trả về status false");
      }
    } catch (error) {
      console.error("❌ Lỗi API getTongSoLuongBanRa:", error);
      console.log("🔄 Sử dụng mock data cho số lượng bán ra");
      return thongkeApi.getMockData().soLuongBanRa;
    }
  },

  // Lấy thống kê số đơn hoàn trả 1 tháng
  getSoDonHoanTra1Thang: async (): Promise<DonHoanTraData> => {
    try {
      const response = await apiClient.get<any>("/thongke/sodonhoantra1thang");

      if (response.data.status) {
        return {
          so_don_hoan_tra: response.data.so_don_hoan_tra || 0,
          ti_le_hoan_tra: response.data.ti_le_hoan_tra || 0,
          tong_don_hang: response.data.tong_don_hang || 0,
        };
      } else {
        throw new Error("API trả về status false");
      }
    } catch (error) {
      console.error("❌ Lỗi API getSoDonHoanTra1Thang:", error);
      console.log("🔄 Sử dụng mock data cho đơn hoàn trả");
      return thongkeApi.getMockData().donHoanTra;
    }
  },

  // Lấy tất cả thống kê cùng lúc
  getAllThongKe: async (): Promise<ThongKeTongHopData> => {
    try {
      const [doanhThu, soLuongBanRa, donHoanTra] = await Promise.all([
        thongkeApi.getTongDoanhThu(),
        thongkeApi.getTongSoLuongBanRa(),
        thongkeApi.getSoDonHoanTra1Thang(),
      ]);

      // Lấy thêm các dữ liệu khác
      const [
        thongKeDonHang,
        doanhThuTheoThang,
        doanhThuTheoQuy,
        doanhThuTheoNam,
        sanPhamBanChay,
        hanhViKhachHang,
      ] = await Promise.all([
        thongkeApi.getThongKeDonHang(),
        thongkeApi.getDoanhThuTheoThang(),
        thongkeApi.getDoanhThuTheoQuy(),
        thongkeApi.getDoanhThuTheoNam(),
        thongkeApi.getSanPhamBanChay(),
        thongkeApi.getHanhViKhachHang(),
      ]);

      return {
        doanhThu,
        soLuongBanRa,
        donHoanTra,
        thongKeDonHang,
        doanhThuTheoThang,
        doanhThuTheoQuy,
        doanhThuTheoNam,
        sanPhamBanChay,
        hanhViKhachHang,
      };
    } catch (error) {
      console.error("❌ Lỗi khi lấy tất cả thống kê:", error);
      console.log("🔄 Sử dụng toàn bộ mock data");
      return thongkeApi.getMockData();
    }
  },

  // Lấy thống kê đơn hàng chi tiết
  getThongKeDonHang: async (): Promise<ThongKeDonHangData> => {
    try {
      const response = await apiClient.get<any>("/thongke/donhang");

      if (response.data.status) {
        return {
          tong_don_hang: response.data.tong_don_hang || 0,
          don_thanh_cong: response.data.don_thanh_cong || 0,
          don_huy: response.data.don_huy || 0,
          don_cho_xu_ly: response.data.don_cho_xu_ly || 0,
          don_dang_giao: response.data.don_dang_giao || 0,
          ti_le_thanh_cong: response.data.ti_le_thanh_cong || 0,
        };
      } else {
        throw new Error("API trả về status false");
      }
    } catch (error) {
      console.error("❌ Lỗi API getThongKeDonHang:", error);
      return thongkeApi.getMockData().thongKeDonHang;
    }
  },

  // Lấy doanh thu theo tháng
  getDoanhThuTheoThang: async (
    nam?: number
  ): Promise<DoanhThuTheoThoiGianData[]> => {
    try {
      const url = nam
        ? `/thongke/doanhthu/thang?nam=${nam}`
        : "/thongke/doanhthu/thang";
      const response = await apiClient.get<any>(url);

      if (response.data.status && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          thang: item.thang,
          nam: item.nam,
          doanh_thu: parseFloat(item.doanh_thu) || 0,
          don_hang: item.don_hang || 0,
          tang_truong: item.tang_truong || 0,
        }));
      } else {
        throw new Error("API trả về dữ liệu không hợp lệ");
      }
    } catch (error) {
      console.error("❌ Lỗi API getDoanhThuTheoThang:", error);
      return thongkeApi.getMockData().doanhThuTheoThang;
    }
  },

  // Lấy doanh thu theo quý
  getDoanhThuTheoQuy: async (
    nam?: number
  ): Promise<DoanhThuTheoThoiGianData[]> => {
    try {
      const url = nam
        ? `/thongke/doanhthu/quy?nam=${nam}`
        : "/thongke/doanhthu/quy";
      const response = await apiClient.get<any>(url);

      if (response.data.status && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          thang: `Q${item.quy}`,
          nam: item.nam,
          quy: item.quy,
          doanh_thu: parseFloat(item.doanh_thu) || 0,
          don_hang: item.don_hang || 0,
          tang_truong: item.tang_truong || 0,
        }));
      } else {
        throw new Error("API trả về dữ liệu không hợp lệ");
      }
    } catch (error) {
      console.error("❌ Lỗi API getDoanhThuTheoQuy:", error);
      return thongkeApi.getMockData().doanhThuTheoQuy;
    }
  },

  // Lấy doanh thu theo năm
  getDoanhThuTheoNam: async (): Promise<DoanhThuTheoThoiGianData[]> => {
    try {
      const response = await apiClient.get<any>("/thongke/doanhthu/nam");

      if (response.data.status && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          thang: item.nam.toString(),
          nam: item.nam,
          doanh_thu: parseFloat(item.doanh_thu) || 0,
          don_hang: item.don_hang || 0,
          tang_truong: item.tang_truong || 0,
        }));
      } else {
        throw new Error("API trả về dữ liệu không hợp lệ");
      }
    } catch (error) {
      console.error("❌ Lỗi API getDoanhThuTheoNam:", error);
      return thongkeApi.getMockData().doanhThuTheoNam;
    }
  },

  // Lấy sản phẩm bán chạy
  getSanPhamBanChay: async (limit?: number): Promise<SanPhamBanChayData[]> => {
    try {
      const url = limit
        ? `/thongke/sanpham/banchay?limit=${limit}`
        : "/thongke/sanpham/banchay";
      const response = await apiClient.get<any>(url);

      if (response.data.status && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          id: item.id,
          ten_san_pham: item.ten_san_pham,
          so_luong_ban: item.so_luong_ban || 0,
          doanh_thu: parseFloat(item.doanh_thu) || 0,
          ti_le_phan_tram: item.ti_le_phan_tram || 0,
          hinh_anh: item.hinh_anh,
        }));
      } else {
        throw new Error("API trả về dữ liệu không hợp lệ");
      }
    } catch (error) {
      console.error("❌ Lỗi API getSanPhamBanChay:", error);
      return thongkeApi.getMockData().sanPhamBanChay;
    }
  },

  // Lấy hành vi khách hàng
  getHanhViKhachHang: async (): Promise<HanhViKhachHangData> => {
    try {
      const response = await apiClient.get<any>("/thongke/khachhang/hanhvi");

      if (response.data.status) {
        return {
          khach_moi: response.data.khach_moi || 0,
          khach_quay_lai: response.data.khach_quay_lai || 0,
          khach_trung_thanh: response.data.khach_trung_thanh || 0,
          don_hang_trung_binh: response.data.don_hang_trung_binh || 0,
          gia_tri_trung_binh: parseFloat(response.data.gia_tri_trung_binh) || 0,
          thoi_gian_mua_sam_trung_binh:
            response.data.thoi_gian_mua_sam_trung_binh || 0,
        };
      } else {
        throw new Error("API trả về status false");
      }
    } catch (error) {
      console.error("❌ Lỗi API getHanhViKhachHang:", error);
      return thongkeApi.getMockData().hanhViKhachHang;
    }
  },
};

export default thongkeApi;
