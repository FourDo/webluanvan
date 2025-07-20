// src/pages/QLSanPham.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Archive,
  Package,
  Filter,
  Tag,
  List,
  LayoutGrid,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productApi } from "../API/productApi";
import type { Product, ProductResponse } from "../types/Product"; // Type của bạn (cần cập nhật)

// --- Helper Functions ---

// Format tiền tệ
const formatCurrency = (amount: number | string) => {
  const numericAmount =
    typeof amount === "string" ? parseInt(amount, 10) : amount;
  if (isNaN(numericAmount)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numericAmount);
};
// Tính toán các chỉ số từ biến thể của sản phẩm
const getProductStats = (product: Product) => {
  if (!product.bienthe || product.bienthe.length === 0) {
    return {
      totalVariants: 0,
      totalStock: 0,
      minPrice: 0,
      maxPrice: 0,
      mainImage: "",
    };
  }
  const totalVariants = product.bienthe.length;
  const totalStock = product.bienthe.reduce(
    (sum, variant) => sum + (variant.so_luong_ton || 0),
    0
  );
  const prices = product.bienthe
    .map((v) => parseInt(v.gia_ban, 10))
    .filter((p) => !isNaN(p));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const mainImage = product.bienthe[0]?.hinh_anh?.[0] || "";

  return { totalVariants, totalStock, minPrice, maxPrice, mainImage };
};

