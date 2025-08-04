import React from "react";
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { DonHang } from "../API/orderApi";
import { refundVNPay } from "../API/orderApi";

// Hàm ánh xạ trạng thái với màu sắc và icon
const getStatusInfo = (status: string) => {
  switch (status) {
    case "Chờ xử lý":
    case "cho_xu_ly":
    case "Chờ Xác Nhận":
      return {
        color: "bg-yellow-100 text-yellow-800",
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Chờ xử lý",
      };
    case "Đang giao":
    case "dang_giao":
    case "Đang Giao":
      return {
        color: "bg-blue-100 text-blue-800",
        icon: <CheckCircle className="w-4 h-4" />,
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
    case "Đã Hủy":
      return {
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-4 h-4" />,
        text: "Hủy",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800",
        icon: <CheckCircle className="w-4 h-4" />,
        text: status,
      };
  }
};

interface CancelReturnRequestsTableProps {
  orders: DonHang[];
  isLoading: boolean;
  onViewDetail: (orderId: number) => void;
  onBackToUsers: () => void;
  onReload: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filteredCount: number;
}

const CancelReturnRequestsTable: React.FC<CancelReturnRequestsTableProps> = ({
  orders,
  isLoading,
  onViewDetail,
  onBackToUsers,
  onReload,
  currentPage,
  totalPages,
  onPageChange,
  filteredCount,
}) => {
  const ITEMS_PER_PAGE = 10;

  const formatDate = (dateString: string) => {
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

  // Xử lý hoàn tiền VNPay
  const handleRefund = async (order: DonHang) => {
    if (!order.da_thanh_toan) {
      alert("Đơn hàng này chưa được thanh toán, không thể hoàn tiền!");
      return;
    }

    // Kiểm tra phương thức thanh toán có phải VNPay không
    const isVNPay =
      order.hinh_thuc_thanh_toan.toLowerCase().includes("vnpay") ||
      order.hinh_thuc_thanh_toan.toLowerCase().includes("online");

    if (!isVNPay) {
      alert("Đơn hàng này không sử dụng VNPay, không thể hoàn tiền tự động!");
      return;
    }

    const confirmRefund = confirm(
      `Bạn có chắc chắn muốn hoàn tiền cho đơn hàng #${order.ma_don_hang}?\n` +
        `Số tiền hoàn: ${formatCurrency(order.tong_thanh_toan)}`
    );

    if (!confirmRefund) return;

    try {
      console.log(
        "💰 Đang xử lý hoàn tiền VNPay cho đơn hàng:",
        order.ma_don_hang
      );

      await refundVNPay(order.ma_don_hang);

      alert("✅ Hoàn tiền thành công!");

      // Reload danh sách để cập nhật trạng thái
      onReload();
    } catch (error: any) {
      console.error("❌ Lỗi hoàn tiền:", error);
      alert(`Lỗi khi hoàn tiền: ${error.message}`);
    }
  };

  // Kiểm tra xem có thể hoàn tiền không
  const canRefund = (order: DonHang) => {
    const isVNPay =
      order.hinh_thuc_thanh_toan.toLowerCase().includes("vnpay") ||
      order.hinh_thuc_thanh_toan.toLowerCase().includes("online");
    return order.da_thanh_toan && isVNPay;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-600">
            Đang tải danh sách yêu cầu Hủy/trả...
          </p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Không có yêu cầu Hủy/trả nào
          </h3>
          <p className="text-gray-500">
            Hiện tại không có yêu cầu hủy hoặc trả hàng nào
          </p>
          <button
            onClick={onBackToUsers}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách người dùng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                Thanh toán
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                Yêu cầu
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
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
                      {formatCurrency(order.tong_thanh_toan)}
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
                      {order.dia_chi_giao}
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
                  <div className="text-xs mt-1">
                    {order.da_thanh_toan ? (
                      <span className="text-green-600 font-medium">
                        ✅ Đã thanh toán
                      </span>
                    ) : (
                      <span className="text-red-600">❌ Chưa thanh toán</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-medium text-red-600">
                      {(order as any).yeu_cau_huy_tra || "Hủy/Trả hàng"}
                    </p>
                    {(order as any).ly_do_huy_tra && (
                      <p className="text-xs text-gray-500 mt-1">
                        {(order as any).ly_do_huy_tra}
                      </p>
                    )}
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
                    {formatDate(order.Ngay_Tao)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Cập nhật: {formatDate(order.Ngay_Cap_Nhat)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => onViewDetail(order.ma_don_hang)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Chi tiết
                    </button>

                    {canRefund(order) && (
                      <button
                        onClick={() => handleRefund(order)}
                        className="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs leading-4 font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Hoàn tiền
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị{" "}
              <span className="font-medium">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              đến{" "}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredCount)}
              </span>{" "}
              trong tổng số <span className="font-medium">{filteredCount}</span>{" "}
              yêu cầu Hủy/trả
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelReturnRequestsTable;
