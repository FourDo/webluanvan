import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getOrderDetail } from "../API/orderApi";
import type { DonHang } from "../API/orderApi";

const TrangHoaDon: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<DonHang | null>(
    location.state?.order || null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const apptransid = queryParams.get("apptransid"); // MoMo
  const app_trans_id = queryParams.get("app_trans_id"); // ZaloPay
  const orderId = queryParams.get("orderId"); // VNPay hoặc COD
  const paymentMethod = queryParams.get("paymentMethod");
  const status = queryParams.get("status");

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodDisplay = (method: string): string => {
    switch (method?.toLowerCase()) {
      case "vnpay":
        return "VNPay";
      case "zalopay":
        return "ZaloPay";
      case "momo":
        return "MoMo";
      case "cod":
        return "COD (Thanh toán khi nhận hàng)";
      default:
        return method || "Chưa xác định";
    }
  };

  const getStatusDisplay = (
    status: string
  ): { text: string; color: string } => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { text: "Chờ xử lý", color: "text-yellow-600 bg-yellow-100" };
      case "confirmed":
        return { text: "Đã xác nhận", color: "text-blue-600 bg-blue-100" };
      case "shipping":
        return {
          text: "Đang giao hàng",
          color: "text-orange-600 bg-orange-100",
        };
      case "delivered":
        return { text: "Đã giao hàng", color: "text-green-600 bg-green-100" };
      case "cancelled":
        return { text: "Đã hủy", color: "text-red-600 bg-red-100" };
      default:
        return { text: "Đã đặt hàng", color: "text-green-600 bg-green-100" };
    }
  };

  useEffect(() => {
    console.log("Query params:", {
      apptransid,
      app_trans_id,
      orderId,
      paymentMethod,
      status,
    });

    // Nếu đã có thông tin đơn hàng từ state, không cần load lại
    if (order) {
      return;
    }

    // Xác định ID đơn hàng từ các nguồn khác nhau
    const targetOrderId = orderId || apptransid || app_trans_id;

    if (targetOrderId) {
      setLoading(true);
      setError(null);

      console.log(`Attempting to fetch order detail for ID: ${targetOrderId}`);
      console.log(
        `API URL: http://127.0.0.1:8000/api/donhang/chitietdonhang/${targetOrderId}`
      );

      // Gọi API để lấy chi tiết đơn hàng
      getOrderDetail(targetOrderId)
        .then((data) => {
          console.log("Order detail from API:", data);
          if (data && data.data) {
            setOrder(data.data);
          } else {
            setError("Không tìm thấy thông tin đơn hàng");
          }
        })
        .catch((err) => {
          console.error("API error:", err);

          // Hiển thị thông tin lỗi chi tiết hơn
          if (err.response) {
            const status = err.response.status;
            const message = err.response.data?.message || "Lỗi không xác định";
            console.error(`API Error ${status}:`, message);

            if (status === 404) {
              setError(`Không tìm thấy đơn hàng với ID: ${targetOrderId}`);
            } else if (status === 500) {
              setError("Lỗi server, vui lòng thử lại sau");
            } else {
              setError(`Lỗi ${status}: ${message}`);
            }
          } else if (err.request) {
            setError(
              "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
            );
          } else {
            setError("Có lỗi xảy ra khi tải thông tin đơn hàng");
          }

          // Fallback: thử tìm trong localStorage
          try {
            const storedOrder = localStorage.getItem("orderData");
            if (storedOrder) {
              const parsedOrder = JSON.parse(storedOrder);
              if (
                parsedOrder.ma_don_hang === targetOrderId ||
                parsedOrder.id === targetOrderId
              ) {
                setOrder(parsedOrder);
                setError(null); // Clear error nếu tìm thấy trong localStorage
                return;
              }
            }
          } catch (parseErr) {
            console.error("Error parsing stored order:", parseErr);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (status && status !== "1") {
      setError("Giao dịch không thành công");
      setLoading(false);
    }
  }, [order, apptransid, app_trans_id, orderId, paymentMethod, status]);
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Đang tải thông tin hóa đơn...
          </h2>
        </div>
      </div>
    );
  }

  if (error || (!order && status !== "1" && !orderId)) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            {error || "Không tìm thấy thông tin hóa đơn"}
          </h2>
          {orderId && (
            <p className="text-sm text-gray-600 mb-4">Mã đơn hàng: {orderId}</p>
          )}
          <div className="space-x-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => navigate("/")}
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl pt-20">
      <div className="bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold mb-2 text-green-600">
            {paymentMethod
              ? "💳 Thanh toán thành công!"
              : order.hinh_thuc_thanh_toan === "COD"
                ? "📦 Đặt hàng thành công!"
                : "✅ Đơn hàng đã được xác nhận!"}
          </h1>
          <p className="text-gray-600">
            Cảm ơn bạn đã mua hàng. Dưới đây là thông tin chi tiết hóa đơn:
          </p>
        </div>

        {/* Order Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
              📋 Thông tin đơn hàng
            </h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Mã đơn hàng:</span>
                <span className="font-bold text-blue-600">
                  #{order.ma_don_hang || order.id}
                </span>
              </div>
              {order.ngay_tao && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Ngày đặt:</span>
                  <span className="text-gray-800">
                    {formatDate(order.ngay_tao)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Phương thức thanh toán:
                </span>
                <span className="text-gray-800">
                  {getPaymentMethodDisplay(
                    paymentMethod || order.hinh_thuc_thanh_toan
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Trạng thái:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusDisplay(order.trang_thai || (paymentMethod ? "confirmed" : "pending")).color}`}
                >
                  {
                    getStatusDisplay(
                      order.trang_thai ||
                        (paymentMethod ? "confirmed" : "pending")
                    ).text
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3">
              🚚 Thông tin giao hàng
            </h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Người nhận:</span>
                <span className="text-gray-800">{order.ten_nguoi_nhan}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Số điện thoại:
                </span>
                <span className="text-gray-800">{order.so_dien_thoai}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-600 mb-2">
                  Địa chỉ giao hàng:
                </span>
                <span className="text-gray-800 bg-white p-2 rounded border">
                  {order.dia_chi_giao}
                </span>
              </div>
              {order.ghi_chu && (
                <div className="flex flex-col">
                  <span className="font-medium text-gray-600 mb-2">
                    Ghi chú:
                  </span>
                  <span className="text-gray-800 bg-white p-2 rounded border italic">
                    {order.ghi_chu}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-purple-500 pl-3 mb-4">
            🛍️ Chi tiết sản phẩm
          </h3>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.chi_tiet?.map((sp, idx) => (
                    <tr key={idx} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {sp.ten_san_pham}
                          </div>
                          {(sp.mau_sac || sp.kich_thuoc) && (
                            <div className="text-sm text-gray-500 mt-1">
                              {sp.mau_sac && (
                                <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                  Màu: {sp.mau_sac}
                                </span>
                              )}
                              {sp.kich_thuoc && (
                                <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                                  Size: {sp.kich_thuoc}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          {sp.so_luong}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-gray-900">
                        {formatCurrency(sp.gia_goc)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(sp.gia_sau_km * sp.so_luong)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-orange-500 pl-3">
            💰 Tổng kết thanh toán
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Tạm tính:</span>
              <span className="font-medium">
                {formatCurrency(order.tong_tien)}
              </span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Phí vận chuyển:</span>
              <span className="font-medium">
                {formatCurrency(order.phi_van_chuyen)}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Tổng thanh toán:</span>
                <span className="text-green-600">
                  {formatCurrency(order.tong_thanh_toan)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">
              ✅ Đơn hàng của bạn đã được ghi nhận thành công!
            </p>
            <p className="text-green-700 text-sm mt-1">
              Chúng tôi sẽ liên hệ với bạn để xác nhận và giao hàng trong thời
              gian sớm nhất.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              onClick={() => {
                localStorage.removeItem("orderData");
                localStorage.removeItem("pendingOrder");
                navigate("/");
              }}
            >
              <span className="mr-2">🏠</span>
              Quay về trang chủ
            </button>

            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              onClick={() => navigate("/sanpham")}
            >
              <span className="mr-2">🛍️</span>
              Tiếp tục mua sắm
            </button>

            <button
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              onClick={() => window.print()}
            >
              <span className="mr-2">🖨️</span>
              In hóa đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrangHoaDon;
