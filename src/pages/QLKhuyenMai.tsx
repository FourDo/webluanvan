import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Percent, Loader2 } from "lucide-react";
// Import các hàm API và kiểu dữ liệu
import {
  fetchPromotions,
  savePromotion,
  deletePromotion,
  type Promotion,
  type PromotionFormData,
} from "../API/promotionApi"; // Điều chỉnh đường dẫn nếu cần

const ITEMS_PER_PAGE = 5;

// Hàm định dạng ngày tháng để hiển thị
const formatDateForDisplay = (dateString: string) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Hàm định dạng ngày tháng cho input datetime-local
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Cần bù trừ múi giờ để hiển thị đúng trên input
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const QLKhuyenMai = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingItem, setEditingItem] = useState<Promotion | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const initialFormData = {
    ten_khuyen_mai: "",
    phan_tram_giam: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
  };
  const [formData, setFormData] = useState<PromotionFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [currentPage, setCurrentPage] = useState(1);

  // Tải dữ liệu lần đầu
  useEffect(() => {
    const loadPromotions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPromotions();
        setPromotions(data);
      } catch (err) {
        setError((err as Error).message || "Không thể tải dữ liệu khuyến mãi.");
      } finally {
        setLoading(false);
      }
    };
    loadPromotions();
  }, []);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingItem(null);
    setShowAddForm(false);
    setFormErrors({});
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData(initialFormData);
    setShowAddForm(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingItem(promotion);
    setFormData({
      ten_khuyen_mai: promotion.ten_khuyen_mai,
      phan_tram_giam: promotion.phan_tram_giam.toString(),
      ngay_bat_dau: formatDateForInput(promotion.ngay_bat_dau),
      ngay_ket_thuc: formatDateForInput(promotion.ngay_ket_thuc),
    });
    setShowAddForm(true);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.ten_khuyen_mai.trim())
      errors.ten_khuyen_mai = "Tên khuyến mãi là bắt buộc.";

    const phanTram = Number(formData.phan_tram_giam);
    if (isNaN(phanTram) || phanTram <= 0 || phanTram > 100)
      errors.phan_tram_giam = "Phần trăm giảm phải là số từ 1 đến 100.";

    if (!formData.ngay_bat_dau)
      errors.ngay_bat_dau = "Ngày bắt đầu là bắt buộc.";
    if (!formData.ngay_ket_thuc)
      errors.ngay_ket_thuc = "Ngày kết thúc là bắt buộc.";

    if (
      formData.ngay_bat_dau &&
      formData.ngay_ket_thuc &&
      new Date(formData.ngay_bat_dau) >= new Date(formData.ngay_ket_thuc)
    ) {
      errors.ngay_ket_thuc = "Ngày kết thúc phải sau ngày bắt đầu.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const savedPromotion = await savePromotion(
        formData,
        editingItem ? editingItem.ma_khuyen_mai : null
      );
      if (editingItem) {
        setPromotions(
          promotions.map((p) =>
            p.ma_khuyen_mai === savedPromotion.ma_khuyen_mai
              ? savedPromotion
              : p
          )
        );
      } else {
        const newPromotionsList = [...promotions, savedPromotion];
        setPromotions(newPromotionsList);
        // Tự động chuyển đến trang cuối sau khi thêm mới
        setCurrentPage(Math.ceil(newPromotionsList.length / ITEMS_PER_PAGE));
      }
      resetForm();
    } catch (err) {
      setError((err as Error).message || "Lưu khuyến mãi thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      setIsSubmitting(true); // Dùng isSubmitting để khóa các nút khác
      try {
        await deletePromotion(id);
        const updatedPromotions = promotions.filter(
          (p) => p.ma_khuyen_mai !== id
        );
        setPromotions(updatedPromotions);

        // Điều chỉnh trang hiện tại nếu cần
        const totalPages = Math.ceil(updatedPromotions.length / ITEMS_PER_PAGE);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        } else if (updatedPromotions.length === 0) {
          setCurrentPage(1);
        }
      } catch (err) {
        setError((err as Error).message || "Xóa khuyến mãi thất bại.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Logic phân trang
  const totalPages = Math.ceil(promotions.length / ITEMS_PER_PAGE);
  const currentPromotions = promotions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Percent className="w-8 h-8 text-blue-600" />
            Quản lý Khuyến mãi
          </h1>
          <button
            onClick={handleAddNew}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm khuyến mãi
          </button>
        </div>

        {/* Form Thêm/Sửa */}
        {showAddForm && (
          <div className="border rounded-lg p-6 mb-6 bg-slate-50">
            <h3 className="text-xl font-semibold mb-4">
              {editingItem ? "Sửa khuyến mãi" : "Thêm khuyến mãi mới"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Tên khuyến mãi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khuyến mãi *
                </label>
                <input
                  type="text"
                  value={formData.ten_khuyen_mai}
                  onChange={(e) =>
                    setFormData({ ...formData, ten_khuyen_mai: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.ten_khuyen_mai ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.ten_khuyen_mai && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.ten_khuyen_mai}
                  </p>
                )}
              </div>
              {/* Phần trăm giảm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phần trăm giảm (%) *
                </label>
                <input
                  type="number"
                  value={formData.phan_tram_giam}
                  onChange={(e) =>
                    setFormData({ ...formData, phan_tram_giam: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.phan_tram_giam ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.phan_tram_giam && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.phan_tram_giam}
                  </p>
                )}
              </div>
              {/* Ngày bắt đầu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu *
                </label>
                <input
                  type="datetime-local"
                  value={formData.ngay_bat_dau}
                  onChange={(e) =>
                    setFormData({ ...formData, ngay_bat_dau: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.ngay_bat_dau ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.ngay_bat_dau && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.ngay_bat_dau}
                  </p>
                )}
              </div>
              {/* Ngày kết thúc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày kết thúc *
                </label>
                <input
                  type="datetime-local"
                  value={formData.ngay_ket_thuc}
                  onChange={(e) =>
                    setFormData({ ...formData, ngay_ket_thuc: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.ngay_ket_thuc ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.ngay_ket_thuc && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.ngay_ket_thuc}
                  </p>
                )}
              </div>
            </div>
            {/* Nút bấm */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
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
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400"
              >
                <X className="w-4 h-4 mr-2" /> Hủy
              </button>
            </div>
          </div>
        )}

        {/* Hiển thị lỗi chung */}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {/* Nội dung chính: Loading, Trạng thái rỗng, hoặc Bảng dữ liệu */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-16">
            <Percent className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chưa có khuyến mãi nào
            </h3>
            <p className="text-gray-500">
              Nhấn nút "Thêm khuyến mãi" để bắt đầu.
            </p>
          </div>
        ) : (
          <>
            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Tên khuyến mãi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Giảm giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Bắt đầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Kết thúc
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPromotions.map((p, index) => (
                    <tr key={p.ma_khuyen_mai} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {p.ten_khuyen_mai}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                        {p.phan_tram_giam}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateForDisplay(p.ngay_bat_dau)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateForDisplay(p.ngay_ket_thuc)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.ma_khuyen_mai)}
                            className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
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

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <span className="text-sm text-gray-700">
                  Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, promotions.length)}{" "}
                  trên {promotions.length}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((c) => c - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-white border rounded-md disabled:opacity-50"
                  >
                    Trang trước
                  </button>
                  <span className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((c) => c + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-white border rounded-md disabled:opacity-50"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QLKhuyenMai;
