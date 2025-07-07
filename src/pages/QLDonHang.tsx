import { useState } from "react";
import { Plus, Edit, Trash2, Save, X, Package } from "lucide-react";

const ITEMS_PER_PAGE = 10; // Changed from 5 to 10

// Định nghĩa kiểu Order
type Order = {
  ma_don_hang: number;
  ten_khach_hang: string;
  tong_tien: number;
  trang_thai: string;
  ngay_tao: string;
};

// Dữ liệu giả lập
const mockOrders: Order[] = [
  {
    ma_don_hang: 1,
    ten_khach_hang: "Nguyễn Văn A",
    tong_tien: 1500000,
    trang_thai: "Chờ xử lý",
    ngay_tao: "2025-06-01T10:00:00Z",
  },
  {
    ma_don_hang: 2,
    ten_khach_hang: "Trần Thị B",
    tong_tien: 2300000,
    trang_thai: "Đang giao",
    ngay_tao: "2025-06-02T12:00:00Z",
  },
  {
    ma_don_hang: 3,
    ten_khach_hang: "Lê Văn C",
    tong_tien: 1800000,
    trang_thai: "Hoàn thành",
    ngay_tao: "2025-06-03T14:00:00Z",
  },
  {
    ma_don_hang: 4,
    ten_khach_hang: "Phạm Thị D",
    tong_tien: 900000,
    trang_thai: "Đã hủy",
    ngay_tao: "2025-06-04T16:00:00Z",
  },
  // Added more mock data to demonstrate pagination
  {
    ma_don_hang: 5,
    ten_khach_hang: "Hoàng Văn E",
    tong_tien: 1200000,
    trang_thai: "Chờ xử lý",
    ngay_tao: "2025-06-05T09:00:00Z",
  },
  {
    ma_don_hang: 6,
    ten_khach_hang: "Ngô Thị F",
    tong_tien: 2500000,
    trang_thai: "Đang giao",
    ngay_tao: "2025-06-06T11:00:00Z",
  },
  {
    ma_don_hang: 7,
    ten_khach_hang: "Đinh Văn G",
    tong_tien: 1700000,
    trang_thai: "Hoàn thành",
    ngay_tao: "2025-06-07T13:00:00Z",
  },
  {
    ma_don_hang: 8,
    ten_khach_hang: "Vũ Thị H",
    tong_tien: 1100000,
    trang_thai: "Đã hủy",
    ngay_tao: "2025-06-08T15:00:00Z",
  },
  {
    ma_don_hang: 9,
    ten_khach_hang: "Bùi Văn I",
    tong_tien: 1900000,
    trang_thai: "Chờ xử lý",
    ngay_tao: "2025-06-09T17:00:00Z",
  },
  {
    ma_don_hang: 10,
    ten_khach_hang: "Lý Thị K",
    tong_tien: 2100000,
    trang_thai: "Đang giao",
    ngay_tao: "2025-06-10T19:00:00Z",
  },
  {
    ma_don_hang: 11,
    ten_khach_hang: "Trương Văn L",
    tong_tien: 1600000,
    trang_thai: "Hoàn thành",
    ngay_tao: "2025-06-11T21:00:00Z",
  },
];

