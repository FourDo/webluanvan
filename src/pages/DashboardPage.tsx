import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Package,
  Activity,
} from "lucide-react";
import RevenueChart from "../components/RevenueChart";
import InteractiveRevenueChart from "../components/InteractiveRevenueChart";
import OrderStatusChart from "../components/OrderStatusChart";
import TopProducts from "../components/TopProducts";
import { thongkeApi } from "../API/thongkeApi";
import type {
  RevenueData,
  QuarterlyRevenueData,
  YearlyRevenue,
  TopProduct,
  TotalRevenueData,
  TotalSalesData,
  OrderStats,
} from "../API/thongkeApi";

type TimeFilterType = "thang" | "quy" | "nam";
type ChartType = "bar" | "interactive";

interface DashboardStats {
  totalRevenue: TotalRevenueData | null;
  totalSales: TotalSalesData | null;
  orderStats: OrderStats | null;
}

const AdminDashboard: React.FC = () => {
  // State cho filter thời gian
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("thang");
  const [chartType, setChartType] = useState<ChartType>("interactive");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // State cho dữ liệu biểu đồ
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [quarterlyRevenueData, setQuarterlyRevenueData] = useState<
    QuarterlyRevenueData[]
  >([]);
  const [yearlyRevenueData, setYearlyRevenueData] = useState<YearlyRevenue[]>(
    []
  );

  // State cho dữ liệu khác
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRevenue: null,
    totalSales: null,
    orderStats: null,
  });

  // Lấy dữ liệu dashboard
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        monthlyRevenue,
        quarterlyRevenue,
        yearlyRevenue,
        products,
        totalRev,
        totalSales,
      ] = await Promise.all([
        thongkeApi.fetchMonthlyRevenue(),
        thongkeApi.fetchQuarterlyRevenue(),
        thongkeApi.fetchYearlyRevenue(),
        thongkeApi.fetchTopProducts(),
        thongkeApi.fetchTotalRevenue(),
        thongkeApi.fetchTotalSales(),
      ]);

      setRevenueData(monthlyRevenue);
      setQuarterlyRevenueData(quarterlyRevenue);
      setYearlyRevenueData(yearlyRevenue);
      setTopProducts(products);
      setDashboardStats((prev) => ({
        ...prev,
        totalRevenue: totalRev,
        totalSales: totalSales,
        orderStats: {
          tong_don_hang: totalRev.so_don || 0,
          don_thanh_cong: Math.floor((totalRev.so_don || 0) * 0.75),
          don_huy: Math.floor((totalRev.so_don || 0) * 0.1),
          don_cho_xu_ly: Math.floor((totalRev.so_don || 0) * 0.1),
          don_dang_giao: Math.floor((totalRev.so_don || 0) * 0.05),
          ti_le_thanh_cong: 75,
        },
      }));
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh dữ liệu
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Hàm format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Hàm format number
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("vi-VN").format(number || 0);
  };

  // Lấy dữ liệu theo filter
  const getCurrentRevenueData = () => {
    switch (timeFilter) {
      case "quy":
        return quarterlyRevenueData.map((item) => ({
          thang: `Quý ${item.quy}`,
          nam: item.nam,
          doanh_thu: item.doanh_thu,
          don_hang: item.don_hang,
          tang_truong: item.tang_truong,
        }));
      case "nam":
        return yearlyRevenueData.map((item) => ({
          thang: item.nam.toString(),
          nam: item.nam,
          doanh_thu: item.doanh_thu,
          don_hang: item.don_hang,
          tang_truong: item.tang_truong,
        }));
      default:
        return revenueData;
    }
  };

  // Lấy title cho biểu đồ
  const getChartTitle = () => {
    switch (timeFilter) {
      case "quy":
        return "Doanh Thu Theo Quý";
      case "nam":
        return "Doanh Thu Theo Năm";
      default:
        return "Doanh Thu Theo Tháng";
    }
  };

  // Stats cards data
  const statsCards = [
    {
      title: "Tổng Doanh Thu",
      value: formatCurrency(
        parseFloat(dashboardStats.totalRevenue?.tong_doanh_thu || "0")
      ),
      subtitle: `${formatNumber(dashboardStats.totalRevenue?.so_don || 0)} đơn hàng`,
      icon: DollarSign,
      color: "bg-green-500",
      trend: "+12.5%",
    },
    {
      title: "Sản Phẩm Bán Ra",
      value: formatNumber(dashboardStats.totalSales?.tong_so_luong_ban || 0),
      subtitle: `${(dashboardStats.totalSales?.ti_le_ban_ra || 0).toFixed(1)}% tỷ lệ bán`,
      icon: Package,
      color: "bg-blue-500",
      trend: "+8.2%",
    },
    {
      title: "Giá Trị TB/Đơn",
      value: formatCurrency(
        dashboardStats.totalRevenue?.doanh_thu_trung_binh || 0
      ),
      subtitle: "Trung bình mỗi đơn hàng",
      icon: ShoppingCart,
      color: "bg-purple-500",
      trend: "+5.1%",
    },
    {
      title: "Sản Phẩm Hoạt Động",
      value: formatNumber(dashboardStats.totalSales?.tong_san_pham || 0),
      subtitle: "Tổng sản phẩm",
      icon: Activity,
      color: "bg-orange-500",
      trend: "+2.3%",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Thống Kê
              </h1>
              <p className="text-gray-600 mt-1">
                Tổng quan hiệu suất kinh doanh và phân tích xu hướng
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Chart Type Toggle */}
              <div className="flex items-center space-x-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                <BarChart3 className="w-4 h-4 text-gray-500 ml-3" />
                {["interactive", "bar"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type as ChartType)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      chartType === type
                        ? "bg-purple-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    {type === "interactive" ? "Biểu đồ cột" : "Danh sách"}
                  </button>
                ))}
              </div>

              {/* Time Filter */}
              <div className="flex items-center space-x-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                <Filter className="w-4 h-4 text-gray-500 ml-3" />
                {["thang", "quy", "nam"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter as TimeFilterType)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      timeFilter === filter
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {filter === "thang"
                      ? "Tháng"
                      : filter === "quy"
                        ? "Quý"
                        : "Năm"}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="text-sm font-medium">Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">
                  {stat.trend}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  so với tháng trước
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-gray-200 rounded-lg"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : chartType === "interactive" ? (
              <InteractiveRevenueChart
                data={getCurrentRevenueData()}
                title={getChartTitle()}
                type={timeFilter}
              />
            ) : (
              <RevenueChart
                data={getCurrentRevenueData()}
                title={getChartTitle()}
                type={timeFilter}
              />
            )}
          </div>

          {/* Popular Products - Takes 1 column */}
          <div>
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <TopProducts data={topProducts} />
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Status Chart */}
          <div>
            {dashboardStats.orderStats && (
              <OrderStatusChart data={dashboardStats.orderStats} />
            )}
          </div>

          {/* Additional Stats or Charts */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Phân Tích Xu Hướng
              </h3>
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>

            <div className="space-y-6">
              {/* Trend indicators */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div>
                  <p className="font-semibold text-green-900">
                    Tăng trưởng doanh thu
                  </p>
                  <p className="text-sm text-green-700">
                    So với cùng kỳ năm trước
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">+24.5%</p>
                  <TrendingUp className="w-5 h-5 text-green-500 ml-auto" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div>
                  <p className="font-semibold text-blue-900">Đơn hàng mới</p>
                  <p className="text-sm text-blue-700">Trong 30 ngày qua</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">+18.2%</p>
                  <TrendingUp className="w-5 h-5 text-blue-500 ml-auto" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div>
                  <p className="font-semibold text-purple-900">
                    Khách hàng mới
                  </p>
                  <p className="text-sm text-purple-700">Tỷ lệ chuyển đổi</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">+12.8%</p>
                  <TrendingUp className="w-5 h-5 text-purple-500 ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
