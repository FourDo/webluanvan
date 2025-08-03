import { useState } from "react";
import {
  User,
  ChevronDown,
  Settings,
  LogOut,
  Search,
  Menu,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import authApi from "../API/authApi";
import { useAuth } from "../context/AuthContext";

interface AdminNavbarProps {
  toggleSidebar: () => void;
}

const AdminNavbar = ({ toggleSidebar }: AdminNavbarProps) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) return;

    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      alert(
        "Có lỗi xảy ra khi đăng xuất, nhưng bạn sẽ được đăng xuất trên thiết bị này."
      );
    } finally {
      setIsLoggingOut(false);
      setProfileOpen(false);
      logout(); // Xóa cookie và trạng thái
      navigate("/admin/dangnhap", { replace: true });
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Menu */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Toggle Sidebar"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-xs text-gray-500">Quản trị hệ thống</p>
            </div>
          </div>
        </div>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoggingOut}
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-sm font-medium text-gray-700">
                  {user?.ho_ten || "Admin"}
                </span>
                <span className="block text-xs text-gray-500">
                  {user?.vai_tro === "admin" ? "Quản trị viên" : "Admin"}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {user?.ho_ten || "Admin"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email || "admin@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate("/admin/profile");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <User size={16} className="mr-3" />
                    <span>Hồ sơ cá nhân</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate("/admin/settings");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <Settings size={16} className="mr-3" />
                    <span>Cài đặt hệ thống</span>
                  </button>

                  <div className="border-t border-gray-100 my-2"></div>

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`w-full text-left flex items-center px-4 py-3 text-sm transition-colors ${
                      isLoggingOut
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-600 hover:bg-red-50 hover:text-red-700"
                    }`}
                  >
                    <LogOut size={16} className="mr-3" />
                    <span>
                      {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                    </span>
                    {isLoggingOut && (
                      <div className="ml-auto">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search - Shows when needed */}
      <div className="md:hidden mt-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
