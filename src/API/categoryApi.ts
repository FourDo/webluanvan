import apiClient from "../ultis/apiClient";
import type {
  CategoryResponse,
  SingleCategoryResponse,
  CreateCategoryCredentials,
  UpdateCategoryCredentials,
} from "../types/category";

const categoryApi = {
  getAll: (): Promise<CategoryResponse> =>
    apiClient
      .get("/danhmuc")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy danh sách danh mục thất bại.");
      }),
  // Lấy danh sách danh mục

  getById: (id: number): Promise<SingleCategoryResponse> =>
    apiClient
      .get(`/danhmuc/${id}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy thông tin danh mục thất bại.");
      }),
  getCategoryBySlug: (slug: string): Promise<SingleCategoryResponse> =>
    apiClient
      .get(`/danhmuc/${slug}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy thông tin danh mục thất bại.");
      }),

  create: (
    credentials: CreateCategoryCredentials
  ): Promise<SingleCategoryResponse> =>
    apiClient
      .post("/danhmuc", credentials)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Tạo danh mục thất bại.");
      }),

  update: (
    id: number,
    credentials: UpdateCategoryCredentials
  ): Promise<SingleCategoryResponse> =>
    apiClient
      .put(`/danhmuc/${id}`, credentials)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Cập nhật danh mục thất bại.");
      }),

  delete: (id: number): Promise<{ message: string }> =>
    apiClient
      .delete(`/danhmuc/${id}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Xóa danh mục thất bại.");
      }),
};

export default categoryApi;
