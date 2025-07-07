// src/pages/TrangSanPham.tsx

import React, { useState, useEffect, useMemo } from "react";
import { Filter, Search } from "lucide-react";

// Import API và Types từ trang quản lý
import { getProducts } from "../API/productApi";
import type { Product as ApiProduct, ProductResponse } from "../types/Product";

// Import các component con
import ProductSwiper from "../components/ProductSwiper";
import FilterMenu from "../components/FilterMenu";
import ProductCard from "../components/ProductCard";

// Helper function để lấy các thông tin cần thiết từ sản phẩm API
const getProductDisplayInfo = (product: ApiProduct) => {
  const mainVariant = product.bienthe?.[0];
  return {
    id: product.ma_san_pham,
    name: product.ten_san_pham,
    category: product.ten_danh_muc || "Uncategorized",
    description: product.mo_ta_ngan || "No description available.",
    price: mainVariant ? parseFloat(mainVariant.gia_ban) : 0,
    image: mainVariant?.hinh_anh?.[0] || "",
    // Giả sử màu sắc được lưu trong thuộc tính của biến thể
    color: mainVariant?.hex_code || "N/A",
  };
};

const TrangSanPham: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(true); // Mặc định mở
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // State cho tìm kiếm và sắp xếp
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("Featured");

  // State cho bộ lọc từ FilterMenu
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchProducts = async () => {
      const CACHE_KEY = "cached_products";
      const CACHE_TIMESTAMP_KEY = "cached_products_timestamp";
      const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

      // Lấy dữ liệu từ localStorage nếu còn hạn
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
        setAllProducts(cachedProducts);
        const prices = cachedProducts
          .map((p) => getProductDisplayInfo(p).price)
          .filter((price) => price > 0);
        const maxPrice =
          prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
        setPriceRange([0, maxPrice]);
        setLoading(false);
        return;
      }

      // Nếu không có cache hoặc cache hết hạn, gọi API
      try {
        const response: ProductResponse = await getProducts();
        if (
          response.message === "Danh sách tìm kiếm sản phẩm" &&
          Array.isArray(response.data)
        ) {
          const activeProducts = response.data.filter(
            (p) => p.trang_thai_hoat_dong === "hoat_dong"
          );
          setAllProducts(activeProducts);
          cacheProducts(activeProducts);

          const prices = activeProducts
            .map((p) => getProductDisplayInfo(p).price)
            .filter((price) => price > 0);
          const maxPrice =
            prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
          setPriceRange([0, maxPrice]);
        } else {
          setError("Dữ liệu sản phẩm không hợp lệ.");
        }
      } catch (err) {
        // Nếu API lỗi, thử lấy lại cache (nếu có)
        const cachedProductsFallback = getCachedProducts();
        if (cachedProductsFallback) {
          setAllProducts(cachedProductsFallback);
          const prices = cachedProductsFallback
            .map((p) => getProductDisplayInfo(p).price)
            .filter((price) => price > 0);
          const maxPrice =
            prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
          setPriceRange([0, maxPrice]);
        } else {
          setError((err as Error).message || "Không thể tải dữ liệu sản phẩm.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- LOGIC LỌC, SẮP XẾP VÀ PHÂN TRANG (CORE LOGIC) ---
  const filteredAndSortedProducts = useMemo(() => {
    // Chuyển đổi dữ liệu API thành định dạng dễ hiển thị
    const displayProducts = allProducts.map(getProductDisplayInfo);

    let filtered = displayProducts;

    // 1. Lọc theo các tiêu chí từ FilterMenu
    filtered = filtered.filter((p) => {
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);
      const colorMatch =
        selectedColors.length === 0 || selectedColors.includes(p.color);
      return priceMatch && categoryMatch && colorMatch;
    });

    // 2. Lọc theo Tìm kiếm (Search)
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. Sắp xếp (Sort)
    switch (sortOption) {
      case "Price, low to high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "Price, high to low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "Alphabetically, A-Z":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Alphabetically, Z-A":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
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
  ]);

  // --- Dữ liệu động cho FilterMenu ---
  const { categoriesForFilter, colorsForFilter, maxPrice } = useMemo(() => {
    const displayProducts = allProducts.map(getProductDisplayInfo);

    const categoryCounts: { [key: string]: number } = {};
    const colorCounts: { [key: string]: { count: number; hex: string } } = {};
    let maxPriceValue = 0;

    displayProducts.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      if (p.color !== "N/A") {
        colorCounts[p.color] = {
          count: (colorCounts[p.color]?.count || 0) + 1,
          hex: p.color, // Assuming p.color is the hex code
        };
      }
      if (p.price > maxPriceValue) {
        maxPriceValue = p.price;
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
      maxPrice: Math.ceil(maxPriceValue),
    };
  }, [allProducts]);

  // --- PHÂN TRANG ---
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

  // --- EVENT HANDLERS ---
  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedColors([]);
    setPriceRange([0, maxPrice]);
    setSortOption("Featured");
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
          <h1 className="mt-10 mb-6 text-5xl font-bold">Products</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
            Explore our curated collection of fine furniture and home decor.
          </p>
        </div>
      </div>
      <div className="w-full mt-8">
        <ProductSwiper />
      </div>

      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <button
              className="flex items-center justify-center gap-2 bg-[#518581] text-white rounded-lg shadow px-4 py-2 h-[44px] transition hover:bg-green-800"
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            >
              <Filter className="w-5 h-5" />
              <span>{isFilterMenuOpen ? "Hide" : "Show"} Filters</span>
            </button>
            <div className="flex-1 relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[44px] pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-gray-700 font-medium whitespace-nowrap">
                Sort by:
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {[
                  "Featured",
                  "Best selling",
                  "Alphabetically, A-Z",
                  "Alphabetically, Z-A",
                  "Price, low to high",
                  "Price, high to low",
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
                onResetFilters={resetAllFilters}
              />
            </aside>
          )}

          <main
            className={isFilterMenuOpen ? "w-full md:w-3/4 lg:w-4/5" : "w-full"}
          >
            <div className="mb-4 text-gray-600">
              Showing <strong>{currentProducts.length}</strong> of{" "}
              <strong>{filteredAndSortedProducts.length}</strong> products
            </div>
            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product) => {
                  // Tìm lại ApiProduct gốc dựa trên id
                  const originalProduct = allProducts.find(
                    (p) => p.ma_san_pham === product.ma_san_pham
                  );
                  if (!originalProduct) return null;
                  return (
                    <ProductCard
                      key={product.ma_san_pham}
                      product={originalProduct}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-700">
                  No products match your criteria
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="mt-4 px-4 py-2 bg-[#518581] text-white rounded-lg hover:bg-green-800"
                >
                  Reset All Filters
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
  );
};

export default TrangSanPham;
