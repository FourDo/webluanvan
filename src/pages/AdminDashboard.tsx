import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarAdmin from "../components/SidebarAdmin";
import AdminNavbar from "../components/AdminNavbar";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Download,
  Package,
} from "lucide-react";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // ----- Dữ liệu và state từ QLThongKe được chuyển vào đây -----
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Dữ liệu mẫu cho biểu đồ
  const salesData = [
    { month: "T1", sales: 4000, orders: 240, revenue: 85000000 },
    { month: "T2", sales: 3000, orders: 180, revenue: 62000000 },
    { month: "T3", sales: 5000, orders: 320, revenue: 105000000 },
    { month: "T4", sales: 4500, orders: 280, revenue: 95000000 },
    { month: "T5", sales: 6000, orders: 380, revenue: 125000000 },
    { month: "T6", sales: 5500, orders: 350, revenue: 115000000 },
  ];

  const categoryData = [
    { name: "Điện thoại", value: 40, color: "#8884d8" },
    { name: "Laptop", value: 30, color: "#82ca9d" },
    { name: "Phụ kiện", value: 20, color: "#ffc658" },
    { name: "Khác", value: 10, color: "#ff7c7c" },
  ];

  const recentActivity = [
    {
      time: "2 phút trước",
      activity: "Đơn hàng mới #12345",
      amount: "2,500,000đ",
    },
    { time: "15 phút trước", activity: "Khách hàng mới đăng ký", amount: "+1" },
    { time: "1 giờ trước", activity: "Sản phẩm được thêm", amount: "+5" },
    {
      time: "3 giờ trước",
      activity: "Đơn hàng hoàn thành #12340",
      amount: "1,200,000đ",
    },
  ];

  const topProducts = [
    { name: "iPhone 15 Pro", sales: 150, revenue: "375,000,000đ" },
    { name: "MacBook Air M2", sales: 89, revenue: "267,000,000đ" },
    { name: "Samsung Galaxy S24", sales: 120, revenue: "240,000,000đ" },
    { name: "AirPods Pro", sales: 200, revenue: "120,000,000đ" },
  ];

  const formatCurrency = (value: bigint | ValueType) => {
    let numValue: number | bigint = 0;
    if (typeof value === "number" || typeof value === "bigint") {
      numValue = value;
    } else if (
      Array.isArray(value) &&
      value.length > 0 &&
      (typeof value[0] === "number" || typeof value[0] === "bigint")
    ) {
      numValue = value[0];
    } else if (typeof value === "string" && !isNaN(Number(value))) {
      numValue = Number(value);
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numValue);
  };
  // ----- Kết thúc phần dữ liệu từ QLThongKe -----

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <SidebarAdmin isOpen={sidebarOpen} closeSidebar={closeSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <AdminNavbar toggleSidebar={toggleSidebar} />
        <main className="flex-1">
          {location.pathname === "/admin" ? (
            // ----- Toàn bộ JSX của QLThongKe được đưa vào đây -----
            <div className="min-h-full bg-gradient-to-br from-slate-50 to-blue-50 p-6">
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Thống Kê Tổng Quan
                      </h1>
                      <p className="text-gray-600">
                        Theo dõi hiệu suất kinh doanh của bạn
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="week">7 ngày qua</option>
                        <option value="month">30 ngày qua</option>
                        <option value="quarter">3 tháng qua</option>
                        <option value="year">12 tháng qua</option>
                      </select>
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Xuất báo cáo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tổng Doanh Thu
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          587M đ
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          +12.5% so với tháng trước
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Đơn Hàng
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          1,750
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          +8.2% so với tháng trước
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Khách Hàng
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          2,849
                        </p>
                        <p className="text-sm text-purple-600 mt-1">
                          +15.3% so với tháng trước
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Sản Phẩm
                        </p>
                        <p className="text-2xl font-bold text-gray-900">456</p>
                        <p className="text-sm text-orange-600 mt-1">
                          +5.1% so với tháng trước
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Sales Chart */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Doanh Thu Theo Tháng
                      </h3>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">+12.5%</span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) => `${value / 1000000}M`}
                        />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Distribution */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Phân Bố Theo Danh Mục
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Hoạt Động Gần Đây
                    </h3>
                    <div className="space-y-4">
                      {recentActivity.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.activity}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.time}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {item.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Products */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Sản Phẩm Bán Chạy
                    </h3>
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">
                                #{index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.sales} sản phẩm
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {product.revenue}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ----- Outlet để render các trang con khác như /admin/products, /admin/orders, ... -----
            <div className="p-4">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
