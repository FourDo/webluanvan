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
} from "lucide-react";
import { eventApi } from "../API/eventApi";
import type { Event, EventProduct } from "../types/Event";

const QLSuKien: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventProducts, setEventProducts] = useState<EventProduct[]>([]);
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
  const [productFormData, setProductFormData] = useState({
    ma_san_pham: 0,
    gia_khuyen_mai: 0,
    phan_tram_giam: 0,
    ghi_chu: "",
  });

  // Load events from API
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventApi.fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sự kiện:", error);
      // Fallback to mock data if API fails
      const mockEvents: Event[] = [
        {
          su_kien_id: 1,
          tieu_de: "Khai trương chi nhánh",
          noi_dung:
            "Chào mừng khai trương chi nhánh mới với hàng loạt ưu đãi hấp dẫn.",
          anh_banner:
            "https://res.cloudinary.com/demo/image/upload/v1650000000/banner-khai-truong.jpg",
          slug: "khai-truong-chi-nhanh",
          ngay_bat_dau: "2025-07-05 00:00:00",
          ngay_ket_thuc: "2025-07-20 23:59:59",
          loai_su_kien: "khai-truong",
          duong_dan: "/su-kien/khai-truong-showroom",
          uu_tien: 2,
          hien_thi: 1,
          ngay_tao: "2025-07-03 23:46:56",
          ngay_cap_nhat: "2025-07-04 00:15:09",
        },
      ];
      setEvents(mockEvents);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventProducts = async (eventId: number) => {
    try {
      const products = await eventApi.getEventProducts(eventId);
      setEventProducts(products);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm sự kiện:", error);
      setEventProducts([]);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.tieu_de.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEvent = () => {
    setEditingEvent(null);
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
    setShowModal(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      tieu_de: event.tieu_de,
      noi_dung: event.noi_dung,
      anh_banner: event.anh_banner,
      ngay_bat_dau:
        event.ngay_bat_dau.split(" ")[0] +
        "T" +
        event.ngay_bat_dau.split(" ")[1],
      ngay_ket_thuc:
        event.ngay_ket_thuc.split(" ")[0] +
        "T" +
        event.ngay_ket_thuc.split(" ")[1],
      loai_su_kien: event.loai_su_kien,
      uu_tien: event.uu_tien,
      hien_thi: event.hien_thi,
    });
    setShowModal(true);
  };

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      try {
        await eventApi.deleteEvent(id);
        setEvents(events.filter((event) => event.su_kien_id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa sự kiện:", error);
        alert("Xóa sự kiện thất bại!");
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
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        ngay_bat_dau: formData.ngay_bat_dau.replace("T", " "),
        ngay_ket_thuc: formData.ngay_ket_thuc.replace("T", " "),
      };

      if (editingEvent) {
        await eventApi.updateEvent(editingEvent.su_kien_id, submitData);
        await loadEvents();
      } else {
        await eventApi.createEvent(submitData);
        await loadEvents();
      }
      setShowModal(false);
    } catch (error) {
      console.error("Lỗi khi lưu sự kiện:", error);
      alert("Lưu sự kiện thất bại!");
    }
  };

  const handleShowProducts = (event: Event) => {
    setSelectedEvent(event);
    loadEventProducts(event.su_kien_id);
    setShowProductModal(true);
  };

  const handleAddProduct = async () => {
    if (!selectedEvent) return;

    try {
      await eventApi.addProductsToEvent({
        su_kien_id: selectedEvent.su_kien_id,
        san_pham: [productFormData],
      });
      loadEventProducts(selectedEvent.su_kien_id);
      setProductFormData({
        ma_san_pham: 0,
        gia_khuyen_mai: 0,
        phan_tram_giam: 0,
        ghi_chu: "",
      });
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert("Thêm sản phẩm thất bại!");
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    if (!selectedEvent) return;

    if (
      window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi sự kiện?")
    ) {
      try {
        await eventApi.removeProductFromEvent(
          selectedEvent.su_kien_id,
          productId
        );
        loadEventProducts(selectedEvent.su_kien_id);
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        alert("Xóa sản phẩm thất bại!");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const isEventActive = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.ngay_bat_dau);
    const endDate = new Date(event.ngay_ket_thuc);
    return now >= startDate && now <= endDate;
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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Sự kiện</h1>
        <button
          onClick={handleAddEvent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Thêm Sự kiện
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
            placeholder="Tìm kiếm sự kiện..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
            {filteredEvents.map((event) => (
              <tr key={event.su_kien_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-16 h-10 bg-gray-200 rounded flex-shrink-0 mr-4">
                      {event.anh_banner ? (
                        <img
                          src={event.anh_banner}
                          alt={event.tieu_de}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Calendar className="text-gray-400 w-full h-full p-2" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {event.tieu_de}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {event.noi_dung}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>Từ: {formatDate(event.ngay_bat_dau)}</div>
                    <div>Đến: {formatDate(event.ngay_ket_thuc)}</div>
                  </div>
                  {isEventActive(event) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      Đang diễn ra
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {event.loai_su_kien}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {event.uu_tien}
                  </span>
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
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleShowProducts(event)}
                      className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50"
                      title="Quản lý sản phẩm"
                    >
                      <Package size={16} />
                    </button>
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.su_kien_id)}
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
        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy sự kiện nào
          </div>
        )}
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingEvent ? "Sửa Sự kiện" : "Thêm Sự kiện Mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.tieu_de}
                    onChange={(e) =>
                      setFormData({ ...formData, tieu_de: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.noi_dung}
                    onChange={(e) =>
                      setFormData({ ...formData, noi_dung: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Banner
                  </label>
                  <input
                    type="url"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.anh_banner}
                    onChange={(e) =>
                      setFormData({ ...formData, anh_banner: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.ngay_bat_dau}
                    onChange={(e) =>
                      setFormData({ ...formData, ngay_bat_dau: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.ngay_ket_thuc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ngay_ket_thuc: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại sự kiện
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.loai_su_kien}
                    onChange={(e) =>
                      setFormData({ ...formData, loai_su_kien: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ưu tiên
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.uu_tien}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        uu_tien: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hien_thi"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={formData.hien_thi === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hien_thi: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label
                      htmlFor="hien_thi"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Hiển thị sự kiện
                    </label>
                  </div>
                </div>
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
                  {editingEvent ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Management Modal */}
      {showProductModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Quản lý sản phẩm - {selectedEvent.tieu_de}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Add Product Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-md font-medium mb-3">
                Thêm sản phẩm vào sự kiện
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã sản phẩm
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productFormData.ma_san_pham}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        ma_san_pham: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá khuyến mãi
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productFormData.gia_khuyen_mai}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        gia_khuyen_mai: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    % Giảm
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productFormData.phan_tram_giam}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        phan_tram_giam: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={productFormData.ghi_chu}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        ghi_chu: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <button
                onClick={handleAddProduct}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={16} />
                Thêm sản phẩm
              </button>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã SP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá khuyến mãi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Giảm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ghi chú
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.ma_san_pham}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.gia_khuyen_mai.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          -{product.phan_tram_giam}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.ghi_chu}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            handleRemoveProduct(product.ma_san_pham)
                          }
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
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
      )}
    </div>
  );
};

export default QLSuKien;
