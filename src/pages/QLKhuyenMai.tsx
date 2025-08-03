import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Loader2, Tag } from "lucide-react";
// Import các hàm API và kiểu dữ liệu
import {
  fetchVouchers,
  saveVoucher,
  deleteVoucher,
  type Voucher,
  type VoucherFormData,
} from "../API/promotionApi";

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
  return date.toISOString().slice(0, 10); // Chỉ lấy YYYY-MM-DD
};

const QLVoucher = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingItem, setEditingItem] = useState<Voucher | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const initialFormData: VoucherFormData = {
    ma_giam_gia: "",
    mo_ta: "",
    loai_khuyen_mai: "%",
    gia_tri_giam: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    trang_thai: "hoat_dong",
  };
  const [formData, setFormData] = useState<VoucherFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [currentPage, setCurrentPage] = useState(1);

  // Tải dữ liệu lần đầu
  useEffect(() => {
    const loadVouchers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVouchers();
        // Đảm bảo data luôn là array
        setVouchers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError((err as Error).message || "Không thể tải dữ liệu voucher.");
        setVouchers([]); // Đặt về array rỗng khi có lỗi
      } finally {
        setLoading(false);
      }
    };
    loadVouchers();
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

  const handleEdit = (voucher: Voucher) => {
    setEditingItem(voucher);
    setFormData({
      ma_giam_gia: voucher.ma_giam_gia,
      mo_ta: voucher.mo_ta,
      loai_khuyen_mai: voucher.loai_khuyen_mai,
      gia_tri_giam: voucher.gia_tri_giam.toString(),
      ngay_bat_dau: formatDateForInput(voucher.ngay_bat_dau),
      ngay_ket_thuc: formatDateForInput(voucher.ngay_ket_thuc),
      trang_thai: voucher.trang_thai,
    });
    setShowAddForm(true);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.ma_giam_gia.trim())
      errors.ma_giam_gia = "Mã giảm giá là bắt buộc.";

    if (!formData.mo_ta.trim()) errors.mo_ta = "Mô tả là bắt buộc.";

    const giaTriGiam = Number(formData.gia_tri_giam);
    if (isNaN(giaTriGiam) || giaTriGiam <= 0) {
      errors.gia_tri_giam = "Giá trị giảm phải lớn hơn 0.";
    } else if (formData.loai_khuyen_mai === "%" && giaTriGiam > 100) {
      errors.gia_tri_giam = "Phần trăm giảm không được vượt quá 100%.";
    }

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
      const savedVoucher = await saveVoucher(
        formData,
        editingItem ? editingItem.ma_voucher : null
      );
      if (editingItem) {
        setVouchers(
          vouchers.map((v) =>
            v.ma_voucher === savedVoucher.ma_voucher ? savedVoucher : v
          )
        );
      } else {
        const newVouchersList = [...vouchers, savedVoucher];
        setVouchers(newVouchersList);
        // Tự động chuyển đến trang cuối sau khi thêm mới
        setCurrentPage(Math.ceil(newVouchersList.length / ITEMS_PER_PAGE));
      }
      resetForm();
    } catch (err) {
      setError((err as Error).message || "Lưu voucher thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
      setIsSubmitting(true);
      try {
        await deleteVoucher(id);
        const updatedVouchers = vouchers.filter((v) => v.ma_voucher !== id);
        setVouchers(updatedVouchers);

        // Điều chỉnh trang hiện tại nếu cần
        const totalPages = Math.ceil(updatedVouchers.length / ITEMS_PER_PAGE);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        } else if (updatedVouchers.length === 0) {
          setCurrentPage(1);
        }
      } catch (err) {
        setError((err as Error).message || "Xóa voucher thất bại.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Logic phân trang
  const totalPages = Math.ceil(vouchers.length / ITEMS_PER_PAGE);
  const currentVouchers = vouchers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Tag className="w-8 h-8 text-blue-600" />
            Quản lý Voucher
          </h1>
          <button
            onClick={handleAddNew}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm voucher
          </button>
        </div>

        {/* Form Thêm/Sửa */}
        {showAddForm && (
          <div className="border rounded-lg p-6 mb-6 bg-slate-50">
            <h3 className="text-xl font-semibold mb-4">
              {editingItem ? "Sửa voucher" : "Thêm voucher mới"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Mã giảm giá */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã giảm giá *
                </label>
                <input
                  type="text"
                  value={formData.ma_giam_gia}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ma_giam_gia: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="VD: CHECKKMCOMMAND"
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.ma_giam_gia ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.ma_giam_gia && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.ma_giam_gia}
                  </p>
                )}
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả *
                </label>
                <input
                  type="text"
                  value={formData.mo_ta}
                  onChange={(e) =>
                    setFormData({ ...formData, mo_ta: e.target.value })
                  }
                  placeholder="VD: Giảm 30% cho đơn hàng từ 500.000đ"
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.mo_ta ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.mo_ta && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.mo_ta}
                  </p>
                )}
              </div>

              {/* Loại khuyến mãi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại giảm giá *
                </label>
                <select
                  value={formData.loai_khuyen_mai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loai_khuyen_mai: e.target.value as "%" | "tien",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="%">Phần trăm (%)</option>
                  <option value="tien">Số tiền (VND)</option>
                </select>
              </div>

              {/* Giá trị giảm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá trị giảm *
                </label>
                <input
                  type="number"
                  value={formData.gia_tri_giam}
                  onChange={(e) =>
                    setFormData({ ...formData, gia_tri_giam: e.target.value })
                  }
                  placeholder={
                    formData.loai_khuyen_mai === "%" ? "VD: 30" : "VD: 50000"
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.gia_tri_giam ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.gia_tri_giam && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.gia_tri_giam}
                  </p>
                )}
              </div>

              {/* Ngày bắt đầu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu *
                </label>
                <input
                  type="date"
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
                  type="date"
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

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái *
                </label>
                <select
                  value={formData.trang_thai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trang_thai: e.target.value as
                        | "hoat_dong"
                        | "het_han"
                        | "vo_hieu",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="hoat_dong">Hoạt động</option>
                  <option value="het_han">Hết hạn</option>
                  <option value="vo_hieu">Vô hiệu</option>
                </select>
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
        ) : vouchers.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chưa có voucher nào
            </h3>
            <p className="text-gray-500">Nhấn nút "Thêm voucher" để bắt đầu.</p>
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
                      Mã giảm giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Giá trị giảm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Ngày bắt đầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Ngày kết thúc
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentVouchers.map((v, index) => (
                    <tr key={v.ma_voucher} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">
                        {v.ma_giam_gia}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {v.mo_ta}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                        {v.gia_tri_giam}
                        {v.loai_khuyen_mai}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateForDisplay(v.ngay_bat_dau)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateForDisplay(v.ngay_ket_thuc)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            v.trang_thai === "hoat_dong"
                              ? "bg-green-100 text-green-800"
                              : v.trang_thai === "het_han"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {v.trang_thai === "hoat_dong"
                            ? "Hoạt động"
                            : v.trang_thai === "het_han"
                              ? "Hết hạn"
                              : "Vô hiệu"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(v)}
                            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.ma_voucher)}
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
                  {Math.min(currentPage * ITEMS_PER_PAGE, vouchers.length)} trên{" "}
                  {vouchers.length}
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

export default QLVoucher;
