import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Edit, Trash2, Save, X, Ruler, Loader2 } from "lucide-react";
import { fetchSizes, deleteSize, saveSize } from "../API/sizeApi";
import type { Size } from "../types/Size";

// Định nghĩa hằng số cho việc tải dữ liệu
const INITIAL_DISPLAY_COUNT = 15; // Số lượng hiển thị ban đầu
const LOAD_MORE_COUNT = 10; // Số lượng tải thêm mỗi lần

const QLKichThuoc = () => {
  // State chứa TOÀN BỘ danh sách kích thước từ API
  const [sizes, setSizes] = useState<Size[]>([]);
  // State chứa danh sách kích thước đang được HIỂN THỊ trên màn hình
  const [displayedSizes, setDisplayedSizes] = useState<Size[]>([]);

  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Size | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    ten_kich_thuoc: "",
    mo_ta: "",
  });

  // State quản lý số lượng mục hiển thị
  const [displayCount, setDisplayCount] = useState<number>(
    INITIAL_DISPLAY_COUNT
  );

  // Refs cho IntersectionObserver (cơ chế cuộn vô hạn)
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Hàm reset form
  const resetForm = () => {
    setFormData({ ten_kich_thuoc: "", mo_ta: "" });
    setEditingItem(null);
    setShowAddForm(false);
  };

  // Hàm bắt đầu chỉnh sửa
  const startEdit = (size: Size) => {
    setEditingItem(size);
    setShowAddForm(true);
    setFormData({
      ten_kich_thuoc: size.ten_kich_thuoc,
      mo_ta: size.mo_ta || "", // Đảm bảo mo_ta là chuỗi
    });
    // Tự động cuộn lên đầu trang để người dùng thấy form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Tải dữ liệu lần đầu
  useEffect(() => {
    const loadSizes = async () => {
      setLoading(true);
      try {
        const result = await fetchSizes();
        if (result.success) {
          setSizes(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch sizes:", error);
        alert("Không thể tải danh sách kích thước.");
      } finally {
        setLoading(false);
      }
    };
    loadSizes();
  }, []);

  // Cập nhật danh sách hiển thị khi `sizes` hoặc `displayCount` thay đổi
  useEffect(() => {
    setDisplayedSizes(sizes.slice(0, displayCount));
  }, [sizes, displayCount]);

  // Logic của IntersectionObserver để tải thêm
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && displayCount < sizes.length) {
        setDisplayCount((prev) => prev + LOAD_MORE_COUNT);
      }
    },
    [displayCount, sizes.length]
  );

  // Thiết lập và dọn dẹp IntersectionObserver
  useEffect(() => {
    const currentObserver = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    });
    observer.current = currentObserver;

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      currentObserver.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef) {
        currentObserver.unobserve(currentLoadMoreRef);
      }
    };
  }, [handleObserver]);

  // Xử lý xóa
  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa kích thước này? Thao tác này không thể hoàn tác."
      )
    )
      return;

    const result = await deleteSize(id);
    if (result.success) {
      setSizes((prevSizes) =>
        prevSizes.filter((size) => size.ma_kich_thuoc !== id)
      );
      alert("Xóa kích thước thành công!");
    } else if ("error" in result && result.error) {
      alert(`Lỗi khi xóa: ${result.error}`);
    }
  };

  // Xử lý lưu (Thêm mới / Cập nhật)
  const handleSave = async () => {
    if (!formData.ten_kich_thuoc.trim()) {
      alert("Tên kích thước không được để trống.");
      return;
    }

    const result = await saveSize(formData, editingItem);
    if (result.success) {
      if (editingItem) {
        // Cập nhật
        setSizes((prevSizes) =>
          prevSizes.map((size) =>
            size.ma_kich_thuoc === editingItem.ma_kich_thuoc
              ? result.data
              : size
          )
        );
        alert("Cập nhật kích thước thành công!");
      } else {
        // Thêm mới (đưa lên đầu danh sách)
        setSizes((prevSizes) => [result.data, ...prevSizes]);
        alert("Thêm kích thước thành công!");
      }
      resetForm();
    } else if (result.error) {
      alert(`Lỗi khi lưu: ${result.error}`);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý Kích thước
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm kích thước
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              {editingItem ? "Sửa kích thước" : "Thêm kích thước mới"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="ten_kich_thuoc"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tên kích thước *
                </label>
                <input
                  id="ten_kich_thuoc"
                  type="text"
                  value={formData.ten_kich_thuoc}
                  onChange={(e) =>
                    setFormData({ ...formData, ten_kich_thuoc: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="VD: S, M, L, XL, 40, 41..."
                />
              </div>
              <div>
                <label
                  htmlFor="mo_ta"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mô tả (Không bắt buộc)
                </label>
                <input
                  id="mo_ta"
                  type="text"
                  value={formData.mo_ta}
                  onChange={(e) =>
                    setFormData({ ...formData, mo_ta: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="VD: Size nhỏ, Dành cho người dưới 60kg..."
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

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Sizes Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tên kích thước
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedSizes.map((size, index) => (
                    <tr
                      key={size.ma_kich_thuoc}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
                          {size.ten_kich_thuoc}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {size.mo_ta || (
                          <span className="text-gray-400 italic">Không có</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(size.ngay_tao).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(size)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded-full"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(size.ma_kich_thuoc)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded-full"
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
            </div>

            {/* Thông báo khi không có dữ liệu */}
            {sizes.length === 0 && (
              <div className="text-center py-16">
                <Ruler className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Chưa có kích thước nào
                </h3>
                <p className="text-gray-500">
                  Nhấn nút "Thêm kích thước" để bắt đầu
                </p>
              </div>
            )}

            {/* Indicator để tải thêm dữ liệu */}
            {displayCount < sizes.length && (
              <div
                ref={loadMoreRef}
                className="flex justify-center items-center py-6 text-gray-500"
              >
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang tải thêm...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QLKichThuoc;
