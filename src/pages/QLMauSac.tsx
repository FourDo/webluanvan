import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Palette,
  List,
  LayoutGrid,
  Archive,
  X,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import colorApi from "../API/colorApi";
import type { Color } from "../types/Color";
import {
  getVietnameseColorName,
  getHexFromVietnameseName,
} from "../utils/colorNameUtils";

const ColorFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (colorData: Partial<Color>) => void;
  color?: Color | null;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onSave, color, isLoading = false }) => {
  const [formData, setFormData] = useState({
    ten_mau_sac: "",
    mo_ta: "",
    hex_code: "#000000",
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Danh sách gợi ý màu
  const colorSuggestions = [
    "Đỏ",
    "Xanh dương",
    "Xanh lá",
    "Vàng",
    "Cam",
    "Tím",
    "Hồng",
    "Nâu",
    "Đen",
    "Trắng",
    "Xám",
    "Đỏ tươi",
    "Đỏ thẫm",
    "Xanh trời",
    "Xanh lơ",
    "Vàng chanh",
    "Vàng kim",
    "Tím nhạt",
    "Hồng nhạt",
    "Nâu đất",
    "Xám nhạt",
    "Bạc",
    "Xanh hải quân",
    "Xanh ô liu",
    "Đỏ san hô",
  ];

  useEffect(() => {
    if (color) {
      setFormData({
        ten_mau_sac: color.ten_mau_sac || "",
        mo_ta: color.mo_ta || "",
        hex_code: color.hex_code || "#000000",
      });
    } else {
      setFormData({
        ten_mau_sac: "",
        mo_ta: "",
        hex_code: "#000000",
      });
    }
  }, [color, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ten_mau_sac.trim()) {
      alert("Vui lòng nhập tên màu sắc");
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
              {color ? "Sửa màu sắc" : "Thêm màu sắc"}
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
                Tên màu sắc *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.ten_mau_sac}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFormData({ ...formData, ten_mau_sac: newName });

                    // Hiển thị suggestions khi có text
                    setShowSuggestions(newName.length > 0);

                    // Tự động thay đổi hex code nếu tìm thấy màu phù hợp
                    const suggestedHex = getHexFromVietnameseName(newName);
                    if (suggestedHex) {
                      setFormData((prev) => ({
                        ...prev,
                        ten_mau_sac: newName,
                        hex_code: suggestedHex,
                      }));
                    }
                  }}
                  onFocus={() =>
                    setShowSuggestions(formData.ten_mau_sac.length > 0)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Nhập tên màu sắc... (VD: Đỏ, Xanh dương, Vàng)"
                  required
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {colorSuggestions
                      .filter((suggestion) =>
                        suggestion
                          .toLowerCase()
                          .includes(formData.ten_mau_sac.toLowerCase())
                      )
                      .slice(0, 8)
                      .map((suggestion, index) => {
                        const suggestedHex =
                          getHexFromVietnameseName(suggestion);
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                ten_mau_sac: suggestion,
                                hex_code: suggestedHex || formData.hex_code,
                              });
                              setShowSuggestions(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div
                              className="w-6 h-6 rounded-full border border-gray-200 flex-shrink-0"
                              style={{
                                backgroundColor: suggestedHex || "#CCCCCC",
                              }}
                            />
                            <span className="font-medium flex-grow">
                              {suggestion}
                            </span>
                            <span className="text-sm text-gray-500 font-mono">
                              {suggestedHex || "N/A"}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
              <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-blue-600">
                    💡 Gợi ý hiện tại:{" "}
                    <span className="font-semibold">
                      {getVietnameseColorName(formData.hex_code)}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        ten_mau_sac: getVietnameseColorName(formData.hex_code),
                      })
                    }
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Sử dụng
                  </button>
                </div>
                <p className="text-xs text-purple-600">
                  ✨ <strong>Mẹo:</strong> Nhập tên màu tiếng Việt (như "Đỏ",
                  "Xanh dương") để tự động cập nhật mã hex!
                </p>
              </div>
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Nhập mô tả màu sắc..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã màu (Hex) *
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.hex_code}
                  onChange={(e) =>
                    setFormData({ ...formData, hex_code: e.target.value })
                  }
                  className="w-16 h-12 border border-gray-200 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.hex_code}
                  onChange={(e) =>
                    setFormData({ ...formData, hex_code: e.target.value })
                  }
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono"
                  placeholder="#000000"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Xem trước:</p>
              <div className="flex items-center space-x-3">
                <div
                  className="w-16 h-16 rounded-xl border border-gray-200 shadow-sm"
                  style={{ backgroundColor: formData.hex_code }}
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {formData.ten_mau_sac || "Tên màu sắc"}
                  </p>
                  <p className="text-sm text-purple-600 font-medium">
                    {getVietnameseColorName(formData.hex_code)}
                  </p>
                  <p className="text-sm text-gray-500 font-mono">
                    {formData.hex_code}
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
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Save size={18} />
                    <span>{color ? "Cập nhật" : "Thêm mới"}</span>
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

// Color Card Component cho Grid View
const ColorCard: React.FC<{
  color: Color;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ color, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
      <div className="relative">
        <div
          className="w-full h-48 group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundColor: color.hex_code }}
        />
        <div className="absolute top-3 right-3">
          <span className="bg-white bg-opacity-90 text-gray-700 px-2 py-1 text-xs font-semibold rounded-full shadow-sm">
            {color.hex_code}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
          {color.ten_mau_sac}
        </h3>
        <p className="text-xs text-purple-600 font-medium mb-1">
          {getVietnameseColorName(color.hex_code)}
        </p>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{color.mo_ta}</p>

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => onView(color.ma_mau_sac)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Eye size={16} className="mr-1" />
              Xem
            </button>
            <button
              onClick={() => onEdit(color.ma_mau_sac)}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Edit size={16} className="mr-1" />
              Sửa
            </button>
            <button
              onClick={() => onDelete(color.ma_mau_sac)}
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

const ITEMS_PER_PAGE = 12; // Số màu sắc mỗi trang

const QLMauSac: React.FC = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchColors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await colorApi.fetchColors();
        if (Array.isArray(response)) {
          setColors(response);
        } else {
          setError("Dữ liệu trả về không đúng định dạng mong đợi.");
        }
      } catch (err) {
        setError((err as Error).message || "Không thể tải dữ liệu màu sắc.");
      } finally {
        setLoading(false);
      }
    };
    fetchColors();
  }, []);

  const allFilteredColors = colors.filter((color) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      color.ten_mau_sac.toLowerCase().includes(searchLower) ||
      color.mo_ta.toLowerCase().includes(searchLower) ||
      color.hex_code.toLowerCase().includes(searchLower)
    );
  });

  // Tính toán tổng số trang
  const totalPages = Math.ceil(allFilteredColors.length / ITEMS_PER_PAGE);

  // Lấy danh sách màu sắc cho trang hiện tại
  const displayedColors = allFilteredColors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Event Handlers
  const handleAddColor = () => {
    setEditingColor(null);
    setIsModalOpen(true);
  };

  const handleEditColor = (id: number) => {
    const colorToEdit = colors.find((color) => color.ma_mau_sac === id);
    if (colorToEdit) {
      setEditingColor(colorToEdit);
      setIsModalOpen(true);
    }
  };

  const handleViewColor = (id: number) => navigate(`/admin/mausac/${id}`);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingColor(null);
    setError(null);
  };

  const handleSaveColor = async (colorData: Partial<Color>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingColor) {
        // Cập nhật màu sắc - sử dụng saveColor với id
        const formData = {
          ten_mau_sac: colorData.ten_mau_sac || "",
          mo_ta: colorData.mo_ta || "",
          hex_code: colorData.hex_code || "#000000",
        };
        await colorApi.saveColor(formData);
        // Tải lại danh sách
        const response = await colorApi.fetchColors();
        if (Array.isArray(response)) {
          setColors(response);
        }
      } else {
        // Thêm màu sắc mới
        const formData = {
          ten_mau_sac: colorData.ten_mau_sac || "",
          mo_ta: colorData.mo_ta || "",
          hex_code: colorData.hex_code || "#000000",
        };
        await colorApi.saveColor(formData);
        // Tải lại danh sách
        const response = await colorApi.fetchColors();
        if (Array.isArray(response)) {
          setColors(response);
        }
      }
      handleCloseModal();
    } catch (err) {
      setError((err as Error).message || "Không thể lưu màu sắc.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteColor = async (colorId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa màu sắc này?")) {
      try {
        await colorApi.deleteColor(colorId);
        setColors((prev) =>
          prev.filter((color) => color.ma_mau_sac !== colorId)
        );
      } catch (err) {
        setError((err as Error).message || "Không thể xóa màu sắc.");
      }
    }
  };

  // Dashboard Stats
  const totalColors = colors.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-4 md:p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Quản lý màu sắc
                </h1>
                <p className="text-gray-500 mt-1">
                  Quản lý toàn bộ màu sắc trong hệ thống.
                </p>
              </div>
            </div>
            <button
              onClick={handleAddColor}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Thêm màu sắc</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng màu sắc</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalColors}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hiển thị</p>
                <p className="text-2xl font-bold text-blue-600">
                  {allFilteredColors.length}
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
                placeholder="Tìm kiếm theo tên màu, mô tả, mã hex..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-purple-600 shadow-sm"
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
                      ? "bg-white text-purple-600 shadow-sm"
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : displayedColors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Archive className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? "Không tìm thấy màu sắc" : "Chưa có màu sắc nào"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Vui lòng thử lại với từ khóa khác."
                : 'Nhấn nút "Thêm màu sắc" để bắt đầu quản lý.'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedColors.map((color) => (
                  <ColorCard
                    key={color.ma_mau_sac}
                    color={color}
                    onView={handleViewColor}
                    onEdit={handleEditColor}
                    onDelete={handleDeleteColor}
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
                        Tên màu sắc
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tên tiếng Việt
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mã màu (Hex)
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayedColors.map((color, index) => (
                      <tr
                        key={color.ma_mau_sac}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <button
                            onClick={() => handleViewColor(color.ma_mau_sac)}
                            className="text-purple-600 hover:text-purple-900 hover:underline"
                          >
                            {color.ten_mau_sac}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                          {getVietnameseColorName(color.hex_code)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          <div className="line-clamp-2">{color.mo_ta}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div
                              className="w-8 h-8 mr-3 rounded-lg border border-gray-200 shadow-sm"
                              style={{ backgroundColor: color.hex_code }}
                            ></div>
                            <span className="font-mono">{color.hex_code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center space-x-1">
                            <button
                              onClick={() => handleViewColor(color.ma_mau_sac)}
                              className="text-gray-400 hover:text-blue-600 p-2 hover:bg-gray-100 rounded-lg"
                              title="Xem"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditColor(color.ma_mau_sac)}
                              className="text-gray-400 hover:text-yellow-600 p-2 hover:bg-gray-100 rounded-lg"
                              title="Sửa"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteColor(color.ma_mau_sac)
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
                    allFilteredColors.length
                  )}{" "}
                  trên tổng số {allFilteredColors.length} màu sắc
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

      {/* Color Form Modal */}
      <ColorFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveColor}
        color={editingColor}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default QLMauSac;
