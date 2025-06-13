import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
} from "lucide-react";
import { useGioHang } from "../context/GioHangContext";
import authApi from "../API/authApi"; // Import authApi từ authApi.ts

const Navbar: React.FC = () => {
  // --- Các state và hook của bạn (giữ nguyên) ---
  const { demSoLuongSanPham } = useGioHang();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ ho_ten: string; email: string } | null>(
    null
  );

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  // --- Các hằng số và hiệu ứng (giữ nguyên) ---
  const menuItems = [
    { to: "/sanpham", label: "Product" },
    { to: "/dichvu", label: "Services" },
    { to: "/baibao", label: "Article" },
    { to: "/about-us", label: "About Us" },
  ];

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setIsLoggedIn(true);
        setUser(userData);
      } catch (e) {
        // Xử lý trường hợp dữ liệu trong localStorage không hợp lệ
        console.error("Lỗi khi parse dữ liệu người dùng từ localStorage:", e);
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
    // Lắng nghe sự thay đổi của cả đường dẫn và trạng thái dropdown
    // để đảm bảo component re-render khi cần
  }, [location.pathname, isUserDropdownOpen]);

  // --- TỐI ƯU HÀM ĐĂNG XUẤT ---
  const handleLogout = async () => {
    // Không cần hiển thị confirm nếu người dùng đã click vào nút trong dropdown
    // Nhưng nếu muốn chắc chắn, có thể thêm:
    // if (!window.confirm("Bạn có chắc muốn đăng xuất?")) return;

    try {
      // 1. Gọi API đăng xuất trước
      await authApi.logout();
      console.log("Đăng xuất thành công trên server.");
    } catch (error) {
      // 2. Nếu API lỗi, ghi log lại nhưng không chặn quá trình đăng xuất ở client
      console.error(
        "Lỗi khi gọi API đăng xuất, nhưng vẫn tiếp tục đăng xuất ở client:",
        error
      );
    } finally {
      // 3. Khối finally sẽ LUÔN LUÔN được thực thi, dù try thành công hay catch bị lỗi
      // Đây là nơi lý tưởng để dọn dẹp state và localStorage

      localStorage.removeItem("user");
      // Bạn có thể thêm các key khác cần xóa ở đây
      // localStorage.removeItem("client_token"); // Ví dụ nếu có token
      // localStorage.removeItem("client_rememberMe");
      // localStorage.removeItem("client_rememberMeEmail");

      // Cập nhật state của ứng dụng
      setIsLoggedIn(false);
      setUser(null);
      setIsUserDropdownOpen(false); // Đóng dropdown sau khi đăng xuất

      // Điều hướng người dùng về trang chủ
      // replace: true để người dùng không thể nhấn "Back" quay lại trang trước đó
      navigate("/", { replace: true });
    }
  };

  // --- Các hiệu ứng xử lý click và scroll (giữ nguyên) ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const controlNavbar = () => {
    if (typeof window !== "undefined") {
      setShowNavbar(window.scrollY < lastScrollY || window.scrollY < 100);
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar, { passive: true });
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <header
      className={`px-4 sm:px-8 md:px-14 py-4 sm:py-6 bg-gray-50 shadow-sm transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      } fixed top-0 left-0 right-0 z-50`}
    >
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo + tên */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 3H8.5L10.62 9L14.5 3H22L15.5 13L20.5 21H14L10.5 15L6.5 21H2L8.5 13L2 3Z"
                fill="#AD7E5C"
              />
            </svg>
          </div>
          <Link to="/" className="text-[#151411] text-lg sm:text-xl font-bold">
            NộiThấtVN
          </Link>
        </div>

        {/* Menu desktop */}
        <div className="hidden sm:flex items-center gap-6 md:gap-12">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`relative text-sm sm:text-base font-medium transition-colors duration-200 ${
                location.pathname === item.to
                  ? "text-[#518581]"
                  : "text-[#151411] hover:text-[#AD7E5C]"
              }`}
            >
              {item.label}
              {location.pathname === item.to && (
                <span className="absolute left-0 right-0 bottom-[-4px] h-[2px] bg-[#518581]" />
              )}
            </Link>
          ))}
        </div>

        {/* Icon giỏ hàng, user và hamburger */}
        <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
          <Link to="/gio-hang" aria-label="Shopping cart" className="relative">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#151411]" />
            {demSoLuongSanPham() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 sm:h-5 w-4 sm:w-5 flex items-center justify-center">
                {demSoLuongSanPham()}
              </span>
            )}
          </Link>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleUserDropdown}
              aria-label="User menu"
              className="flex items-center gap-1 hover:text-[#AD7E5C] transition-colors duration-200"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#151411]" />
              <ChevronDown
                className={`w-3 h-3 text-[#151411] transition-transform duration-200 ${
                  isUserDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {!isLoggedIn ? (
                  // Menu khi chưa đăng nhập
                  <div className="px-4 py-2">
                    <p className="text-sm text-gray-600 mb-3">
                      Chào mừng bạn đến với NộiThấtVN
                    </p>
                    <div className="space-y-2">
                      <Link
                        to="/dangnhap"
                        className="block w-full text-center px-4 py-2 bg-[#518581] text-white rounded-md hover:bg-[#518581]/90 transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        to="/dangky"
                        className="block w-full text-center px-4 py-2 border border-[#518581] text-[#518581] rounded-md hover:bg-[#518581]/10 transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Tạo tài khoản
                      </Link>
                      <Link
                        to="/quen-mat-khau"
                        className="block text-center text-sm text-gray-600 hover:text-[#AD7E5C] transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Menu khi đã đăng nhập
                  <div>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#518581] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user?.ho_ten?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user?.ho_ten || "Người dùng"}
                          </p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <UserCircle className="w-4 h-4" />
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/don-hang"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Đơn hàng của tôi
                      </Link>
                      <Link
                        to="/cai-dat"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Cài đặt
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger menu icon */}
          <button
            className="sm:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#151411]" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-[#151411]" />
            )}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="sm:hidden flex flex-col gap-3 border-t border-gray-200 pt-4 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`relative text-base font-medium transition-colors duration-200 ${
                location.pathname === item.to
                  ? "text-[#518581]"
                  : "text-[#151411] hover:text-[#AD7E5C]"
              }`}
              onClick={toggleMenu}
            >
              {item.label}
              {location.pathname === item.to && (
                <span className="absolute left-0 right-0 bottom-[-2px] h-[2px] bg-[#518581]" />
              )}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
