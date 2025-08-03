import React from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Eye,
} from "lucide-react";

const DashboardContent: React.FC = () => {
  // Mock data cho dashboard content
  const stats = [
    {
      title: "Doanh thu hôm nay",
      value: "2,450,000 ₫",
      change: "+12.3%",
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Đơn hàng mới",
      value: "24",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "blue",
    },
    {
      title: "Khách hàng mới",
      value: "12",
      change: "+15.7%",
      icon: Users,
      color: "purple",
    },
    {
      title: "Sản phẩm bán ra",
      value: "89",
      change: "+5.4%",
      icon: Package,
      color: "orange",
    },
  ];

  const recentOrders = [
    {
      id: "#12345",
      customer: "Nguyễn Văn A",
      amount: "450,000 ₫",
      status: "Đã giao",
    },
    {
      id: "#12346",
      customer: "Trần Thị B",
      amount: "320,000 ₫",
      status: "Đang giao",
    },
    {
      id: "#12347",
      customer: "Lê Văn C",
      amount: "180,000 ₫",
      status: "Chờ xử lý",
    },
    {
      id: "#12348",
      customer: "Phạm Thị D",
      amount: "720,000 ₫",
      status: "Đã giao",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: "bg-green-100 text-green-600 border-green-500",
      blue: "bg-blue-100 text-blue-600 border-blue-500",
      purple: "bg-purple-100 text-purple-600 border-purple-500",
      orange: "bg-orange-100 text-orange-600 border-orange-500",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao":
        return "bg-green-100 text-green-800";
      case "Đang giao":
        return "bg-blue-100 text-blue-800";
      case "Chờ xử lý":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Chào mừng quay trở lại! Đây là tổng quan nhanh về hoạt động hôm nay.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${getColorClasses(stat.color)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm mt-1 ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                  >
                    {stat.change} so với hôm qua
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full ${getColorClasses(stat.color).split(" ")[0]}`}
                >
                  <Icon
                    className={`w-6 h-6 ${getColorClasses(stat.color).split(" ")[1]}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Đơn hàng gần đây
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-500">
                    <th className="pb-3">Mã đơn</th>
                    <th className="pb-3">Khách hàng</th>
                    <th className="pb-3">Số tiền</th>
                    <th className="pb-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order, index) => (
                    <tr key={index} className="text-sm">
                      <td className="py-3 font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="py-3 text-gray-600">{order.customer}</td>
                      <td className="py-3 font-medium text-gray-900">
                        {order.amount}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thao tác nhanh
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Thêm sản phẩm mới
                </span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Xem báo cáo
                </span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Eye className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Quản lý đơn hàng
                </span>
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông báo
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Sản phẩm sắp hết hàng
                  </p>
                  <p className="text-xs text-yellow-700">
                    5 sản phẩm có số lượng &lt; 10
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Doanh thu tăng trưởng
                  </p>
                  <p className="text-xs text-green-700">
                    +15% so với tuần trước
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Đánh giá mới
                  </p>
                  <p className="text-xs text-blue-700">
                    3 đánh giá 5 sao hôm nay
                  </p>
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
