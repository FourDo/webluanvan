import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Tag,
  Percent,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { voucherApi } from "../API/promotionApi";
import type { Voucher, VoucherCreate } from "../API/promotionApi";
import categoryApi from "../API/categoryApi";
import { productApi } from "../API/productApi";

// Voucher Form Modal Component
const VoucherFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (voucherData: Partial<VoucherCreate>) => void;
  voucher?: Voucher | null;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onSave, voucher, isLoading = false }) => {
  const [formData, setFormData] = useState<{
    ma_giam_gia: string;
    mo_ta: string;
    loai_khuyen_mai: "%" | "tien";
    gia_tri_giam: number;
    giam_toi_da: number;
    don_toi_thieu: number;
    ap_dung_toan_bo: boolean;
    gioi_han_su_dung: number;
    ma_san_pham: number | null;
    ma_danh_muc: number | null;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
    trang_thai: "hoat_dong" | "het_han" | "vo_hieu";
  }>({
    ma_giam_gia: "",
    mo_ta: "",
    loai_khuyen_mai: "%",
    gia_tri_giam: 0,
    giam_toi_da: 0,
    don_toi_thieu: 0,
    ap_dung_toan_bo: true,
    gioi_han_su_dung: 0,
    ma_san_pham: null,
    ma_danh_muc: null,
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    trang_thai: "hoat_dong",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Load categories and products
      loadCategories();
      loadProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (voucher) {
      setFormData({
        ma_giam_gia: voucher.ma_giam_gia || "",
        mo_ta: voucher.mo_ta || "",
        loai_khuyen_mai: voucher.loai_khuyen_mai || "%",
        gia_tri_giam: voucher.gia_tri_giam || 0,
        giam_toi_da: voucher.giam_toi_da || 0,
        don_toi_thieu: voucher.don_toi_thieu || 0,
        ap_dung_toan_bo: voucher.ap_dung_toan_bo ?? true,
        gioi_han_su_dung: voucher.gioi_han_su_dung || 0,
        ma_san_pham: voucher.ma_san_pham || null,
        ma_danh_muc: voucher.ma_danh_muc || null,
        ngay_bat_dau: voucher.ngay_bat_dau
          ? voucher.ngay_bat_dau.replace(" ", "T").slice(0, 16)
          : "",
        ngay_ket_thuc: voucher.ngay_ket_thuc
          ? voucher.ngay_ket_thuc.replace(" ", "T").slice(0, 16)
          : "",
        trang_thai: voucher.trang_thai || "hoat_dong",
      });
    } else {
      setFormData({
        ma_giam_gia: "",
        mo_ta: "",
        loai_khuyen_mai: "%",
        gia_tri_giam: 0,
        giam_toi_da: 0,
        don_toi_thieu: 0,
        ap_dung_toan_bo: true,
        gioi_han_su_dung: 0,
        ma_san_pham: null,
        ma_danh_muc: null,
        ngay_bat_dau: "",
        ngay_ket_thuc: "",
        trang_thai: "hoat_dong",
      });
    }
  }, [voucher, isOpen]);

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productApi.getProducts();
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation cơ bản cho tất cả trường hợp
    if (!formData.ma_giam_gia.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    if (!formData.mo_ta.trim()) {
      toast.error("Vui lòng nhập mô tả");
      return;
    }

    if (formData.gia_tri_giam <= 0) {
      toast.error("Giá trị giảm phải lớn hơn 0");
      return;
    }

    // Validation đầy đủ cho voucher mới hoặc voucher đang chỉnh sửa
    if (!formData.ngay_bat_dau) {
      toast.error("Vui lòng chọn ngày bắt đầu");
      return;
    }

    if (!formData.ngay_ket_thuc) {
      toast.error("Vui lòng chọn ngày kết thúc");
      return;
    }

    if (formData.loai_khuyen_mai === "%" && formData.gia_tri_giam > 100) {
      toast.error("Phần trăm giảm không được vượt quá 100%");
      return;
    }

    // Validation cho loại tiền cố định
    if (formData.loai_khuyen_mai === "tien") {
      // Giá trị giảm không được lớn hơn đơn tối thiểu
      if (
        formData.don_toi_thieu > 0 &&
        formData.gia_tri_giam > formData.don_toi_thieu
      ) {
        toast.error("Giá trị giảm không được lớn hơn đơn hàng tối thiểu");
        return;
      }
    }

    // Validation cho giảm tối đa
    if (formData.giam_toi_da > 0) {
      // Giảm tối đa phải nhỏ hơn hoặc bằng đơn tối thiểu
      if (
        formData.don_toi_thieu > 0 &&
        formData.giam_toi_da > formData.don_toi_thieu
      ) {
        toast.error("Giảm tối đa không được lớn hơn đơn hàng tối thiểu");
        return;
      }

      // Với loại %, giảm tối đa không được lớn hơn giá trị % * đơn tối thiểu
      if (formData.loai_khuyen_mai === "%" && formData.don_toi_thieu > 0) {
        const maxDiscountByPercent =
          (formData.gia_tri_giam / 100) * formData.don_toi_thieu;
        if (formData.giam_toi_da > maxDiscountByPercent) {
          toast.error(
            `Với ${formData.gia_tri_giam}% và đơn tối thiểu ${formData.don_toi_thieu.toLocaleString()}đ, giảm tối đa không được vượt quá ${maxDiscountByPercent.toLocaleString()}đ`
          );
          return;
        }
      }

      // Với loại tiền, giảm tối đa không được lớn hơn giá trị giảm
      if (
        formData.loai_khuyen_mai === "tien" &&
        formData.giam_toi_da > formData.gia_tri_giam
      ) {
        toast.error("Giảm tối đa không được lớn hơn giá trị giảm");
        return;
      }
    }

    // Validation ngày tháng
    const startDate = new Date(formData.ngay_bat_dau);
    const endDate = new Date(formData.ngay_ket_thuc);

    if (startDate >= endDate) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    // Tạo dữ liệu submit - không bao gồm trạng thái khi chỉnh sửa
    const submitData: any = {
      ma_giam_gia: formData.ma_giam_gia,
      mo_ta: formData.mo_ta,
      loai_khuyen_mai: formData.loai_khuyen_mai,
      gia_tri_giam: formData.gia_tri_giam,
      giam_toi_da: formData.giam_toi_da,
      don_toi_thieu: formData.don_toi_thieu,
      ap_dung_toan_bo: formData.ap_dung_toan_bo,
      gioi_han_su_dung: formData.gioi_han_su_dung,
      ngay_bat_dau: formData.ngay_bat_dau.replace("T", " "),
      ngay_ket_thuc: formData.ngay_ket_thuc.replace("T", " "),
      ma_san_pham: formData.ap_dung_toan_bo ? null : formData.ma_san_pham,
      ma_danh_muc: formData.ap_dung_toan_bo ? null : formData.ma_danh_muc,
    };

    // Chỉ thêm trạng thái khi tạo mới
    if (!voucher) {
      submitData.trang_thai = formData.trang_thai;
    }

    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-6 h-6 text-blue-600" />
              {voucher ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông báo cho voucher đang hoạt động */}
            {voucher && voucher.trang_thai === "hoat_dong" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">
                    Voucher đang hoạt động - Không thể chỉnh sửa thông tin
                  </p>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  Để chỉnh sửa voucher, vui lòng vô hiệu hóa voucher trước bằng
                  nút chuyển đổi trạng thái.
                </p>
              </div>
            )}

            {/* Mã giảm giá */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="VD: SALE2025"
                required
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả *
              </label>
              <textarea
                value={formData.mo_ta}
                onChange={(e) =>
                  setFormData({ ...formData, mo_ta: e.target.value })
                }
                disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Mô tả chi tiết về voucher"
                rows={3}
                required
              />
            </div>

            {/* Loại khuyến mãi và Giá trị giảm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại khuyến mãi *
                </label>
                <select
                  value={formData.loai_khuyen_mai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loai_khuyen_mai: e.target.value as "%" | "tien",
                    })
                  }
                  disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="%">Phần trăm (%)</option>
                  <option value="tien">Số tiền cố định (VNĐ)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá trị giảm *
                </label>
                <input
                  type="number"
                  value={formData.gia_tri_giam}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gia_tri_giam: Number(e.target.value),
                    })
                  }
                  disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={formData.loai_khuyen_mai === "%" ? "0-100" : "0"}
                  min="0"
                  max={formData.loai_khuyen_mai === "%" ? "100" : undefined}
                  required
                />
              </div>
            </div>

            {/* Giảm tối đa và Đơn tối thiểu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giảm tối đa (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.giam_toi_da}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      giam_toi_da: Number(e.target.value),
                    })
                  }
                  disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="0"
                  min="0"
                />
                {formData.loai_khuyen_mai === "%" &&
                  formData.don_toi_thieu > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tối đa:{" "}
                      {(
                        (formData.gia_tri_giam / 100) *
                        formData.don_toi_thieu
                      ).toLocaleString()}
                      đ ({formData.gia_tri_giam}% ×{" "}
                      {formData.don_toi_thieu.toLocaleString()}đ)
                    </p>
                  )}
                {formData.loai_khuyen_mai === "tien" &&
                  formData.gia_tri_giam > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Không được vượt quá{" "}
                      {formData.gia_tri_giam.toLocaleString()}đ (giá trị giảm)
                    </p>
                  )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn tối thiểu (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.don_toi_thieu}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      don_toi_thieu: Number(e.target.value),
                    })
                  }
                  disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="0"
                  min="0"
                />
                {formData.loai_khuyen_mai === "tien" &&
                  formData.gia_tri_giam > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Phải lớn hơn hoặc bằng{" "}
                      {formData.gia_tri_giam.toLocaleString()}đ (giá trị giảm)
                    </p>
                  )}
              </div>
            </div>

            {/* Giới hạn sử dụng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới hạn số lần sử dụng
              </label>
              <input
                type="number"
                value={formData.gioi_han_su_dung}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gioi_han_su_dung: Number(e.target.value),
                  })
                }
                disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="0 = Không giới hạn"
                min="0"
              />
            </div>

            {/* Áp dụng toàn bộ */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="ap_dung_toan_bo"
                checked={formData.ap_dung_toan_bo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ap_dung_toan_bo: e.target.checked,
                  })
                }
                disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <label
                htmlFor="ap_dung_toan_bo"
                className={`text-sm font-medium ${voucher && voucher.trang_thai === "hoat_dong" ? "text-gray-400" : "text-gray-700"}`}
              >
                Áp dụng cho toàn bộ sản phẩm
              </label>
            </div>

            {/* Danh mục và Sản phẩm (chỉ hiển thị khi không áp dụng toàn bộ) */}
            {!formData.ap_dung_toan_bo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục áp dụng
                  </label>
                  <select
                    value={formData.ma_danh_muc || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ma_danh_muc: e.target.value
                          ? Number(e.target.value)
                          : null,
                        ma_san_pham: null, // Reset sản phẩm khi chọn danh mục
                      })
                    }
                    disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option
                        key={category.ma_danh_muc}
                        value={category.ma_danh_muc}
                      >
                        {category.ten_danh_muc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sản phẩm áp dụng
                  </label>
                  <select
                    value={formData.ma_san_pham || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ma_san_pham: e.target.value
                          ? Number(e.target.value)
                          : null,
                        ma_danh_muc: null, // Reset danh mục khi chọn sản phẩm
                      })
                    }
                    disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map((product) => (
                      <option
                        key={product.ma_san_pham}
                        value={product.ma_san_pham}
                      >
                        {product.ten_san_pham}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Ngày bắt đầu và kết thúc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="datetime-local"
                  value={formData.ngay_bat_dau}
                  onChange={(e) =>
                    setFormData({ ...formData, ngay_bat_dau: e.target.value })
                  }
                  disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc *
                </label>
                <input
                  type="datetime-local"
                  value={formData.ngay_ket_thuc}
                  onChange={(e) =>
                    setFormData({ ...formData, ngay_ket_thuc: e.target.value })
                  }
                  disabled={!!(voucher && voucher.trang_thai === "hoat_dong")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            {/* Trạng thái - chỉ hiển thị khi tạo mới */}
            {!voucher && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hoat_dong">Hoạt động</option>
                  <option value="vo_hieu">Vô hiệu</option>
                  <option value="het_han">Hết hạn</option>
                </select>
              </div>
            )}

            {/* Submit buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2"
              >
                {isLoading && <RotateCcw className="w-4 h-4 animate-spin" />}
                {voucher ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Voucher Card Component
const VoucherCard: React.FC<{
  voucher: Voucher;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (voucher: Voucher) => void;
  isToggleLoading?: boolean;
}> = ({
  voucher,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggleLoading = false,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "hoat_dong":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Hoạt động
          </span>
        );
      case "vo_hieu":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Vô hiệu
          </span>
        );
      case "het_han":
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Hết hạn
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-semibold rounded-full">
            Không xác định
          </span>
        );
    }
  };

  const getVoucherStatusBadge = (voucher: Voucher) => {
    const now = new Date();
    // Đảm bảo xử lý đúng múi giờ
    const startDate = new Date(voucher.ngay_bat_dau);
    const endDate = new Date(voucher.ngay_ket_thuc);

    if (now < startDate) {
      return (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Sắp bắt đầu
        </span>
      );
    } else if (now > endDate) {
      return (
        <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Đã hết hạn
        </span>
      );
    } else {
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Đang áp dụng
        </span>
      );
    }
  };

  const getDiscountDisplay = () => {
    if (voucher.loai_khuyen_mai === "%") {
      return (
        <div className="flex items-center gap-1 text-lg font-bold text-blue-600">
          <Percent className="w-5 h-5" />
          {voucher.gia_tri_giam}%
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-lg font-bold text-green-600">
          <DollarSign className="w-5 h-5" />
          {formatCurrency(voucher.gia_tri_giam)}
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {voucher.ma_giam_gia}
              </h3>
              {getDiscountDisplay()}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {getStatusBadge(voucher.trang_thai)}
            {getVoucherStatusBadge(voucher)}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {voucher.mo_ta}
        </p>

        <div className="space-y-2 text-xs text-gray-500 mb-4">
          <div className="flex justify-between">
            <span>Giảm tối đa:</span>
            <span className="font-medium">
              {voucher.giam_toi_da > 0
                ? formatCurrency(voucher.giam_toi_da)
                : "Không giới hạn"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Đơn tối thiểu:</span>
            <span className="font-medium">
              {voucher.don_toi_thieu > 0
                ? formatCurrency(voucher.don_toi_thieu)
                : "Không"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Lượt sử dụng:</span>
            <span className="font-medium">
              {voucher.gioi_han_su_dung > 0
                ? voucher.gioi_han_su_dung
                : "Không giới hạn"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Bắt đầu:</span>
            <span className="font-medium">
              {formatDate(voucher.ngay_bat_dau)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Kết thúc:</span>
            <span className="font-medium">
              {formatDate(voucher.ngay_ket_thuc)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(voucher.ma_voucher!)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(voucher.ma_voucher!)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => onToggleStatus(voucher)}
            disabled={isToggleLoading}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              voucher.trang_thai === "hoat_dong"
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
                : "bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
            }`}
            title={
              voucher.trang_thai === "hoat_dong" ? "Vô hiệu hóa" : "Kích hoạt"
            }
          >
            {isToggleLoading && <RotateCcw className="w-3 h-3 animate-spin" />}
            {voucher.trang_thai === "hoat_dong" ? "Vô hiệu hóa" : "Kích hoạt"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ITEMS_PER_PAGE = 12;

const QLKhuyenMai: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load vouchers from API
  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voucherApi.fetchVouchers();
      setVouchers(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách voucher:", error);
      toast.error("Không thể tải danh sách voucher");
      setError("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  // Filter vouchers
  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      voucher.ma_giam_gia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.mo_ta.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || voucher.trang_thai === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVouchers.length / ITEMS_PER_PAGE);
  const displayedVouchers = filteredVouchers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Event handlers
  const handleAddVoucher = () => {
    setEditingVoucher(null);
    setIsModalOpen(true);
  };

  const handleEditVoucher = (id: number) => {
    const voucherToEdit = vouchers.find((voucher) => voucher.ma_voucher === id);
    if (voucherToEdit) {
      setEditingVoucher(voucherToEdit);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVoucher(null);
    setError(null);
  };

  const handleSaveVoucher = async (voucherData: Partial<VoucherCreate>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingVoucher) {
        await voucherApi.updateVoucher(editingVoucher.ma_voucher!, voucherData);
        toast.success("Cập nhật voucher thành công!");
      } else {
        await voucherApi.createVoucher(voucherData as VoucherCreate);
        toast.success("Thêm voucher mới thành công!");
      }
      await loadVouchers();
      handleCloseModal();
    } catch (err: any) {
      console.error("Error saving voucher:", err);
      const errorMessage = err.message || "Không thể lưu voucher.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVoucher = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
      try {
        await voucherApi.deleteVoucher(id);
        setVouchers(vouchers.filter((voucher) => voucher.ma_voucher !== id));
        toast.success("Xóa voucher thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa voucher:", error);
        toast.error("Xóa voucher thất bại!");
      }
    }
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    // Xác định trạng thái mới (ngược lại với trạng thái hiện tại)
    const newStatus =
      voucher.trang_thai === "hoat_dong" ? "vo_hieu" : "hoat_dong";
    const actionText =
      voucher.trang_thai === "hoat_dong" ? "vô hiệu hóa" : "kích hoạt";
    const confirmMessage = `Bạn có chắc chắn muốn ${actionText} voucher "${voucher.ma_giam_gia}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setToggleLoading(voucher.ma_voucher!);

    try {
      // Gọi API chuyển đổi trạng thái với trạng thái mới
      await voucherApi.toggleVoucherStatus(voucher.ma_voucher!, newStatus);

      // Reload lại danh sách voucher để lấy trạng thái mới nhất
      await loadVouchers();

      const successText =
        voucher.trang_thai === "hoat_dong" ? "Vô hiệu hóa" : "Kích hoạt";
      toast.success(`${successText} voucher thành công!`);
    } catch (error: any) {
      console.error("Lỗi khi chuyển đổi trạng thái:", error);
      const errorMessage = error.message || "Chuyển đổi trạng thái thất bại!";
      toast.error(errorMessage);
    } finally {
      setToggleLoading(null);
    }
  };

  // Dashboard Stats
  const totalVouchers = vouchers.length;
  const activeVouchers = vouchers.filter(
    (v) => v.trang_thai === "hoat_dong"
  ).length;
  const expiredVouchers = vouchers.filter((v) => {
    const now = new Date();
    const endDate = new Date(v.ngay_ket_thuc);
    return now > endDate;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-16">
          <RotateCcw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách voucher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Tag className="w-8 h-8 text-blue-600" />
                Quản lý Voucher
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý các mã giảm giá và chương trình khuyến mãi
              </p>
            </div>
            <button
              onClick={handleAddVoucher}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Thêm voucher mới
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng voucher</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalVouchers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeVouchers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã hết hạn</p>
                <p className="text-2xl font-bold text-gray-900">
                  {expiredVouchers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm voucher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-40"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="hoat_dong">Hoạt động</option>
                <option value="vo_hieu">Vô hiệu</option>
                <option value="het_han">Hết hạn</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {displayedVouchers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy voucher nào
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                : "Chưa có voucher nào được tạo"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={handleAddVoucher}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium mx-auto"
              >
                <Plus className="w-5 h-5" />
                Thêm voucher đầu tiên
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.ma_voucher}
                  voucher={voucher}
                  onEdit={handleEditVoucher}
                  onDelete={handleDeleteVoucher}
                  onToggleStatus={handleToggleStatus}
                  isToggleLoading={toggleLoading === voucher.ma_voucher}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Voucher Form Modal */}
      <VoucherFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveVoucher}
        voucher={editingVoucher}
        isLoading={isSubmitting}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default QLKhuyenMai;
