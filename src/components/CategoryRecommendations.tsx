import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { recommendationApi } from "../API/recommendationApi";
import type { Product } from "../types/Product";
import { Star, ShoppingCart } from "lucide-react";

interface CategoryRecommendationsProps {
  productId: number;
  limit?: number;
}

const formatCurrency = (amount: number | string) => {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numericAmount);
};

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
    />
  ));
};

const CategoryRecommendations: React.FC<CategoryRecommendationsProps> = ({
  productId,
  limit = 8,
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching recommendations for productId:", productId);
        const response = await recommendationApi.getCategoryRecommendations(
          productId,
          limit
        );
        console.log("API Response:", response);

        if (response.success && response.data) {
          console.log("Setting recommendations:", response.data);
          setRecommendations(response.data);
        } else {
          console.log("No data or unsuccessful response:", response);
          setError("Không thể tải sản phẩm gợi ý");
        }
      } catch (err) {
        console.error("Error fetching category recommendations:", err);
        setError("Không thể tải sản phẩm gợi ý");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRecommendations();
    }
  }, [productId, limit]);

  const handleProductClick = (id: number) => {
    navigate(`/san-pham/${id}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Sản phẩm liên quan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-gray-200 animate-pulse rounded-lg h-80"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Sản phẩm liên quan
        </h2>
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="text-gray-500">Không có sản phẩm gợi ý</div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sản phẩm liên quan
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => {
          // Lấy hình ảnh đầu tiên từ biến thể
          const firstImage =
            product.bienthe?.[0]?.hinh_anh?.[0] || "/no-image.png";

          // Lấy giá từ biến thể đầu tiên
          const firstVariant = product.bienthe?.[0];
          const originalPrice = firstVariant ? Number(firstVariant.gia_ban) : 0;
          const discountPrice = firstVariant?.gia_khuyen_mai
            ? Number(firstVariant.gia_khuyen_mai)
            : firstVariant?.phan_tram_giam
              ? originalPrice * (1 - firstVariant.phan_tram_giam / 100)
              : null;

          return (
            <div
              key={product.ma_san_pham}
              className="group bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative"
              onClick={() => handleProductClick(product.ma_san_pham)}
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={firstImage}
                  alt={product.ten_san_pham}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-[#518581] font-medium mb-1">
                  {product.ten_danh_muc}
                </p>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#518581] transition-colors">
                  {product.ten_san_pham}
                </h3>
                <div className="flex items-center space-x-1 mb-3">
                  {renderStars(4.5)}
                  <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {discountPrice ? (
                      <>
                        <span className="text-sm font-bold text-red-600">
                          {formatCurrency(discountPrice)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          {formatCurrency(originalPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(originalPrice)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product.ma_san_pham);
                    }}
                    className="p-2 bg-[#518581] text-white rounded-lg hover:bg-[#457470] transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
                {firstVariant?.phan_tram_giam && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                    -{firstVariant.phan_tram_giam}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryRecommendations;
