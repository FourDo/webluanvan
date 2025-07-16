import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Calendar,
  User,
  FileText,
} from "lucide-react";

interface BaiBao {
  id: number;
  title: string;
  content: string;
  summary: string;
  featured_image?: string;
  author: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  category: string;
}

const QLBaiBao: React.FC = () => {
  const [baiBaos, setBaiBaos] = useState<BaiBao[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBaiBao, setEditingBaiBao] = useState<BaiBao | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    featured_image: "",
    author: "",
    is_published: false,
    category: "Tin tức",
  });

  // Mock data - thay thế bằng API call thật
  useEffect(() => {
    const mockBaiBaos: BaiBao[] = [
      {
        id: 1,
        title: "Xu hướng thời trang mùa hè 2024",
        content: "Nội dung chi tiết về xu hướng thời trang mùa hè...",
        summary: "Khám phá những xu hướng thời trang hot nhất mùa hè này",
        featured_image: "/image/baibao1.jpg",
        author: "Admin",
        is_published: true,
        published_at: "2024-01-15",
        created_at: "2024-01-15",
        updated_at: "2024-01-15",
        view_count: 1250,
        category: "Thời trang",
      },
      {
        id: 2,
        title: "Cách chọn size áo phù hợp",
        content: "Hướng dẫn chi tiết cách chọn size áo...",
        summary: "Hướng dẫn chọn size áo phù hợp với từng dáng người",
        featured_image: "/image/baibao2.jpg",
        author: "Editor",
        is_published: true,
        published_at: "2024-01-16",
        created_at: "2024-01-16",
        updated_at: "2024-01-16",
        view_count: 850,
        category: "Hướng dẫn",
      },
      {
        id: 3,
        title: "Bộ sưu tập mới ra mắt",
        content: "Giới thiệu bộ sưu tập mới nhất...",
        summary: "Khám phá bộ sưu tập thời trang mới nhất của chúng tôi",
        featured_image: "/image/baibao3.jpg",
        author: "Admin",
        is_published: false,
        created_at: "2024-01-17",
        updated_at: "2024-01-17",
        view_count: 0,
        category: "Sản phẩm",
      },
    ];
    setTimeout(() => {
      setBaiBaos(mockBaiBaos);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredBaiBaos = baiBaos.filter(
    (baibao) =>
      baibao.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      baibao.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBaiBao = () => {
    setEditingBaiBao(null);
    setFormData({
      title: "",
      content: "",
      summary: "",
      featured_image: "",
      author: "",
      is_published: false,
      category: "Tin tức",
    });
    setShowModal(true);
  };

  const handleEditBaiBao = (baibao: BaiBao) => {
    setEditingBaiBao(baibao);
    setFormData({
      title: baibao.title,
      content: baibao.content,
      summary: baibao.summary,
      featured_image: baibao.featured_image || "",
      author: baibao.author,
      is_published: baibao.is_published,
      category: baibao.category,
    });
    setShowModal(true);
  };

  const handleDeleteBaiBao = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài báo này?")) {
      setBaiBaos(baiBaos.filter((baibao) => baibao.id !== id));
    }
  };

  const handleTogglePublish = (id: number) => {
    setBaiBaos(
      baiBaos.map((baibao) =>
        baibao.id === id
          ? {
              ...baibao,
              is_published: !baibao.is_published,
              published_at: !baibao.is_published
                ? new Date().toISOString().split("T")[0]
                : undefined,
            }
          : baibao
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBaiBao) {
      // Cập nhật bài báo
      setBaiBaos(
        baiBaos.map((baibao) =>
          baibao.id === editingBaiBao.id
            ? {
                ...baibao,
                ...formData,
                updated_at: new Date().toISOString().split("T")[0],
                published_at:
                  formData.is_published && !editingBaiBao.published_at
                    ? new Date().toISOString().split("T")[0]
                    : editingBaiBao.published_at,
              }
            : baibao
        )
      );
    } else {
      // Thêm bài báo mới
      const newBaiBao: BaiBao = {
        id: Math.max(...baiBaos.map((b) => b.id)) + 1,
        ...formData,
        created_at: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString().split("T")[0],
        published_at: formData.is_published
          ? new Date().toISOString().split("T")[0]
          : undefined,
        view_count: 0,
      };
      setBaiBaos([...baiBaos, newBaiBao]);
    }
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài báo</h1>
        <button
          onClick={handleAddBaiBao}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Viết bài mới
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm bài báo..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bài báo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tác giả
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
            {filteredBaiBaos.map((baibao) => (
              <tr key={baibao.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-20">
                      {baibao.featured_image ? (
                        <img
                          className="h-12 w-20 object-cover rounded"
                          src={baibao.featured_image}
                          alt={baibao.title}
                        />
                      ) : (
                        <div className="h-12 w-20 bg-gray-200 rounded flex items-center justify-center">
                          <FileText className="text-gray-400" size={20} />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {baibao.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {baibao.summary.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <User size={16} className="mr-2" />
                    {baibao.author}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {baibao.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleTogglePublish(baibao.id)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      baibao.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {baibao.is_published ? (
                      <>
                        <Eye size={12} className="mr-1" />
                        Đã xuất bản
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} className="mr-1" />
                        Nháp
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {baibao.view_count.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar size={16} className="mr-2" />
                    {baibao.created_at}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditBaiBao(baibao)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBaiBao(baibao.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBaiBaos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy bài báo nào
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingBaiBao ? "Sửa Bài báo" : "Viết Bài báo Mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tóm tắt
                </label>
                <textarea
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung
                </label>
                <textarea
                  required
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tác giả
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="Tin tức">Tin tức</option>
                    <option value="Thời trang">Thời trang</option>
                    <option value="Hướng dẫn">Hướng dẫn</option>
                    <option value="Sản phẩm">Sản phẩm</option>
                    <option value="Khuyến mãi">Khuyến mãi</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh đại diện (URL)
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.featured_image}
                  onChange={(e) =>
                    setFormData({ ...formData, featured_image: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData({ ...formData, is_published: e.target.checked })
                  }
                />
                <label
                  htmlFor="is_published"
                  className="ml-2 text-sm text-gray-700"
                >
                  Xuất bản ngay
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingBaiBao ? "Cập nhật" : "Lưu bài"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QLBaiBao;
