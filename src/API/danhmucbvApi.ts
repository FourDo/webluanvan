import apiClient from "../ultis/apiClient";

export interface DanhMucBaiViet {
  id: number;
  ten_danh_muc: string;
  slug: string;
  mo_ta?: string | null;
  hien_thi: number;
  so_bai_viet: number;
}

export interface DanhMucBaiVietResponse {
  data: DanhMucBaiViet[];
}

export const danhmucbvApi = {
  // Lấy danh sách danh mục bài viết
  getAll: () =>
    apiClient
      .get<DanhMucBaiVietResponse>("/danhmucbv")
      .then((res) => res.data.data) // Lấy array từ response.data.data
      .catch(() => {
        throw new Error("Lấy danh sách danh mục bài viết thất bại.");
      }),

  // Lấy danh mục theo ID
  getById: (id: number) =>
    apiClient
      .get<{ data: DanhMucBaiViet }>(`/danhmucbv/${id}`)
      .then((res) => res.data.data)
      .catch(() => {
        throw new Error("Lấy danh mục bài viết thất bại.");
      }),

  // Tạo danh mục mới
  create: (data: Omit<DanhMucBaiViet, "id" | "so_bai_viet">) =>
    apiClient
      .post<{ data: DanhMucBaiViet }>("/danhmucbv", data)
      .then((res) => res.data.data)
      .catch(() => {
        throw new Error("Tạo danh mục bài viết thất bại.");
      }),

  // Cập nhật danh mục
  update: (id: number, data: Omit<DanhMucBaiViet, "id" | "so_bai_viet">) =>
    apiClient
      .put<{ data: DanhMucBaiViet }>(`/danhmucbv/${id}`, data)
      .then((res) => res.data.data)
      .catch(() => {
        throw new Error("Cập nhật danh mục bài viết thất bại.");
      }),

  // Xóa danh mục
  delete: (id: number) =>
    apiClient
      .delete(`/danhmucbv/${id}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Xóa danh mục bài viết thất bại.");
      }),
};

export default danhmucbvApi;