// Product Card Component cho Grid View
const ProductCard: React.FC<{
  product: Product;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ product, onView, onEdit, onDelete }) => {
  const stats = getProductStats(product);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
      <div className="relative">
        <img
          src={stats.mainImage}
          alt={product.ten_san_pham}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.ma_khuyen_mai && (
            <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded-full shadow-sm">
              KM
            </span>
          )}
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${
              product.trang_thai_hoat_dong === "hoat_dong"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.trang_thai_hoat_dong === "hoat_dong"
              ? "Hoạt động"
              : "Ngừng bán"}
          </span>
        </div>
        {product.ten_danh_muc && (
          <div className="absolute top-3 right-3">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs font-semibold rounded-full shadow-sm">
              {product.ten_danh_muc}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
          {product.ten_san_pham}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{product.thuong_hieu}</p>

        <div className="space-y-1 my-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Giá từ:</span>
            <span className="font-bold text-blue-600">
              {formatCurrency(stats.minPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">
              {stats.totalVariants} biến thể
            </span>
            <span className="text-gray-500">Tồn kho: {stats.totalStock}</span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => onView(product.ma_san_pham)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Eye size={16} className="mr-1" />
              Xem
            </button>
            <button
              onClick={() => onEdit(product.ma_san_pham)}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Edit size={16} className="mr-1" />
              Sửa
            </button>
            <button
              onClick={() => onDelete(product.ma_san_pham)}
              className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 12;

const QLSanPham: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [displayCount, setDisplayCount] = useState<number>(12);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response: ProductResponse = await productApi.getProducts();
        if (
          response.message === "Danh sách tìm kiếm sản phẩm" &&
          Array.isArray(response.data)
        ) {
          setProducts(response.data);
        } else {
          setError("Dữ liệu trả về không đúng định dạng mong đợi.");
        }
      } catch (err) {
        setError((err as Error).message || "Không thể tải dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    ...new Set(products.map((p) => p.ten_danh_muc).filter(Boolean) as string[]),
  ];

  const allFilteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      product.ten_san_pham.toLowerCase().includes(searchLower) ||
      product.thuong_hieu.toLowerCase().includes(searchLower) ||
      (product.mo_ta_ngan &&
        product.mo_ta_ngan.toLowerCase().includes(searchLower));

    const matchesStatus =
      filterStatus === "all" || product.trang_thai_hoat_dong === filterStatus;
    const matchesCategory =
      filterCategory === "all" || product.ten_danh_muc === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Tính toán tổng số trang
  const totalPages = Math.ceil(allFilteredProducts.length / ITEMS_PER_PAGE);

  // Lấy danh sách sản phẩm cho trang hiện tại
  const displayedProducts = allFilteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset về trang 1 khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && displayCount < allFilteredProducts.length) {
        setDisplayCount((prev) => prev + 12);
      }
    },
    [displayCount, allFilteredProducts.length]
  );

  useEffect(() => {
    const currentObserver = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "400px",
      threshold: 0.1,
    });
    observer.current = currentObserver;
    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      currentObserver.observe(currentLoadMoreRef);
    }
    return () => {
      if (currentLoadMoreRef) {
        currentObserver.unobserve(currentLoadMoreRef);
      }
    };
  }, [handleObserver]);

  // Event Handlers
  const handleAddProduct = () => navigate("/admin/sanpham/them");
  const handleEditProduct = (id: number) =>
    navigate(`/admin/sanpham/sua/${id}`);
  const handleViewProduct = (id: number) => navigate(`/admin/sanpham/${id}`);
  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      console.warn("Thực hiện gọi API DELETE cho sản phẩm có ID:", id);
      // TODO: Gọi API DELETE và cập nhật state
      setProducts((prev) => prev.filter((p) => p.ma_san_pham !== id));
    }
  };

  // Dashboard Stats
  const totalProducts = products.length;
  const activeProducts = products.filter(
    (p) => p.trang_thai_hoat_dong === "hoat_dong"
  ).length;
  const totalVariants = products.reduce(
    (sum, p) => sum + (p.bienthe?.length || 0),
    0
  );
  const totalStock = products.reduce(
    (sum, p) => sum + getProductStats(p).totalStock,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-4 md:p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Quản lý sản phẩm
                </h1>
                <p className="text-gray-500 mt-1">
                  Quản lý toàn bộ sản phẩm và biến thể trong hệ thống.
                </p>
              </div>
            </div>
            <button
              onClick={handleAddProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalProducts}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeProducts}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng biến thể</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalVariants}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng tồn kho</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalStock}
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <Archive className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, thương hiệu, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="hoat_dong">Hoạt động</option>
                  <option value="ngung_ban">Ngừng bán</option>
                </select>
              </div>
              <div className="relative w-full sm:w-auto">
                <Tag
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                  title="Xem dạng lưới"
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                  title="Xem dạng bảng"
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="font-bold">Đã có lỗi xảy ra</p>
            <p>{error}</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Archive className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || filterStatus !== "all" || filterCategory !== "all"
                ? "Không tìm thấy sản phẩm"
                : "Chưa có sản phẩm nào"}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== "all" || filterCategory !== "all"
                ? "Vui lòng thử lại với từ khóa hoặc bộ lọc khác."
                : 'Nhấn nút "Thêm sản phẩm" để bắt đầu quản lý.'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.ma_san_pham}
                    product={product}
                    onView={handleViewProduct}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Danh mục
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thông tin
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayedProducts.map((product) => {
                      const stats = getProductStats(product);
                      return (
                        <tr
                          key={product.ma_san_pham}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <img
                                src={stats.mainImage}
                                alt={product.ten_san_pham}
                                className="w-12 h-12 rounded-lg object-cover mr-4 flex-shrink-0"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {product.ten_san_pham}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.thuong_hieu}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {product.ten_danh_muc || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div>
                              <strong>Giá:</strong>{" "}
                              {formatCurrency(stats.minPrice)}
                              {stats.minPrice !== stats.maxPrice
                                ? ` - ${formatCurrency(stats.maxPrice)}`
                                : ""}
                            </div>
                            <div>
                              <strong>Tồn kho:</strong> {stats.totalStock}
                            </div>
                            <div>
                              <strong>Biến thể:</strong> {stats.totalVariants}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.trang_thai_hoat_dong === "hoat_dong" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {product.trang_thai_hoat_dong === "hoat_dong"
                                ? "Hoạt động"
                                : "Ngừng bán"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center items-center space-x-1">
                              <button
                                onClick={() =>
                                  handleViewProduct(product.ma_san_pham)
                                }
                                className="text-gray-400 hover:text-blue-600 p-2 hover:bg-gray-100 rounded-lg"
                                title="Xem"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleEditProduct(product.ma_san_pham)
                                }
                                className="text-gray-400 hover:text-yellow-600 p-2 hover:bg-gray-100 rounded-lg"
                                title="Sửa"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteProduct(product.ma_san_pham)
                                }
                                className="text-gray-400 hover:text-red-600 p-2 hover:bg-gray-100 rounded-lg"
                                title="Xóa"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 mt-6">
                <span className="text-sm text-gray-700">
                  Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    allFilteredProducts.length
                  )}{" "}
                  trên tổng số {allFilteredProducts.length} sản phẩm
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((c) => c - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trang trước
                  </button>
                  <span className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((c) => c + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QLSanPham;
