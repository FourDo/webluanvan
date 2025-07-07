import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Edit, Trash2, Save, X, Folder, Loader2 } from "lucide-react";
import categoryApi from "../API/categoryApi";
import type {
  Category,
  CreateCategoryCredentials,
  UpdateCategoryCredentials,
} from "../types/category";

// Định nghĩa hằng số cho việc tải dữ liệu
const INITIAL_DISPLAY_COUNT = 15; // Số lượng hiển thị ban đầu
const LOAD_MORE_COUNT = 10; // Số lượng tải thêm mỗi lần

const QLDoanhMuc = () => {
  // State chứa TOÀN BỘ danh sách danh mục từ API
  const [categories, setCategories] = useState<Category[]>([]);
  // State chứa danh sách danh mục đang được HIỂN THỊ trên màn hình
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // State riêng cho việc submit form
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryCredentials>({
    ten_danh_muc: "",
    mo_ta: "",
  });
  const [error, setError] = useState<string | null>(null);

  // State quản lý số lượng mục hiển thị
  const [displayCount, setDisplayCount] = useState<number>(
    INITIAL_DISPLAY_COUNT
  );

  // Refs cho IntersectionObserver
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Tải danh sách danh mục ban đầu
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (err) {
        setError("Không thể tải danh sách danh mục.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Cập nhật danh sách hiển thị khi `categories` hoặc `displayCount` thay đổi
  useEffect(() => {
    setDisplayedCategories(categories.slice(0, displayCount));
  }, [categories, displayCount]);

  // Logic của IntersectionObserver để tải thêm
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        !loading &&
        displayCount < categories.length
      ) {
        setDisplayCount((prev) => prev + LOAD_MORE_COUNT);
      }
    },
    [displayCount, categories.length, loading]
  );

  // Thiết lập và dọn dẹp IntersectionObserver
  useEffect(() => {
    const currentObserver = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "40px",
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

  const resetForm = () => {
    setFormData({ ten_danh_muc: "", mo_ta: "" });
    setEditingItem(null);
    setShowAddForm(false);
    setError(null);
  };

  const startEdit = (category: Category) => {
    setEditingItem(category);
    setShowAddForm(true);
    setFormData({
      ten_danh_muc: category.ten_danh_muc,
      mo_ta: category.mo_ta || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryApi.delete(id);
        setCategories((prev) => prev.filter((cat) => cat.ma_danh_muc !== id));
        alert("Xóa danh mục thành công!");
      } catch (err) {
        alert("Xóa danh mục thất bại. Vui lòng thử lại.");
      }
    }
  };

  const handleSave = async () => {
    if (!formData.ten_danh_muc.trim()) {
      alert("Tên danh mục không được để trống.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingItem) {
        // Cập nhật
        const credentials: UpdateCategoryCredentials = { ...formData };
        const response = await categoryApi.update(
          editingItem.ma_danh_muc,
          credentials
        );
        setCategories((prev) =>
          prev.map((cat) =>
            cat.ma_danh_muc === editingItem.ma_danh_muc ? response.data : cat
          )
        );
        alert("Cập nhật danh mục thành công!");
      } else {
        // Thêm mới
        const credentials: CreateCategoryCredentials = { ...formData };
        const response = await categoryApi.create(credentials);
        setCategories((prev) => [response.data, ...prev]);
        alert("Thêm danh mục thành công!");
      }
      resetForm();
    } catch (err) {
      const message = editingItem
        ? "Cập nhật danh mục thất bại."
        : "Thêm danh mục thất bại.";
      setError(message);
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Danh mục</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={isSubmitting}
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm danh mục
          </button>
        </div>

        {/* Form thêm/sửa */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              {editingItem ? "Sửa danh mục" : "Thêm danh mục mới"}
            </h3>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="ten_danh_muc"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tên danh mục *
                </label>
                <input
                  id="ten_danh_muc"
                  type="text"
                  value={formData.ten_danh_muc}
                  onChange={(e) =>
                    setFormData({ ...formData, ten_danh_muc: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="VD: Áo Thun, Quần Jean..."
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label
                  htmlFor="mo_ta"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mô tả
                </label>
                <input
                  id="mo_ta"
                  type="text"
                  value={formData.mo_ta}
                  onChange={(e) =>
                    setFormData({ ...formData, mo_ta: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Mô tả ngắn về danh mục..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSave}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSubmitting
                  ? "Đang lưu..."
                  : editingItem
                    ? "Cập nhật"
                    : "Thêm mới"}
              </button>
              <button
                onClick={resetForm}
                className="flex items-center px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách danh mục...</p>
          </div>
        ) : (
          <>
            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tên danh mục
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
                  {displayedCategories.map((category, index) => (
                    <tr
                      key={category.ma_danh_muc}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.ten_danh_muc}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.mo_ta || (
                          <span className="text-gray-400 italic">Không có</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.ngay_tao).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(category)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded-full"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.ma_danh_muc)}
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
            {!loading && categories.length === 0 && (
              <div className="text-center py-16">
                <Folder className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Chưa có danh mục nào
                </h3>
                <p className="text-gray-500">
                  Nhấn nút "Thêm danh mục" để bắt đầu quản lý.
                </p>
              </div>
            )}

            {/* Indicator tải thêm */}
            {displayCount < categories.length && (
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

export default QLDoanhMuc;
