import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Eye,
  CreditCard,
  User,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  Users,
  ArrowLeft,
  ShoppingBag,
  FileCheck,
} from "lucide-react";
import orderApi, {
  type DonHang,
  type OrderDetailResponse,
  updateOrderStatusQL,
} from "../API/orderApi";
import accountApi from "../API/accountApi";
import apiClient from "../ultis/apiClient";
import type { Account } from "../types/Account";

const ITEMS_PER_PAGE = 10;

// Hàm ánh xạ trạng thái với màu sắc và icon
const getStatusInfo = (status: string) => {
  switch (status) {
    case "Chờ xử lý":
    case "cho_xu_ly":
    case "Chờ Xác Nhận":
      return {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="w-4 h-4" />,
        text: "Chờ xử lý",
      };
    case "Đang giao":
    case "dang_giao":
    case "Đang Giao":
      return {
        color: "bg-blue-100 text-blue-800",
        icon: <Truck className="w-4 h-4" />,
        text: "Đang giao",
      };
    case "Hoàn thành":
    case "hoan_thanh":
    case "Hoàn Thành":
      return {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Hoàn thành",
      };
    case "Đã hủy":
    case "da_huy":
    case "Đã Hủy":
      return {
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-4 h-4" />,
        text: "Đã hủy",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800",
        icon: <AlertCircle className="w-4 h-4" />,
        text: status,
      };
  }
};

