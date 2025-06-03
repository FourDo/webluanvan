import React, { useState } from "react";
import {
  Heart,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Share2,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useGioHang } from "../context/GioHangContext";
import type { SanPham } from "../types/types";

interface Product {
  id: number;
  image: string;
  images: string[];
  category: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  features: string[];
  specifications: { [key: string]: string };
}

interface RelatedProduct {
  id: number;
  image: string;
  category: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  discount?: number;
}

const ChiTietSanPham: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Sử dụng context giỏ hàng
  const { themVaoGio } = useGioHang();

  // Mock data với nhiều hình ảnh và thông tin chi tiết
  const product: Product = {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549497538-303791108f95?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
    ],
    category: "Kệ sách",
    name: "Kệ sách gỗ cao cấp Minimalist",
    description:
      "Kệ sách được thiết kế theo phong cách tối giản với chất liệu gỗ tự nhiên cao cấp. Sản phẩm kết hợp hoàn hảo giữa tính thẩm mỹ và công năng sử dụng, phù hợp với mọi không gian nội thất hiện đại.",
    price: 1599000,
    originalPrice: 1999000,
    rating: 4.8,
    reviewCount: 127,
    inStock: true,
    features: [
      "Chất liệu gỗ tự nhiên 100%",
      "Thiết kế tối giản, hiện đại",
      "Khả năng chịu tải cao đến 50kg",
      "Dễ dàng lắp ráp và di chuyển",
      "Bảo hành 2 năm",
    ],
    specifications: {
      "Kích thước": "120cm x 180cm x 30cm",
      "Chất liệu": "Gỗ sồi tự nhiên",
      "Màu sắc": "Nâu gỗ tự nhiên",
      "Trọng lượng": "25kg",
      "Số tầng": "5 tầng",
      "Xuất xứ": "Việt Nam",
    },
  };

  // Related products data
  const relatedProducts = [
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop",
      category: "Kệ sách",
      name: "Kệ sách gỗ thông 4 tầng",
      price: 1299000,
      originalPrice: 1599000,
      rating: 4.6,
      reviewCount: 89,
      discount: 19,
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
      category: "Bàn làm việc",
      name: "Bàn làm việc gỗ tự nhiên",
      price: 2499000,
      rating: 4.7,
      reviewCount: 156,
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      category: "Tủ quần áo",
      name: "Tủ quần áo 3 cánh gỗ sồi",
      price: 3999000,
      originalPrice: 4999000,
      rating: 4.9,
      reviewCount: 203,
      discount: 20,
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=400&fit=crop",
      category: "Ghế",
      name: "Ghế gỗ ergonomic cao cấp",
      price: 1899000,
      rating: 4.5,
      reviewCount: 74,
    },
  ];

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleAddToCart = () => {
    const sanPhamGioHang: SanPham = {
      id: product.id,
      ten: product.name,
      gia: product.price,
      hinhAnh: product.image,
      loai: product.category,
      moTa: product.description,
      description: product.description,
      category: product.category,
      image: product.image,
      price: product.price,
      name: product.name,
      date: new Date().toISOString(), // Provide a default date
      conHang: product.inStock, // Map from inStock
    };

    themVaoGio(sanPhamGioHang, quantity);
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const handleRelatedProductAddToCart = (relatedProduct: RelatedProduct) => {
    const sanPhamGioHang: SanPham = {
      id: relatedProduct.id,
      ten: relatedProduct.name,
      gia: relatedProduct.price,
      hinhAnh: relatedProduct.image,
      loai: relatedProduct.category,
      moTa: `${relatedProduct.name} - ${relatedProduct.category}`,
      description: `${relatedProduct.name} - ${relatedProduct.category}`, // Use a default description
      category: relatedProduct.category,
      image: relatedProduct.image,
      price: relatedProduct.price,
      name: relatedProduct.name,
      date: new Date().toISOString(), // Provide a default date
      conHang: true, // Default value, as inStock is not available in RelatedProduct
    };

    themVaoGio(sanPhamGioHang, 1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button className="flex items-center space-x-1 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-[#518581]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[#518581] font-medium mb-2">
                  {product.category}
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviewCount} đánh giá)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                      -
                      {Math.round(
                        (1 - product.price / product.originalPrice) * 100
                      )}
                      %
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <span
                  className={`text-sm font-medium ${product.inStock ? "text-green-700" : "text-red-700"}`}
                >
                  {product.inStock ? "Còn hàng" : "Hết hàng"}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Số lượng:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isAddedToCart
                      ? "bg-green-600 text-white"
                      : "bg-[#518581] text-white hover:bg-[#457470]"
                  }`}
                  disabled={!product.inStock}
                >
                  {isAddedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Đã thêm vào giỏ hàng!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Thêm vào giỏ hàng</span>
                    </>
                  )}
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`flex-1 border border-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 ${
                      isFavorite
                        ? "text-red-600 border-red-300 bg-red-50"
                        : "text-gray-700"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                    />
                    <span>Yêu thích</span>
                  </button>
                  <button className="flex-1 border border-gray-300 py-3 px-4 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                    <Share2 className="w-5 h-5" />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              {[
                { id: "description", label: "Mô tả" },
                { id: "features", label: "Tính năng" },
                { id: "specifications", label: "Thông số" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-[#518581] border-b-2 border-[#518581]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === "features" && (
                <div className="grid gap-3">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-[#518581] rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid gap-4">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <span className="font-medium text-gray-900">
                          {key}:
                        </span>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                  {relatedProduct.discount && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{relatedProduct.discount}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#518581] font-medium mb-1">
                    {relatedProduct.category}
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#518581] transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex items-center space-x-1 mb-2">
                    {renderStars(relatedProduct.rating)}
                    <span className="text-xs text-gray-500">
                      ({relatedProduct.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">
                        {formatPrice(relatedProduct.price)}
                      </span>
                      {relatedProduct.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(relatedProduct.originalPrice)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        handleRelatedProductAddToCart(relatedProduct)
                      }
                      className="bg-[#518581] text-white p-2 rounded-lg hover:bg-[#457470] transition-colors"
                      title="Thêm vào giỏ hàng"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChiTietSanPham;
