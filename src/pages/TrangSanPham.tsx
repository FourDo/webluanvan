// src/pages/TrangSanPham.tsx

import React, { useState, useEffect, useMemo } from "react";
import { Filter, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Import API và Types từ trang quản lý
import { productApi } from "../API/productApi";
import type { Product as ApiProduct, ProductResponse } from "../types/Product";

// Import các component con
import ProductSwiper from "../components/ProductSwiper";
import eventApi from "../API/eventApi";
import FilterMenu from "../components/FilterMenu";
import ProductCard from "../components/ProductCard";

// Import hook tracking behavior
import { useBehaviorTracking } from "../hooks/useBehaviorTracking";

// Helper function để lấy các thông tin cần thiết từ sản phẩm API
const getProductDisplayInfo = (product: ApiProduct) => {
  const mainVariant = product.bienthe?.[0];
  const originalPrice = mainVariant ? parseFloat(mainVariant.gia_ban) : 0;
  const discountPercent = mainVariant?.phan_tram_giam || null;
  const discountedPrice = discountPercent
    ? originalPrice * (1 - discountPercent / 100)
    : null;

  // Tính số lượng thực tế còn lại = số lượng tồn kho - số lượng tạm giữ
  const actualStock = mainVariant
    ? mainVariant.so_luong_ton - (mainVariant.so_luong_tam_giu || 0)
    : 0;

  return {
    id: product.ma_san_pham,
    name: product.ten_san_pham,
    category: product.ten_danh_muc || "Uncategorized",
    brand: product.thuong_hieu || "Không có thương hiệu",
    description: product.mo_ta_ngan || "No description available.",
    price: originalPrice,
    discountedPrice: discountedPrice,
    discountPercent: discountPercent,
    finalPrice: discountedPrice || originalPrice, // Giá cuối cùng để sắp xếp và lọc
    image: mainVariant?.hinh_anh?.[0] || "",
    // Sử dụng tên màu sắc thay vì hex code
    color: mainVariant?.ten_mau_sac || "N/A",
    hex: mainVariant?.hex_code || "#000000",
    actualStock: actualStock, // Thêm số lượng thực tế
  };
};

// Custom hook useDebounce để debounce giá trị search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const TrangSanPham: React.FC = () => {
  // Hook tracking behavior
  const { trackViewProduct, trackSearchProduct } = useBehaviorTracking();

  // Sự kiện
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);
  // Lấy tất cả sự kiện còn hiệu lực
  useEffect(() => {
    const fetchActiveEvents = async () => {
      setEventLoading(true);
      setEventError(null);
      try {
        const events = await eventApi.fetchEvents();

        if (Array.isArray(events) && events.length > 0) {
          // Lọc chỉ lấy sự kiện còn hiệu lực (chưa kết thúc)
          const now = new Date();

          const validEvents = events.filter((event) => {
            try {
              const endDate = new Date(event.ngay_ket_thuc);
              const isNotExpired = endDate > now;
              const isVisible = Boolean(event.hien_thi) && event.hien_thi !== 0;

              return isNotExpired && isVisible;
            } catch (err) {
              console.error(
                "❌ TrangSanPham - Error processing event:",
                event,
                err
              );
              return false;
            }
          });

          setActiveEvents(validEvents);
        } else {
          setActiveEvents([]);
        }
      } catch (err: any) {
        setEventError(err.message || "Không thể tải sự kiện");
        setActiveEvents([]);
      } finally {
        setEventLoading(false);
      }
    };
    fetchActiveEvents();
  }, []);
  // --- HOOKS ---
  const location = useLocation();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(true); // Mặc định mở
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // State cho tìm kiếm và sắp xếp
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Input thực tế mà user gõ
  const [sortOption, setSortOption] = useState("mặc định");

  // Debounce search term với delay 500ms
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  // State để hiển thị loading khi đang debounce search
  const [isSearching, setIsSearching] = useState(false);

  // State cho bộ lọc từ FilterMenu
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // --- URL PARAMS HANDLING ---
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get("search");
    const categoryParam = urlParams.get("category");

    if (searchParam) {
      setSearchTerm(searchParam);
      setSearchInput(searchParam);
    }

    if (categoryParam) {
      // Tự động chọn danh mục từ URL
      setSelectedCategories([categoryParam]);
      setCurrentPage(1); // Reset về trang đầu
    }
  }, [location.search]);

  // --- DEBOUNCED SEARCH EFFECT ---
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
    setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
    setIsSearching(false); // Tắt loading khi search hoàn tất

    // Track search behavior nếu có từ khóa tìm kiếm
    if (debouncedSearchTerm.trim()) {
      // Tìm tất cả sản phẩm phù hợp với từ khóa
      const matchingProducts = allProducts.filter((product) =>
        product.ten_san_pham
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
      );

      // Track behavior cho mỗi sản phẩm tìm thấy
      matchingProducts.forEach((product) => {
        trackSearchProduct(product.ma_san_pham, debouncedSearchTerm);
      });
    }
  }, [debouncedSearchTerm, allProducts, trackSearchProduct]);

  // --- SEARCH LOADING EFFECT ---
  useEffect(() => {
    if (searchInput !== debouncedSearchTerm) {
      setIsSearching(true);
    }
  }, [searchInput, debouncedSearchTerm]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchProducts = async () => {
      const CACHE_KEY = "cached_products";
      const CACHE_TIMESTAMP_KEY = "cached_products_timestamp";
      const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

      const getCachedProducts = () => {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (cachedData && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          if (now - timestamp < CACHE_DURATION) {
            return JSON.parse(cachedData) as ApiProduct[];
          }
        }
        return null;
      };

      // Lưu dữ liệu vào localStorage
      const cacheProducts = (products: ApiProduct[]) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify(products));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      };

      setLoading(true);
      setError(null);

      // Kiểm tra cache trước
      const cachedProducts = getCachedProducts();
      if (cachedProducts) {
        // Lọc chỉ lấy sản phẩm có biến thể và hình ảnh
        const validProducts = cachedProducts.filter(
          (p) =>
            Array.isArray(p.bienthe) &&
            p.bienthe.length > 0 &&
            p.bienthe[0].hinh_anh &&
            Array.isArray(p.bienthe[0].hinh_anh) &&
            p.bienthe[0].hinh_anh.length > 0
        );
        setAllProducts(validProducts);
        const prices = validProducts
          .map((p) => getProductDisplayInfo(p).finalPrice)
          .filter((price) => price > 0);
        const maxPrice =
          prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
        const minPrice = 0;

        // Đảm bảo maxPrice luôn lớn hơn minPrice
        const safeMaxPrice = Math.max(maxPrice, minPrice + 1);

        setPriceRange([minPrice, safeMaxPrice]);
        setLoading(false);
        return;
      }

      // Nếu không có cache hoặc cache hết hạn, gọi API
      try {
        let response: ProductResponse;

        // Kiểm tra nếu có searchTerm từ URL, sử dụng API tìm kiếm
        const urlParams = new URLSearchParams(location.search);
        const searchParam = urlParams.get("search");

        if (searchParam) {
          response = await productApi.searchProducts(searchParam);
        } else {
          response = await productApi.getProducts();
        }

        if (response.message && Array.isArray(response.data)) {
          // Lọc chỉ lấy sản phẩm có biến thể và hình ảnh
          const activeProducts = response.data.filter(
            (p) =>
              p.trang_thai_hoat_dong === "hoat_dong" &&
              Array.isArray(p.bienthe) &&
              p.bienthe.length > 0 &&
              p.bienthe[0].hinh_anh &&
              Array.isArray(p.bienthe[0].hinh_anh) &&
              p.bienthe[0].hinh_anh.length > 0
          );
          setAllProducts(activeProducts);

          // Chỉ cache kết quả khi không phải tìm kiếm
          if (!searchParam) {
            cacheProducts(activeProducts);
          }

          // Tính toán price range với fallback an toàn - sử dụng finalPrice
          const prices = activeProducts
            .map((p) => getProductDisplayInfo(p).finalPrice)
            .filter((price) => price > 0);

          const maxPrice =
            prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
          const minPrice = 0;

          // Đảm bảo maxPrice luôn lớn hơn minPrice
          const safeMaxPrice = Math.max(maxPrice, minPrice + 1);

          setPriceRange([minPrice, safeMaxPrice]);
        } else {
          setError("Dữ liệu sản phẩm không hợp lệ.");
        }
      } catch (err) {
        // Nếu API lỗi, thử lấy lại cache (nếu có)
        const cachedProductsFallback = getCachedProducts();
        if (cachedProductsFallback) {
          // Lọc chỉ lấy sản phẩm có biến thể và hình ảnh
          const validProducts = cachedProductsFallback.filter(
            (p) =>
              Array.isArray(p.bienthe) &&
              p.bienthe.length > 0 &&
              p.bienthe[0].hinh_anh &&
              Array.isArray(p.bienthe[0].hinh_anh) &&
              p.bienthe[0].hinh_anh.length > 0
          );
          setAllProducts(validProducts);
          const prices = validProducts
            .map((p) => getProductDisplayInfo(p).finalPrice)
            .filter((price) => price > 0);

          const maxPrice =
            prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
          const minPrice = 0;

          // Đảm bảo maxPrice luôn lớn hơn minPrice
          const safeMaxPrice = Math.max(maxPrice, minPrice + 1);

          setPriceRange([minPrice, safeMaxPrice]);
        } else {
          setError((err as Error).message || "Không thể tải dữ liệu sản phẩm.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]); // Thêm location.search để useEffect chạy lại khi URL thay đổi

  // --- LOGIC LỌC, SẮP XẾP VÀ PHÂN TRANG (CORE LOGIC) ---
  const filteredAndSortedProducts = useMemo(() => {
    // Chuyển đổi dữ liệu API thành định dạng dễ hiển thị
    const displayProducts = allProducts.map(getProductDisplayInfo);

    let filtered = displayProducts;

    // 1. Lọc theo các tiêu chí từ FilterMenu
    filtered = filtered.filter((p) => {
      // Sử dụng finalPrice thay vì price cho việc lọc
      const priceMatch =
        p.finalPrice >= priceRange[0] && p.finalPrice <= priceRange[1];
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);
      const colorMatch =
        selectedColors.length === 0 || selectedColors.includes(p.color);
      const brandMatch =
        selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      return priceMatch && categoryMatch && colorMatch && brandMatch;
    });

    // 2. Lọc theo Tìm kiếm (Search) - áp dụng cho cả search từ URL và search local
    const urlParams = new URLSearchParams(location.search);
    const urlSearchParam = urlParams.get("search");
    const normalizedSearch = (str: string) => {
      return str.toLocaleLowerCase().trim().replace(/\s+/g, " ");
    };

    if (urlSearchParam || searchTerm) {
      const searchKeyword = urlSearchParam || searchTerm;
      const normalizedKeyword = normalizedSearch(searchKeyword);
      filtered = filtered.filter((product) =>
        normalizedSearch(product.name).includes(normalizedKeyword)
      );
    }

    // 3. Sắp xếp (Sort) - Sử dụng finalPrice cho việc sắp xếp theo giá
    switch (sortOption) {
      case "Giá, thấp đến cao":
        filtered.sort((a, b) => a.finalPrice - b.finalPrice);
        break;
      case "Giá, cao đến thấp":
        filtered.sort((a, b) => b.finalPrice - a.finalPrice);
        break;
      case "Theo thứ tự chữ cái, A-Z":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Theo thứ tự chữ cái, Z-A":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "mặc định":
      default:
        // Giữ thứ tự mặc định (có thể sắp xếp theo ID hoặc thứ tự ban đầu)
        break;
    }

    // Trả về mảng id sản phẩm sau khi lọc/sắp xếp
    return filtered.map((p) => p.id);
  }, [
    allProducts,
    searchTerm,
    sortOption,
    priceRange,
    selectedCategories,
    selectedColors,
    selectedBrands,
  ]);

  // --- Dữ liệu động cho FilterMenu ---
  const { categoriesForFilter, colorsForFilter, brandsForFilter, maxPrice } =
    useMemo(() => {
      const displayProducts = allProducts.map(getProductDisplayInfo);

      const categoryCounts: { [key: string]: number } = {};
      const colorCounts: { [key: string]: { count: number; hex: string } } = {};
      const brandCounts: { [key: string]: number } = {};
      let maxPriceValue = 0;

      displayProducts.forEach((p) => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
        brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
        if (p.color !== "N/A") {
          colorCounts[p.color] = {
            count: (colorCounts[p.color]?.count || 0) + 1,
            hex: p.hex, // Sử dụng hex code từ thuộc tính hex
          };
        }
        // Sử dụng finalPrice để tính maxPrice
        if (p.finalPrice > maxPriceValue) {
          maxPriceValue = p.finalPrice;
        }
      });

      return {
        categoriesForFilter: Object.entries(categoryCounts).map(
          ([name, count]) => ({ name, count })
        ),
        colorsForFilter: Object.entries(colorCounts).map(([name, value]) => ({
          name,
          count: value.count,
          hex: value.hex,
        })),
        brandsForFilter: Object.entries(brandCounts).map(([name, count]) => ({
          name,
          count,
        })),
        maxPrice: Math.max(Math.ceil(maxPriceValue), 1), // Đảm bảo maxPrice ít nhất là 1
      };
    }, [allProducts]);

  // --- PHÂN TRANG ---
  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / ITEMS_PER_PAGE
  );

  // Lấy các sản phẩm cho trang hiện tại và sắp xếp theo đúng thứ tự đã được sắp xếp
  const currentProductIds = filteredAndSortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Tạo mảng sản phẩm theo đúng thứ tự đã sắp xếp
  const currentProducts = currentProductIds
    .map((productId) => allProducts.find((p) => p.ma_san_pham === productId))
    .filter((product): product is ApiProduct => product !== undefined); // Type guard để đảm bảo không có undefined

  // --- EVENT HANDLERS ---
  const resetAllFilters = () => {
    setSearchTerm("");
    setSearchInput("");
    setIsSearching(false);
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    // Đảm bảo reset price range với giá trị an toàn
    const safeMaxPrice = Math.max(maxPrice, 1);
    setPriceRange([0, safeMaxPrice]);
    setSortOption("mặc định");
    setCurrentPage(1);

    // Xóa query parameters khỏi URL
    navigate("/sanpham", { replace: true });
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
    setCurrentPage(1);
  };

  const handleColorChange = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((name) => name !== colorName)
        : [...prev, colorName]
    );
    setCurrentPage(1);
  };

  const handleBrandChange = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((name) => name !== brandName)
        : [...prev, brandName]
    );
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading)
    return <div className="text-center py-20">Loading products...</div>;
  if (error)
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;

  // --- RENDER ---
  return (
    <div className="bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center">
          <h1 className="mt-10 mb-6 text-5xl font-bold">Sản Phẩm</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
            Khám phá bộ sưu tập nội thất và trang trí nhà cửa tinh tế của chúng
            tôi.
          </p>
        </div>

        <div className="w-full mt-8">
          {/* Debug Banner - Temporary */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            {eventLoading ? (
              <div className="text-center py-10 text-gray-500">
                Đang tải sự kiện...
              </div>
            ) : eventError ? (
              <div className="text-center py-10 text-red-500">{eventError}</div>
            ) : activeEvents.length > 0 ? (
              <ProductSwiper products={[]} events={activeEvents} />
            ) : (
              <div className="text-center py-10 text-gray-500">
                Hiện tại không có sự kiện nào đang diễn ra
              </div>
            )}
          </div>

          <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <button
                  className="flex items-center justify-center gap-2 bg-[#518581] text-white rounded-lg shadow px-4 py-2 h-[44px] transition hover:bg-green-800"
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                >
                  <Filter className="w-5 h-5" />
                  <span>{isFilterMenuOpen} bộ lọc</span>
                </button>
                <div className="flex-1 relative w-full">
                  {isSearching ? (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    </div>
                  ) : (
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                  )}
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchInput}
                    onChange={(e) => {
                      const newSearchInput = e.target.value;
                      setSearchInput(newSearchInput);

                      // Clear URL search param when user types in search box
                      if (location.search.includes("search=")) {
                        navigate(location.pathname, { replace: true });
                      }
                    }}
                    className="w-full h-[44px] pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {searchInput && (
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <label className="text-gray-700 font-medium whitespace-nowrap">
                    sắp sếp:
                  </label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    {[
                      "mặc định",
                      "Theo thứ tự chữ cái, A-Z",
                      "Theo thứ tự chữ cái, Z-A",
                      "Giá, thấp đến cao",
                      "Giá, cao đến thấp",
                    ].map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {isFilterMenuOpen && (
                <aside className="w-full md:w-1/4 lg:w-1/5">
                  <FilterMenu
                    priceRange={priceRange}
                    onPriceChange={(values) => {
                      setPriceRange(values);
                      setCurrentPage(1);
                    }}
                    maxPrice={maxPrice}
                    allColors={colorsForFilter}
                    selectedColors={selectedColors}
                    onColorChange={handleColorChange}
                    allCategories={categoriesForFilter}
                    selectedCategories={selectedCategories}
                    onCategoryChange={handleCategoryChange}
                    allBrands={brandsForFilter}
                    selectedBrands={selectedBrands}
                    onBrandChange={handleBrandChange}
                    onResetFilters={resetAllFilters}
                  />
                </aside>
              )}

              <main
                className={
                  isFilterMenuOpen ? "w-full md:w-3/4 lg:w-4/5" : "w-full"
                }
              >
                <div className="mb-4 text-gray-600">
                  Showing <strong>{currentProducts.length}</strong> of{" "}
                  <strong>{filteredAndSortedProducts.length}</strong> products
                </div>
                {currentProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentProducts.map((product) => {
                      // Nếu sản phẩm không có biến thể hoặc hình ảnh, không hiển thị
                      if (
                        !Array.isArray(product.bienthe) ||
                        product.bienthe.length === 0 ||
                        !product.bienthe[0].hinh_anh ||
                        !Array.isArray(product.bienthe[0].hinh_anh) ||
                        product.bienthe[0].hinh_anh.length === 0
                      )
                        return null;
                      return (
                        <div
                          key={product.ma_san_pham}
                          onClick={() => trackViewProduct(product.ma_san_pham)}
                        >
                          <ProductCard product={product} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                    <h3 className="text-xl font-semibold text-gray-700">
                      Không có sản phẩm hợp lệ để hiển thị
                    </h3>
                    <p className="text-gray-500 mt-2">
                      Tất cả sản phẩm hợp lệ phải có ít nhất 1 biến thể.
                    </p>
                    <button
                      onClick={resetAllFilters}
                      className="mt-4 px-4 py-2 bg-[#518581] text-white rounded-lg hover:bg-green-800"
                    >
                      Đặt lại bộ lọc
                    </button>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      className="px-4 py-2 bg-[#518581] text-white rounded-lg disabled:opacity-50"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="text-gray-700 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="px-4 py-2 bg-[#518581] text-white rounded-lg disabled:opacity-50"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrangSanPham;
