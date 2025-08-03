import apiClient from "../ultis/apiClient";

// Interfaces cho các response types
export interface RevenueData {
  thang: string;
  nam: number;
  doanh_thu: number;
  don_hang: number;
  tang_truong: number;
}

// Alias để tương thích với RevenueChart
export type DoanhThuTheoThoiGianData = RevenueData;

export interface TopProduct {
  id: number;
  ten_san_pham: string;
  so_luong_ban: number;
  doanh_thu: number;
  ti_le_phan_tram: number;
}

// Alias để tương thích với TopProductsChart
export type SanPhamBanChayData = TopProduct;

export interface OrderStats {
  tong_don_hang: number;
  don_thanh_cong: number;
  don_huy: number;
  don_cho_xu_ly: number;
  don_dang_giao: number;
  ti_le_thanh_cong: number;
}

export interface YearlyRevenue {
  nam: number;
  doanh_thu: number;
  don_hang: number;
  tang_truong: number;
}

export interface MonthlyReport {
  thang: number;
  nam: number;
  so_luong_don_hang: number;
  doanh_thu: number;
  ti_le_hoan_thanh: number;
}

export interface QuarterlyReport {
  quy: number;
  nam: number;
  so_luong_don_hang: number;
  doanh_thu: number;
  ti_le_hoan_thanh: number;
}

export interface YearlyReport {
  nam: number;
  so_luong_don_hang: number;
  doanh_thu: number;
  ti_le_hoan_thanh: number;
}

// Interface cho doanh thu theo quý
export interface QuarterlyRevenueData {
  quy: number;
  nam: number;
  doanh_thu: number;
  don_hang: number;
  tang_truong: number;
}

// Interface cho tổng số lượng bán ra
export interface TotalSalesData {
  tong_so_luong_ban: number;
  tong_san_pham: number;
  ti_le_ban_ra: number;
}

// Interface cho tổng doanh thu - cập nhật theo response thực tế
export interface TotalRevenueData {
  status: boolean;
  tong_doanh_thu: string; // Backend trả về string
  so_don: number;
  doanh_thu_trung_binh: number;
}

export const thongkeApi = {
  // Lấy sản phẩm bán chạy
  fetchTopProducts: () =>
    apiClient
      .get<TopProduct[]>("/thongke/spbanchay")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy danh sách sản phẩm bán chạy thất bại.");
      }),

  // Lấy doanh thu theo tháng
  fetchMonthlyRevenue: () =>
    apiClient
      .get<RevenueData[]>("/thongke/doanhthutheothang")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy doanh thu theo tháng thất bại.");
      }),

  // Lấy doanh thu theo năm
  fetchYearlyRevenue: () =>
    apiClient
      .get<YearlyRevenue[]>("/thongke/doanhthutheonam")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy doanh thu theo năm thất bại.");
      }),

  // Lấy báo cáo số lượng đơn hàng theo tháng
  fetchMonthlyOrderReport: () =>
    apiClient
      .get<MonthlyReport[]>("/thongke/baocaosldhthang")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy báo cáo đơn hàng theo tháng thất bại.");
      }),

  // Lấy báo cáo số lượng đơn hàng theo quý
  fetchQuarterlyOrderReport: () =>
    apiClient
      .get<QuarterlyReport[]>("/thongke/baocaosldhquy")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy báo cáo đơn hàng theo quý thất bại.");
      }),

  // Lấy báo cáo số lượng đơn hàng theo năm
  fetchYearlyOrderReport: () =>
    apiClient
      .get<YearlyReport[]>("/thongke/baocaosldhnam")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy báo cáo đơn hàng theo năm thất bại.");
      }),

  // Lấy doanh thu theo quý
  fetchQuarterlyRevenue: () =>
    apiClient
      .get<QuarterlyRevenueData[]>("/thongke/doanhthutheoquy")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy doanh thu theo quý thất bại.");
      }),

  // Lấy tổng số lượng bán ra
  fetchTotalSales: () =>
    apiClient
      .get<TotalSalesData>("/thongke/tongslbanra")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy tổng số lượng bán ra thất bại.");
      }),

  // Lấy tổng doanh thu - cập nhật theo response thực tế
  fetchTotalRevenue: () =>
    apiClient
      .get<TotalRevenueData>("/thongke/tongdoanhthu")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy tổng doanh thu thất bại.");
      }),

  // Thêm API mới cho thống kê tổng quan
  fetchDashboardStats: async () => {
    try {
      const [totalRevenue, topProducts] = await Promise.all([
        thongkeApi.fetchTotalRevenue(),
        thongkeApi.fetchTopProducts(),
      ]);

      return {
        totalRevenue,
        topProducts,
      };
    } catch (error) {
      throw new Error("Lấy thống kê dashboard thất bại.");
    }
  },
};

export default thongkeApi;
