import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getOrderDetail } from "../API/orderApi";

const TrangHoaDon: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(location.state?.order || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const apptransid = queryParams.get("apptransid"); // MoMo
  const app_trans_id = queryParams.get("app_trans_id"); // ZaloPay
  const orderId = queryParams.get("orderId"); // VNPay hoặc COD
  const paymentMethod = queryParams.get("paymentMethod");
  const status = queryParams.get("status");

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
                return;
              }
            }
          } catch (parseErr) {
            console.error("Error parsing stored order:", parseErr);
          }

          setError("Không thể tải thông tin đơn hàng từ server");
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
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {error || "Không tìm thấy thông tin hóa đơn"}
          </h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate("/")}
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4 text-center text-green-600">
          {paymentMethod
            ? "Thanh toán thành công!"
            : order.hinh_thuc_thanh_toan === "COD"
              ? "Đặt hàng thành công!"
              : "Đơn hàng đã được xác nhận!"}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Cảm ơn bạn đã mua hàng. Dưới đây là thông tin hóa đơn của bạn:
        </p>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Mã đơn hàng:</span>
            <span>{order.ma_don_hang || order.id || "-"}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Người nhận:</span>
            <span>{order.ten_nguoi_nhan}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Số điện thoại:</span>
            <span>{order.so_dien_thoai}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Địa chỉ giao:</span>
            <span>{order.dia_chi_giao}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Hình thức thanh toán:</span>
            <span>
              {paymentMethod === "vnpay"
                ? "VNPay"
                : paymentMethod === "momo"
                  ? "MoMo"
                  : order.hinh_thuc_thanh_toan || "Chưa xác định"}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Trạng thái:</span>
            <span className="text-green-600 font-semibold">
              {paymentMethod ? "Đã thanh toán" : "Đặt hàng thành công"}
            </span>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Sản phẩm:</h2>
          <div className="divide-y">
            {order.chi_tiet?.map((sp: any, idx: number) => (
              <div key={idx} className="py-2 flex justify-between">
                <div className="flex-1">
                  <span className="font-medium">{sp.ten_san_pham}</span>
                  {(sp.mau_sac || sp.kich_thuoc) && (
                    <div className="text-sm text-gray-500 mt-1">
                      {sp.mau_sac && (
                        <span className="mr-2">Màu: {sp.mau_sac}</span>
                      )}
                      {sp.kich_thuoc && <span>Size: {sp.kich_thuoc}</span>}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    Số lượng: {sp.so_luong}
                  </div>
                </div>
                <span className="font-medium">
                  {sp.gia_sau_km?.toLocaleString()}₫
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>{order.tong_tien?.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển:</span>
            <span>{order.phi_van_chuyen?.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Tổng thanh toán:</span>
            <span className="text-blue-600">
              {order.tong_thanh_toan?.toLocaleString()}₫
            </span>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              localStorage.removeItem("orderData"); // Xóa sau khi hiển thị
              navigate("/");
            }}
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrangHoaDon;
