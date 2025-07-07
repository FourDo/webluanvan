import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../API/productApi";
import type { Product, ProductResponse } from "../types/Product";

const QLSanPham: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [displayCount, setDisplayCount] = useState<number>(10);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response: ProductResponse = await getProducts();
        if (
          response.message === "Danh sách tìm kiếm sản phẩm" &&
          Array.isArray(response.data)
        ) {
          setProducts(response.data);
          setFilteredProducts(response.data.slice(0, displayCount));
        } else {
          setError("Dữ liệu không đúng định dạng");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products
      .filter(
        (product) =>
          product.ten_san_pham
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.thuong_hieu.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, displayCount);
    setFilteredProducts(filtered);
  }, [searchTerm, products, displayCount]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && displayCount < products.length) {
        setDisplayCount((prev) => prev + 10);
      }
    },
    [products.length]
  );

  useEffect(() => {
    observer.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    });

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current && observer.current) {
        observer.current.unobserve(loadMoreRef.current);
      }
    };
  }, [handleObserver]);

  const handleAddProduct = () => {
    navigate("/admin/sanpham/them");
  };

  const handleEditProduct = (productId: number) => {
    navigate(`/admin/sanpham/sua/${productId}`);
  };

  const handleDeleteProduct = (_productId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      console.warn("Xóa sản phẩm cần gọi API DELETE");
    }
  };

  const handleViewProduct = (productId: number) => {
    navigate(`/admin/sanpham/${productId}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <button
            onClick={handleAddProduct}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm sản phẩm
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow">
            Lỗi: {error}
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-500">
              Nhấn nút "Thêm sản phẩm" để bắt đầu quản lý.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tên sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Thương hiệu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Chất liệu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product, index) => (
                    <tr
                      key={product.ma_san_pham}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <button
                          onClick={() => handleViewProduct(product.ma_san_pham)}
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          {product.ten_san_pham}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.thuong_hieu}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.mo_ta_ngan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.chat_lieu}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.trang_thai_hoat_dong === "hoat_dong"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.trang_thai_hoat_dong === "hoat_dong"
                            ? "Hoạt động"
                            : "Ngừng hoạt động"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleViewProduct(product.ma_san_pham)
                            }
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded-full"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleEditProduct(product.ma_san_pham)
                            }
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded-full"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteProduct(product.ma_san_pham)
                            }
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded-full"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {displayCount < products.length && (
              <div
                ref={loadMoreRef}
                className="flex justify-center items-center my-6"
              >
                <div className="text-gray-500">Đang tải thêm sản phẩm...</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QLSanPham;
