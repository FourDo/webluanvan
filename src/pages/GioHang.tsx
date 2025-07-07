import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGioHang } from "../context/GioHangContext";

const GioHang: React.FC = () => {
  const navigate = useNavigate();
  const { items, xoaKhoiGio, capNhatSoLuong, xoaGioHang, tinhTongTien } =
    useGioHang();

  // State cho ghi chú đơn hàng
  const [ghiChu, setGhiChu] = useState<string>("");

  const dinhDangTien = (gia: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(gia);
  };

  const handleCapNhatSoLuong = (sanPhamId: number, soLuong: number) => {
    if (soLuong > 0) {
      capNhatSoLuong(sanPhamId, soLuong);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    // Lưu ghi chú vào localStorage hoặc context
    if (ghiChu.trim()) {
      localStorage.setItem("ghiChuDonHang", ghiChu);
    }
    // Chuyển hướng đến trang thanh toán
    navigate("/thanh-toan");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-gray-600 mb-6">
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate("/")}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Danh sách sản phẩm */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thành tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.sanPham.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={item.sanPham.hinhAnh}
                              alt={item.sanPham.ten}
                              onError={(e) => {
                                const imgElement = e.target as HTMLImageElement;
                                imgElement.src =
                                  "/api/placeholder/40/40?text=" +
                                  encodeURIComponent(item.sanPham.ten);
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.sanPham.ten}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.sanPham.loai}
                            </div>
                            {(item.sanPham.mauSac || item.sanPham.kichThuoc) && (
                              <div className="text-xs text-gray-400 mt-1">
                                {item.sanPham.mauSac && (
                                  <span className="mr-2">
                                    Màu: {item.sanPham.mauSac}
                                  </span>
                                )}
                                {item.sanPham.kichThuoc && (
                                  <span>Size: {item.sanPham.kichThuoc}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dinhDangTien(item.sanPham.gia)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center border rounded w-24">
                          <button
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                            onClick={() =>
                              handleCapNhatSoLuong(
                                item.sanPham.id,
                                item.soLuong - 1
                              )
                            }
                          >
                            -
                          </button>
                          <span className="px-2 py-1 w-8 text-center">
                            {item.soLuong}
                          </span>
                          <button
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                            onClick={() =>
                              handleCapNhatSoLuong(
                                item.sanPham.id,
                                item.soLuong + 1
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dinhDangTien(item.sanPham.gia * item.soLuong)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => xoaKhoiGio(item.sanPham.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded"
                onClick={() => navigate("/")}
              >
                Tiếp tục mua sắm
              </button>

              <button
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                onClick={xoaGioHang}
              >
                Xóa giỏ hàng
              </button>
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">
                    {dinhDangTien(tinhTongTien())}
                  </span>
                </div>

                <div className="flex justify-between py-3 font-semibold text-lg border-t-2">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">
                    {dinhDangTien(tinhTongTien())}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  * Phí vận chuyển sẽ được tính khi thanh toán
                </p>
              </div>

              {/* Ghi chú đơn hàng */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Thêm ghi chú cho đơn hàng (không bắt buộc)"
                />
              </div>

              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-6 transition-colors duration-200"
                onClick={handleCheckout}
              >
                Tiến hành thanh toán
              </button>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>🔒 Thông tin thanh toán được bảo mật an toàn</p>
              </div>

              {/* Thông tin bổ sung */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-sm mb-2">
                  Chính sách mua hàng
                </h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Miễn phí đổi trả trong 7 ngày</li>
                  <li>• Giao hàng nhanh 2-3 ngày</li>
                  <li>• Hỗ trợ khách hàng 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GioHang;
