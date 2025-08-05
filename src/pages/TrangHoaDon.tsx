import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getOrderDetail } from "../API/orderApi";
import type { DonHang, ChiTietDonHang } from "../API/orderApi";

interface GHNShippingInfo {
  order_code: string;
  total_fee: number;
  expected_delivery_time: string;
  sort_code: string;
  orderId: string | number;
}

const TrangHoaDon: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<DonHang | null>(
    location.state?.order || null
  );

  // Debug initial state
  console.log("🔍 TrangHoaDon initialized with:", {
    "location.state": location.state,
    "initial order": location.state?.order,
    "order properties": location.state?.order
      ? Object.keys(location.state.order)
      : "no order",
  });

  const [orderDetails, setOrderDetails] = useState<ChiTietDonHang[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ghnShippingInfo, setGhnShippingInfo] =
    useState<GHNShippingInfo | null>(null);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const app_trans_id = queryParams.get("app_trans_id"); // ZaloPay specific parameter
  const orderId = queryParams.get("orderId"); // General order ID for VNPay, COD, etc.
  const paymentMethod = queryParams.get("paymentMethod");
  const status = queryParams.get("status");

  // Helper functions
  const formatCurrency = (amount: string | number): string => {
    let numAmount: number;

    if (typeof amount === "string") {
      // Xóa tất cả ký tự không phải số và dấu thập phân
      const cleanString = amount.replace(/[^0-9.-]/g, "");
      numAmount = parseFloat(cleanString);
    } else {
      numAmount = amount;
    }

    // Kiểm tra nếu không phải số hợp lệ
    if (isNaN(numAmount)) {
      console.warn("formatCurrency: Invalid amount:", amount);
      return "0 ₫";
    }

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numAmount);
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
    console.log("🔍 TrangHoaDon - Query params:", {
      app_trans_id,
      orderId,
      paymentMethod,
      status,
    });

    // Load GHN shipping info từ localStorage
    try {
      const storedGHNInfo = localStorage.getItem("ghnShippingInfo");
      if (storedGHNInfo) {
        const parsedInfo = JSON.parse(storedGHNInfo) as GHNShippingInfo;
        setGhnShippingInfo(parsedInfo);
        console.log("📦 Thông tin vận chuyển GHN:", parsedInfo);
      }
    } catch (err) {
      console.error("Lỗi parse GHN shipping info:", err);
    }

    // Luôn gọi API để đảm bảo có dữ liệu đầy đủ, bất kể có order từ state hay không
    // Chỉ bỏ qua nếu đã có đầy đủ cả order và orderDetails
    const hasCompleteData =
      order &&
      orderDetails &&
      orderDetails.length > 0 &&
      order.ten_nguoi_nhan &&
      order.dia_chi_giao &&
      order.tong_tien &&
      order.tong_thanh_toan;

    if (hasCompleteData) {
      console.log("✅ Đã có dữ liệu đầy đủ, bỏ qua API call:", {
        order,
        orderDetails,
      });
      return;
    }

    // Xác định ID đơn hàng từ các nguồn khác nhau
    let targetOrderId;

    if (paymentMethod?.toLowerCase() === "momo" && orderId) {
      // Với ZaloPay, lấy phần sau dấu _ từ orderId (format: 250805_199)
      const parts = orderId.split("_");
      targetOrderId = parts.length > 1 ? parts[1] : orderId;
      console.log(
        "🎯 ZaloPay - Extracted Order ID:",
        targetOrderId,
        "from original:",
        orderId
      );
    } else {
      // Với các phương thức khác, sử dụng logic cũ
      targetOrderId = orderId || app_trans_id || order?.ma_don_hang?.toString();
    }

    console.log(
      "🎯 Final Target Order ID:",
      targetOrderId,
      "từ orderId:",
      orderId,
      "hoặc app_trans_id:",
      app_trans_id,
      "hoặc order.ma_don_hang:",
      order?.ma_don_hang,
      "paymentMethod:",
      paymentMethod
    );

    if (targetOrderId) {
      setLoading(true);
      setError(null);

      console.log(
        `🚀 Attempting to fetch order detail for ID: ${targetOrderId}`
      );
      console.log(
        `📡 API URL: http://127.0.0.1:8000/api/donhang/chitietdonhang/${targetOrderId}`
      );

      // Gọi API để lấy chi tiết đơn hàng
      getOrderDetail(targetOrderId)
        .then((response) => {
          console.log("✅ Order detail from API:", response);
          console.log(
            "✅ Response structure:",
            JSON.stringify(response, null, 2)
          );

          if (response && response.don_hang) {
            // LUÔN cập nhật order từ API để đảm bảo dữ liệu đầy đủ
            console.log(
              "✅ Cập nhật order state với dữ liệu API:",
              response.don_hang
            );
            console.log(
              "✅ Order properties từ API:",
              Object.keys(response.don_hang)
            );
            setOrder(response.don_hang);

            // Luôn set orderDetails từ API vì có thể thiếu từ state
            console.log("✅ Đặt orderDetails với:", response.chi_tiet || []);
            setOrderDetails(response.chi_tiet || []);
          } else {
            console.error("❌ Response không có don_hang:", response);
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
                parsedOrder.ma_don_hang === parseInt(targetOrderId) ||
                parsedOrder.id === parseInt(targetOrderId) ||
                parsedOrder.ma_don_hang === targetOrderId ||
                parsedOrder.id === targetOrderId
              ) {
                console.log(
                  "✅ Tìm thấy order trong localStorage:",
                  parsedOrder
                );
                if (!order) {
                  setOrder(parsedOrder);
                }
                // Nếu có chi tiết sản phẩm trong localStorage
                if (parsedOrder.chi_tiet && parsedOrder.chi_tiet.length > 0) {
                  setOrderDetails(parsedOrder.chi_tiet);
                }
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
      console.log("❌ Giao dịch không thành công - status:", status);
      setError("Giao dịch không thành công");
      setLoading(false);
    } else {
      console.log("ℹ️ Không có targetOrderId và status valid:", {
        targetOrderId,
        status,
      });
    }
  }, [order, app_trans_id, orderId, paymentMethod, status]);
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

  if (error || (!order && !loading && !orderId)) {
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

  if (!order && !error) {
    console.log("⏳ Chưa có order và không có lỗi, hiển thị loading...");
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

  if (!order) {
    console.log("❌ Không có order để render, trạng thái hiện tại:", {
      order,
      orderDetails,
      loading,
      error,
    });
    return null;
  }

  console.log("✅ Sẵn sàng render với dữ liệu:", { order, orderDetails });
  console.log("🔍 Order details:", {
    ten_nguoi_nhan: order.ten_nguoi_nhan,
    dia_chi_giao: order.dia_chi_giao,
    tong_tien: order.tong_tien,
    phi_van_chuyen: order.phi_van_chuyen,
    tong_thanh_toan: order.tong_thanh_toan,
  });

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
                  #{order.ma_don_hang}
                </span>
              </div>
              {order.Ngay_Tao && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Ngày đặt:</span>
                  <span className="text-gray-800">
                    {formatDate(order.Ngay_Tao)}
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
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Trạng thái thanh toán:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.da_thanh_toan === 1
                      ? "text-green-700 bg-green-100"
                      : "text-yellow-700 bg-yellow-100"
                  }`}
                >
                  {order.da_thanh_toan === 1
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </span>
              </div>
              {order.ngay_thanh_toan && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    Ngày thanh toán:
                  </span>
                  <span className="text-gray-800">
                    {formatDate(order.ngay_thanh_toan)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3">
              🚚 Thông tin giao hàng
            </h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Người nhận:</span>
                <span className="text-gray-800">
                  {order.ten_nguoi_nhan || "Không có thông tin"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Số điện thoại:
                </span>
                <span className="text-gray-800">
                  {order.so_dien_thoai || "Không có thông tin"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-600 mb-2">
                  Địa chỉ giao hàng:
                </span>
                <span className="text-gray-800 bg-white p-2 rounded border">
                  {order.dia_chi_giao || "Không có thông tin"}
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

              {/* Thông tin vận chuyển GHN */}
              {ghnShippingInfo && (
                <>
                  <div className="border-t pt-3 mt-3">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      📦 Thông tin vận chuyển GHN
                    </h4>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Mã vận đơn:
                    </span>
                    <span className="text-blue-600 font-mono text-sm font-bold">
                      {ghnShippingInfo.order_code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Mã sắp xếp:
                    </span>
                    <span className="text-gray-800 font-mono text-sm">
                      {ghnShippingInfo.sort_code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Phí vận chuyển GHN:
                    </span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(ghnShippingInfo.total_fee)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-600 mb-1">
                      Thời gian dự kiến giao:
                    </span>
                    <span className="text-orange-600 font-medium bg-orange-50 p-2 rounded border">
                      {new Date(
                        ghnShippingInfo.expected_delivery_time
                      ).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 flex items-center">
                      <span className="mr-2">ℹ️</span>
                      <span>
                        Đơn hàng đã được đăng ký với GHN. Bạn có thể theo dõi
                        tiến trình giao hàng qua mã vận đơn.
                      </span>
                    </p>
                  </div>
                </>
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
                  {orderDetails?.map((sp, idx) => (
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
                {formatCurrency(order.tong_tien || 0)}
              </span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Phí vận chuyển:</span>
              <span className="font-medium">
                {formatCurrency(order.phi_van_chuyen || 0)}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Tổng thanh toán:</span>
                <span className="text-green-600">
                  {formatCurrency(order.tong_thanh_toan || 0)}
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
