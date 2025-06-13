import { useState } from "react";
import { User, ChevronDown, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import authApi from "../API/authApi"; // 2. Import authApi của bạn

interface AdminNavbarProps {
  toggleSidebar: () => void;
}

const AdminNavbar = ({ toggleSidebar }: AdminNavbarProps) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate(); // 3. Khởi tạo hook navigate

  // 4. Tạo hàm xử lý đăng xuất
  const handleLogout = async () => {
    // Hiển thị hộp thoại xác nhận trước khi đăng xuất
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      try {
        await authApi.logout();
        // Có thể hiển thị thông báo đăng xuất thành công nếu cần
      } catch (error) {
        console.error(error);
        // Thông báo cho người dùng rằng có lỗi xảy ra nhưng vẫn tiếp tục đăng xuất
        alert(
          "Có lỗi xảy ra khi đăng xuất trên máy chủ, nhưng bạn vẫn sẽ được đăng xuất khỏi thiết bị này."
        );
      } finally {
        // Quan trọng: Luôn xóa dữ liệu local và điều hướng
        // dù cho API có thành công hay thất bại.
        localStorage.removeItem("admin_data");
        localStorage.removeItem("admin_token"); // Đừng quên xóa token
        navigate("/admin/dangnhap");
      }
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* ... (Các phần code khác không thay đổi) ... */}
        <div className="flex items-center space-x-4">
          {/* ... Search, Notifications ... */}

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium">Admin</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User size={16} className="mr-3" />
                  Hồ sơ
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings size={16} className="mr-3" />
                  Cài đặt
                </a>
                <div className="border-t border-gray-200 my-2"></div>
                {/* 5. Thay đổi thẻ a thành button hoặc div và gọi handleLogout */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} className="mr-3" />
                  Đăng xuất
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
