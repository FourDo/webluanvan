import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { recommendationApi } from "../API/recommendationApi";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types/Product";
import { Link } from "react-router-dom";
import { useBehaviorTracking } from "../hooks/useBehaviorTracking";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/swiper-custom.css";

interface ProductRecommendationsProps {
  limit?: number;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  limit = 8,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { trackViewProduct } = useBehaviorTracking();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        let response;

        console.log("User object:", user); // Debug log

        if (user && user.ma_nguoi_dung) {
          // User đã đăng nhập - lấy gợi ý cá nhân hóa
          const userId = user.ma_nguoi_dung;
          console.log("Fetching recommendations for user ID:", userId);

          response = await recommendationApi.getUserRecommendations(
            userId,
            "hybrid",
            limit
          );
        } else {
          // Khách chưa đăng nhập - lấy gợi ý chung
          console.log("Fetching guest recommendations");
          response = await recommendationApi.getGuestRecommendations(limit);
        }

        // Lọc sản phẩm có biến thể và hình ảnh hợp lệ
        const products = response.data.recommendations || [];
        const validProducts = products.filter(
          (product) =>
            product.bienthe &&
            product.bienthe.length > 0 &&
            product.trang_thai_hoat_dong === "hoat_dong"
        );

        setProducts(validProducts);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, limit]);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#518581]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Không thể tải gợi ý sản phẩm: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có gợi ý sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-[#151411] mb-4">
          {user ? "Gợi Ý Dành Cho Bạn" : "Sản Phẩm Được Đề Xuất"}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {user
            ? "Những sản phẩm được chọn lọc dựa trên sở thích và lịch sử mua hàng của bạn"
            : "Khám phá những sản phẩm được nhiều khách hàng yêu thích"}
        </p>
      </motion.div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
        }}
        className="product-swiper mb-16"
      >
        {products.map((product, index) => {
          const mainVariant = product.bienthe[0];
          const imageUrl =
            mainVariant.hinh_anh && mainVariant.hinh_anh.length > 0
              ? mainVariant.hinh_anh[0]
              : "/image/product1.png"; // Fallback image

          return (
            <SwiperSlide key={product.ma_san_pham}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link
                  to={`/sanpham/${product.ma_san_pham}`}
                  onClick={() => trackViewProduct(product.ma_san_pham)}
                >
                  <div className="relative group">
                    <img
                      src={imageUrl}
                      alt={product.ten_san_pham}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {user ? "Gợi Ý" : "Đề Xuất"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-[#518581] transition-colors">
                      {product.ten_san_pham}
                    </h3>

                    <div className="flex items-center justify-between">
                      {mainVariant.phan_tram_giam ? (
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-red-600">
                            {formatPrice(
                              (
                                parseFloat(mainVariant.gia_ban) *
                                (1 - mainVariant.phan_tram_giam / 100)
                              ).toString()
                            )}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(mainVariant.gia_ban)}
                          </span>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full mt-1 self-start">
                            -{mainVariant.phan_tram_giam}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-[#518581]">
                          {formatPrice(mainVariant.gia_ban)}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {product.thuong_hieu}
                      </span>
                    </div>

                    {product.ten_danh_muc && (
                      <p className="text-xs text-gray-400 mt-1">
                        {product.ten_danh_muc}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center mt-12"
      >
        <Link
          to="/sanpham"
          className="inline-block bg-[#518581] text-white px-8 py-3 rounded-lg hover:bg-green-800 transition-colors duration-300"
        >
          Khám Phá Thêm
        </Link>
      </motion.div>
    </div>
  );
};

export default ProductRecommendations;
