import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGioHang } from "../context/GioHangContext";
import Cookies from "js-cookie";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Lock,
  User,
  CreditCard,
  Truck,
  Shield,
} from "lucide-react";

const GioHang: React.FC = () => {
  const navigate = useNavigate();
  const { items, xoaKhoiGio, capNhatSoLuong, xoaGioHang, tinhTongTien } =
    useGioHang();

  // State cho ghi chú đơn hàng và trạng thái đăng nhập
  const [ghiChu, setGhiChu] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // Kiểm tra trạng thái đăng nhập qua user_data cookie
  useEffect(() => {
    const userDataCookie = Cookies.get("user_data");
    const adminDataCookie = Cookies.get("admin_data");
    const localUserData = localStorage.getItem("user");

    // Ưu tiên cookie, nếu không có thì localStorage
    if (userDataCookie || adminDataCookie) {
      setIsLoggedIn(true);
      try {
        const userData = userDataCookie
          ? JSON.parse(userDataCookie)
          : adminDataCookie
            ? JSON.parse(adminDataCookie)
            : null;
        setUser(userData);
      } catch (e) {
        console.error("Lỗi parse user data từ cookie:", e);
        setIsLoggedIn(false);
        setUser(null);
      }
    } else if (localUserData) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(localUserData));
      } catch (e) {
        console.error("Lỗi parse user data từ localStorage:", e);
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

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

    // Kiểm tra đăng nhập qua user data cookie
    const userDataCookie = Cookies.get("user_data");
    const adminDataCookie = Cookies.get("admin_data");
    const localUserData = localStorage.getItem("user");
    const hasUserData = userDataCookie || adminDataCookie || localUserData;

    if (!hasUserData || !isLoggedIn) {
      alert("Vui lòng đăng nhập để tiến hành thanh toán!");
      navigate("/dangnhap");
      return;
    }

    // Lưu ghi chú vào localStorage
    if (ghiChu.trim()) {
      localStorage.setItem("ghiChuDonHang", ghiChu);
    }
    // Chuyển hướng đến trang thanh toán
    navigate("/thanh-toan");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ShoppingCart className="w-8 h-8 text-[#518581] mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Giỏ hàng của bạn
            </h1>
          </div>
          <p className="text-gray-600">
            {items.length > 0
              ? `Bạn có ${items.length} sản phẩm trong giỏ hàng`
              : "Giỏ hàng của bạn đang trống"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và thêm chúng
              vào giỏ hàng!
            </p>
            <button
              className="bg-gradient-to-r from-[#518581] to-[#3d6360] hover:from-[#3d6360] hover:to-[#518581] text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => navigate("/sanpham")}
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#518581] to-[#3d6360] p-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <ShoppingCart className="w-6 h-6 mr-2" />
                    Sản phẩm trong giỏ ({items.length})
                  </h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <div
                      key={item.sanPham.id}
                      className="p-6 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Hình ảnh sản phẩm */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                            <img
                              className="w-full h-full object-cover"
                              src={item.sanPham.hinhAnh}
                              alt={item.sanPham.ten}
                              onError={(e) => {
                                const imgElement = e.target as HTMLImageElement;
                                imgElement.src = "/image/hetcuu3.png";
                              }}
                            />
                          </div>
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.sanPham.ten}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.sanPham.loai}
                          </p>
                          {(item.sanPham.mauSac || item.sanPham.kichThuoc) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.sanPham.mauSac && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Màu: {item.sanPham.mauSac}
                                </span>
                              )}
                              {item.sanPham.kichThuoc && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Size: {item.sanPham.kichThuoc}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Giá và số lượng */}
                        <div className="text-right">
                          <div className="text-xl font-bold text-[#518581] mb-3">
                            {dinhDangTien(item.sanPham.gia)}
                          </div>

                          {/* Điều chỉnh số lượng */}
                          <div className="flex items-center justify-end space-x-2 mb-3">
                            <button
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                              onClick={() =>
                                handleCapNhatSoLuong(
                                  item.sanPham.id,
                                  item.soLuong - 1
                                )
                              }
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-12 text-center font-semibold bg-gray-50 py-1 px-2 rounded">
                              {item.soLuong}
                            </span>
                            <button
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                              onClick={() =>
                                handleCapNhatSoLuong(
                                  item.sanPham.id,
                                  item.soLuong + 1
                                )
                              }
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>

                          {/* Tổng tiền */}
                          <div className="text-lg font-bold text-gray-900 mb-3">
                            {dinhDangTien(item.sanPham.gia * item.soLuong)}
                          </div>

                          {/* Nút xóa */}
                          <button
                            className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => xoaKhoiGio(item.sanPham.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                    onClick={() => navigate("/sanpham")}
                  >
                    Tiếp tục mua sắm
                  </button>

                  <button
                    className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center"
                    onClick={xoaGioHang}
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Xóa toàn bộ giỏ hàng
                  </button>
                </div>
              </div>
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-4">
                <div className="bg-gradient-to-r from-[#518581] to-[#3d6360] p-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <CreditCard className="w-6 h-6 mr-2" />
                    Tóm tắt đơn hàng
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Tạm tính</span>
                    <span className="font-bold text-lg">
                      {dinhDangTien(tinhTongTien())}
                    </span>
                  </div>

                  <div className="flex justify-between py-3 border-b-2 border-gray-200">
                    <span className="text-xl font-bold">Tổng cộng</span>
                    <span className="text-2xl font-bold text-[#518581]">
                      {dinhDangTien(tinhTongTien())}
                    </span>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center text-blue-700">
                      <Truck className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">
                        Phí vận chuyển sẽ được tính khi thanh toán
                      </span>
                    </div>
                  </div>

                  {/* Ghi chú đơn hàng */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Ghi chú đơn hàng
                    </label>
                    <textarea
                      value={ghiChu}
                      onChange={(e) => setGhiChu(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#518581] focus:border-transparent resize-none"
                      placeholder="Thêm ghi chú cho đơn hàng (không bắt buộc)"
                    />
                  </div>

                  {/* Kiểm tra đăng nhập */}
                  {(() => {
                    const userDataCookie = Cookies.get("user_data");
                    const adminDataCookie = Cookies.get("admin_data");
                    const hasUserData =
                      userDataCookie ||
                      adminDataCookie ||
                      localStorage.getItem("user");

                    console.log("🛒 GioHang login check:");
                    console.log("- user_data cookie:", userDataCookie);
                    console.log("- admin_data cookie:", adminDataCookie);
                    console.log(
                      "- localStorage user:",
                      localStorage.getItem("user")
                    );
                    console.log("- isLoggedIn:", isLoggedIn);

                    if (!hasUserData) {
                      return (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-center text-amber-700 mb-2">
                            <User className="w-5 h-5 mr-2" />
                            <span className="font-medium">Cần đăng nhập</span>
                          </div>
                          <p className="text-sm text-amber-600 mb-3">
                            Bạn cần đăng nhập để tiến hành thanh toán
                          </p>
                          <button
                            onClick={() => navigate("/dangnhap")}
                            className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                          >
                            Đăng nhập ngay
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <button
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center ${
                      isLoggedIn
                        ? "bg-gradient-to-r from-[#518581] to-[#3d6360] hover:from-[#3d6360] hover:to-[#518581] text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={handleCheckout}
                    disabled={!isLoggedIn}
                  >
                    {isLoggedIn ? (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Tiến hành thanh toán
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 mr-2" />
                        Vui lòng đăng nhập
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>Thông tin thanh toán được bảo mật an toàn</span>
                    </div>
                  </div>

                  {/* Chính sách */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-sm mb-3 text-gray-800">
                      Chính sách mua hàng
                    </h3>
                    <ul className="text-xs text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Miễn phí đổi trả trong 7 ngày
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Giao hàng nhanh 2-3 ngày
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Hỗ trợ khách hàng 24/7
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GioHang;
