import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarAdmin from "../components/SidebarAdmin";
import AdminNavbar from "../components/AdminNavbar";
import { BarChart3 } from "lucide-react";

const statsData = [
  {
    title: "Tổng đơn hàng",
    value: "1,234",
    change: "+12%",
    color: "bg-blue-500",
  },
  { title: "Doanh thu", value: "₫125M", change: "+8%", color: "bg-green-500" },
  { title: "Sản phẩm", value: "456", change: "+3%", color: "bg-purple-500" },
  { title: "Khách hàng", value: "789", change: "+15%", color: "bg-orange-500" },
];

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <SidebarAdmin isOpen={sidebarOpen} closeSidebar={closeSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <AdminNavbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4">
          {location.pathname === "/admin" ? (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Tổng quan
                </h2>
                <p className="text-gray-600">
                  Chào mừng bạn quay trở lại với trang quản trị
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsData.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-800">
                          {stat.value}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          {stat.change}
                        </p>
                      </div>
                      <div
                        className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                      >
                        <BarChart3 size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Biểu đồ doanh thu
                  </h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">
                      Biểu đồ sẽ được hiển thị ở đây
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Đơn hàng gần đây
                  </h3>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            Đơn hàng #{1000 + i}
                          </p>
                          <p className="text-sm text-gray-600">
                            Khách hàng {i}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">
                            ₫{(Math.random() * 1000000).toFixed(0)}
                          </p>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Hoàn thành
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
