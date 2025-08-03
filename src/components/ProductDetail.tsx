import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productApi } from "../API/productApi";
import type { Product } from "../types/Product";

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (!productId) throw new Error("Không tìm thấy ID sản phẩm");
        const product: Product = await productApi.getProductById(
          Number(productId)
        );
        setProduct(product);
      } catch (err: any) {
        console.error("API Error:", err);
        setError(err.message || "Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
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

  // Hàm tiện ích để định dạng ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // Hàm định dạng giá
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header của trang */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {product.ten_san_pham}
            </h1>
            <p className="text-sm text-gray-500">
              ID Sản phẩm: {product.ma_san_pham}
            </p>
          </div>
          <Link
            to={`/admin/sanpham/sua/${product.ma_san_pham}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          >
            Chỉnh sửa sản phẩm
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Cột trái: Thông tin chung */}
            <div className="p-6 border-b lg:border-r lg:border-b-0 border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Thông tin chung
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Trạng thái:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.trang_thai_hoat_dong === "hoat_dong"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.trang_thai_hoat_dong === "hoat_dong"
                      ? "Đang bán"
                      : "Ngừng bán"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    Thương hiệu:
                  </span>
                  <span className="text-gray-800">{product.thuong_hieu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Chất liệu:</span>
                  <span className="text-gray-800">{product.chat_lieu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Ngày tạo:</span>
                  <span className="text-gray-800">
                    {formatDate(product.ngay_tao)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    Cập nhật lần cuối:
                  </span>
                  <span className="text-gray-800">
                    {formatDate(product.ngay_cap_nhat)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Danh mục:</span>
                  <span className="text-gray-800">
                    {product.ten_danh_muc || "Không có danh mục"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Khuyến mãi:</span>
                  <span className="text-gray-800">
                    {product.ma_khuyen_mai || "Không có khuyến mãi"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cột phải: Biến thể, hình ảnh và mô tả */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Các biến thể & Tồn kho
              </h2>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Biến thể
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Màu sắc
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Giá bán (VND)
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tồn kho
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Hình ảnh
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.bienthe?.length ? (
                      product.bienthe.map((variant, index) => (
                        <tr
                          key={`${variant.ten_mau_sac}-${variant.ten_kich_thuoc}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {variant.ten_mau_sac} - {variant.ten_kich_thuoc}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-full border border-gray-300"
                                style={{ backgroundColor: variant.hex_code }}
                              />
                              <span>{variant.hex_code}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatPrice(variant.gia_ban)}
                          </td>
                          <td
                            className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${
                              variant.so_luong_ton === 0
                                ? "text-red-600"
                                : variant.so_luong_ton < 10
                                  ? "text-orange-500"
                                  : "text-gray-900"
                            }`}
                          >
                            {variant.so_luong_ton}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {variant.hinh_anh?.length ? (
                              <div className="flex space-x-2">
                                {variant.hinh_anh.map((image, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={image}
                                    alt={`Hình ảnh biến thể ${variant.ten_mau_sac} ${variant.ten_kich_thuoc} ${imgIndex + 1}`}
                                    className="w-16 h-16 object-cover rounded-md"
                                    onError={(e) =>
                                      (e.currentTarget.src =
                                        "/fallback-image.jpg")
                                    }
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">
                                Không có hình
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-3 text-center text-sm text-gray-500"
                        >
                          Không có biến thể nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">
                Mô tả chi tiết
              </h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                {product.mo_ta_ngan ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: product.mo_ta_ngan }}
                  />
                ) : (
                  <p>Không có mô tả chi tiết.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
