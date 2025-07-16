import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "../API/productApi";
import type { Product } from "../types/Product";
import { useGioHang } from "../context/GioHangContext";
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
      className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
    />
  ));
};

const ChiTietSanPham: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { themVaoGio } = useGioHang();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    productApi
      .getProductById(Number(id))
      .then((data) => {
        setProduct(data);
        setSelectedVariantIdx(0);
        if (data.bienthe && data.bienthe.length > 0) {
          // Use ten_kich_thuoc if available, otherwise parse ten_cac_bien_the
          const firstSize =
            data.bienthe[0].ten_kich_thuoc ||
            data.bienthe[0].ten_cac_bien_the?.split(" / ")[1]?.trim() ||
            "";
          setSelectedSize(firstSize);
        }
      })
      .catch((err) => setError(err.message || "Không thể tải sản phẩm"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải dữ liệu sản phẩm...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-semibold">{error}</div>
    );
  if (!product)
    return (
      <div className="p-8 text-center text-gray-500">
        Không tìm thấy sản phẩm.
      </div>
    );

  // Get current color and sizes, with fallback to ten_cac_bien_the if needed
  const currentColor =
    product.bienthe?.[selectedVariantIdx]?.ten_mau_sac ||
    product.bienthe?.[selectedVariantIdx]?.ten_cac_bien_the
      ?.split(" / ")[0]
      ?.trim() ||
    "";
  const sizesForCurrentColor = Array.from(
    new Set(
      product.bienthe
        ?.filter(
          (v) =>
            (v.ten_mau_sac || v.ten_cac_bien_the?.split(" / ")[0]?.trim()) ===
            currentColor
        )
        .map(
          (v) =>
            v.ten_kich_thuoc ||
            v.ten_cac_bien_the?.split(" / ")[1]?.trim() ||
            ""
        )
        .filter((size) => size)
    )
  );
  const selectedVariant =
    product.bienthe?.find((v) => {
      const color =
        v.ten_mau_sac || v.ten_cac_bien_the?.split(" / ")[0]?.trim() || "";
      const size =
        v.ten_kich_thuoc || v.ten_cac_bien_the?.split(" / ")[1]?.trim() || "";
      return color === currentColor && size === selectedSize;
    }) || product.bienthe?.[selectedVariantIdx];
  const images =
    selectedVariant?.hinh_anh && selectedVariant.hinh_anh.length > 0
      ? selectedVariant.hinh_anh
      : ["/no-image.png"];
  const inStock = selectedVariant ? selectedVariant.so_luong_ton > 0 : false;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    const color =
      selectedVariant.ten_mau_sac ||
      selectedVariant.ten_cac_bien_the?.split(" / ")[0]?.trim() ||
      "";
    const size =
      selectedVariant.ten_kich_thuoc ||
      selectedVariant.ten_cac_bien_the?.split(" / ")[1]?.trim() ||
      "";
    const sanPhamGioHang = {
      id: product.ma_san_pham,
      ten: product.ten_san_pham,
      gia: Number(selectedVariant.gia_ban),
      hinhAnh: images[0],
      loai: product.ten_danh_muc || "",
      moTa: product.mo_ta_ngan,
      description: product.mo_ta_ngan,
      category: product.ten_danh_muc || "",
      image: images[0],
      price: Number(selectedVariant.gia_ban),
      name: product.ten_san_pham,
      date: new Date().toISOString(),
      conHang: inStock,
      width: 0,
      length: 0,
      weight: 0,
      chieuRong: 0,
      chieuDai: 0,
      chieuCao: 0,
      khoiLuong: 0,
      ma_bien_the: selectedVariant.ma_bien_the || selectedVariant.id,
      mauSac: color,
      kichThuoc: size,
      so_luong: quantity,
      gia_goc: Number(selectedVariant.gia_ban),
      loai_khuyen_mai: null,
      gia_khuyen_mai: 0,
      gia_sau_km: Number(selectedVariant.gia_ban),
    };
    themVaoGio(sanPhamGioHang, quantity);
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <span>/</span>
            <span>{product.ten_danh_muc}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {product.ten_san_pham}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={images[0]}
                  alt={product.ten_san_pham}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {}}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === 0 ? "border-[#518581]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <img
                      src={img}
                      alt={product.ten_san_pham + " " + idx}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-[#518581] font-medium mb-2">
                  {product.ten_danh_muc}
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.ten_san_pham}
                </h1>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(4.5)}
                  </div>
                  <span className="text-sm text-gray-600">
                    4.5 (100 đánh giá)
                  </span>
                </div>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(selectedVariant?.gia_ban || 0)}
                  </span>
                </div>
              </div>

              {product.bienthe && product.bienthe.length > 1 && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    Màu sắc:
                  </span>
                  <div className="flex space-x-2">
                    {Array.from(
                      new Set(
                        product.bienthe.map(
                          (v) =>
                            v.ten_mau_sac ||
                            v.ten_cac_bien_the?.split(" / ")[0]?.trim()
                        )
                      )
                    ).map((color, idx) => {
                      const variant = product.bienthe.find(
                        (v) =>
                          (v.ten_mau_sac ||
                            v.ten_cac_bien_the?.split(" / ")[0]?.trim()) ===
                          color
                      );
                      return (
                        <button
                          key={`${color ?? "unknown"}-${idx}`}
                          onClick={() => {
                            const newIdx = product.bienthe.findIndex(
                              (v) =>
                                (v.ten_mau_sac ||
                                  v.ten_cac_bien_the
                                    ?.split(" / ")[0]
                                    ?.trim()) === color
                            );
                            setSelectedVariantIdx(newIdx);
                            const firstSize =
                              product.bienthe.find(
                                (v) =>
                                  (v.ten_mau_sac ||
                                    v.ten_cac_bien_the
                                      ?.split(" / ")[0]
                                      ?.trim()) === color
                              )?.ten_kich_thuoc ||
                              product.bienthe
                                .find(
                                  (v) =>
                                    (v.ten_mau_sac ||
                                      v.ten_cac_bien_the
                                        ?.split(" / ")[0]
                                        ?.trim()) === color
                                )
                                ?.ten_cac_bien_the?.split(" / ")[1]
                                ?.trim() ||
                              "";
                            setSelectedSize(firstSize);
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${currentColor === color ? "border-[#518581] ring-2 ring-[#518581]" : "border-gray-300 hover:border-[#518581]"}`}
                          style={{ backgroundColor: variant?.hex_code }}
                          title={color}
                        ></button>
                      );
                    })}
                  </div>
                </div>
              )}
              {sizesForCurrentColor.length > 0 && (
                <div className="flex items-center space-x-4 mt-4">
                  <span className="text-sm font-medium text-gray-700">
                    Kích thước:
                  </span>
                  <div className="flex space-x-2">
                    {sizesForCurrentColor.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1 rounded border text-sm font-medium transition-all ${selectedSize === size ? "bg-[#518581] text-white border-[#518581]" : "bg-white text-gray-700 border-gray-300 hover:border-[#518581]"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${inStock ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <span
                  className={`text-sm font-medium ${inStock ? "text-green-700" : "text-red-700"}`}
                >
                  {inStock ? "Còn hàng" : "Hết hàng"}
                </span>
                {selectedVariant && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Kho: {selectedVariant.so_luong_ton})
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Số lượng:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${isAddedToCart ? "bg-green-600 text-white" : "bg-[#518581] text-white hover:bg-[#457470]"}`}
                  disabled={!inStock || !selectedSize}
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
                    className={`flex-1 border border-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 ${isFavorite ? "text-red-600 border-red-300 bg-red-50" : "text-gray-700"}`}
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
                  className={`px-6 py-4 font-medium transition-colors ${activeTab === tab.id ? "text-[#518581] border-b-2 border-[#518581]" : "text-gray-600 hover:text-gray-900"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-8">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.mo_ta_ngan}
                  </p>
                </div>
              )}
              {activeTab === "features" && (
                <div className="grid gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#518581] rounded-full"></div>
                    <span className="text-gray-700">
                      Thương hiệu: {product.thuong_hieu}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#518581] rounded-full"></div>
                    <span className="text-gray-700">
                      Chất liệu: {product.chat_lieu}
                    </span>
                  </div>
                </div>
              )}
              {activeTab === "specifications" && (
                <div className="grid gap-4">
                  <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-900">Ngày tạo:</span>
                    <span className="text-gray-700">
                      {new Date(product.ngay_tao).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-900">
                      Ngày cập nhật:
                    </span>
                    <span className="text-gray-700">
                      {new Date(product.ngay_cap_nhat).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-900">
                      Trạng thái:
                    </span>
                    <span className="text-gray-700">
                      {product.trang_thai_hoat_dong === "hoat_dong"
                        ? "Đang bán"
                        : "Ngừng bán"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChiTietSanPham;
