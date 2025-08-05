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
  updateOrderStatusNEW,
  getCancelReturnRequests,
  confirmCancelReturn,
  refundVNPay,
  refundZaloPay,
} from "../API/orderApi";
import accountApi from "../API/accountApi";
import type { Account } from "../types/Account";
import {
  parseAddress,
  type GHNCreateOrderPayload,
} from "../API/ghnShippingApi";
import apiClient from "../ultis/apiClient";

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
    case "Hủy":
    case "da_huy":
    case "Hủy":
      return {
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-4 h-4" />,
        text: "Hủy",
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa có thông tin";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? Number(amount) : amount;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numAmount);
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
                    <p className="text-sm text-gray-500">Mã người dùng</p>
                    <p className="font-medium">
                      #{orderDetail.don_hang.ma_nguoi_dung}
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
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                    <p className="font-medium">
                      {orderDetail.don_hang.dia_chi_giao}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Đơn vị vận chuyển</p>
                    <p className="font-medium">
                      {orderDetail.don_hang.don_vi_van_chuyen || "Chưa có"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mã vận đơn</p>
                    <p className="font-medium">
                      {orderDetail.don_hang.ma_van_don || "Chưa có"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày dự kiến giao</p>
                    <p className="font-medium">
                      {formatDate(
                        orderDetail.don_hang.ngay_du_kien_giao || null
                      )}
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
                    <p className="text-sm text-gray-500">
                      Tình trạng thanh toán
                    </p>
                    <div className="flex items-center space-x-2">
                      {orderDetail.don_hang.da_thanh_toan ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          ✅ Đã thanh toán
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          ❌ Chưa thanh toán
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày thanh toán</p>
                    <p className="font-medium">
                      {formatDate(orderDetail.don_hang.ngay_thanh_toan)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mã voucher</p>
                    <p className="font-medium">
                      {(orderDetail.don_hang as any).ma_voucher
                        ? `#${(orderDetail.don_hang as any).ma_voucher}`
                        : "Không sử dụng"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái đơn hàng</p>
                    <div className="flex items-center space-x-2">
                      {getStatusInfo(orderDetail.don_hang.trang_thai).icon}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(orderDetail.don_hang.trang_thai).color}`}
                      >
                        {getStatusInfo(orderDetail.don_hang.trang_thai).text}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Yêu cầu Hủy/trả</p>
                    <p className="font-medium">
                      {(orderDetail.don_hang as any).yeu_cau_huy_tra ===
                        "none" || !(orderDetail.don_hang as any).yeu_cau_huy_tra
                        ? "Không có"
                        : (orderDetail.don_hang as any).yeu_cau_huy_tra}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo</p>
                    <p className="font-medium">
                      {formatDate(orderDetail.don_hang.Ngay_Tao)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày cập nhật</p>
                    <p className="font-medium">
                      {formatDate(orderDetail.don_hang.Ngay_Cap_Nhat)}
                    </p>
                  </div>
                  {orderDetail.don_hang.ghi_chu && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Ghi chú</p>
                      <p className="font-medium">
                        {orderDetail.don_hang.ghi_chu}
                      </p>
                    </div>
                  )}
                  {(orderDetail.don_hang as any).ly_do_huy_tra && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Lý do Hủy/trả</p>
                      <p className="font-medium">
                        {(orderDetail.don_hang as any).ly_do_huy_tra}
                      </p>
                    </div>
                  )}
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
                          {item.so_luong} x {formatCurrency(item.gia_sau_km)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tổng:{" "}
                          {formatCurrency(item.gia_sau_km * item.so_luong)}
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
                      {formatCurrency(Number(orderDetail.don_hang.tong_tien))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        Number(orderDetail.don_hang.phi_van_chuyen)
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Tổng thanh toán:</span>
                    <span className="text-blue-600">
                      {formatCurrency(
                        Number(orderDetail.don_hang.tong_thanh_toan)
                      )}
                    </span>
                  </div>
                </div>
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
  const [confirmedOrders, setConfirmedOrders] = useState<DonHang[]>([]);
  const [cancelReturnRequests, setCancelReturnRequests] = useState<DonHang[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingPendingOrders, setIsLoadingPendingOrders] = useState(false);
  const [isLoadingConfirmedOrders, setIsLoadingConfirmedOrders] =
    useState(false);
  const [isLoadingCancelReturnRequests, setIsLoadingCancelReturnRequests] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [view, setView] = useState<
    | "users"
    | "orders"
    | "pending-orders"
    | "confirmed-orders"
    | "cancel-return-requests"
  >("users"); // Trạng thái để điều khiển view hiện tại

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

  // Load yêu cầu Hủy/trả hàng
  const loadCancelReturnRequests = async () => {
    try {
      setIsLoadingCancelReturnRequests(true);
      setView("cancel-return-requests");
      console.log("🔍 Đang tải yêu cầu Hủy/trả hàng...");
      const response = await getCancelReturnRequests();

      console.log("📋 Response từ API getCancelReturnRequests:", response);

      // Kiểm tra và set cancel return requests với nhiều format khác nhau
      if (response && Array.isArray(response.don_hang)) {
        // Format: {don_hang: [...], message: "..."}
        setCancelReturnRequests(response.don_hang);
        console.log(
          `✅ Đã tải ${response.don_hang.length} yêu cầu Hủy/trả hàng`
        );
      } else if (response && Array.isArray(response.data)) {
        // Format: {data: [...], message: "..."}
        setCancelReturnRequests(response.data);
        console.log(`✅ Đã tải ${response.data.length} yêu cầu Hủy/trả hàng`);
      } else if (Array.isArray(response)) {
        // Format: trực tiếp array
        setCancelReturnRequests(response);
        console.log(`✅ Đã tải ${response.length} yêu cầu Hủy/trả hàng`);
      } else {
        console.warn(
          "⚠️ API trả về dữ liệu yêu cầu Hủy/trả hàng không hợp lệ:",
          response
        );
        setCancelReturnRequests([]);
      }
      setCurrentPage(1);
      setSearchQuery("");
    } catch (error) {
      console.error("❌ Lỗi khi tải yêu cầu Hủy/trả hàng:", error);
      setCancelReturnRequests([]); // Đảm bảo luôn set về mảng rỗng khi có lỗi
      alert("Lỗi khi tải danh sách yêu cầu Hủy/trả hàng!");
    } finally {
      setIsLoadingCancelReturnRequests(false);
    }
  };

  // Load đơn hàng đã xác nhận
  const loadConfirmedOrders = async () => {
    try {
      setIsLoadingConfirmedOrders(true);
      setView("confirmed-orders");
      console.log("🔍 Đang tải đơn hàng đã xác nhận...");
      const response = await apiClient.get("/qldonhang/dsdaxacnhan");

      console.log("📋 Response từ API loadConfirmedOrders:", response.data);

      // Kiểm tra và set confirmed orders với nhiều format khác nhau
      if (response.data && Array.isArray(response.data.don_hang)) {
        // Format: {don_hang: [...], message: "..."}
        setConfirmedOrders(response.data.don_hang);
        console.log(
          `✅ Đã tải ${response.data.don_hang.length} đơn hàng đã xác nhận`
        );
      } else if (response.data && Array.isArray(response.data.data)) {
        // Format: {data: [...], message: "..."}
        setConfirmedOrders(response.data.data);
        console.log(
          `✅ Đã tải ${response.data.data.length} đơn hàng đã xác nhận`
        );
      } else if (Array.isArray(response.data)) {
        // Format: trực tiếp array
        setConfirmedOrders(response.data);
        console.log(`✅ Đã tải ${response.data.length} đơn hàng đã xác nhận`);
      } else {
        console.warn(
          "⚠️ API trả về dữ liệu đơn hàng đã xác nhận không hợp lệ:",
          response.data
        );
        setConfirmedOrders([]);
      }
      setCurrentPage(1);
      setSearchQuery("");
    } catch (error) {
      console.error("❌ Lỗi khi tải đơn hàng đã xác nhận:", error);
      setConfirmedOrders([]); // Đảm bảo luôn set về mảng rỗng khi có lỗi
      alert("Lỗi khi tải danh sách đơn hàng đã xác nhận!");
    } finally {
      setIsLoadingConfirmedOrders(false);
    }
  };

  // Xử lý xác nhận hủy/trả hàng
  const handleConfirmCancelReturn = async (
    orderId: number,
    decision: "Chấp Nhận" | "Từ Chối",
    order: DonHang
  ) => {
    try {
      // Hiển thị xác nhận trước khi thực hiện
      const isOnlinePayment =
        order.hinh_thuc_thanh_toan === "vnpay" ||
        order.hinh_thuc_thanh_toan === "zalopay";

      const isPaid = order.da_thanh_toan === 1;

      let confirmMessage = "";
      if (decision === "Chấp Nhận") {
        confirmMessage = `Bạn có chắc chắn muốn chấp nhận yêu cầu hủy/trả cho đơn hàng #${orderId}?`;
        if (isOnlinePayment && isPaid) {
          confirmMessage += `\n\n💰 Đây là đơn hàng đã thanh toán qua ${order.hinh_thuc_thanh_toan}, hệ thống sẽ tự động hoàn tiền.`;
        }
      } else {
        confirmMessage = `Bạn có chắc chắn muốn từ chối yêu cầu hủy/trả cho đơn hàng #${orderId}?`;
      }

      if (!confirm(confirmMessage)) return;

      console.log(
        `🔄 Đang xác nhận ${decision.toLowerCase()} đơn hàng ${orderId}...`
      );

      // Gọi API xác nhận hủy/trả
      await confirmCancelReturn(orderId, decision);

      // Nếu chấp nhận và là thanh toán online đã thanh toán, thực hiện hoàn tiền
      if (decision === "Chấp Nhận" && isPaid && isOnlinePayment) {
        try {
          console.log(
            `💰 Đang thực hiện hoàn tiền ${order.hinh_thuc_thanh_toan} cho đơn hàng ${orderId}...`
          );

          // Gọi API hoàn tiền tương ứng với phương thức thanh toán
          const paymentMethod = order.hinh_thuc_thanh_toan.toLowerCase();
          if (paymentMethod == "zalopay" || paymentMethod == "zalo pay") {
            console.log("🔄 Gọi API hoàn tiền ZaloPay...");
            await refundZaloPay(orderId);
          } else if (paymentMethod == "vnpay" || paymentMethod == "vn pay") {
            console.log("🔄 Gọi API hoàn tiền VNPay...");
            await refundVNPay(orderId);
          } else {
            // Fallback cho các phương thức thanh toán online khác
            console.log("🔄 Gọi API hoàn tiền fallback (VNPay)...");
            await refundVNPay(orderId);
          }

          alert(
            `✅ ${decision} yêu cầu hủy/trả thành công!\n\n💰 Hoàn tiền ${order.hinh_thuc_thanh_toan} đã được thực hiện cho đơn hàng #${orderId}\nSố tiền: ${new Intl.NumberFormat(
              "vi-VN",
              {
                style: "currency",
                currency: "VND",
              }
            ).format(Number(order.tong_thanh_toan))}`
          );
        } catch (refundError) {
          console.error("❌ Lỗi khi hoàn tiền:", refundError);
          alert(
            `⚠️ ${decision} yêu cầu hủy/trả thành công nhưng hoàn tiền thất bại!\n\nĐơn hàng #${orderId} đã được xác nhận hủy/trả nhưng hoàn tiền ${order.hinh_thuc_thanh_toan} gặp lỗi.\n\nVui lòng liên hệ bộ phận kỹ thuật để xử lý hoàn tiền thủ công.`
          );
        }
      } else {
        const message =
          decision === "Chấp Nhận"
            ? `✅ Chấp nhận yêu cầu hủy/trả thành công cho đơn hàng #${orderId}!${
                !isPaid
                  ? "\n\n📝 Đơn hàng chưa thanh toán nên không cần hoàn tiền."
                  : !isOnlinePayment
                    ? "\n\n💵 Đơn hàng thanh toán COD nên không cần hoàn tiền online."
                    : ""
              }`
            : `✅ Từ chối yêu cầu hủy/trả thành công cho đơn hàng #${orderId}!`;
        alert(message);
      }

      // Reload danh sách yêu cầu hủy/trả
      await loadCancelReturnRequests();
    } catch (error) {
      console.error(
        `❌ Lỗi khi ${decision.toLowerCase()} yêu cầu hủy/trả:`,
        error
      );
      alert(
        `❌ ${decision} yêu cầu hủy/trả thất bại!\n\nLỗi: ${error instanceof Error ? error.message : error}`
      );
    }
  };

  // Xử lý xác nhận đơn hàng (chỉ xác nhận, không tạo đơn GHN)
  const handleConfirmOrder = async (orderId: number) => {
    try {
      if (!confirm(`Bạn có chắc chắn muốn xác nhận đơn hàng #${orderId}?`)) {
        return;
      }

      console.log(`🔄 Đang xác nhận đơn hàng ${orderId}...`);

      // Gọi API xác nhận đơn hàng
      await updateOrderStatusNEW(orderId);

      console.log("✅ Xác nhận đơn hàng thành công");

      alert(`✅ Xác nhận đơn hàng #${orderId} thành công!`);

      // Reload danh sách đơn hàng chờ xác nhận
      await loadPendingOrders();
    } catch (error) {
      console.error("❌ Lỗi khi xác nhận đơn hàng:", error);

      let errorMessage = "Xác nhận đơn hàng thất bại!";
      if (error instanceof Error) {
        errorMessage += `\n\nLỗi: ${error.message}`;
      }

      alert(`❌ ${errorMessage}`);
    }
  };

  // Xử lý tạo đơn GHN cho đơn hàng đã xác nhận
  const handleCreateGHNOrder = async (orderId: number, order: DonHang) => {
    try {
      if (
        !confirm(
          `Bạn có chắc chắn muốn tạo đơn vận chuyển GHN cho đơn hàng #${orderId}?`
        )
      ) {
        return;
      }

      console.log(`🔄 Đang tạo đơn GHN cho đơn hàng ${orderId}...`);

      // Parse địa chỉ từ chuỗi địa chỉ đầy đủ
      const addressParts = parseAddress(order.dia_chi_giao);

      // Tạo payload cho GHN
      const ghnPayload: GHNCreateOrderPayload = {
        to_name: order.ten_nguoi_nhan,
        to_phone: order.so_dien_thoai,
        to_address: addressParts.address || order.dia_chi_giao,
        to_ward_name: addressParts.ward || "Phường 14",
        to_district_name: addressParts.district || "Quận 10",
        to_province_name: addressParts.province || "TP. Hồ Chí Minh",
        cod_amount:
          order.hinh_thuc_thanh_toan === "COD"
            ? Number(order.tong_thanh_toan)
            : 0,
        content: `Đơn hàng #${orderId} - Thời trang`,
        weight: 500, // Default weight
        length: 20,
        width: 15,
        height: 10,
        service_type_id: 2, // Hàng nhẹ
        payment_type_id: order.hinh_thuc_thanh_toan === "COD" ? 2 : 1, // 1: Người gửi trả, 2: Người nhận trả
        required_note: "KHONGCHOXEMHANG",
        note: order.ghi_chu || "Giao nhanh trong giờ hành chính",
        client_order_code: `DH${orderId}`,
        insurance_value: Number(order.tong_thanh_toan),
      };

      // Gọi API tạo đơn GHN
      const ghnResponse = await apiClient.post(
        `/ghn/taodon/${orderId}`,
        ghnPayload
      );

      console.log("✅ Tạo đơn GHN thành công:", ghnResponse.data);

      alert(
        `✅ Tạo đơn vận chuyển GHN cho đơn hàng #${orderId} thành công!\n\n` +
          `📦 Mã vận đơn: ${ghnResponse.data.order_code || "Đang cập nhật"}\n` +
          `💰 Phí vận chuyển: ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(ghnResponse.data.total_fee || 0)}\n` +
          `🕐 Dự kiến giao: ${ghnResponse.data.expected_delivery_time || "Đang cập nhật"}`
      );

      // Reload danh sách đơn hàng đã xác nhận
      await loadConfirmedOrders();
    } catch (error) {
      console.error("❌ Lỗi khi tạo đơn GHN:", error);

      let errorMessage = "Tạo đơn vận chuyển GHN thất bại!";
      if (error instanceof Error) {
        errorMessage += `\n\nLỗi: ${error.message}`;
      }

      alert(`❌ ${errorMessage}`);
    }
  };

  // Quay lại danh sách người dùng
  const backToUsers = () => {
    setView("users");
    setSelectedUser(null);
    setOrders([]);
    setPendingOrders([]);
    setConfirmedOrders([]);
    setCancelReturnRequests([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Duyệt đơn hàng - chỉ xác nhận đơn hàng
  const handleApproveOrder = async (orderId: number) => {
    try {
      console.log("🔄 Đang xác nhận đơn hàng:", orderId);

      // Sử dụng hàm mới để chỉ xác nhận đơn hàng
      await handleConfirmOrder(orderId);
    } catch (error: any) {
      console.error("❌ Lỗi duyệt đơn hàng:", error);
      alert("Lỗi khi duyệt đơn hàng!");
    }
  };

  // Từ chối đơn hàng - chuyển sang "Hủy"
  const handleRejectOrder = async (orderId: number) => {
    if (confirm("Bạn có chắc chắn muốn từ chối đơn hàng này?")) {
      try {
        await updateOrderStatusQL(orderId, "Hủy");
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

  // Filter cancel return requests theo search query
  const filteredCancelReturnRequests = (cancelReturnRequests || []).filter(
    (order) => {
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
    }
  );

  // Filter confirmed orders theo search query
  const filteredConfirmedOrders = (confirmedOrders || []).filter((order) => {
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

  // Pagination cho cancel return requests
  const totalPagesCancelReturnRequests = Math.ceil(
    filteredCancelReturnRequests.length / ITEMS_PER_PAGE
  );
  const paginatedCancelReturnRequests = filteredCancelReturnRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Pagination cho confirmed orders
  const totalPagesConfirmedOrders = Math.ceil(
    filteredConfirmedOrders.length / ITEMS_PER_PAGE
  );
  const paginatedConfirmedOrders = filteredConfirmedOrders.slice(
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
        : view === "confirmed-orders"
          ? filteredConfirmedOrders.reduce(
              (total, order) => total + Number(order.tong_thanh_toan),
              0
            )
          : view === "cancel-return-requests"
            ? filteredCancelReturnRequests.reduce(
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
                      : view === "pending-orders"
                        ? "Đơn hàng chờ xác nhận"
                        : view === "confirmed-orders"
                          ? "Đơn hàng đã xác nhận"
                          : "Yêu cầu Hủy/trả hàng"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {view === "users" && (
                <>
                  <button
                    onClick={loadPendingOrders}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    <FileCheck className="w-5 h-5" />
                    <span>Đơn hàng chờ xác nhận</span>
                  </button>
                  <button
                    onClick={loadConfirmedOrders}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Đơn hàng đã xác nhận</span>
                  </button>
                  <button
                    onClick={loadCancelReturnRequests}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>Yêu cầu Hủy/trả</span>
                  </button>
                </>
              )}

              {(view === "orders" ||
                view === "pending-orders" ||
                view === "confirmed-orders" ||
                view === "cancel-return-requests") && (
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
                    : view === "cancel-return-requests"
                      ? "Tìm kiếm yêu cầu Hủy/trả (mã đơn hàng, tên, SĐT, địa chỉ, trạng thái...)..."
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
        {((view === "orders" && orders.length > 0) ||
          (view === "pending-orders" && pendingOrders.length > 0) ||
          (view === "confirmed-orders" && confirmedOrders.length > 0) ||
          (view === "cancel-return-requests" &&
            cancelReturnRequests.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {view === "pending-orders"
                      ? "Tổng đơn chờ xác nhận"
                      : view === "confirmed-orders"
                        ? "Tổng đơn đã xác nhận"
                        : view === "cancel-return-requests"
                          ? "Tổng yêu cầu Hủy/trả"
                          : "Tổng đơn hàng"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {view === "pending-orders"
                      ? pendingOrders.length
                      : view === "confirmed-orders"
                        ? confirmedOrders.length
                        : view === "cancel-return-requests"
                          ? cancelReturnRequests.length
                          : orders.length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  {view === "pending-orders" ? (
                    <FileCheck className="w-6 h-6 text-blue-600" />
                  ) : view === "confirmed-orders" ? (
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  ) : view === "cancel-return-requests" ? (
                    <AlertCircle className="w-6 h-6 text-blue-600" />
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
                      : view === "cancel-return-requests"
                        ? filteredCancelReturnRequests.length
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
        )}

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

        {/* Confirmed Orders Table */}
        {view === "confirmed-orders" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {isLoadingConfirmedOrders ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-gray-600">
                  Đang tải danh sách đơn hàng đã xác nhận...
                </p>
              </div>
            ) : confirmedOrders.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-green-50 border-b border-green-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                          Đơn hàng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                          Khách hàng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                          Thanh toán
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                          Vận đơn
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedConfirmedOrders.map((order) => (
                        <tr
                          key={order.ma_don_hang}
                          className="hover:bg-green-50 transition-colors"
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
                            <div className="flex items-center space-x-2">
                              <Truck className="w-4 h-4 text-gray-400" />
                              <div>
                                {order.ma_van_don ? (
                                  <>
                                    <p className="text-sm font-medium text-gray-900">
                                      {order.ma_van_don}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {order.don_vi_van_chuyen || "GHN"}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    Chưa có mã vận đơn
                                  </p>
                                )}
                              </div>
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
                              {!order.ma_van_don && (
                                <button
                                  onClick={() =>
                                    handleCreateGHNOrder(
                                      order.ma_don_hang,
                                      order
                                    )
                                  }
                                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white shadow-sm text-sm leading-4 font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                  <Truck className="w-4 h-4 mr-1" />
                                  Tạo vận đơn GHN
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination cho Confirmed Orders */}
                {totalPagesConfirmedOrders > 1 && (
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
                            filteredConfirmedOrders.length
                          )}
                        </span>{" "}
                        trong tổng số{" "}
                        <span className="font-medium">
                          {filteredConfirmedOrders.length}
                        </span>{" "}
                        đơn hàng đã xác nhận
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
                          {currentPage} / {totalPagesConfirmedOrders}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(
                                totalPagesConfirmedOrders,
                                currentPage + 1
                              )
                            )
                          }
                          disabled={currentPage === totalPagesConfirmedOrders}
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
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Không có đơn hàng đã xác nhận nào
                </h3>
                <p className="text-gray-500">
                  Hiện tại không có đơn hàng nào đã được xác nhận
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

        {/* Cancel Return Requests Table */}
        {view === "cancel-return-requests" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {isLoadingCancelReturnRequests ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <p className="mt-2 text-gray-600">
                  Đang tải danh sách yêu cầu Hủy/trả...
                </p>
              </div>
            ) : cancelReturnRequests.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-red-50 border-b border-red-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                          Đơn hàng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                          Khách hàng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                          Yêu cầu
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                          Thanh toán
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-red-700 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedCancelReturnRequests.map((order) => {
                        const statusStyles =
                          order.trang_thai === "Chờ Xác Nhận"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.trang_thai === "Đang Giao"
                              ? "bg-blue-100 text-blue-800"
                              : order.trang_thai === "Hoàn Thành"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800";

                        return (
                          <tr
                            key={order.ma_don_hang}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  #{order.ma_don_hang}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(Number(order.tong_thanh_toan))}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.ten_nguoi_nhan}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.so_dien_thoai}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-red-600">
                                  {order.yeu_cau_huy_tra || "Hủy/Trả hàng"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.ly_do_huy_tra ||
                                    "Xem chi tiết để biết lý do"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.hinh_thuc_thanh_toan}
                              </div>
                              <div className="flex items-center mt-1">
                                <div
                                  className={`text-xs ${
                                    order.da_thanh_toan === 1
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {order.da_thanh_toan === 1
                                    ? "✓ Đã thanh toán"
                                    : "○ Chưa thanh toán"}
                                </div>
                                {order.da_thanh_toan === 1 &&
                                  (order.hinh_thuc_thanh_toan === "VNPay" ||
                                    order.hinh_thuc_thanh_toan ===
                                      "ZaloPay") && (
                                    <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      💰 Có thể hoàn tiền
                                    </div>
                                  )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles}`}
                              >
                                {order.trang_thai}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.Ngay_Tao).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() =>
                                    setSelectedOrderId(order.ma_don_hang)
                                  }
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Chi tiết
                                </button>

                                {/* Chỉ hiển thị nút xác nhận nếu đơn hàng chưa được xử lý */}
                                {(order.trang_thai === "Chờ Xác Nhận" ||
                                  order.trang_thai === "cho_xu_ly") && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleConfirmCancelReturn(
                                          order.ma_don_hang,
                                          "Chấp Nhận",
                                          order
                                        )
                                      }
                                      className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                      title="Chấp nhận yêu cầu hủy/trả"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Chấp nhận
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleConfirmCancelReturn(
                                          order.ma_don_hang,
                                          "Từ Chối",
                                          order
                                        )
                                      }
                                      className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                      title="Từ chối yêu cầu hủy/trả"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Từ chối
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination cho Cancel Return Requests */}
                {totalPagesCancelReturnRequests > 1 && (
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
                            filteredCancelReturnRequests.length
                          )}
                        </span>{" "}
                        trong tổng số{" "}
                        <span className="font-medium">
                          {filteredCancelReturnRequests.length}
                        </span>{" "}
                        yêu cầu Hủy/trả
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
                        <span className="px-3 py-2 text-sm text-gray-700">
                          Trang {currentPage} / {totalPagesCancelReturnRequests}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(
                                totalPagesCancelReturnRequests,
                                currentPage + 1
                              )
                            )
                          }
                          disabled={
                            currentPage === totalPagesCancelReturnRequests
                          }
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
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Không có yêu cầu Hủy/trả nào
                </h3>
                <p className="text-gray-500">
                  Hiện tại không có yêu cầu Hủy/trả hàng nào
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
