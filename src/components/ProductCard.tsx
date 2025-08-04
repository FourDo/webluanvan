// src/components/ProductCard.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product as ApiProduct } from "../types/Product"; // Sử dụng kiểu dữ liệu gốc từ API
import { useBehaviorTracking } from "../hooks/useBehaviorTracking";

// Helper để chuyển tên màu sang mã hex, bạn có thể tùy chỉnh
const colorNameToHex = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    đen: "#000000",
    trắng: "#FFFFFF",
    xám: "#808080",
    nâu: "#A52A2A",
    vàng: "#FFD700",
    "xanh dương": "#0000FF",
    đỏ: "#FF0000",
    // Thêm các màu khác từ dữ liệu của bạn ở đây
  };
  // Trả về màu xám nếu không tìm thấy, hoặc bạn có thể trả về chính colorName nếu nó đã là mã hex
  return colorMap[colorName.toLowerCase()] || colorName;
};

// Helper định dạng tiền tệ
const formatCurrency = (amount: number | string) => {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numericAmount);
};

interface ProductCardProps {
  product: ApiProduct; // Bắt buộc nhận prop 'product' với kiểu dữ liệu gốc
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { trackViewProduct } = useBehaviorTracking();

  // Lấy biến thể đầu tiên làm mặc định
  const defaultVariant = product.bienthe?.[0];
  const defaultImage = defaultVariant?.hinh_anh?.[0] || "";

  // State để quản lý ảnh đang được hover
  const [currentImage, setCurrentImage] = useState(defaultImage);

  // Nếu sản phẩm không có biến thể nào, không hiển thị
  if (!defaultVariant) {
    return null;
  }

  const handleMouseEnterColor = (variantImage: string | undefined) => {
    if (variantImage) {
      setCurrentImage(variantImage);
    }
  };

  const handleMouseLeaveCard = () => {
    setCurrentImage(defaultImage);
  };

  const handleCardClick = () => {
    // Track behavior "xem" khi user click vào sản phẩm
    trackViewProduct(product.ma_san_pham);

    // Điều hướng đến trang chi tiết sản phẩm, ví dụ: /san-pham/123
    navigate(`/sanpham/${product.ma_san_pham}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl"
      onMouseLeave={handleMouseLeaveCard} // Reset ảnh khi chuột rời khỏi card
    >
      {/* Phần hình ảnh */}
      <div className="relative cursor-pointer" onClick={handleCardClick}>
        {/* Badge giảm giá */}
        {defaultVariant.phan_tram_giam && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold z-10">
            -{defaultVariant.phan_tram_giam}%
          </div>
        )}
        <img
          src={currentImage}
          onError={(e) => {
            e.currentTarget.src = "/image/hetcuu3.png"; // Hình ảnh thay thế nếu không tìm thấy
          }}
          alt={product.ten_san_pham}
          className="w-full h-64 object-cover transition-all duration-300"
        />
      </div>

      {/* Phần thông tin */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs text-gray-500 mb-1">
          {product.ten_danh_muc || "Chưa phân loại"}
        </span>
        <h3
          className="font-semibold text-gray-800 line-clamp-2 flex-grow min-h-[48px] cursor-pointer hover:text-green-700"
          onClick={handleCardClick}
        >
          {product.ten_san_pham}
        </h3>

        {/* Phần giá - hiển thị giá khuyến mãi nếu có */}
        <div className="my-3">
          {defaultVariant.phan_tram_giam &&
          defaultVariant.phan_tram_giam > 0 ? (
            <div className="flex flex-col">
              <p className="text-xl font-bold text-red-600">
                {defaultVariant.gia_khuyen_mai
                  ? formatCurrency(defaultVariant.gia_khuyen_mai)
                  : formatCurrency(
                      parseFloat(defaultVariant.gia_ban) *
                        (1 - defaultVariant.phan_tram_giam / 100)
                    )}
              </p>
              <p className="text-sm text-gray-500 line-through">
                {formatCurrency(defaultVariant.gia_ban)}
              </p>
              <p className="text-xs text-green-600 font-medium">
                Tiết kiệm {defaultVariant.phan_tram_giam}%
              </p>
            </div>
          ) : (
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(defaultVariant.gia_ban)}
            </p>
          )}
        </div>

        {/* Phần hiển thị màu sắc tương tác */}
        <div className="mt-auto pt-3 border-t border-gray-100 min-h-[40px]">
          {product.bienthe && product.bienthe.length > 1 ? (
            <div className="flex items-center gap-2">
              {product.bienthe.map(
                (variant) =>
                  variant.hex_code && (
                    <div
                      key={variant.hex_code}
                      onMouseEnter={() =>
                        handleMouseEnterColor(variant.hinh_anh?.[0])
                      }
                      className="w-6 h-6 rounded-full cursor-pointer border-2 border-white ring-1 ring-gray-300 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: colorNameToHex(variant.hex_code),
                      }}
                      title={variant.hex_code} // Hiển thị tên màu khi hover
                    />
                  )
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">Chỉ có 1 tùy chọn</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
