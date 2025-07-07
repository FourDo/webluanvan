import { useState } from "react";
import { User, ChevronDown, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authApi from "../API/authApi";
import { useAuth } from "../context/AuthContext";

interface AdminNavbarProps {
  toggleSidebar: () => void;
}

const AdminNavbar = ({}: AdminNavbarProps) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              disabled={isLoggingOut}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium">Admin</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => navigate("/admin/profile")}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User size={16} className="mr-3" />
                  Hồ sơ
                </button>
                <button
                  onClick={() => navigate("/admin/settings")}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings size={16} className="mr-3" />
                  Cài đặt
                </button>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 ${
                    isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <LogOut size={16} className="mr-3" />
                  {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