// Hàm ánh xạ trạng thái với màu sắc
const getStatusColor = (status: string) => {
  switch (status) {
    case "Chờ xử lý":
      return "bg-yellow-100 text-yellow-800";
    case "Đang giao":
      return "bg-blue-100 text-blue-800";
    case "Hoàn thành":
      return "bg-green-100 text-green-800";
    case "Đã hủy":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const QLDonHang = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [loading] = useState(false);
  const [editingItem, setEditingItem] = useState<Order | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    ten_khach_hang: "",
    tong_tien: "",
    trang_thai: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const resetForm = () => {
    setFormData({
      ten_khach_hang: "",
      tong_tien: "",
      trang_thai: "",
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const startEdit = (order: Order) => {
    setEditingItem(order);
    setShowAddForm(true);
    setFormData({
      ten_khach_hang: order.ten_khach_hang,
      tong_tien: order.tong_tien.toString(),
      trang_thai: order.trang_thai,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
      const updatedOrders = orders.filter((order) => order.ma_don_hang !== id);
      setOrders(updatedOrders);
      const totalPages = Math.ceil(updatedOrders.length / ITEMS_PER_PAGE);
      if (
        updatedOrders.length % ITEMS_PER_PAGE === 0 &&
        currentPage > totalPages &&
        totalPages > 0
      ) {
        setCurrentPage(totalPages);
      } else if (updatedOrders.length === 0) {
        setCurrentPage(1);
      }
      alert("Xóa đơn hàng thành công!");
    }
  };

  const handleSave = () => {
    // Kiểm tra dữ liệu form
    if (
      !formData.ten_khach_hang.trim() ||
      !formData.tong_tien.trim() ||
      !formData.trang_thai.trim()
    ) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }
    const tongTien = parseFloat(formData.tong_tien);
    if (isNaN(tongTien) || tongTien <= 0) {
      alert("Tổng tiền phải là số dương!");
      return;
    }

    const newOrder: Order = {
      ma_don_hang: editingItem
        ? editingItem.ma_don_hang
        : orders.length > 0
          ? Math.max(...orders.map((o) => o.ma_don_hang)) + 1
          : 1,
      ten_khach_hang: formData.ten_khach_hang,
      tong_tien: tongTien,
      trang_thai: formData.trang_thai,
      ngay_tao: editingItem ? editingItem.ngay_tao : new Date().toISOString(),
    };

    if (editingItem) {
      setOrders(
        orders.map((order) =>
          order.ma_don_hang === editingItem.ma_don_hang ? newOrder : order
        )
      );
      alert("Cập nhật đơn hàng thành công!");
    } else {
      const newOrders = [...orders, newOrder];
      setOrders(newOrders);
      const newTotalPages = Math.ceil(newOrders.length / ITEMS_PER_PAGE);
      setCurrentPage(newTotalPages);
      alert("Thêm đơn hàng thành công!");
    }
    resetForm();
  };

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const lastItemIndex = currentPage * ITEMS_PER_PAGE;
  const firstItemIndex = lastItemIndex - ITEMS_PER_PAGE;
  const currentOrders = orders.slice(firstItemIndex, lastItemIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm đơn hàng
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border">
          <h3 className="text-xl font-semibold mb-4">
            {editingItem ? "Sửa đơn hàng" : "Thêm đơn hàng mới"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên khách hàng *
              </label>
              <input
                type="text"
                value={formData.ten_khach_hang}
                onChange={(e) =>
                  setFormData({ ...formData, ten_khach_hang: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên khách hàng..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tổng tiền *
              </label>
              <input
                type="number"
                value={formData.tong_tien}
                onChange={(e) =>
                  setFormData({ ...formData, tong_tien: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tổng tiền..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái *
              </label>
              <select
                value={formData.trang_thai}
                onChange={(e) =>
                  setFormData({ ...formData, trang_thai: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="" disabled>
                  Chọn trạng thái...
                </option>
                <option value="Chờ xử lý">Chờ xử lý</option>
                <option value="Đang giao">Đang giao</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingItem ? "Cập nhật" : "Thêm mới"}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <tr key={order.ma_don_hang} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.ma_don_hang}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center text-blue-800 text-sm font-medium mr-3">
                          {order.ten_khach_hang}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.tong_tien.toLocaleString("vi-VN")} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.trang_thai
                        )}`}
                      >
                        {order.trang_thai}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.ngay_tao).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(order)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.ma_don_hang)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentOrders.length === 0 && orders.length > 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Không có dữ liệu trên trang này
                </h3>
              </div>
            )}

            {orders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Chưa có đơn hàng nào
                </h3>
                <p className="text-gray-500">
                  Nhấn nút "Thêm đơn hàng" để bắt đầu
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <span className="text-sm text-gray-700">
                Hiển thị {firstItemIndex + 1}-
                {Math.min(lastItemIndex, orders.length)} trên tổng số{" "}
                {orders.length} đơn hàng
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QLDonHang;
