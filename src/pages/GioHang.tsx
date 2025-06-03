import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGioHang } from "../context/GioHangContext";
import { createMomoPayment } from "../API/api";
import { createVNPayPayment } from "../API/vnpay";
import { createZaloPayPayment } from "../API/zaloapi";

const GioHang: React.FC = () => {
  const navigate = useNavigate();
  const { items, xoaKhoiGio, capNhatSoLuong, xoaGioHang, tinhTongTien } =
    useGioHang();

  // State cho phương thức thanh toán
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState<string>("");
  const [, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string | null>(null);

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

  const handleXacNhanDatHang = async () => {
    if (items.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (!phuongThucThanhToan) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    // Xử lý theo phương thức thanh toán được chọn
    switch (phuongThucThanhToan) {
      case "cod":
        alert(
          "Đơn hàng của bạn đã được xác nhận! Bạn sẽ thanh toán khi nhận hàng."
        );
        break;
      case "vnpay":
        try {
          // Gọi API VNPay
          const response = await createVNPayPayment({
            amount: tinhTongTien() + 30000, // Tổng tiền + phí vận chuyển
            orderInfo: `Thanh toán đơn hàng từ ${items.length} sản phẩm`,
            orderType: "billpayment", // Có thể thay đổi tùy theo yêu cầu
            language: "vn",
          });

          if (response.code === "00" && response.data) {
            window.location.href = response.data; // Chuyển hướng đến URL thanh toán VNPay
          } else {
            setError("Không nhận được URL thanh toán từ VNPay");
          }
        } catch (error) {
          setError("Đã có lỗi xảy ra khi xử lý thanh toán VNPay");
          console.error("Lỗi thanh toán VNPay:", error);
        } finally {
          setLoading(false);
        }
        break;
      case "zalopay":
        try {
          const response = await createZaloPayPayment({
            amount: tinhTongTien() + 30000, // Tổng tiền + phí vận chuyển
            userId: "user123",
          });
          const { order_url } = response;
          if (order_url) {
            window.location.href = order_url; // Chuyển hướng đến URL thanh toán ZaloPay
          } else {
            setError("Không nhận được URL thanh toán từ ZaloPay");
          }
        } catch (error) {
          setError("Đã có lỗi xảy ra khi xử lý thanh toán ZaloPay");
          console.error("Lỗi thanh toán ZaloPay:", error);
        } finally {
          setLoading(false);
        }
        break;
        try {
          // Gọi API MoMo
          const response = await createMomoPayment({
            amount: (tinhTongTien() + 30000).toString(), // Tổng tiền (tạm tính + phí vận chuyển)
            orderInfo: `Thanh toán đơn hàng từ ${items.length} sản phẩm`,
            // redirectUrl: 'https://your-redirect-url', // Thêm nếu cần
            // ipnUrl: 'https://your-ipn-url', // Thêm nếu cần
          });

          const { payUrl } = response;
          if (payUrl) {
            window.location.href = payUrl; // Chuyển hướng đến URL thanh toán MoMo
          } else {
            setError("Không nhận được URL thanh toán từ MoMo");
          }
        } catch (error) {
          setError("Đã có lỗi xảy ra khi xử lý thanh toán MoMo");
          console.error("Lỗi thanh toán MoMo:", error);
        } finally {
          setLoading(false);
        }
        break;
      default:
        alert("Phương thức thanh toán không hợp lệ!");
        return;
    }

    // Sau khi xác nhận đặt hàng thành công, xóa giỏ hàng
    xoaGioHang();
    navigate("/dat-hang-thanh-cong");
  };

  const phuongThucThanhToanOptions = [
    { value: "cod", label: "COD (Thanh toán khi nhận hàng)", icon: "💵" },
    { value: "vnpay", label: "VNPay", icon: "🏦" },
    { value: "zalopay", label: "ZaloPay", icon: "⚡" },
    { value: "momo", label: "Momo", icon: "🟣" },
  ];

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
        <div className="flex flex-col md:flex-row gap-6">
          {/* Danh sách sản phẩm */}
          <div className="md:w-2/3">
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

          {/* Tổng tiền và thanh toán */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>

              <div className="flex justify-between py-2 border-b">
                <span>Tạm tính</span>
                <span>{dinhDangTien(tinhTongTien())}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span>Phí vận chuyển</span>
                <span>{dinhDangTien(30000)}</span>
              </div>

              <div className="flex justify-between py-2 font-semibold text-lg mt-2">
                <span>Tổng cộng</span>
                <span>{dinhDangTien(tinhTongTien() + 30000)}</span>
              </div>

              {/* Phương thức thanh toán */}
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-3">
                  Chọn phương thức thanh toán
                </h3>
                <div className="space-y-2">
                  {phuongThucThanhToanOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        phuongThucThanhToan === option.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="phuongThucThanhToan"
                        value={option.value}
                        checked={phuongThucThanhToan === option.value}
                        onChange={(e) => setPhuongThucThanhToan(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-lg mr-2">{option.icon}</span>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                className={`w-full font-bold py-3 px-4 rounded mt-6 transition-colors ${
                  phuongThucThanhToan
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                onClick={handleXacNhanDatHang}
                disabled={!phuongThucThanhToan}
              >
                {phuongThucThanhToan
                  ? `Thanh toán bằng ${phuongThucThanhToanOptions.find((opt) => opt.value === phuongThucThanhToan)?.label}`
                  : "Chọn phương thức thanh toán"}
              </button>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>🔒 Thông tin thanh toán được bảo mật an toàn</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GioHang;