// Component modal chi tiết đơn hàng
const OrderDetailModal = ({
  orderId,
  onClose,
}: {
  orderId: number;
  onClose: () => void;
}) => {
  const [orderDetail, setOrderDetail] = useState<OrderDetailResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setIsLoading(true);
        const response = await orderApi.getOrderDetail(orderId);
        setOrderDetail(response);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!orderDetail) return;

    try {
      setIsUpdating(true);
      await updateOrderStatusQL(orderDetail.don_hang.ma_don_hang, newStatus);

      // Cập nhật trạng thái local
      setOrderDetail((prev) =>
        prev
          ? {
              ...prev,
              don_hang: { ...prev.don_hang, trang_thai: newStatus },
            }
          : null
      );

      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Lỗi cập nhật trạng thái!");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!orderDetail) return;

    if (confirm("Bạn có chắc chắn muốn hoàn trả tiền cho đơn hàng này?")) {
      try {
        setIsUpdating(true);
        await orderApi.refundVNPay(orderDetail.don_hang.ma_don_hang);
        alert("Hoàn trả tiền thành công!");
      } catch (error) {
        console.error("Lỗi hoàn trả tiền:", error);
        alert("Lỗi hoàn trả tiền!");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Chi tiết đơn hàng
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">
                Đang tải chi tiết đơn hàng...
              </p>
            </div>
          ) : orderDetail ? (
            <div className="space-y-6">
              {/* Thông tin đơn hàng */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-3">
                  Thông tin đơn hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng</p>
                    <p className="font-medium">
                      #{orderDetail.don_hang.ma_don_hang}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tên người nhận</p>
                    <p className="font-medium">
                      {orderDetail.don_hang.ten_nguoi_nhan}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium">
                      {orderDetail.don_hang.so_dien_thoai}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                    <p className="font-medium">
                      {orderDetail.don_hang.dia_chi_giao}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Phương thức thanh toán
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">
                        {orderDetail.don_hang.hinh_thuc_thanh_toan}
                      </p>
                      {/* Badge hiển thị loại thanh toán */}
                      {(orderDetail.don_hang.hinh_thuc_thanh_toan === "VNPay" ||
                        orderDetail.don_hang.hinh_thuc_thanh_toan ===
                          "vnpay") && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          💳 Online
                        </span>
                      )}
                      {(orderDetail.don_hang.hinh_thuc_thanh_toan ===
                        "ZaloPay" ||
                        orderDetail.don_hang.hinh_thuc_thanh_toan ===
                          "zalopay") && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          📱 E-Wallet
                        </span>
                      )}
                      {(orderDetail.don_hang.hinh_thuc_thanh_toan === "COD" ||
                        orderDetail.don_hang.hinh_thuc_thanh_toan ===
                          "cod") && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          💵 Tiền mặt
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <div className="flex items-center space-x-2">
                      {getStatusInfo(orderDetail.don_hang.trang_thai).icon}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(orderDetail.don_hang.trang_thai).color}`}
                      >
                        {getStatusInfo(orderDetail.don_hang.trang_thai).text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chi tiết sản phẩm */}
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-3">
                  Chi tiết sản phẩm
                </h3>
                <div className="space-y-3">
                  {orderDetail.chi_tiet.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.ten_san_pham}</p>
                        <p className="text-sm text-gray-500">
                          Màu: {item.mau_sac} | Size: {item.kich_thuoc}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {item.so_luong} x{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.gia_sau_km)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tổng:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.gia_sau_km * item.so_luong)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng kết */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tổng tiền hàng:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Number(orderDetail.don_hang.tong_tien))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Number(orderDetail.don_hang.phi_van_chuyen))}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Tổng thanh toán:</span>
                    <span className="text-blue-600">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Number(orderDetail.don_hang.tong_thanh_toan))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cập nhật trạng thái:
                  </label>
                  <select
                    value={orderDetail.don_hang.trang_thai}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={isUpdating}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Chờ Xác Nhận">Chờ xử lý</option>
                    <option value="Đang Giao">Đang giao</option>
                    <option value="Hoàn Thành">Hoàn thành</option>
                    <option value="Đã Hủy">Đã hủy</option>
                  </select>
                </div>

                {/* Nút hoàn tiền theo phương thức thanh toán */}
                {orderDetail.don_hang.hinh_thuc_thanh_toan === "VNPay" && (
                  <button
                    onClick={handleRefund}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <CreditCard size={16} />
                    <span>Hoàn tiền VNPay</span>
                  </button>
                )}

                {orderDetail.don_hang.hinh_thuc_thanh_toan === "vnpay" && (
                  <button
                    onClick={handleRefund}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <CreditCard size={16} />
                    <span>Hoàn tiền VNPay</span>
                  </button>
                )}

                {(orderDetail.don_hang.hinh_thuc_thanh_toan === "ZaloPay" ||
                  orderDetail.don_hang.hinh_thuc_thanh_toan === "zalopay") && (
                  <button
                    onClick={() =>
                      alert("Chức năng hoàn tiền ZaloPay đang được phát triển")
                    }
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <CreditCard size={16} />
                    <span>Hoàn tiền ZaloPay</span>
                  </button>
                )}

                {(orderDetail.don_hang.hinh_thuc_thanh_toan === "COD" ||
                  orderDetail.don_hang.hinh_thuc_thanh_toan === "cod") &&
                  orderDetail.don_hang.trang_thai === "hoan_thanh" && (
                    <button
                      onClick={() =>
                        alert(
                          "Đơn hàng COD đã hoàn thành. Liên hệ khách hàng để hoàn trả trực tiếp."
                        )
                      }
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <CreditCard size={16} />
                      <span>Hướng dẫn hoàn tiền COD</span>
                    </button>
                  )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Không thể tải chi tiết đơn hàng</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component chính
const QLDonHang = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [pendingOrders, setPendingOrders] = useState<DonHang[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingPendingOrders, setIsLoadingPendingOrders] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [view, setView] = useState<"users" | "orders" | "pending-orders">(
    "users"
  ); // Trạng thái để điều khiển view hiện tại

  // Load danh sách người dùng khi component mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Đang tải danh sách người dùng...");
      const response = await accountApi.fetchAccounts();

      console.log("📋 Response từ API fetchAccounts:", response);

      // Kiểm tra cấu trúc response
      if (Array.isArray(response)) {
        // Trường hợp API trả về trực tiếp array (backward compatibility)
        setAccounts(response);
        console.log(`✅ Đã tải ${response.length} người dùng`);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Trường hợp API trả về {message, data: [...]}
        setAccounts(response.data);
        console.log(`✅ Đã tải ${response.data.length} người dùng`);
      } else {
        console.warn("⚠️ API trả về dữ liệu không đúng định dạng:", response);
        setAccounts([]);
      }
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách người dùng:", error);
      setAccounts([]); // Đảm bảo luôn set về mảng rỗng khi có lỗi
      alert("Lỗi khi tải danh sách người dùng!");
    } finally {
      setIsLoading(false);
    }
  };

  // Load đơn hàng theo user ID
  const loadOrdersByUserId = async (userId: number, user: Account) => {
    try {
      setIsLoadingOrders(true);
      setSelectedUser(user);
      setView("orders");
      console.log(`🔍 Đang tải đơn hàng của user ID: ${userId}...`);
      const response = await orderApi.getOrdersByUserId(userId);

      console.log("📋 Response từ API getOrdersByUserId:", response);

      // Kiểm tra và set orders với nhiều format khác nhau
      if (response && Array.isArray(response.don_hang)) {
        // Format: {don_hang: [...], message: "..."}
        setOrders(response.don_hang);
        console.log(`✅ Đã tải ${response.don_hang.length} đơn hàng`);
      } else if (response && Array.isArray(response.data)) {
        // Format: {data: [...], message: "..."}
        setOrders(response.data);
        console.log(`✅ Đã tải ${response.data.length} đơn hàng`);
      } else if (Array.isArray(response)) {
        // Format: trực tiếp array
        setOrders(response);
        console.log(`✅ Đã tải ${response.length} đơn hàng`);
      } else {
        console.warn("⚠️ API trả về dữ liệu đơn hàng không hợp lệ:", response);
        setOrders([]);
      }
      setCurrentPage(1);
    } catch (error) {
      console.error("❌ Lỗi khi tải đơn hàng:", error);
      setOrders([]); // Đảm bảo luôn set về mảng rỗng khi có lỗi
      alert("Lỗi khi tải danh sách đơn hàng!");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Load đơn hàng chờ xác nhận
  const loadPendingOrders = async () => {
    try {
      setIsLoadingPendingOrders(true);
      setView("pending-orders");
      console.log("🔍 Đang tải đơn hàng chờ xác nhận...");
      const response = await orderApi.getPendingOrders();

      console.log("📋 Response từ API getPendingOrders:", response);

      // Kiểm tra và set pending orders với nhiều format khác nhau
      if (response && Array.isArray(response.don_hang)) {
        // Format: {don_hang: [...], message: "..."}
        setPendingOrders(response.don_hang);
        console.log(
          `✅ Đã tải ${response.don_hang.length} đơn hàng chờ xác nhận`
        );
      } else if (response && Array.isArray(response.data)) {
        // Format: {data: [...], message: "..."}
        setPendingOrders(response.data);
        console.log(`✅ Đã tải ${response.data.length} đơn hàng chờ xác nhận`);
      } else if (Array.isArray(response)) {
        // Format: trực tiếp array
        setPendingOrders(response);
        console.log(`✅ Đã tải ${response.length} đơn hàng chờ xác nhận`);
      } else {
        console.warn(
          "⚠️ API trả về dữ liệu đơn hàng chờ xác nhận không hợp lệ:",
          response
        );
        setPendingOrders([]);
      }
      setCurrentPage(1);
      setSearchQuery("");
    } catch (error) {
      console.error("❌ Lỗi khi tải đơn hàng chờ xác nhận:", error);
      setPendingOrders([]); // Đảm bảo luôn set về mảng rỗng khi có lỗi
      alert("Lỗi khi tải danh sách đơn hàng chờ xác nhận!");
    } finally {
      setIsLoadingPendingOrders(false);
    }
  };

  // Quay lại danh sách người dùng
  const backToUsers = () => {
    setView("users");
    setSelectedUser(null);
    setOrders([]);
    setPendingOrders([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Duyệt đơn hàng - chuyển từ "Chờ xử lý" sang "Đang giao" và tạo đơn GHN
  const handleApproveOrder = async (orderId: number) => {
    try {
      // Lấy chi tiết đơn hàng trước khi duyệt
      const orderDetail = await orderApi.getOrderDetail(orderId);
      console.log("📋 Chi tiết đơn hàng:", orderDetail);

      // Tính COD amount (nếu thanh toán khi nhận hàng)
      const codAmount =
        orderDetail.don_hang.hinh_thuc_thanh_toan === "Thanh toán khi nhận hàng"
          ? parseInt(orderDetail.don_hang.tong_thanh_toan.replace(/[^\d]/g, ""))
          : 0;

      // Chuẩn bị payload đơn giản cho GHN API
      const ghnPayload = {
        note: orderDetail.don_hang.ghi_chu || "Giao nhanh trong giờ hành chính",
        required_note: "KHONGCHOXEMHANG",
        to_name: orderDetail.don_hang.ten_nguoi_nhan,
        to_phone: orderDetail.don_hang.so_dien_thoai,
        to_address: orderDetail.don_hang.dia_chi_giao,
        to_ward_name: "Phường 14", // Default
        to_district_name: "Quận 10", // Default
        to_province_name: "TP. Hồ Chí Minh", // Default
        insurance_value: Math.min(codAmount || 1000000, 5000000), // Max 5M
        pick_shift: [2],
      };

      console.log("🚚 GHN Payload:", ghnPayload);

      // Gọi API GHN tạo đơn
      const response = await apiClient.post(
        `/ghn/taodon/${orderId}`,
        ghnPayload
      );

      const ghnResponse = response.data;
      console.log("✅ GHN Response:", ghnResponse);

      // Cập nhật trạng thái đơn hàng
      await updateOrderStatusQL(orderId, "Đang Giao");

      alert(
        `✅ Đã duyệt đơn hàng thành công!\n` +
          `🚚 Đơn hàng đã được gửi đến GHN để xử lý`
      );

      // Reload pending orders để cập nhật danh sách
      loadPendingOrders();
    } catch (error: any) {
      console.error("❌ Lỗi duyệt đơn hàng:", error);

      let errorMessage = "Lỗi khi duyệt đơn hàng!";
      if (error.message?.includes("HTTP")) {
        errorMessage = `Lỗi tạo đơn vận chuyển GHN: ${error.message}`;
      }

      alert(errorMessage);
    }
  };

  // Từ chối đơn hàng - chuyển sang "Đã hủy"
  const handleRejectOrder = async (orderId: number) => {
    if (confirm("Bạn có chắc chắn muốn từ chối đơn hàng này?")) {
      try {
        await updateOrderStatusQL(orderId, "Đã Hủy");
        alert("Đã từ chối đơn hàng thành công!");
        // Reload pending orders để cập nhật danh sách
        loadPendingOrders();
      } catch (error) {
        console.error("Lỗi từ chối đơn hàng:", error);
        alert("Lỗi khi từ chối đơn hàng!");
      }
    }
  };

  // Filter accounts theo search query (loại bỏ admin và chỉ lấy khách hàng)
  const filteredAccounts = (accounts || []).filter((account) => {
    // Loại bỏ admin, chỉ hiển thị khách hàng
    if (account.vai_tro === "admin") return false;

    // Nếu không có search query, hiển thị tất cả khách hàng
    if (!searchQuery) return true;

    // Filter theo search query
    const searchLower = searchQuery.toLowerCase();
    return (
      account.ho_ten.toLowerCase().includes(searchLower) ||
      account.email.toLowerCase().includes(searchLower) ||
      account.so_dien_thoai?.includes(searchLower) ||
      account.ma_nguoi_dung.toString().includes(searchLower)
    );
  });

  // Filter orders theo search query
  const filteredOrders = (orders || []).filter((order) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      order.ma_don_hang.toString().includes(searchLower) ||
      order.ten_nguoi_nhan.toLowerCase().includes(searchLower) ||
      order.so_dien_thoai.includes(searchLower) ||
      order.dia_chi_giao.toLowerCase().includes(searchLower) ||
      order.trang_thai.toLowerCase().includes(searchLower) ||
      order.hinh_thuc_thanh_toan.toLowerCase().includes(searchLower)
    );
  });

  // Filter pending orders theo search query
  const filteredPendingOrders = (pendingOrders || []).filter((order) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      order.ma_don_hang.toString().includes(searchLower) ||
      order.ten_nguoi_nhan.toLowerCase().includes(searchLower) ||
      order.so_dien_thoai.includes(searchLower) ||
      order.dia_chi_giao.toLowerCase().includes(searchLower) ||
      order.trang_thai.toLowerCase().includes(searchLower) ||
      order.hinh_thuc_thanh_toan.toLowerCase().includes(searchLower)
    );
  });

  // Pagination cho accounts
  const totalPagesAccounts = Math.ceil(
    filteredAccounts.length / ITEMS_PER_PAGE
  );
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Pagination cho orders
  const totalPagesOrders = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Pagination cho pending orders
  const totalPagesPendingOrders = Math.ceil(
    filteredPendingOrders.length / ITEMS_PER_PAGE
  );
  const paginatedPendingOrders = filteredPendingOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Tính tổng doanh thu cho user hiện tại hoặc pending orders
  const totalRevenue =
    view === "orders"
      ? filteredOrders.reduce(
          (total, order) => total + Number(order.tong_thanh_toan),
          0
        )
      : view === "pending-orders"
        ? filteredPendingOrders.reduce(
            (total, order) => total + Number(order.tong_thanh_toan),
            0
          )
        : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý đơn hàng
                </h1>
                <p className="text-gray-600">
                  {view === "users"
                    ? "Chọn người dùng để xem đơn hàng của họ hoặc xem đơn hàng chờ xác nhận"
                    : view === "orders"
                      ? `Đơn hàng của ${selectedUser?.ho_ten}`
                      : "Đơn hàng chờ xác nhận"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {view === "users" && (
                <button
                  onClick={loadPendingOrders}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                >
                  <FileCheck className="w-5 h-5" />
                  <span>Đơn hàng chờ xác nhận</span>
                </button>
              )}

              {(view === "orders" || view === "pending-orders") && (
                <button
                  onClick={backToUsers}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Quay lại</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={
                view === "users"
                  ? "Tìm kiếm người dùng (tên, email, SĐT, ID)..."
                  : view === "pending-orders"
                    ? "Tìm kiếm đơn hàng chờ xác nhận (mã đơn hàng, tên, SĐT, địa chỉ, trạng thái...)..."
                    : "Tìm kiếm đơn hàng (mã đơn hàng, tên, SĐT, địa chỉ, trạng thái...)..."
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Statistics cho Orders và Pending Orders */}
        {(view === "orders" && orders.length > 0) ||
          (view === "pending-orders" && pendingOrders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {view === "pending-orders"
                        ? "Tổng đơn chờ xác nhận"
                        : "Tổng đơn hàng"}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {view === "pending-orders"
                        ? pendingOrders.length
                        : orders.length}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    {view === "pending-orders" ? (
                      <FileCheck className="w-6 h-6 text-blue-600" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Kết quả lọc
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {view === "pending-orders"
                        ? filteredPendingOrders.length
                        : filteredOrders.length}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Search className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng doanh thu
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-xl">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* Users Table */}
        {view === "users" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">
                  Đang tải danh sách người dùng...
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Người dùng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Liên hệ
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vai trò
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedAccounts.map((account) => (
                        <tr
                          key={account.ma_nguoi_dung}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {account.ho_ten}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ID: {account.ma_nguoi_dung}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-gray-900 flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                {account.email}
                              </p>
                              {account.so_dien_thoai && (
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {account.so_dien_thoai}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                account.vai_tro === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {account.vai_tro === "admin"
                                ? "Quản trị viên"
                                : "Khách hàng"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                account.trang_thai === "active" ||
                                account.trang_thai === "hoat_dong"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {account.trang_thai === "active" ||
                              account.trang_thai === "hoat_dong"
                                ? "Hoạt động"
                                : "Bị khóa"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                loadOrdersByUserId(
                                  account.ma_nguoi_dung,
                                  account
                                )
                              }
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <ShoppingBag className="w-4 h-4 mr-1" />
                              Xem đơn hàng
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination cho Users */}
                {totalPagesAccounts > 1 && (
                  <div className="bg-white px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Hiển thị{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>{" "}
                        đến{" "}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredAccounts.length
                          )}
                        </span>{" "}
                        trong tổng số{" "}
                        <span className="font-medium">
                          {filteredAccounts.length}
                        </span>{" "}
                        người dùng
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trước
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                          {currentPage} / {totalPagesAccounts}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPagesAccounts, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPagesAccounts}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Orders Table */}
        {view === "orders" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {isLoadingOrders ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">
                  Đang tải danh sách đơn hàng...
                </p>
              </div>
            ) : orders.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Đơn hàng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Khách hàng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thanh toán
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedOrders.map((order) => (
                        <tr
                          key={order.ma_don_hang}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                #{order.ma_don_hang}
                              </p>
                              <p className="text-sm text-green-600 font-medium">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(Number(order.tong_thanh_toan))}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 flex items-center">
                                <User className="w-4 h-4 mr-1 text-gray-400" />
                                {order.ten_nguoi_nhan}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center mt-1">
                                <Phone className="w-4 h-4 mr-1" />
                                {order.so_dien_thoai}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {order.dia_chi_giao.length > 50
                                  ? `${order.dia_chi_giao.substring(0, 50)}...`
                                  : order.dia_chi_giao}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-sm font-medium">
                                {order.hinh_thuc_thanh_toan}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {order.da_thanh_toan
                                ? "Đã thanh toán"
                                : "Chưa thanh toán"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {getStatusInfo(order.trang_thai).icon}
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(order.trang_thai).color}`}
                              >
                                {getStatusInfo(order.trang_thai).text}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(order.Ngay_Tao).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.Ngay_Tao).toLocaleTimeString(
                                "vi-VN"
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                setSelectedOrderId(order.ma_don_hang)
                              }
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination cho Orders */}
                {totalPagesOrders > 1 && (
                  <div className="bg-white px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Hiển thị{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>{" "}
                        đến{" "}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredOrders.length
                          )}
                        </span>{" "}
                        trong tổng số{" "}
                        <span className="font-medium">
                          {filteredOrders.length}
                        </span>{" "}
                        đơn hàng
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trước
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                          {currentPage} / {totalPagesOrders}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPagesOrders, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPagesOrders}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Người dùng này chưa có đơn hàng nào
                </h3>
                <p className="text-gray-500">
                  {selectedUser?.ho_ten} chưa thực hiện đơn hàng nào
                </p>
                <button
                  onClick={backToUsers}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Quay lại danh sách người dùng
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pending Orders Table */}
        {view === "pending-orders" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {isLoadingPendingOrders ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <p className="mt-2 text-gray-600">
                  Đang tải danh sách đơn hàng chờ xác nhận...
                </p>
              </div>
            ) : pendingOrders.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-orange-50 border-b border-orange-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Đơn hàng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Khách hàng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Thanh toán
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedPendingOrders.map((order) => (
                        <tr
                          key={order.ma_don_hang}
                          className="hover:bg-orange-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                #{order.ma_don_hang}
                              </p>
                              <p className="text-sm text-green-600 font-medium">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(Number(order.tong_thanh_toan))}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 flex items-center">
                                <User className="w-4 h-4 mr-1 text-gray-400" />
                                {order.ten_nguoi_nhan}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center mt-1">
                                <Phone className="w-4 h-4 mr-1" />
                                {order.so_dien_thoai}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {order.dia_chi_giao.length > 50
                                  ? `${order.dia_chi_giao.substring(0, 50)}...`
                                  : order.dia_chi_giao}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-sm font-medium">
                                {order.hinh_thuc_thanh_toan}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {order.da_thanh_toan
                                ? "Đã thanh toán"
                                : "Chưa thanh toán"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {getStatusInfo(order.trang_thai).icon}
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(order.trang_thai).color}`}
                              >
                                {getStatusInfo(order.trang_thai).text}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(order.Ngay_Tao).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.Ngay_Tao).toLocaleTimeString(
                                "vi-VN"
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  setSelectedOrderId(order.ma_don_hang)
                                }
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Chi tiết
                              </button>
                              <button
                                onClick={() =>
                                  handleApproveOrder(order.ma_don_hang)
                                }
                                className="inline-flex items-center px-3 py-2 bg-green-600 text-white shadow-sm text-sm leading-4 font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Duyệt
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectOrder(order.ma_don_hang)
                                }
                                className="inline-flex items-center px-3 py-2 bg-red-600 text-white shadow-sm text-sm leading-4 font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Từ chối
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination cho Pending Orders */}
                {totalPagesPendingOrders > 1 && (
                  <div className="bg-white px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Hiển thị{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>{" "}
                        đến{" "}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredPendingOrders.length
                          )}
                        </span>{" "}
                        trong tổng số{" "}
                        <span className="font-medium">
                          {filteredPendingOrders.length}
                        </span>{" "}
                        đơn hàng chờ xác nhận
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trước
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                          {currentPage} / {totalPagesPendingOrders}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPagesPendingOrders, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPagesPendingOrders}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Không có đơn hàng chờ xác nhận nào
                </h3>
                <p className="text-gray-500">
                  Hiện tại không có đơn hàng nào cần duyệt
                </p>
                <button
                  onClick={backToUsers}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Quay lại danh sách người dùng
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state cho Users */}
        {view === "users" && !isLoading && filteredAccounts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Không tìm thấy người dùng nào
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác"
                : "Hệ thống chưa có người dùng nào"}
            </p>
          </div>
        )}

        {/* Modal chi tiết đơn hàng */}
        {selectedOrderId && (
          <OrderDetailModal
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default QLDonHang;
