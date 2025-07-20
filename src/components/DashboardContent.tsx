import { useState } from "react";
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
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Download,
  Target,
  Eye,
  Heart,
} from "lucide-react";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

const DashboardContent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Dữ liệu doanh thu theo tháng
  const salesData = [
    { month: "T1", sales: 4000, orders: 240, revenue: 85000000 },
    { month: "T2", sales: 3000, orders: 180, revenue: 62000000 },
    { month: "T3", sales: 5000, orders: 320, revenue: 105000000 },
    { month: "T4", sales: 4500, orders: 280, revenue: 95000000 },
    { month: "T5", sales: 6000, orders: 380, revenue: 125000000 },
    { month: "T6", sales: 5500, orders: 350, revenue: 115000000 },
  ];

  // Dữ liệu doanh thu theo quý
  const quarterlyData = [
    { quarter: "Q1", revenue: 252000000, orders: 640, growth: 12.5 },
    { quarter: "Q2", revenue: 335000000, orders: 1010, growth: 18.2 },
    { quarter: "Q3", revenue: 298000000, orders: 890, growth: -8.1 },
    { quarter: "Q4", revenue: 415000000, orders: 1250, growth: 22.3 },
  ];

  // Dữ liệu doanh thu theo năm
  const yearlyData = [
    { year: "2022", revenue: 980000000, orders: 3200, customers: 1850 },
    { year: "2023", revenue: 1250000000, orders: 4100, customers: 2890 },
    { year: "2024", revenue: 1580000000, orders: 5200, customers: 3650 },
  ];

  // Dữ liệu hành vi khách hàng
  const customerBehavior = [
    { category: "Mua lần đầu", value: 35, color: "#8884d8" },
    { category: "Mua lại", value: 45, color: "#82ca9d" },
    { category: "Khách VIP", value: 15, color: "#ffc658" },
    { category: "Khách tiềm năng", value: 5, color: "#ff7c7c" },
  ];

  // Sản phẩm bán chạy theo thời gian
  const productTrends = [
    { month: "T1", sofa: 45, ban: 32, tu: 28 },
    { month: "T2", sofa: 38, ban: 28, tu: 22 },
    { month: "T3", sofa: 55, ban: 42, tu: 35 },
    { month: "T4", sofa: 48, ban: 38, tu: 30 },
    { month: "T5", sofa: 62, ban: 45, tu: 38 },
    { month: "T6", sofa: 58, ban: 40, tu: 32 },
  ];

  const categoryData = [
    { name: "Bàn ghế", value: 35, color: "#8884d8" },
    { name: "Tủ kệ", value: 25, color: "#82ca9d" },
    { name: "Sofa", value: 20, color: "#ffc658" },
    { name: "Giường ngủ", value: 15, color: "#ff7c7c" },
    { name: "Khác", value: 5, color: "#8dd1e1" },
  ];

  const recentActivity = [
    {
      time: "2 phút trước",
      activity: "Đơn hàng mới #12345 - Bộ sofa da",
      amount: "15,500,000đ",
    },
    { time: "15 phút trước", activity: "Khách hàng mới đăng ký", amount: "+1" },
    {
      time: "1 giờ trước",
      activity: "Sản phẩm mới - Bàn làm việc",
      amount: "+1",
    },
    {
      time: "3 giờ trước",
      activity: "Đơn hàng hoàn thành #12340 - Tủ bếp",
      amount: "8,200,000đ",
    },
  ];

  const topProducts = [
    {
      name: "Sofa da cao cấp",
      sales: 85,
      revenue: "425,000,000đ",
      trend: "+18%",
    },
    {
      name: "Bàn ăn gỗ sồi",
      sales: 62,
      revenue: "186,000,000đ",
      trend: "+12%",
    },
    {
      name: "Tủ quần áo 4 cánh",
      sales: 45,
      revenue: "315,000,000đ",
      trend: "+25%",
    },
    {
      name: "Giường ngủ King Size",
      sales: 38,
      revenue: "228,000,000đ",
      trend: "+8%",
    },
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

  return (
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
                <p className="text-2xl font-bold text-gray-900">587M đ</p>
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
                <p className="text-sm font-medium text-gray-600">Đơn Hàng</p>
                <p className="text-2xl font-bold text-gray-900">1,750</p>
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
                <p className="text-sm font-medium text-gray-600">Khách Hàng</p>
                <p className="text-2xl font-bold text-gray-900">2,849</p>
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
                  Tỷ Lệ Chuyển Đổi
                </p>
                <p className="text-2xl font-bold text-gray-900">3.24%</p>
                <p className="text-sm text-orange-600 mt-1">
                  +0.5% so với tháng trước
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Analysis by Period */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Doanh Thu Theo Quý
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xu Hướng 3 Năm
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `${value / 1000000000}B`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hành Vi Khách Hàng
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={customerBehavior}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {customerBehavior.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
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

          {/* Product Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Xu Hướng Sản Phẩm Bán Chạy
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sofa"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Sofa"
                />
                <Line
                  type="monotone"
                  dataKey="ban"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Bàn ghế"
                />
                <Line
                  type="monotone"
                  dataKey="tu"
                  stroke="#ffc658"
                  strokeWidth={2}
                  name="Tủ kệ"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Phân Bố Doanh Thu Theo Danh Mục
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                Chi Tiết Theo Danh Mục
              </h4>
              {categoryData.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {category.value}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {((category.value * 587000000) / 100).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                      <p className="text-xs text-gray-500">{item.time}</p>
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Sản Phẩm Bán Chạy
              </h3>
              <span className="text-sm text-gray-500">30 ngày qua</span>
            </div>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.name}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-500">
                          {product.sales} sản phẩm
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            product.trend.startsWith("+")
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {product.revenue}
                    </span>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">
                        Tăng trưởng
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Behavior Insights */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4">
                Thống Kê Hành Vi Khách Hàng
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">8.2K</div>
                  <div className="text-sm text-gray-600">Lượt xem showroom</div>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-pink-600">1.5K</div>
                  <div className="text-sm text-gray-600">
                    Nội thất yêu thích
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
