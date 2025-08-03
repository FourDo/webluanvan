import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Calendar,
  Package,
  X,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Archive,
  TrendingUp,
  BarChart3,
  Clock,
  MapPin,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { eventApi } from "../API/eventApi";
import { productApi } from "../API/productApi";
import type { Event, EventProduct } from "../types/Event";
import type { Product } from "../types/Product";

// Event Form Modal Component
const EventFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<Event>) => void;
  event?: Event | null;
  isLoading?: boolean;
}> = ({ isOpen, onClose, onSave, event, isLoading = false }) => {
  const [formData, setFormData] = useState({
    tieu_de: "",
    noi_dung: "",
    anh_banner: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    loai_su_kien: "",
    uu_tien: 1,
    hien_thi: 1,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        tieu_de: event.tieu_de || "",
        noi_dung: event.noi_dung || "",
        anh_banner: event.anh_banner || "",
        ngay_bat_dau: event.ngay_bat_dau
          ? event.ngay_bat_dau.replace(" ", "T").slice(0, 16)
          : "",
        ngay_ket_thuc: event.ngay_ket_thuc
          ? event.ngay_ket_thuc.replace(" ", "T").slice(0, 16)
          : "",
        loai_su_kien: event.loai_su_kien || "",
        uu_tien: event.uu_tien || 1,
        hien_thi: event.hien_thi || 1,
      });
      setImagePreview(event.anh_banner || "");
    } else {
      setFormData({
        tieu_de: "",
        noi_dung: "",
        anh_banner: "",
        ngay_bat_dau: "",
        ngay_ket_thuc: "",
        loai_su_kien: "",
        uu_tien: 1,
        hien_thi: 1,
      });
      setImagePreview("");
    }
    setSelectedImage(null);
  }, [event, isOpen]);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "webluanvan_upload");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dubtdbe8z/image/upload",
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Upload failed");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, anh_banner: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tieu_de.trim()) {
      toast.error("Vui lòng nhập tiêu đề sự kiện");
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = formData.anh_banner;

      // Upload new image if selected
      if (selectedImage) {
        imageUrl = await uploadToCloudinary(selectedImage);
      }

      const submitData = {
        ...formData,
        anh_banner: imageUrl,
        ngay_bat_dau: formData.ngay_bat_dau.replace("T", " "),
        ngay_ket_thuc: formData.ngay_ket_thuc.replace("T", " "),
      };
      onSave(submitData);
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Có lỗi xảy ra khi lưu sự kiện");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {event ? "Sửa sự kiện" : "Thêm sự kiện mới"}
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
                Tiêu đề sự kiện *
              </label>
              <input
                type="text"
                required
                value={formData.tieu_de}
                onChange={(e) =>
                  setFormData({ ...formData, tieu_de: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập tiêu đề sự kiện..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung
              </label>
              <textarea
                value={formData.noi_dung}
                onChange={(e) =>
                  setFormData({ ...formData, noi_dung: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Nhập nội dung sự kiện..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh banner sự kiện
              </label>

              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="text-sm text-gray-600 mb-2">
                      Kéo và thả ảnh vào đây hoặc
                    </div>
                    <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2">
                      <Upload size={16} />
                      Chọn ảnh
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Alternative URL input */}
              <div className="mt-3">
                <label className="block text-xs text-gray-500 mb-1">
                  Hoặc nhập URL ảnh:
                </label>
                <input
                  type="url"
                  value={formData.anh_banner}
                  onChange={(e) => {
                    setFormData({ ...formData, anh_banner: e.target.value });
                    setImagePreview(e.target.value);
                    setSelectedImage(null);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.ngay_bat_dau}
                  onChange={(e) =>
                    setFormData({ ...formData, ngay_bat_dau: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.ngay_ket_thuc}
                  onChange={(e) =>
                    setFormData({ ...formData, ngay_ket_thuc: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại sự kiện
                </label>
                <select
                  value={formData.loai_su_kien}
                  onChange={(e) =>
                    setFormData({ ...formData, loai_su_kien: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Chọn loại sự kiện</option>
                  <option value="khai-truong">Khai trương</option>
                  <option value="khuyen-mai">Khuyến mãi</option>
                  <option value="san-pham-moi">Sản phẩm mới</option>
                  <option value="mua-sam">Mua sắm</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ưu tiên
                </label>
                <select
                  value={formData.uu_tien}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      uu_tien: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value={1}>Thấp</option>
                  <option value={2}>Trung bình</option>
                  <option value={3}>Cao</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isUploading
                  ? "Đang tải ảnh..."
                  : isLoading
                    ? "Đang lưu..."
                    : event
                      ? "Cập nhật"
                      : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Event Card Component
const EventCard: React.FC<{
  event: Event;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (event: Event) => void;
  onViewProducts: (event: Event) => void;
}> = ({ event, onView, onEdit, onDelete, onToggleStatus, onViewProducts }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatusBadge = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.ngay_bat_dau);
    const endDate = new Date(event.ngay_ket_thuc);

    if (now < startDate) {
      return (
        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold rounded-full">
          Sắp diễn ra
        </span>
      );
    } else if (now > endDate) {
      return (
        <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-semibold rounded-full">
          Đã kết thúc
        </span>
      );
    } else {
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
          Đang diễn ra
        </span>
      );
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 3:
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-semibold rounded-full">
            Cao
          </span>
        );
      case 2:
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold rounded-full">
            Trung bình
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-semibold rounded-full">
            Thấp
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
      <div className="relative">
        <div
          className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center"
          style={{
            backgroundImage: event.anh_banner
              ? `url(${event.anh_banner})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!event.anh_banner && (
            <Calendar className="w-16 h-16 text-white opacity-50" />
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {getEventStatusBadge(event)}
          {getPriorityBadge(event.uu_tien)}
        </div>
        <div className="absolute top-3 left-3">
          <button
            onClick={() => onToggleStatus(event)}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              event.hien_thi === 1
                ? "bg-green-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {event.hien_thi === 1 ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 mb-2">
          {event.tieu_de}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {event.noi_dung}
        </p>

        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center">
            <Calendar size={12} className="mr-1" />
            <span>Bắt đầu: {formatDate(event.ngay_bat_dau)}</span>
          </div>
          <div className="flex items-center">
            <Clock size={12} className="mr-1" />
            <span>Kết thúc: {formatDate(event.ngay_ket_thuc)}</span>
          </div>
          {event.loai_su_kien && (
            <div className="flex items-center">
              <MapPin size={12} className="mr-1" />
              <span className="capitalize">{event.loai_su_kien}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex justify-center space-x-2 mb-2">
            <button
              onClick={() => onView(event.su_kien_id)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Eye size={14} className="mr-1" />
              Xem
            </button>
            <button
              onClick={() => onEdit(event.su_kien_id)}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Edit size={14} className="mr-1" />
              Sửa
            </button>
            <button
              onClick={() => onDelete(event.su_kien_id)}
              className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <button
            onClick={() => onViewProducts(event)}
            className="w-full bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
          >
            <Package size={14} className="mr-1" />
            Quản lý sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ITEMS_PER_PAGE = 12;

const QLSuKien: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventProducts, setEventProducts] = useState<EventProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [productFormData, setProductFormData] = useState({
    ma_san_pham: 0,
    gia_sau_khuyen_mai: 0,
    phan_tram_giam: 0,
    ghi_chu: "",
  });

  // Helper function to round price to nearest thousand
  const roundToThousand = (price: number): number => {
    return Math.floor(price / 1000) * 1000;
  };

  // Get selected product info
  const selectedProduct = products.find(
    (p) => p.ma_san_pham === productFormData.ma_san_pham
  );
  const originalPrice = selectedProduct
    ? parseFloat(selectedProduct.bienthe[0]?.gia_ban || "0")
    : 0;

  // Load events from API
  useEffect(() => {
    loadEvents();
  }, []);

  // Load products when showProductModal mở
  useEffect(() => {
    if (showProductModal) {
      productApi.getProducts().then((res) => {
        if (Array.isArray(res.data)) setProducts(res.data);
      });
    }
  }, [showProductModal]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventApi.fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sự kiện:", error);
      toast.error("Không thể tải danh sách sự kiện");
      // Fallback to mock data if API fails
    } finally {
      setLoading(false);
    }
  };

  const loadEventProducts = async (eventId: number) => {
    try {
      const products = await eventApi.getEventProducts(eventId);
      setEventProducts(products);
    } catch (error) {
      setEventProducts([]);
    }
  };

  // Filter events
  const filteredEvents = events.filter(
    (event) =>
      event.tieu_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.noi_dung.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.loai_su_kien.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const displayedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Event handlers
  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (id: number) => {
    const eventToEdit = events.find((event) => event.su_kien_id === id);
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setIsModalOpen(true);
    }
  };

  const handleViewEvent = (id: number) => {
    console.log("View event:", id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setError(null);
  };

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    setIsSubmitting(true);
    setError(null);

    // Đảm bảo gửi đủ trường khi update
    const fullData = {
      tieu_de: eventData.tieu_de || "",
      noi_dung: eventData.noi_dung || "",
      anh_banner: eventData.anh_banner || "",
      ngay_bat_dau: eventData.ngay_bat_dau || "",
      ngay_ket_thuc: eventData.ngay_ket_thuc || "",
      loai_su_kien: eventData.loai_su_kien || "",
      uu_tien: eventData.uu_tien ?? 1,
      hien_thi: eventData.hien_thi ?? 1,
    };
    try {
      if (editingEvent) {
        await eventApi.updateEvent(editingEvent.su_kien_id, fullData);
        toast.success("Cập nhật sự kiện thành công!");
      } else {
        await eventApi.createEvent(fullData as any);
        toast.success("Thêm sự kiện mới thành công!");
      }
      await loadEvents();
      handleCloseModal();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        // Laravel validation errors
        const errors = err.response.data.errors;
        const msg = Object.values(errors)
          .map((v: any) => v.join("\n"))
          .join("\n");
        setError(msg);
        alert(msg);
      } else {
        toast.error((err as Error).message || "Không thể lưu sự kiện.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      try {
        await eventApi.deleteEvent(id);
        setEvents(events.filter((event) => event.su_kien_id !== id));
        toast.success("Xóa sự kiện thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa sự kiện:", error);
        toast.error("Xóa sự kiện thất bại!");
      }
    }
  };

  const handleToggleStatus = async (event: Event) => {
    try {
      const updatedEvent = { ...event, hien_thi: event.hien_thi === 1 ? 0 : 1 };
      await eventApi.updateEvent(event.su_kien_id, updatedEvent);
      setEvents(
        events.map((e) =>
          e.su_kien_id === event.su_kien_id ? updatedEvent : e
        )
      );
      toast.success(
        `${updatedEvent.hien_thi === 1 ? "Hiển thị" : "Ẩn"} sự kiện thành công!`
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  const handleShowProducts = (event: Event) => {
    setSelectedEvent(event);
    loadEventProducts(event.su_kien_id);
    setShowProductModal(true);
  };

  const handleAddProduct = async () => {
    if (!selectedEvent) return;

    // Validation
    if (!productFormData.ma_san_pham || productFormData.ma_san_pham === 0) {
      toast.error("Vui lòng chọn sản phẩm!");
      return;
    }

    if (productFormData.gia_sau_khuyen_mai <= 0) {
      toast.error("Giá khuyến mãi phải lớn hơn 0!");
      return;
    }

    if (
      productFormData.phan_tram_giam < 0 ||
      productFormData.phan_tram_giam > 100
    ) {
      toast.error("Phần trăm giảm phải từ 0 đến 100!");
      return;
    }

    if (
      originalPrice > 0 &&
      productFormData.gia_sau_khuyen_mai >= originalPrice
    ) {
      toast.error("Giá khuyến mãi phải nhỏ hơn giá gốc!");
      return;
    }

    const payload = {
      su_kien_id: selectedEvent.su_kien_id,
      san_pham: [productFormData],
    };
    try {
      await eventApi.addProductsToEvent(payload);
      loadEventProducts(selectedEvent.su_kien_id);
      setProductFormData({
        ma_san_pham: 0,
        gia_sau_khuyen_mai: 0,
        phan_tram_giam: 0,
        ghi_chu: "",
      });
      toast.success("Thêm sản phẩm vào sự kiện thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      toast.error("Thêm sản phẩm thất bại!");
    }
  };

  // Handle percentage change and auto-calculate discount price
  const handlePercentageChange = (percentage: number) => {
    if (percentage < 0 || percentage > 100) {
      toast.warning("Phần trăm giảm phải từ 0 đến 100!");
      return;
    }

    setProductFormData((prev) => ({
      ...prev,
      phan_tram_giam: percentage,
      gia_sau_khuyen_mai:
        originalPrice > 0
          ? roundToThousand(originalPrice * (1 - percentage / 100))
          : 0,
    }));
  };

  // Handle discount price change and auto-calculate percentage
  const handleDiscountPriceChange = (discountPrice: number) => {
    if (discountPrice < 0) {
      toast.warning("Giá khuyến mãi không thể âm!");
      return;
    }

    if (originalPrice > 0 && discountPrice >= originalPrice) {
      toast.warning("Giá khuyến mãi phải nhỏ hơn giá gốc!");
      return;
    }

    const roundedPrice = roundToThousand(discountPrice);
    const percentage =
      originalPrice > 0
        ? Math.round(((originalPrice - roundedPrice) / originalPrice) * 100)
        : 0;

    setProductFormData((prev) => ({
      ...prev,
      gia_sau_khuyen_mai: roundedPrice,
      phan_tram_giam: percentage,
    }));
  };

  // Handle product selection change
  const handleProductChange = (productId: number) => {
    setProductFormData({
      ma_san_pham: productId,
      gia_sau_khuyen_mai: 0,
      phan_tram_giam: 0,
      ghi_chu: "",
    });
  };

  const handleRemoveProduct = async (productId: number) => {
    if (!selectedEvent) return;

    if (
      window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi sự kiện?")
    ) {
      try {
        await eventApi.removeProductFromEvent(productId);
        loadEventProducts(selectedEvent.su_kien_id);
        toast.success("Xóa sản phẩm khỏi sự kiện thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        toast.error("Xóa sản phẩm thất bại!");
      }
    }
  };

  // Dashboard Stats
  const totalEvents = events.length;
  const activeEvents = events.filter((e) => {
    const now = new Date();
    const startDate = new Date(e.ngay_bat_dau);
    const endDate = new Date(e.ngay_ket_thuc);
    return now >= startDate && now <= endDate;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-4 md:p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý Sự kiện
                </h1>
                <p className="text-gray-600">
                  Quản lý và theo dõi các sự kiện của cửa hàng
                </p>
              </div>
            </div>
            <button
              onClick={handleAddEvent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Thêm Sự kiện</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng số sự kiện
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalEvents}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Sự kiện đang diễn ra
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeEvents}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
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
                placeholder="Tìm kiếm theo tiêu đề, nội dung, loại sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List size={20} />
              </button>
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
        {displayedEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Archive className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? "Không tìm thấy sự kiện" : "Chưa có sự kiện nào"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Thử thay đổi từ khóa tìm kiếm"
                : "Hãy thêm sự kiện đầu tiên của bạn"}
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedEvents.map((event) => (
                  <EventCard
                    key={event.su_kien_id}
                    event={event}
                    onView={handleViewEvent}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onToggleStatus={handleToggleStatus}
                    onViewProducts={handleShowProducts}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sự kiện
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ưu tiên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedEvents.map((event) => (
                      <tr key={event.su_kien_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div
                                className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
                                style={{
                                  backgroundImage: event.anh_banner
                                    ? `url(${event.anh_banner})`
                                    : undefined,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              >
                                {!event.anh_banner && (
                                  <Calendar className="w-6 h-6 text-white" />
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {event.tieu_de}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {event.noi_dung}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(event.ngay_bat_dau).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            đến{" "}
                            {new Date(event.ngay_ket_thuc).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                            {event.loai_su_kien}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.uu_tien === 3 && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Cao
                            </span>
                          )}
                          {event.uu_tien === 2 && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Trung bình
                            </span>
                          )}
                          {event.uu_tien === 1 && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              Thấp
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(event)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              event.hien_thi === 1
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {event.hien_thi === 1 ? (
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
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewEvent(event.su_kien_id)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditEvent(event.su_kien_id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleShowProducts(event)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Package size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteEvent(event.su_kien_id)
                              }
                              className="text-red-600 hover:text-red-900"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 mt-6">
                <div className="text-sm text-gray-500">
                  Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredEvents.length
                  )}{" "}
                  trong số {filteredEvents.length} sự kiện
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Event Form Modal */}
      <EventFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        event={editingEvent}
        isLoading={isSubmitting}
      />

      {/* Product Management Modal */}
      {showProductModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Quản lý sản phẩm - {selectedEvent.tieu_de}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Add Product Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="text-md font-medium mb-3">
                  Thêm sản phẩm vào sự kiện
                </h4>

                {/* Product Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn sản phẩm *
                  </label>
                  <select
                    value={productFormData.ma_san_pham || ""}
                    onChange={(e) =>
                      handleProductChange(parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map((sp) => (
                      <option key={sp.ma_san_pham} value={sp.ma_san_pham}>
                        {sp.ten_san_pham} (#{sp.ma_san_pham})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Information */}
                {selectedProduct && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-800 mb-2">
                      Thông tin giá sản phẩm
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Giá gốc:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {originalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá khuyến mãi (đ) *
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      max={originalPrice}
                      value={productFormData.gia_sau_khuyen_mai || ""}
                      onChange={(e) =>
                        handleDiscountPriceChange(
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {originalPrice > 0 &&
                      productFormData.gia_sau_khuyen_mai >= originalPrice && (
                        <p className="text-red-500 text-xs mt-1">
                          Giá KM phải nhỏ hơn giá gốc
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phần trăm giảm (%) *
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={productFormData.phan_tram_giam || ""}
                      onChange={(e) =>
                        handlePercentageChange(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {(productFormData.phan_tram_giam < 0 ||
                      productFormData.phan_tram_giam > 100) && (
                      <p className="text-red-500 text-xs mt-1">Từ 0 đến 100%</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <input
                      type="text"
                      placeholder="Ghi chú"
                      value={productFormData.ghi_chu}
                      onChange={(e) =>
                        setProductFormData({
                          ...productFormData,
                          ghi_chu: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Quick Percentage Buttons */}
                {selectedProduct && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giảm giá nhanh:
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {[10, 20, 30, 50].map((percent) => (
                        <button
                          key={percent}
                          type="button"
                          onClick={() => handlePercentageChange(percent)}
                          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                        >
                          -{percent}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddProduct}
                  disabled={
                    !selectedProduct || productFormData.gia_sau_khuyen_mai <= 0
                  }
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  Thêm sản phẩm vào sự kiện
                </button>
              </div>

              {/* Products List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mã SP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Giá KM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        % Giảm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ghi chú
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eventProducts.map((product) => (
                      <tr
                        key={product.ma_san_pham}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.ma_san_pham}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.gia_sau_khuyen_mai?.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.phan_tram_giam}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.ghi_chu}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              handleRemoveProduct(product.ma_san_pham)
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {eventProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có sản phẩm nào trong sự kiện này
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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

export default QLSuKien;
