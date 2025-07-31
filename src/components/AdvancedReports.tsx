import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Star,
  Activity,
  PieChart,
  Download,
  RefreshCw,
  Eye,
  Home,
  ChevronRight,
} from "lucide-react";
import thongkeApi from "../API/thongkeApi";
import RevenueChart from "./RevenueChart";
import type {
  ThongKeTongHopData,
  DoanhThuTheoThoiGianData,
} from "../API/thongkeApi";

type TimeFilter = "thang" | "quy" | "nam";

const AdvancedReports = () => {
  const [thongKe, setThongKe] = useState<ThongKeTongHopData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("thang");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "revenue" | "products" | "customers"
  >("overview");

  useEffect(() => {
    loadThongKe();

    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (
      tabParam &&
      ["overview", "revenue", "products", "customers"].includes(tabParam)
    ) {
      setActiveTab(tabParam as any);
    }
  }, []);

  const loadThongKe = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await thongkeApi.getAllThongKe();
      setThongKe(data);
    } catch (error) {
      console.error("❌ Lỗi khi tải thống kê:", error);
      setError("Không thể tải dữ liệu thống kê");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("vi-VN").format(number);
  };

  const getRevenueData = (): DoanhThuTheoThoiGianData[] => {
    if (!thongKe) return [];

    switch (timeFilter) {
      case "thang":
        return thongKe.doanhThuTheoThang;
      case "quy":
        return thongKe.doanhThuTheoQuy;
      case "nam":
        return thongKe.doanhThuTheoNam;
      default:
        return thongKe.doanhThuTheoThang;
    }
  };

  const exportData = () => {
    // Logic xuất báo cáo
    console.log("Đang xuất báo cáo...");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  if (error || !thongKe) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error || "Không có dữ liệu"}</p>
          <button
            onClick={loadThongKe}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <Home className="w-4 h-4" />
        <Link to="/admin" className="hover:text-blue-600 transition-colors">
          Admin
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Thống kê & Báo cáo</span>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Chào mừng đến với Báo cáo nâng cao! 🎉
            </h1>
            <p className="text-blue-100">
              Phân tích toàn diện doanh thu, sản phẩm và hành vi khách hàng của
              bạn
            </p>
          </div>
          <div className="hidden lg:block">
            <BarChart3 className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Header với filter và actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📊 Báo cáo & Thống kê nâng cao
            </h1>
            <p className="text-gray-600">
              Phân tích chi tiết doanh thu, sản phẩm và hành vi khách hàng
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Time Filter */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["thang", "quy", "nam"] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeFilter === filter
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {filter === "thang"
                    ? "Theo tháng"
                    : filter === "quy"
                      ? "Theo quý"
                      : "Theo năm"}
                </button>
              ))}
            </div>

            {/* Year Filter */}
            {timeFilter !== "nam" && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[2022, 2023, 2024, 2025].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={loadThongKe}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Xuất BC
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(thongKe.doanhThu.tong_doanh_thu)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-lg font-bold text-blue-600">
                {formatNumber(thongKe.thongKeDonHang.tong_don_hang)}
              </p>
            </div>
            <ShoppingBag className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sản phẩm bán</p>
              <p className="text-lg font-bold text-purple-600">
                {formatNumber(thongKe.soLuongBanRa.tong_so_luong)}
              </p>
            </div>
            <Package className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tỷ lệ thành công</p>
              <p className="text-lg font-bold text-orange-600">
                {thongKe.thongKeDonHang.ti_le_thanh_cong.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Tổng quan", icon: BarChart3 },
              { id: "revenue", label: "Doanh thu", icon: DollarSign },
              { id: "products", label: "Sản phẩm", icon: Package },
              { id: "customers", label: "Khách hàng", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Tổng doanh thu</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(thongKe.doanhThu.tong_doanh_thu)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-200" />
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+12.5% so với tháng trước</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Đơn hàng</p>
                      <p className="text-2xl font-bold">
                        {formatNumber(thongKe.thongKeDonHang.tong_don_hang)}
                      </p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-blue-200" />
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      Tỷ lệ thành công:{" "}
                      {thongKe.thongKeDonHang.ti_le_thanh_cong}%
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Sản phẩm bán</p>
                      <p className="text-2xl font-bold">
                        {formatNumber(thongKe.soLuongBanRa.tong_so_luong)}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-purple-200" />
                  </div>
                  <div className="mt-4 flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {thongKe.soLuongBanRa.so_san_pham} loại sản phẩm
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Khách hàng</p>
                      <p className="text-2xl font-bold">
                        {formatNumber(
                          thongKe.hanhViKhachHang.khach_moi +
                            thongKe.hanhViKhachHang.khach_quay_lai
                        )}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-orange-200" />
                  </div>
                  <div className="mt-4 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {thongKe.hanhViKhachHang.khach_moi} khách mới
                    </span>
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="col-span-full">
                <RevenueChart
                  data={getRevenueData()}
                  title={`Biểu đồ doanh thu ${
                    timeFilter === "thang"
                      ? "theo tháng"
                      : timeFilter === "quy"
                        ? "theo quý"
                        : "theo năm"
                  }`}
                  type={timeFilter}
                />
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Detailed Revenue Stats */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    💰 Chi tiết doanh thu
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">
                          Tổng doanh thu
                        </p>
                        <p className="text-sm text-gray-500">Tất cả đơn hàng</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(thongKe.doanhThu.tong_doanh_thu)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">
                          Doanh thu trung bình/đơn
                        </p>
                        <p className="text-sm text-gray-500">
                          Giá trị đơn hàng
                        </p>
                      </div>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(
                          thongKe.doanhThu.doanh_thu_trung_binh || 0
                        )}
                      </p>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">
                          Tổng số đơn hàng
                        </p>
                        <p className="text-sm text-gray-500">Đã xử lý</p>
                      </div>
                      <p className="text-xl font-bold text-purple-600">
                        {formatNumber(thongKe.doanhThu.so_don_hang)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    📦 Trạng thái đơn hàng
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium">Thành công</span>
                      </div>
                      <span className="font-bold text-green-600">
                        {formatNumber(thongKe.thongKeDonHang.don_thanh_cong)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                        <span className="font-medium">Đang xử lý</span>
                      </div>
                      <span className="font-bold text-yellow-600">
                        {formatNumber(thongKe.thongKeDonHang.don_cho_xu_ly)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="font-medium">Đang giao</span>
                      </div>
                      <span className="font-bold text-blue-600">
                        {formatNumber(thongKe.thongKeDonHang.don_dang_giao)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                        <span className="font-medium">Đã hủy</span>
                      </div>
                      <span className="font-bold text-red-600">
                        {formatNumber(thongKe.thongKeDonHang.don_huy)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    🔥 Top sản phẩm bán chạy
                  </h3>
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>

                <div className="space-y-4">
                  {thongKe.sanPhamBanChay.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                          {index + 1}
                        </div>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {product.hinh_anh ? (
                            <img
                              src={product.hinh_anh}
                              alt={product.ten_san_pham}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {product.ten_san_pham}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatNumber(product.so_luong_ban)} đã bán •{" "}
                            {product.ti_le_phan_tram}% thị phần
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(product.doanh_thu)}
                        </p>
                        <div className="flex items-center justify-end mt-1">
                          <Eye className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">
                            Chi tiết
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Behavior */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      👥 Phân tích khách hàng
                    </h3>
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">
                          Khách hàng mới
                        </p>
                        <p className="text-sm text-gray-500">
                          Lần đầu mua hàng
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatNumber(thongKe.hanhViKhachHang.khach_moi)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">
                          Khách quay lại
                        </p>
                        <p className="text-sm text-gray-500">Đã mua trước đó</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatNumber(thongKe.hanhViKhachHang.khach_quay_lai)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">
                          Khách trung thành
                        </p>
                        <p className="text-sm text-gray-500">
                          Mua thường xuyên
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatNumber(
                          thongKe.hanhViKhachHang.khach_trung_thanh
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Purchase Behavior */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      🛒 Hành vi mua sắm
                    </h3>
                    <PieChart className="w-6 h-6 text-orange-600" />
                  </div>

                  <div className="space-y-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">
                        Đơn hàng TB/khách
                      </p>
                      <p className="text-3xl font-bold text-orange-600 mt-2">
                        {thongKe.hanhViKhachHang.don_hang_trung_binh}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">
                        Giá trị TB/đơn
                      </p>
                      <p className="text-2xl font-bold text-indigo-600 mt-2">
                        {formatCurrency(
                          thongKe.hanhViKhachHang.gia_tri_trung_binh
                        )}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">
                        Chu kỳ mua hàng (ngày)
                      </p>
                      <p className="text-3xl font-bold text-pink-600 mt-2">
                        {thongKe.hanhViKhachHang.thoi_gian_mua_sam_trung_binh}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Segmentation */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📊 Phân khúc khách hàng
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                      <span>
                        Khách mới ({thongKe.hanhViKhachHang.khach_moi})
                      </span>
                      <span>54.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{ width: "54.5%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                      <span>
                        Khách quay lại ({thongKe.hanhViKhachHang.khach_quay_lai}
                        )
                      </span>
                      <span>30.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: "30.8%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                      <span>
                        Khách trung thành (
                        {thongKe.hanhViKhachHang.khach_trung_thanh})
                      </span>
                      <span>14.7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full"
                        style={{ width: "14.7%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedReports;
