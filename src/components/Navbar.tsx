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
  Package,
  FileText,
  Info,
  ChevronRight,
} from "lucide-react";
import Cookies from "js-cookie";

import { useNavbarData } from "../hooks/useNavbarData";
import { useGioHang } from "../context/GioHangContext";
import authApi from "../API/authApi";

// --- Định nghĩa các Type/Interface cho dữ liệu ---

const Navbar: React.FC = () => {
  const { demSoLuongSanPham } = useGioHang();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ ho_ten: string; email: string } | null>(
    null
  );

  // State cho menu sản phẩm động
  const { categories, productsByCategory: navbarProductsByCategory } =
    useNavbarData();

  // Gom sản phẩm theo tên danh mục từ hook
  const productsByCategory = React.useMemo(() => {
    return navbarProductsByCategory;
  }, [navbarProductsByCategory]);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const menuItems = [
    { to: "#", label: "Danh mục", icon: Package, hasSubmenu: true },
    { to: "/sanpham", label: "Sản phẩm", icon: Package },
    { to: "/dichvu", label: "Dịch vụ", icon: Settings },
    { to: "/baibao", label: "Bài viết", icon: FileText },
    { to: "/about-us", label: "Về chúng tôi", icon: Info },
  ];

  const checkLoginStatus = () => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setIsLoggedIn(true);
        setUser(userData);
      } catch (e) {
        console.error("Lỗi parse dữ liệu user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      console.log("Đăng xuất server thành công");
    } catch (error) {
      console.error("Lỗi API đăng xuất:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Xóa cookie token
      Cookies.remove("token");
      setIsLoggedIn(false);
      setUser(null);
      setIsUserDropdownOpen(false);
      navigate("/", { replace: true });
    }
  };

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      return () => window.removeEventListener("scroll", controlNavbar);
    }
  }, [lastScrollY]);

  return (
    <header
      className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300 ${
        showNavbar ? "translate-y-0 shadow-sm" : "-translate-y-full shadow-none"
      } fixed top-0 left-0 right-0 z-50`}
    >
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#AD7E5C] to-[#8B6346] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <path
                  d="M3 21V3L21 3V21L12 16L3 21Z"
                  fill="currentColor"
                  fillOpacity="0.9"
                />
                <path
                  d="M8 8H16M8 12H13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <Link
            to="/"
            className="text-gray-800 text-xl sm:text-2xl font-bold tracking-tight hover:text-[#AD7E5C] transition-colors duration-200"
          >
            NộiThấtVN
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname.startsWith(item.to) ||
              (item.hasSubmenu && isProductMenuOpen);

            // Dropdown cho "Danh mục"
            if (item.hasSubmenu) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => {
                    setIsProductMenuOpen(true);
                    setSelectedCategory(categories[0]?.ten_danh_muc || null); // Mặc định chọn danh mục đầu tiên
                  }}
                  onMouseLeave={() => {
                    setIsProductMenuOpen(false);
                    setSelectedCategory(null);
                  }}
                >
                  <button
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? "text-[#518581] bg-[#518581]/10"
                        : "text-gray-700 hover:text-[#AD7E5C] hover:bg-gray-50"
                    }`}
                    type="button"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  {isProductMenuOpen && (
                    <div
                      className="absolute left-0 top-full flex z-50 w-[600px] bg-white rounded-xl shadow-xl border border-gray-100"
                      // KHÔNG dùng margin giữa hai panel
                    >
                      {/* Bên trái: danh mục */}
                      <div className="w-56 border-r border-gray-100 py-2">
                        {categories.map((cat) => (
                          <Link
                            key={cat.ma_danh_muc}
                            to={`/sanpham?category=${encodeURIComponent(cat.ten_danh_muc)}`}
                            className={`px-4 py-2 cursor-pointer text-sm rounded-lg flex items-center justify-between
                              ${selectedCategory === cat.ten_danh_muc ? "bg-gray-100 text-[#518581]" : "text-gray-700 hover:bg-gray-50"}
                            `}
                            onMouseEnter={() =>
                              setSelectedCategory(cat.ten_danh_muc)
                            }
                            onClick={() => {
                              setIsProductMenuOpen(false);
                              setSelectedCategory(null);
                            }}
                          >
                            {cat.ten_danh_muc}
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        ))}
                      </div>
                      {/* Bên phải: sản phẩm */}
                      <div className="flex-1 p-4 grid grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                        {selectedCategory &&
                        productsByCategory[selectedCategory]?.length ? (
                          productsByCategory[selectedCategory].map(
                            (product) => (
                              <Link
                                key={product.ma_san_pham}
                                to={`/sanpham/${product.ma_san_pham}`}
                                className="group relative"
                                onClick={() => {
                                  setIsProductMenuOpen(false);
                                  setSelectedCategory(null);
                                }}
                                title={product.ten_san_pham} // Tooltip khi hover
                              >
                                <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-[#AD7E5C]">
                                  <img
                                    src={product.image}
                                    alt={product.ten_san_pham}
                                    className="w-full h-20 object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) =>
                                      (e.currentTarget.src =
                                        "/image/hetcuu3.png")
                                    }
                                  />
                                  {/* Overlay khi hover */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 text-[#AD7E5C] px-2 py-1 rounded text-xs font-medium transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                      Xem chi tiết
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            )
                          )
                        ) : (
                          <div className="col-span-4 text-gray-400 text-sm flex items-center justify-center h-full">
                            Không có sản phẩm
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Các mục menu còn lại (bao gồm "Sản phẩm")
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "text-[#518581] bg-[#518581]/10"
                    : "text-gray-700 hover:text-[#AD7E5C] hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons & User Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/gio-hang"
            aria-label="Giỏ hàng"
            className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200 group"
          >
            <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-[#AD7E5C] transition-colors duration-200" />
            {demSoLuongSanPham() > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                {demSoLuongSanPham() > 99 ? "99+" : demSoLuongSanPham()}
              </span>
            )}
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleUserDropdown}
              aria-label="Menu người dùng"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            >
              {isLoggedIn && user ? (
                <div className="w-8 h-8 bg-gradient-to-br from-[#518581] to-[#3d6360] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-semibold">
                    {user?.ho_ten?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              ) : (
                <User className="w-5 h-5 text-gray-700 group-hover:text-[#AD7E5C] transition-colors duration-200" />
              )}
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-all duration-200 ${
                  isUserDropdownOpen
                    ? "rotate-180 text-[#AD7E5C]"
                    : "group-hover:text-gray-700"
                }`}
              />
            </button>
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                {!isLoggedIn ? (
                  <div className="px-4 py-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        Chào mừng bạn!
                      </h3>
                      <p className="text-sm text-gray-600">
                        Đăng nhập để có trải nghiệm tốt nhất
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Link
                        to="/dangnhap"
                        className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-[#518581] to-[#3d6360] text-white rounded-lg hover:from-[#3d6360] hover:to-[#518581] font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        to="/dangky"
                        className="block w-full text-center px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-[#AD7E5C] hover:text-[#AD7E5C] font-medium transition-all duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Tạo tài khoản mới
                      </Link>
                      <Link
                        to="/quenmatkhau"
                        className="block text-center text-sm text-gray-500 hover:text-[#518581] transition-colors duration-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#518581] to-[#3d6360] rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-lg font-bold">
                            {user?.ho_ten?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-gray-900 truncate">
                            {user?.ho_ten || "Người dùng"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user?.email}
                          </p>
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full mt-1">
                            Đã xác thực
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#518581] transition-all duration-200 group"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <UserCircle className="w-5 h-5 group-hover:text-[#518581] transition-colors duration-200" />
                        <span className="font-medium">Thông tin cá nhân</span>
                      </Link>
                      
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
                      >
                        <LogOut className="w-5 h-5 group-hover:text-red-700 transition-colors duration-200" />
                        <span className="font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[#518581] bg-[#518581]/10"
                      : "text-gray-700 hover:text-[#AD7E5C] hover:bg-gray-50"
                  }`}
                  onClick={toggleMenu}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
