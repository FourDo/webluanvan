import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Ruler,
  List,
  LayoutGrid,
  Archive,
  X,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import sizeApi from "../API/sizeApi";
import type { Size } from "../types/Size";

// --- Sub-Components ---

// Size Form Modal Component
const SizeFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (sizeData: Partial<Size>) => void;
  size?: Size | null;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onSave, size, isLoading = false }) => {
  const [formData, setFormData] = useState({
    ten_kich_thuoc: "",
    mo_ta: "",
  });

  useEffect(() => {
    if (size) {
      setFormData({
        ten_kich_thuoc: size.ten_kich_thuoc || "",
        mo_ta: size.mo_ta || "",
      });
    } else {
      setFormData({
        ten_kich_thuoc: "",
        mo_ta: "",
      });
    }
  }, [size, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ten_kich_thuoc.trim()) {
      alert("Vui lòng nhập tên kích thước");
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {size ? "Sửa kích thước" : "Thêm kích thước"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên kích thước *
              </label>
              <input
                type="text"
                value={formData.ten_kich_thuoc}
                onChange={(e) =>
                  setFormData({ ...formData, ten_kich_thuoc: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="VD: S, M, L, XL, 40, 41..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.mo_ta}
                onChange={(e) =>
                  setFormData({ ...formData, mo_ta: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="VD: Size nhỏ, Dành cho người dưới 60kg..."
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Xem trước:</p>
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-xl border border-blue-200 flex items-center justify-center">
                  <span className="text-blue-800 font-bold text-lg">
                    {formData.ten_kich_thuoc || "?"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {formData.ten_kich_thuoc || "Tên kích thước"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formData.mo_ta || "Không có mô tả"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Save size={18} />
                    <span>{size ? "Cập nhật" : "Thêm mới"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Size Card Component cho Grid View
const SizeCard: React.FC<{
  size: Size;
  index: number;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ size, index, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-xl border border-blue-200 flex items-center justify-center">
            <span className="text-blue-800 font-bold text-xl">
              {size.ten_kich_thuoc}
            </span>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            #{index + 1}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 flex-1">
          Kích thước {size.ten_kich_thuoc}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {size.mo_ta || "Không có mô tả"}
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Tạo: {new Date(size.ngay_tao).toLocaleDateString("vi-VN")}
        </p>

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => onView(size.ma_kich_thuoc)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Eye size={16} className="mr-1" />
              Xem
            </button>
            <button
              onClick={() => onEdit(size.ma_kich_thuoc)}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Edit size={16} className="mr-1" />
              Sửa
            </button>
            <button
              onClick={() => onDelete(size.ma_kich_thuoc)}
              className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const ITEMS_PER_PAGE = 12; // Số kích thước mỗi trang

const QLKichThuoc: React.FC = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSizes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await sizeApi.fetchSizes();
        if (Array.isArray(response)) {
          setSizes(response);
        } else {
          setError("Dữ liệu trả về không đúng định dạng mong đợi.");
        }
      } catch (err) {
        setError((err as Error).message || "Không thể tải dữ liệu kích thước.");
      } finally {
        setLoading(false);
      }
    };
    fetchSizes();
  }, []);

  const allFilteredSizes = sizes.filter((size) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      size.ten_kich_thuoc.toLowerCase().includes(searchLower) ||
      (size.mo_ta && size.mo_ta.toLowerCase().includes(searchLower))
    );
  });

  // Tính toán tổng số trang
  const totalPages = Math.ceil(allFilteredSizes.length / ITEMS_PER_PAGE);

  // Lấy danh sách kích thước cho trang hiện tại
  const displayedSizes = allFilteredSizes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Event Handlers
  const handleAddSize = () => {
    setEditingSize(null);
    setIsModalOpen(true);
  };

  const handleEditSize = (id: number) => {
    const sizeToEdit = sizes.find((size) => size.ma_kich_thuoc === id);
    if (sizeToEdit) {
      setEditingSize(sizeToEdit);
      setIsModalOpen(true);
    }
  };

  const handleViewSize = (id: number) => navigate(`/admin/kichthuoc/${id}`);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSize(null);
    setError(null);
  };

  const handleSaveSize = async (sizeData: Partial<Size>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingSize) {
        // Cập nhật kích thước
        const formData = {
          ten_kich_thuoc: sizeData.ten_kich_thuoc || "",
          mo_ta: sizeData.mo_ta || "",
        };
        await sizeApi.saveSize(formData);
        // Tải lại danh sách
        const response = await sizeApi.fetchSizes();
        if (Array.isArray(response)) {
          setSizes(response);
        }
      } else {
        // Thêm kích thước mới
        const formData = {
          ten_kich_thuoc: sizeData.ten_kich_thuoc || "",
          mo_ta: sizeData.mo_ta || "",
        };
        await sizeApi.saveSize(formData);
        // Tải lại danh sách
        const response = await sizeApi.fetchSizes();
        if (Array.isArray(response)) {
          setSizes(response);
        }
      }
      handleCloseModal();
    } catch (err) {
      setError((err as Error).message || "Không thể lưu kích thước.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSize = async (sizeId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kích thước này?")) {
      try {
        await sizeApi.deleteSize(sizeId);
        setSizes((prev) =>
          prev.filter((size) => size.ma_kich_thuoc !== sizeId)
        );
      } catch (err) {
        setError((err as Error).message || "Không thể xóa kích thước.");
      }
    }
  };

  // Dashboard Stats
  const totalSizes = sizes.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-4 md:p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Ruler className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Quản lý kích thước
                </h1>
                <p className="text-gray-500 mt-1">
                  Quản lý toàn bộ kích thước trong hệ thống.
                </p>
              </div>
            </div>
            <button
              onClick={handleAddSize}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Thêm kích thước</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng kích thước</p>
                <p className="text-2xl font-bold text-gray-900">{totalSizes}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Ruler className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hiển thị</p>
                <p className="text-2xl font-bold text-blue-600">
                  {allFilteredSizes.length}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên kích thước, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Xem dạng lưới"
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Xem dạng bảng"
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <p className="font-bold">Đã có lỗi xảy ra</p>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : displayedSizes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Archive className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm
                ? "Không tìm thấy kích thước"
                : "Chưa có kích thước nào"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Vui lòng thử lại với từ khóa khác."
                : 'Nhấn nút "Thêm kích thước" để bắt đầu quản lý.'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedSizes.map((size, index) => (
                  <SizeCard
                    key={size.ma_kich_thuoc}
                    size={size}
                    index={(currentPage - 1) * ITEMS_PER_PAGE + index}
                    onView={handleViewSize}
                    onEdit={handleEditSize}
                    onDelete={handleDeleteSize}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Kích thước
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayedSizes.map((size, index) => (
                      <tr
                        key={size.ma_kich_thuoc}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-800 font-bold">
                                {size.ten_kich_thuoc}
                              </span>
                            </div>
                            <button
                              onClick={() => handleViewSize(size.ma_kich_thuoc)}
                              className="text-blue-600 hover:text-blue-900 hover:underline"
                            ></button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          <div className="line-clamp-2">
                            {size.mo_ta || (
                              <span className="text-gray-400 italic">
                                Không có mô tả
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(size.ngay_tao).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center space-x-1">
                            <button
                              onClick={() => handleViewSize(size.ma_kich_thuoc)}
                              className="text-gray-400 hover:text-blue-600 p-2 hover:bg-gray-100 rounded-lg"
                              title="Xem"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditSize(size.ma_kich_thuoc)}
                              className="text-gray-400 hover:text-yellow-600 p-2 hover:bg-gray-100 rounded-lg"
                              title="Sửa"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteSize(size.ma_kich_thuoc)
                              }
                              className="text-gray-400 hover:text-red-600 p-2 hover:bg-gray-100 rounded-lg"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 mt-6">
                <span className="text-sm text-gray-700">
                  Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    allFilteredSizes.length
                  )}{" "}
                  trên tổng số {allFilteredSizes.length} kích thước
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((c) => c - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trang trước
                  </button>
                  <span className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((c) => c + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Size Form Modal */}
      <SizeFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSize}
        size={editingSize}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default QLKichThuoc;
