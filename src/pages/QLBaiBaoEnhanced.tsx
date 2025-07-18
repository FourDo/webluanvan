import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Calendar,
  FileText,
  Grid,
  List,
  Archive,
  BookOpen,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { BaiViet } from "../types/BaiViet";
import { getAllBaiViet, deleteBaiViet } from "../API/baibaoApi";

// BaiViet Card Component cho Grid View
const BaiVietCard: React.FC<{
  baiviet: BaiViet;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ baiviet, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
      <div className="relative">
        <div className="w-full h-48 overflow-hidden">
          {baiviet.anh_dai_dien ? (
            <img
              src={baiviet.anh_dai_dien}
              alt={baiviet.tieu_de}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <FileText className="text-gray-400" size={48} />
            </div>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${
              baiviet.hien_thi
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {baiviet.hien_thi ? "Hiển thị" : "Ẩn"}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-white bg-opacity-90 text-gray-700 px-2 py-1 text-xs font-semibold rounded-full shadow-sm">
            {baiviet.luot_xem || 0} lượt xem
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-xs text-blue-600 font-medium">
            {baiviet.danh_muc?.ten_danh_muc || "Chưa phân loại"}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 flex-1">
          {baiviet.tieu_de}
        </h3>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {baiviet.mo_ta_ngan}
        </p>

        <div className="mb-3">
          <div className="flex items-center text-xs text-gray-400">
            <Calendar size={12} className="mr-1" />
            {baiviet.ngay_tao
              ? new Date(baiviet.ngay_tao).toLocaleDateString("vi-VN")
              : ""}
          </div>
        </div>

        {baiviet.tags && baiviet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {baiviet.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                #{tag.ten_tag}
              </span>
            ))}
            {baiviet.tags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{baiviet.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => baiviet.id && onView(baiviet.id)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Eye size={16} className="mr-1" />
              Xem
            </button>
            <button
              onClick={() => baiviet.id && onEdit(baiviet.id)}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Edit size={16} className="mr-1" />
              Sửa
            </button>
            <button
              onClick={() => baiviet.id && onDelete(baiviet.id)}
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

const ITEMS_PER_PAGE = 12; // Số bài viết mỗi trang

const QLBaiBaoEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [baiBaos, setBaiBaos] = useState<BaiViet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Lấy danh sách bài báo từ API
  useEffect(() => {
    fetchBaiBaos();
  }, []);

  const fetchBaiBaos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllBaiViet();
      setBaiBaos(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài báo:", error);
      setError("Không thể tải dữ liệu bài báo.");
    } finally {
      setIsLoading(false);
    }
  };

  const allFilteredBaiViets = baiBaos.filter((baiviet) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      baiviet.tieu_de.toLowerCase().includes(searchLower) ||
      baiviet.mo_ta_ngan.toLowerCase().includes(searchLower) ||
      (baiviet.danh_muc?.ten_danh_muc || "").toLowerCase().includes(searchLower)
    );
  });

  // Tính toán tổng số trang
  const totalPages = Math.ceil(allFilteredBaiViets.length / ITEMS_PER_PAGE);

  // Lấy danh sách bài viết cho trang hiện tại
  const displayedBaiViets = allFilteredBaiViets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAddBaiBao = () => {
    navigate("/admin/baibao/them");
  };

  const handleEditBaiBao = (id: number) => {
    navigate(`/admin/baibao/sua/${id}`);
  };

  const handleViewBaiBao = (id: number) => {
    navigate(`/baibao/${id}`);
  };

  const handleDeleteBaiBao = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài báo này?")) {
      try {
        await deleteBaiViet(id);
        await fetchBaiBaos(); // Refresh danh sách
      } catch (error) {
        console.error("Lỗi khi xóa bài báo:", error);
        setError("Có lỗi xảy ra khi xóa bài báo");
      }
    }
  };

  // Dashboard Stats
  const totalBaiViets = baiBaos.length;
  const visibleBaiViets = baiBaos.filter((bv) => bv.hien_thi).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-4 md:p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý Bài báo
                </h1>
                <p className="text-gray-600">
                  Quản lý và chỉnh sửa các bài viết
                </p>
              </div>
            </div>
            <button
              onClick={handleAddBaiBao}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Viết bài mới</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng bài viết</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalBaiViets}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang hiển thị</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visibleBaiViets}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
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
                placeholder="Tìm kiếm theo tiêu đề, mô tả, danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
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
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : displayedBaiViets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Archive className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? "Không tìm thấy bài viết" : "Chưa có bài viết nào"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Vui lòng thử lại với từ khóa khác."
                : 'Nhấn nút "Viết bài mới" để bắt đầu quản lý.'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedBaiViets.map((baiviet) => (
                  <BaiVietCard
                    key={baiviet.id}
                    baiviet={baiviet}
                    onView={handleViewBaiBao}
                    onEdit={handleEditBaiBao}
                    onDelete={handleDeleteBaiBao}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bài báo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Danh mục
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lượt xem
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedBaiViets.map((baiviet) => (
                      <tr key={baiviet.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-20">
                              {baiviet.anh_dai_dien ? (
                                <img
                                  className="h-12 w-20 object-cover rounded"
                                  src={baiviet.anh_dai_dien}
                                  alt={baiviet.tieu_de}
                                />
                              ) : (
                                <div className="h-12 w-20 bg-gray-200 rounded flex items-center justify-center">
                                  <FileText
                                    className="text-gray-400"
                                    size={20}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {baiviet.tieu_de}
                              </div>
                              <div className="text-sm text-gray-500">
                                {baiviet.mo_ta_ngan.substring(0, 50)}...
                              </div>
                              {baiviet.tags && baiviet.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {baiviet.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag.id}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {tag.ten_tag}
                                    </span>
                                  ))}
                                  {baiviet.tags.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                      +{baiviet.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {baiviet.danh_muc?.ten_danh_muc || "Chưa phân loại"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              baiviet.hien_thi
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {baiviet.hien_thi ? (
                              <>
                                <Eye size={12} className="mr-1" />
                                Hiển thị
                              </>
                            ) : (
                              <>
                                <EyeOff size={12} className="mr-1" />
                                Ẩn
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {baiviet.luot_xem?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar size={16} className="mr-2" />
                            {baiviet.ngay_tao
                              ? new Date(baiviet.ngay_tao).toLocaleDateString(
                                  "vi-VN"
                                )
                              : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                baiviet.id && handleViewBaiBao(baiviet.id)
                              }
                              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50"
                              title="Xem"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() =>
                                baiviet.id && handleEditBaiBao(baiviet.id)
                              }
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                              title="Chỉnh sửa"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() =>
                                baiviet.id && handleDeleteBaiBao(baiviet.id)
                              }
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
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
              <div className="flex items-center justify-between p-4 mt-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                <span className="text-sm text-gray-700">
                  Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    allFilteredBaiViets.length
                  )}
                  trên tổng số {allFilteredBaiViets.length} bài viết
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(currentPage + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
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

export default QLBaiBaoEnhanced;
