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
  Home,
  Package,
  FileText,
  Info,
  Heart,
  Bell,
  ChevronRight,
} from "lucide-react";

// --- Giả lập các hook và API để code có thể chạy độc lập ---
// Bạn có thể xóa phần này nếu đã có các file này trong dự án của mình
const useGioHang = () => ({ demSoLuongSanPham: () => 5 });
const authApi = {
  logout: async () => {
    console.log("Logged out");
    return Promise.resolve();
  },
};

// --- Định nghĩa các Type/Interface cho dữ liệu ---
interface Product {
  id: number;
  name: string;
  image: string;
  price: string;
}

interface SubCategory {
  name: string;
  products: Product[];
}

interface Category {
  name: string;
  subcategories: Record<string, SubCategory>;
}

type ProductCategories = Record<string, Category>;

// --- Dữ liệu Mock với Type đã định nghĩa ---
const productCategories: ProductCategories = {
  "phong-khach": {
    name: "Phòng khách",
    subcategories: {
      sofa: {
        name: "Sofa",
        products: [
          {
            id: 1,
            name: "Sofa da cao cấp",
            image:
              "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=200&h=150&fit=crop",
            price: "15,990,000₫",
          },
          {
            id: 2,
            name: "Sofa vải hiện đại",
            image:
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=150&fit=crop",
            price: "8,990,000₫",
          },
          {
            id: 3,
            name: "Sofa góc L",
            image:
              "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=200&h=150&fit=crop",
            price: "12,500,000₫",
          },
        ],
      },
      "ban-tra": {
        name: "Bàn trà",
        products: [
          {
            id: 4,
            name: "Bàn trà gỗ sồi",
            image:
              "https://images.unsplash.com/photo-1611269154421-4e7e725d7b1a?w=200&h=150&fit=crop",
            price: "3,990,000₫",
          },
          {
            id: 5,
            name: "Bàn trà kính cường lực",
            image:
              "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=200&h=150&fit=crop",
            price: "2,490,000₫",
          },
        ],
      },
      "ke-tv": {
        name: "Kệ TV",
        products: [
          {
            id: 6,
            name: "Kệ TV gỗ tự nhiên",
            image:
              "https://images.unsplash.com/photo-1593349480503-64d4e33d36b6?w=200&h=150&fit=crop",
            price: "4,990,000₫",
          },
        ],
      },
    },
  },
  "phong-ngu": {
    name: "Phòng ngủ",
    subcategories: {
      "giuong-ngu": {
        name: "Giường ngủ",
        products: [
          {
            id: 7,
            name: "Giường ngủ gỗ sồi",
            image:
              "https://images.unsplash.com/photo-1594041183243-34e2c9423c7b?w=200&h=150&fit=crop",
            price: "8,990,000₫",
          },
          {
            id: 8,
            name: "Giường bọc nệm",
            image:
              "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&h=150&fit=crop",
            price: "12,990,000₫",
          },
        ],
      },
      "tu-quan-ao": {
        name: "Tủ quần áo",
        products: [
          {
            id: 9,
            name: "Tủ áo 4 cánh",
            image:
              "https://images.unsplash.com/photo-1618221381711-42ca7ab5e110?w=200&h=150&fit=crop",
            price: "6,990,000₫",
          },
        ],
      },
    },
  },
  "phong-bep": {
    name: "Phòng bếp",
    subcategories: {
      "tu-bep": {
        name: "Tủ bếp",
        products: [
          {
            id: 10,
            name: "Tủ bếp gỗ công nghiệp",
            image:
              "https://images.unsplash.com/photo-1600585152220-02042644a1b7?w=200&h=150&fit=crop",
            price: "25,990,000₫",
          },
        ],
      },
      "ban-an": {
        name: "Bàn ăn",
        products: [
          {
            id: 11,
            name: "Bàn ăn 6 ghế",
            image:
              "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200&h=150&fit=crop",
            price: "8,990,000₫",
          },
          {
            id: 12,
            name: "Bộ bàn ăn 4 ghế",
            image:
              "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=200&h=150&fit=crop",
            price: "5,490,000₫",
          },
        ],
      },
    },
  },
};

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

  // States cho mega menu
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const menuItems = [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/sanpham", label: "Sản phẩm", icon: Package, hasSubmenu: true },
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

            if (item.hasSubmenu) {
              return (
                <div key={item.to} className="relative">
                  <Link
                    to={item.to}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "text-[#518581] bg-[#518581]/10"
                        : "text-gray-700 hover:text-[#AD7E5C] hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => {
                      setIsProductMenuOpen(true);
                      if (!selectedCategory) {
                        const firstCategoryKey =
                          Object.keys(productCategories)[0];
                        setSelectedCategory(firstCategoryKey);
                      }
                    }}
                    onMouseLeave={() => {
                      setIsProductMenuOpen(false);
                      setSelectedCategory(null);
                      setSelectedSubcategory(null);
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${
                        isProductMenuOpen ? "rotate-180" : ""
                      }`}
                    />

                    {isProductMenuOpen && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-[800px] pt-2 animate-in slide-in-from-top-2 duration-200"
                        onMouseEnter={() => setIsProductMenuOpen(true)}
                        onMouseLeave={() => setIsProductMenuOpen(false)}
                      >
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                          <div className="flex">
                            {/* Categories Column */}
                            <div className="w-1/3 bg-gray-50/70 border-r border-gray-100">
                              <div className="p-4">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 px-3">
                                  Danh mục sản phẩm
                                </h3>
                                <div className="space-y-1">
                                  {Object.entries(productCategories).map(
                                    ([key, category]) => (
                                      <button
                                        key={key}
                                        onMouseEnter={() => {
                                          setSelectedCategory(key);
                                          const firstSubCategory = Object.keys(
                                            category.subcategories
                                          )[0];
                                          setSelectedSubcategory(
                                            firstSubCategory
                                          );
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group ${
                                          selectedCategory === key
                                            ? "bg-[#518581] text-white shadow-sm"
                                            : "text-gray-700 hover:bg-white hover:text-[#518581]"
                                        }`}
                                      >
                                        {category.name}
                                        <ChevronRight
                                          className={`w-4 h-4 transition-opacity ${
                                            selectedCategory === key
                                              ? "opacity-100"
                                              : "opacity-0 group-hover:opacity-100"
                                          }`}
                                        />
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Subcategories Column */}
                            <div className="w-1/3 border-r border-gray-100">
                              {selectedCategory && (
                                <div className="p-4">
                                  <h3 className="text-sm font-semibold text-gray-800 mb-3 px-3">
                                    {productCategories[selectedCategory].name}
                                  </h3>
                                  <div className="space-y-1">
                                    {Object.entries(
                                      productCategories[selectedCategory]
                                        .subcategories
                                    ).map(([key, subcategory]) => (
                                      <button
                                        key={key}
                                        onMouseEnter={() =>
                                          setSelectedSubcategory(key)
                                        }
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group ${
                                          selectedSubcategory === key
                                            ? "bg-[#AD7E5C] text-white shadow-sm"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-[#AD7E5C]"
                                        }`}
                                      >
                                        {subcategory.name}
                                        <ChevronRight
                                          className={`w-4 h-4 transition-opacity ${
                                            selectedSubcategory === key
                                              ? "opacity-100"
                                              : "opacity-0 group-hover:opacity-100"
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Products Column */}
                            <div className="w-1/3">
                              {selectedCategory && selectedSubcategory && (
                                <div className="p-4">
                                  <h3 className="text-sm font-semibold text-gray-800 mb-3 px-3">
                                    {
                                      productCategories[selectedCategory]
                                        .subcategories[selectedSubcategory].name
                                    }
                                  </h3>
                                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                                    {productCategories[
                                      selectedCategory
                                    ].subcategories[
                                      selectedSubcategory
                                    ].products.map((product) => (
                                      <Link
                                        key={product.id}
                                        to={`/san-pham/${product.id}`}
                                        className="block group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200"
                                        onClick={() =>
                                          setIsProductMenuOpen(false)
                                        }
                                      >
                                        <div className="flex gap-3">
                                          <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#518581]">
                                              {product.name}
                                            </p>
                                            <p className="text-xs text-[#AD7E5C] font-semibold">
                                              {product.price}
                                            </p>
                                          </div>
                                        </div>
                                      </Link>
                                    ))}
                                  </div>
                                  <Link
                                    to={`/danh-muc/${selectedCategory}/${selectedSubcategory}`}
                                    className="block mt-4 text-center text-sm text-[#518581] hover:text-[#AD7E5C] font-medium transition-colors duration-200"
                                    onClick={() => setIsProductMenuOpen(false)}
                                  >
                                    Xem tất cả →
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
                </div>
              );
            }

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
          <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200 group">
            <Heart className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors duration-200" />
          </button>
          <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200 group relative">
            <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors duration-200" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
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
                        to="/quen-mat-khau"
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
                      <Link
                        to="/don-hang"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#518581] transition-all duration-200 group"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <ShoppingBag className="w-5 h-5 group-hover:text-[#518581] transition-colors duration-200" />
                        <span className="font-medium">Đơn hàng của tôi</span>
                      </Link>
                      <Link
                        to="/cai-dat"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#518581] transition-all duration-200 group"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Settings className="w-5 h-5 group-hover:text-[#518581] transition-colors duration-200" />
                        <span className="font-medium">Cài đặt tài khoản</span>
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
