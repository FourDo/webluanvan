import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Filter, Search, Calendar, MapPin, Clock } from "lucide-react";
import { eventApi } from "../API/eventApi";
import { productApi } from "../API/productApi";
import ProductCard from "../components/ProductCard";
import FilterMenu from "../components/FilterMenu";
import type { Event } from "../types/Event";
import type { Product as ApiProduct } from "../types/Product";

// Helper function để lấy thông tin hiển thị từ sản phẩm API
const getProductDisplayInfo = (product: ApiProduct) => {
  const mainVariant = product.bienthe?.[0];
  const originalPrice = mainVariant ? parseFloat(mainVariant.gia_ban) : 0;
  const discountPercent = mainVariant?.phan_tram_giam || null;
  const discountedPrice = discountPercent
    ? originalPrice * (1 - discountPercent / 100)
    : null;

  return {
    id: product.ma_san_pham,
    name: product.ten_san_pham,
    category: product.ten_danh_muc || "Uncategorized",
    brand: product.thuong_hieu || "Không có thương hiệu",
    description: product.mo_ta_ngan || "No description available.",
    price: originalPrice,
    discountedPrice: discountedPrice,
    discountPercent: discountPercent,
    finalPrice: discountedPrice || originalPrice,
    image: mainVariant?.hinh_anh?.[0] || "",
    color: mainVariant?.ten_mau_sac || "N/A",
    hex: mainVariant?.hex_code || "#000000",
  };
};

// Custom hook useDebounce
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

const ChiTietSuKien: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // State cho sự kiện
  const [event, setEvent] = useState<Event | null>(null);
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho UI
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // State cho search và sort
  const [searchInput, setSearchInput] = useState("");
  const [sortOption, setSortOption] = useState("Mặc định");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search
  const debouncedSearchTerm = useDebounce(searchInput, 500);
  const [searchTerm, setSearchTerm] = useState("");

  // State cho filter
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Load data
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;

      setLoading(true);
      setError(null);

      try {
        // Load thông tin sự kiện và sản phẩm song song
        const [events, eventProductsData] = await Promise.all([
          eventApi.fetchEvents(),
          eventApi.getEventProducts(parseInt(eventId)),
        ]);

        // Tìm sự kiện hiện tại
        const currentEvent = events.find(
          (e) => e.su_kien_id === parseInt(eventId)
        );
        if (!currentEvent) {
          setError("Không tìm thấy sự kiện");
          return;
        }

        setEvent(currentEvent);

        // Load chi tiết sản phẩm
        if (eventProductsData.length > 0) {
          const productIds = eventProductsData.map((ep) => ep.ma_san_pham);
          const allProductsResponse = await productApi.getProducts();

          if (
            allProductsResponse.data &&
            Array.isArray(allProductsResponse.data)
          ) {
            const filteredProducts = allProductsResponse.data.filter(
              (p: ApiProduct) =>
                productIds.includes(p.ma_san_pham) &&
                p.trang_thai_hoat_dong === "hoat_dong" &&
                Array.isArray(p.bienthe) &&
                p.bienthe.length > 0 &&
                p.bienthe[0].hinh_anh &&
                Array.isArray(p.bienthe[0].hinh_anh) &&
                p.bienthe[0].hinh_anh.length > 0
            );

            setAllProducts(filteredProducts);

            // Set price range
            const prices = filteredProducts
              .map((p: ApiProduct) => getProductDisplayInfo(p).finalPrice)
              .filter((price: number) => price > 0);
            const maxPrice =
              prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
            setPriceRange([0, Math.max(maxPrice, 1)]);
          }
        }
      } catch (err) {
        setError((err as Error).message || "Không thể tải dữ liệu sự kiện");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // Handle debounced search
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
    setCurrentPage(1);
    setIsSearching(false);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (searchInput !== debouncedSearchTerm) {
      setIsSearching(true);
    }
  }, [searchInput, debouncedSearchTerm]);

  // Filter và sort logic
  const filteredAndSortedProducts = useMemo(() => {
    const displayProducts = allProducts.map(getProductDisplayInfo);
    let filtered = displayProducts;

    // Apply filters
    filtered = filtered.filter((p) => {
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

    // Apply search
    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(normalizedSearch)
      );
    }

    // Apply sort
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
      default:
        break;
    }

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

  // Data cho FilterMenu
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
            hex: p.hex,
          };
        }
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
        maxPrice: Math.max(Math.ceil(maxPriceValue), 1),
      };
    }, [allProducts]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / ITEMS_PER_PAGE
  );
  const currentProductIds = filteredAndSortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const currentProducts = allProducts.filter((p) =>
    currentProductIds.includes(p.ma_san_pham)
  );

  // Event handlers
  const resetAllFilters = () => {
    setSearchTerm("");
    setSearchInput("");
    setIsSearching(false);
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    const safeMaxPrice = Math.max(maxPrice, 1);
    setPriceRange([0, safeMaxPrice]);
    setSortOption("Mặc định");
    setCurrentPage(1);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-16">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => navigate("/sanpham")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại trang sản phẩm
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Không tìm thấy sự kiện</p>
          <button
            onClick={() => navigate("/sanpham")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại trang sản phẩm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Event Header */}
        <div className="text-center mb-8">
          <h1 className="mt-10 mb-6 text-5xl font-bold">{event.tieu_de}</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto mb-6">
            {event.noi_dung}
          </p>

          {/* Event Info */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Bắt đầu: {formatDate(event.ngay_bat_dau)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Kết thúc: {formatDate(event.ngay_ket_thuc)}</span>
            </div>
            {event.loai_su_kien && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="capitalize">{event.loai_su_kien}</span>
              </div>
            )}
          </div>
        </div>

        {/* Banner Image */}
        {event.anh_banner && (
          <div className="mb-8">
            <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={event.anh_banner}
                alt={event.tieu_de}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <button
              className="flex items-center justify-center gap-2 bg-[#518581] text-white rounded-lg shadow px-4 py-2 h-[44px] transition hover:bg-green-800"
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            >
              <Filter className="w-5 h-5" />
              <span>{isFilterMenuOpen ? "Ẩn" : "Hiện"} Bộ lọc</span>
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
                placeholder="Tìm kiếm sản phẩm trong sự kiện..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
                Sắp xếp:
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {[
                  "Mặc định",
                  "Theo thứ tự chữ cái, A-Z",
                  "Theo thứ tự chữ cái, Z-A",
                  "Giá, thấp đến cao",
                  "Giá, cao đến thấp",
                ].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
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
            className={isFilterMenuOpen ? "w-full md:w-3/4 lg:w-4/5" : "w-full"}
          >
            <div className="mb-4 text-gray-600">
              Hiển thị <strong>{currentProducts.length}</strong> trong tổng số{" "}
              <strong>{filteredAndSortedProducts.length}</strong> sản phẩm
            </div>

            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard key={product.ma_san_pham} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-700">
                  Không có sản phẩm nào trong sự kiện này
                </h3>
                <p className="text-gray-500 mt-2">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="mt-4 px-4 py-2 bg-[#518581] text-white rounded-lg hover:bg-green-800"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  className="px-4 py-2 bg-[#518581] text-white rounded-lg disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                <span className="text-gray-700 font-medium">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  className="px-4 py-2 bg-[#518581] text-white rounded-lg disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ChiTietSuKien;
