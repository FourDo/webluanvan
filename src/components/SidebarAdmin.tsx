import { Link, useLocation } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Settings,
  X,
  Palette,
  Ruler,
  Gift,
  List,
  Image,
  FileText,
  BarChart3,
} from "lucide-react";

interface SidebarAdminProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const SidebarAdmin = ({ isOpen, closeSidebar }: SidebarAdminProps) => {
  const location = useLocation();

  const menuItems = [
    {
      id: "baocao",
      label: "Thống kê & Báo cáo",
      icon: BarChart3,
      path: "/admin",
    },
    { id: "sanpham", label: "Sản phẩm", icon: Package, path: "/admin/sanpham" },
    {
      id: "donhang",
      label: "Đơn hàng",
      icon: ShoppingCart,
      path: "/admin/donhang",
    },
    { id: "doanhmuc", label: "Danh mục", icon: List, path: "/admin/doanhmuc" },
    { id: "mausac", label: "Màu sắc", icon: Palette, path: "/admin/mausac" },
    {
      id: "kichthuoc",
      label: "Kích thước",
      icon: Ruler,
      path: "/admin/kichthuoc",
    },
    {
      id: "voucher",
      label: "Voucher",
      icon: Gift,
      path: "/admin/voucher",
    },
    {
      id: "banner",
      label: "Quản lý banner",
      icon: Image,
      path: "/admin/banner",
    },
    {
      id: "baibao",
      label: "Quản lý bài báo",
      icon: FileText,
      path: "/admin/baibao",
    },
    {
      id: "taikhoan",
      label: "Tài khoản",
      icon: Settings,
      path: "/admin/taikhoan",
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-gray-900 text-white transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold">AdminPanel</span>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  closeSidebar(); // Close sidebar on mobile after clicking
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default SidebarAdmin;
