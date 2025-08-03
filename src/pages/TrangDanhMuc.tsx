import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import categoryApi from "../API/categoryApi";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/Product";

interface Category {
  ma_danh_muc: number;
  ten_danh_muc: string;
  mo_ta: string;
  ngay_tao: string;
  slug: string;
}

const TrangDanhMuc: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategoryAndProducts = async () => {
      if (!slug) {
        setError("Không tìm thấy danh mục");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Lấy thông tin danh mục theo slug (API sẽ trả về cả sản phẩm thuộc danh mục)
        const response = await categoryApi.getCategoryBySlug(slug);

        // Xử lý response dựa trên cấu trúc thực tế
        if (response.message && Array.isArray(response.data)) {
          // Trường hợp API trả về danh sách sản phẩm (như response bạn cung cấp)
          const productList = response.data;

          // Lấy thông tin danh mục từ sản phẩm đầu tiên
          if (productList.length > 0) {
            const firstProduct = productList[0];
            setCategory({
              ma_danh_muc: 0,
              ten_danh_muc: firstProduct.ten_danh_muc || slug,
              mo_ta:
                response.message ||
                `Danh sách sản phẩm thuộc danh mục: ${firstProduct.ten_danh_muc}`,
              ngay_tao: "",
              slug: slug,
            });
          } else {
            // Nếu không có sản phẩm nào, tạo danh mục với thông tin cơ bản
            setCategory({
              ma_danh_muc: 0,
              ten_danh_muc: slug.replace("-", " "),
              mo_ta: response.message || "Danh mục không có sản phẩm",
              ngay_tao: "",
              slug: slug,
            });
          }

          // Lọc sản phẩm hợp lệ
          const validProducts = productList.filter(
            (product: any) =>
              product.trang_thai_hoat_dong === "hoat_dong" &&
              Array.isArray(product.bienthe) &&
              product.bienthe.length > 0 &&
              product.bienthe[0].hinh_anh &&
              Array.isArray(product.bienthe[0].hinh_anh) &&
              product.bienthe[0].hinh_anh.length > 0
          );

          setProducts(validProducts);
        } else if (response.data && !Array.isArray(response.data)) {
          // Trường hợp API trả về thông tin danh mục (như interface định nghĩa)
          setCategory(response.data);
          // Trong trường hợp này, có thể cần gọi API khác để lấy sản phẩm
          setProducts([]); // Tạm thời để trống
        }
      } catch (err: any) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    loadCategoryAndProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/sanpham")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay về trang sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate("/")}
            className="hover:text-blue-600 transition-colors"
          >
            Trang chủ
          </button>
          <span>/</span>
          <button
            onClick={() => navigate("/sanpham")}
            className="hover:text-blue-600 transition-colors"
          >
            Sản phẩm
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {category?.ten_danh_muc}
          </span>
        </nav>

        {/* Category Header */}
        {category && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.ten_danh_muc}
            </h1>
            {category.mo_ta && (
              <p className="text-gray-600 text-lg">{category.mo_ta}</p>
            )}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {products.length} sản phẩm
              </span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.ma_san_pham} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-600 mb-6">
              Danh mục này hiện chưa có sản phẩm. Vui lòng quay lại sau.
            </p>
            <button
              onClick={() => navigate("/sanpham")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrangDanhMuc;
