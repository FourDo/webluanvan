import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Palette } from "lucide-react";
import { fetchColors, deleteColor, saveColor } from "../API/colorApi";

interface Color {
  ma_mau_sac: number;
  ten_mau_sac: string;
  mo_ta: string;
  ngay_tao: string;
}

// <<< THÊM MỚI: Định nghĩa hằng số cho số lượng mục trên mỗi trang
const ITEMS_PER_PAGE = 5;

const QLMauSac = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Color | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    ten_mau_sac: "",
    mo_ta: "",
  });

  // <<< THÊM MỚI: State để quản lý trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);

  const resetForm = () => {
    setFormData({
      ten_mau_sac: "",
      mo_ta: "",
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const startEdit = (color: Color) => {
    setEditingItem(color);
    setShowAddForm(true);
    setFormData({
      ten_mau_sac: color.ten_mau_sac,
      mo_ta: color.mo_ta,
    });
  };

  useEffect(() => {
    const loadColors = async () => {
      setLoading(true);
      const result = await fetchColors();
      if (result.success) {
        setColors(result.data);
      }
      setLoading(false);
    };
    loadColors();
  }, []);

  const handleDelete = async (id: number) => {
    const result = await deleteColor(id);
    if (result.success) {
      const updatedColors = colors.filter((color) => color.ma_mau_sac !== id);
      setColors(updatedColors);

      // <<< THÊM MỚI: Cập nhật lại trang hiện tại nếu trang cuối cùng bị xóa hết
      const totalPages = Math.ceil(updatedColors.length / ITEMS_PER_PAGE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else if (updatedColors.length === 0) {
        setCurrentPage(1);
      }

      alert("Xóa màu sắc thành công!");
    } else if (result.error) {
      alert(result.error);
    }
  };

  const handleSave = async () => {
    const result = await saveColor(formData, editingItem);
    if (result.success) {
      if (editingItem) {
        setColors(
          colors.map((color) =>
            color.ma_mau_sac === editingItem.ma_mau_sac ? result.data : color
          )
        );
        alert("Cập nhật màu sắc thành công!");
      } else {
        const newColors = [...colors, result.data];
        setColors(newColors);

        // <<< THÊM MỚI: Tự động chuyển đến trang cuối cùng khi thêm mới
        const newTotalPages = Math.ceil(newColors.length / ITEMS_PER_PAGE);
        setCurrentPage(newTotalPages);

        alert("Thêm màu sắc thành công!");
      }
      resetForm();
    } else if (result.error) {
      alert(result.error);
    }
  };

  const getColorValue = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      Trắng: "#FFFFFF",
      Đen: "#000000",
      Xám: "#808080",
      Nâu: "#A0522D",
      "Xanh dương": "#0066CC",
      Đỏ: "#FF0000",
      Vàng: "#FFD700",
      "Xanh lá": "#00AA00",
      Hồng: "#FF69B4",
      Beige: "#F5F5DC",
    };
    return colorMap[colorName] || "#CCCCCC";
  };

  // <<< THÊM MỚI: Tính toán dữ liệu cho trang hiện tại
  const totalPages = Math.ceil(colors.length / ITEMS_PER_PAGE);
  const lastItemIndex = currentPage * ITEMS_PER_PAGE;
  const firstItemIndex = lastItemIndex - ITEMS_PER_PAGE;
  const currentColors = colors.slice(firstItemIndex, lastItemIndex);

  return (
    <div className="p-6">
      {/* Header (giữ nguyên không đổi) */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Palette className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Màu sắc</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm màu sắc
        </button>
      </div>

      {/* Add/Edit Form (giữ nguyên không đổi) */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border">
          <h3 className="text-xl font-semibold mb-4">
            {editingItem ? "Sửa màu sắc" : "Thêm màu sắc mới"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên màu sắc *
              </label>
              <input
                type="text"
                value={formData.ten_mau_sac}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ten_mau_sac: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên màu sắc..."
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
                placeholder="Nhập mô tả màu sắc..."
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

      {/* Loading (giữ nguyên không đổi) */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Colors Table */}
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
                    Màu sắc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên màu
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
                {/* <<< CHỈNH SỬA: Lặp qua `currentColors` thay vì `colors` */}
                {currentColors.map((color) => (
                  <tr key={color.ma_mau_sac} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {color.ma_mau_sac}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{
                            backgroundColor: getColorValue(color.ten_mau_sac),
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {color.ten_mau_sac}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {color.mo_ta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(color.ngay_tao).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(color)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(color.ma_mau_sac)}
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
            {currentColors.length === 0 && colors.length > 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Không có dữ liệu trên trang này
                </h3>
              </div>
            )}

            {colors.length === 0 && (
              <div className="text-center py-12">
                <Palette className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Chưa có màu sắc nào
                </h3>
                <p className="text-gray-500">
                  Nhấn nút "Thêm màu sắc" để bắt đầu
                </p>
              </div>
            )}
          </div>

          {/* <<< THÊM MỚI: Component phân trang */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <span className="text-sm text-gray-700">
                Hiển thị {firstItemIndex + 1}-
                {Math.min(lastItemIndex, colors.length)} trên tổng số{" "}
                {colors.length} màu sắc
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

export default QLMauSac;
