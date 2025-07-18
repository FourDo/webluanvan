import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  X,
  Image as ImageIcon,
} from "lucide-react";
import type { BaiVietForm } from "../types/BaiViet";
import { getBaiVietById, createBaiViet, updateBaiViet } from "../API/baibaoApi";
import tagApi, { type Tag } from "../API/tagApi";
import danhmucbvApi, { type DanhMucBaiViet } from "../API/danhmucbvApi";

const BaiBaoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<DanhMucBaiViet[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<BaiVietForm>({
    tieu_de: "",
    mo_ta_ngan: "",
    noi_dung: "",
    anh_dai_dien: "",
    danh_muc_id: 1,
    hien_thi: true,
    tag_ids: [],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      fetchBaiViet(parseInt(id));
    }
  }, [isEditing, id]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [categoriesResponse, tagsResponse] = await Promise.all([
        danhmucbvApi.getAll(),
        tagApi.getAllTags(),
      ]);

      setCategories(categoriesResponse);
      setTags(tagsResponse);

      if (categoriesResponse.length > 0) {
        setFormData((prev) => ({
          ...prev,
          danh_muc_id: categoriesResponse[0].id,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBaiViet = async (baiBaoId: number) => {
    try {
      const baiBao = await getBaiVietById(baiBaoId);
      setFormData({
        tieu_de: baiBao.tieu_de,
        mo_ta_ngan: baiBao.mo_ta_ngan,
        noi_dung: baiBao.noi_dung,
        anh_dai_dien: baiBao.anh_dai_dien,
        danh_muc_id: baiBao.danh_muc_id || 1,
        hien_thi: baiBao.hien_thi,
        tag_ids: baiBao.tags?.map((tag) => tag.id) || [],
      });
    } catch (error) {
      console.error("Lỗi khi tải bài báo:", error);
      alert("Không thể tải bài báo");
      navigate("/admin/baibao");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.tieu_de.trim() ||
      !formData.mo_ta_ngan.trim() ||
      !formData.noi_dung.trim()
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setIsSaving(true);

      if (isEditing && id) {
        await updateBaiViet(parseInt(id), formData);
        alert("Cập nhật bài báo thành công!");
      } else {
        await createBaiViet(formData);
        alert("Tạo bài báo thành công!");
      }

      navigate("/admin/baibao");
    } catch (error) {
      console.error("Lỗi khi lưu bài báo:", error);
      alert("Có lỗi xảy ra khi lưu bài báo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Thực tế nên upload lên server/cloud và lấy URL
      // Tạm thời để placeholder
      const fakeUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(file.name)}`;
      setFormData((prev) => ({
        ...prev,
        anh_dai_dien: fakeUrl,
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/baibao")}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Quay lại
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditing ? "Chỉnh sửa bài báo" : "Tạo bài báo mới"}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  previewMode
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{previewMode ? "Thoát xem trước" : "Xem trước"}</span>
              </button>

              <button
                form="article-form"
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Save size={16} />
                <span>{isSaving ? "Đang lưu..." : "Lưu bài báo"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {previewMode ? (
          /* Preview Mode */
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {formData.tieu_de || "Tiêu đề bài báo"}
              </h1>

              {formData.anh_dai_dien && (
                <img
                  src={formData.anh_dai_dien}
                  alt={formData.tieu_de}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}

              <div className="text-lg text-gray-600 mb-6 font-medium">
                {formData.mo_ta_ngan || "Mô tả ngắn của bài báo"}
              </div>

              <div className="prose prose-lg max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      formData.noi_dung ||
                      "<p>Nội dung bài báo sẽ hiển thị ở đây...</p>",
                  }}
                />
              </div>

              {formData.tag_ids.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Tags:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.tag_ids.map((tagId) => {
                      const tag = tags.find((t) => t.id === tagId);
                      return tag ? (
                        <span
                          key={tagId}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {tag.ten_tag}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form id="article-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Tiêu đề */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề bài báo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tiêu đề hấp dẫn cho bài báo..."
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.tieu_de}
                    onChange={(e) =>
                      setFormData({ ...formData, tieu_de: e.target.value })
                    }
                  />
                </div>

                {/* Mô tả ngắn */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả ngắn *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Viết mô tả ngắn gọn, thu hút người đọc..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    value={formData.mo_ta_ngan}
                    onChange={(e) =>
                      setFormData({ ...formData, mo_ta_ngan: e.target.value })
                    }
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {formData.mo_ta_ngan.length}/200 ký tự
                  </div>
                </div>

                {/* Nội dung */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung bài báo *
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Hỗ trợ HTML</span>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setPreviewMode(true)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Xem trước
                        </button>
                      </div>
                    </div>
                    <textarea
                      required
                      rows={15}
                      placeholder="<h2>Tiêu đề phần</h2>&#10;<p>Nội dung bài viết của bạn...</p>&#10;<img src='URL_ảnh' alt='Mô tả ảnh'>&#10;<p>Tiếp tục nội dung...</p>"
                      className="w-full px-4 py-3 border-0 focus:ring-0 font-mono text-sm resize-none"
                      value={formData.noi_dung}
                      onChange={(e) =>
                        setFormData({ ...formData, noi_dung: e.target.value })
                      }
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Sử dụng HTML để định dạng nội dung. Ví dụ: &lt;h2&gt;,
                    &lt;p&gt;, &lt;img&gt;, &lt;strong&gt;
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Ảnh đại diện */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ảnh đại diện
                  </label>

                  {formData.anh_dai_dien ? (
                    <div className="relative">
                      <img
                        src={formData.anh_dai_dien}
                        alt="Ảnh đại diện"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, anh_dai_dien: "" })
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500">
                            Tải ảnh lên
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="mt-3">
                    <input
                      type="url"
                      placeholder="Hoặc nhập URL ảnh"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      value={formData.anh_dai_dien}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          anh_dai_dien: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Danh mục */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Danh mục *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.danh_muc_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        danh_muc_id: parseInt(e.target.value),
                      })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.ten_danh_muc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tags
                  </label>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.tag_ids.includes(tag.id)}
                          onChange={() => handleTagToggle(tag.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {tag.ten_tag}
                        </span>
                      </label>
                    ))}
                  </div>

                  {formData.tag_ids.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-1">
                        {formData.tag_ids.map((tagId) => {
                          const tag = tags.find((t) => t.id === tagId);
                          return tag ? (
                            <span
                              key={tagId}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag.ten_tag}
                              <button
                                type="button"
                                onClick={() => handleTagToggle(tagId)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cài đặt */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cài đặt xuất bản
                  </label>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="hien_thi"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={formData.hien_thi}
                      onChange={(e) =>
                        setFormData({ ...formData, hien_thi: e.target.checked })
                      }
                    />
                    <label htmlFor="hien_thi" className="text-sm text-gray-700">
                      Hiển thị công khai
                    </label>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {formData.hien_thi
                      ? "Bài báo sẽ hiển thị công khai cho mọi người"
                      : "Bài báo sẽ được ẩn khỏi trang public"}
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BaiBaoForm;
