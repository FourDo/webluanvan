import apiClient from "../ultis/apiClient";
import type { BaiViet, BaiVietForm } from "../types/BaiViet";

export interface BaiVietResponse {
  data: BaiViet[] | BaiViet;
}

export const baibaoApi = {
  // Lấy danh sách bài viết
  getAllBaiViet: () =>
    apiClient
      .get<{ data: BaiViet[] }>("/baiviet")
      .then((res) => res.data.data) // Lấy array từ response.data.data
      .catch(() => {
        throw new Error("Lấy danh sách bài viết thất bại.");
      }),

  // Lấy bài viết theo ID
  getBaiVietById: (id: number) =>
    apiClient
      .get<{ data: BaiViet }>(`/baiviet/${id}`)
      .then((res) => res.data.data) // Lấy object từ response.data.data
      .catch(() => {
        throw new Error("Lấy chi tiết bài viết thất bại.");
      }),

  // Tạo bài viết mới
  createBaiViet: (data: BaiVietForm) =>
    apiClient
      .post<{ data: BaiViet }>("/baiviet", data)
      .then((res) => res.data.data) // Lấy object từ response.data.data
      .catch(() => {
        throw new Error("Tạo bài viết thất bại.");
      }),

  // Cập nhật bài viết
  updateBaiViet: (id: number, data: BaiVietForm) =>
    apiClient
      .put<{ data: BaiViet }>(`/baiviet/${id}`, data)
      .then((res) => res.data.data) // Lấy object từ response.data.data
      .catch(() => {
        throw new Error("Cập nhật bài viết thất bại.");
      }),

  // Xóa bài viết
  deleteBaiViet: (id: number) =>
    apiClient
      .delete(`/baiviet/${id}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Xóa bài viết thất bại.");
      }),
};

// Export default và named exports để tương thích với code cũ
export default baibaoApi;

// Export các function riêng lẻ để tương thích
export const getAllBaiViet = baibaoApi.getAllBaiViet;
export const getBaiVietById = baibaoApi.getBaiVietById;
export const createBaiViet = baibaoApi.createBaiViet;
export const updateBaiViet = baibaoApi.updateBaiViet;
export const deleteBaiViet = baibaoApi.deleteBaiViet;
