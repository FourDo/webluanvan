import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Ruler } from "lucide-react";
import { fetchSizes, deleteSize, saveSize } from "../API/sizeApi";

interface Size {
  ma_kich_thuoc: number;
  ten_kich_thuoc: string;
  mo_ta: string;
  ngay_tao: string;
}

// <<< THÊM MỚI: Định nghĩa hằng số cho số lượng mục trên mỗi trang
const ITEMS_PER_PAGE = 5;

const QLKichThuoc = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Size | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    ten_kich_thuoc: "",
    mo_ta: "",
  });

  // <<< THÊM MỚI: State để quản lý trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);

  const resetForm = () => {
    setFormData({
      ten_kich_thuoc: "",
      mo_ta: "",
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const startEdit = (size: Size) => {
    setEditingItem(size);
    setShowAddForm(true);
    setFormData({
      ten_kich_thuoc: size.ten_kich_thuoc,
      mo_ta: size.mo_ta,
    });
  };

  useEffect(() => {
    const loadSizes = async () => {
      setLoading(true);
      const result = await fetchSizes();
      if (result.success) {
        setSizes(result.data);
      }
      setLoading(false);
    };
    loadSizes();
  }, []);

  const handleDelete = async (id: number) => {
    const result = await deleteSize(id);
    if (result.success) {
      const updatedSizes = sizes.filter((size) => size.ma_kich_thuoc !== id);
      setSizes(updatedSizes);

      // <<< THÊM MỚI: Cập nhật lại trang hiện tại nếu trang cuối cùng bị xóa hết
      const totalPages = Math.ceil(updatedSizes.length / ITEMS_PER_PAGE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else if (updatedSizes.length === 0) {
        setCurrentPage(1);
      }

      alert("Xóa kích thước thành công!");
    } else if (result.error) {
      alert(result.error);
    }
  };

  const handleSave = async () => {
    const result = await saveSize(formData, editingItem);
    if (result.success) {
      if (editingItem) {
        setSizes(
          sizes.map((size) =>
            size.ma_kich_thuoc === editingItem.ma_kich_thuoc
              ? result.data
              : size
          )
        );
        alert("Cập nhật kích thước thành công!");
      } else {
        const newSizes = [...sizes, result.data];
        setSizes(newSizes);

        // <<< THÊM MỚI: Tự động chuyển đến trang cuối cùng khi thêm mới
        const newTotalPages = Math.ceil(newSizes.length / ITEMS_PER_PAGE);
        setCurrentPage(newTotalPages);

        alert("Thêm kích thước thành công!");
      }
      resetForm();
    } else if (result.error) {
      alert(result.error);
    }
  };

  // <<< THÊM MỚI: Tính toán dữ liệu cho trang hiện tại
  const totalPages = Math.ceil(sizes.length / ITEMS_PER_PAGE);
  const lastItemIndex = currentPage * ITEMS_PER_PAGE;
  const firstItemIndex = lastItemIndex - ITEMS_PER_PAGE;
  const currentSizes = sizes.slice(firstItemIndex, lastItemIndex);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Ruler className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý Kích thước
          </h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm kích thước
        </button>
      </div>

      {/* Add/Edit Form ... (giữ nguyên không đổi) */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border">
          <h3 className="text-xl font-semibold mb-4">
            {editingItem ? "Sửa kích thước" : "Thêm kích thước mới"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên kích thước *
              </label>
              <input
                type="text"
                value={formData.ten_kich_thuoc}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ten_kich_thuoc: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên kích thước (VD: S, M, L, XL)..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả *
              </label>
              <input
                type="text"
                value={formData.mo_ta}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mo_ta: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mô tả kích thước..."
              />
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

      {/* Loading ... (giữ nguyên không đổi) */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Sizes Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* ... thead giữ nguyên không đổi ... */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên kích thước
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
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
                {/* <<< CHỈNH SỬA: Lặp qua `currentSizes` thay vì `sizes` */}
                {currentSizes.map((size) => (
                  <tr key={size.ma_kich_thuoc} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {size.ma_kich_thuoc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mr-3">
                          {size.ten_kich_thuoc}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {size.mo_ta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(size.ngay_tao).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(size)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(size.ma_kich_thuoc)}
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

            {/* <<< CHỈNH SỬA: Hiển thị thông báo khi không có dữ liệu trên trang hiện tại */}
            {currentSizes.length === 0 && sizes.length > 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Không có dữ liệu trên trang này
                </h3>
              </div>
            )}

            {sizes.length === 0 && (
              <div className="text-center py-12">
                <Ruler className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Chưa có kích thước nào
                </h3>
                <p className="text-gray-500">
                  Nhấn nút "Thêm kích thước" để bắt đầu
                </p>
              </div>
            )}
          </div>

          {/* <<< THÊM MỚI: Component phân trang */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <span className="text-sm text-gray-700">
                Hiển thị {firstItemIndex + 1}-
                {Math.min(lastItemIndex, sizes.length)} trên tổng số{" "}
                {sizes.length} kích thước
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>
                <span className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
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

export default QLKichThuoc;
