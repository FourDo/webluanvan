import apiClient from "../ultis/apiClient";
import type { Event, EventProduct, EventProductRequest } from "../types/Event";

export type { Event, EventProduct, EventProductRequest };

export const eventApi = {
  // Lấy danh sách sự kiện
  fetchEvents: () =>
    apiClient
      .get<{ data: Event[] }>("/event")
      .then((res) => res.data.data)
      .catch(() => {
        throw new Error("Lấy danh sách sự kiện thất bại.");
      }),

  // Tạo sự kiện mới
  createEvent: (formData: {
    tieu_de: string;
    noi_dung: string;
    anh_banner: string;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
    loai_su_kien: string;
    uu_tien: number;
    hien_thi: number;
  }) =>
    apiClient
      .post<Event>("/event", formData)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Tạo sự kiện thất bại.");
      }),

  // Cập nhật sự kiện
  updateEvent: (id: number, formData: Partial<Event>) =>
    apiClient
      .patch<Event>(`/event/${id}`, formData)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Cập nhật sự kiện thất bại.");
      }),

  // Xóa sự kiện
  deleteEvent: (id: number) =>
    apiClient
      .delete(`/event/${id}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Xóa sự kiện thất bại.");
      }),

  // Thêm sản phẩm vào sự kiện
  addProductsToEvent: (data: EventProductRequest) =>
    apiClient
      .post("/event-sanpham", data)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Thêm sản phẩm vào sự kiện thất bại.");
      }),

  // Lấy danh sách sản phẩm trong sự kiện
  getEventProducts: (eventId: number) =>
    apiClient
      .get<{ data: EventProduct[] }>(`/event-sanpham/${eventId}`)
      .then((res) => res.data.data)
      .catch(() => {
        throw new Error("Lấy danh sách sản phẩm trong sự kiện thất bại.");
      }),

  // Xóa sản phẩm khỏi sự kiện
  removeProductFromEvent: (eventId: number, productId: number) =>
    apiClient
      .delete(`/event-sanpham/${eventId}/${productId}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Xóa sản phẩm khỏi sự kiện thất bại.");
      }),
};

export default eventApi;
