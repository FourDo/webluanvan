import axios from "axios";
import type {
  CategoryResponse,
  SingleCategoryResponse,
  CreateCategoryCredentials,
  UpdateCategoryCredentials,
} from "../types/category";

const categoryApi = {
  // Lấy danh sách danh mục
  getAll: async (): Promise<CategoryResponse> => {
    try {
      const response = await axios.get<CategoryResponse>(
        "https://luanvan-7wv1.onrender.com/api/danhmuc",
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Lấy danh sách danh mục thất bại.");
    }
  },

  // Lấy thông tin một danh mục theo ID
  getById: async (id: number): Promise<SingleCategoryResponse> => {
    try {
      const response = await axios.get<SingleCategoryResponse>(
        `https://luanvan-7wv1.onrender.com/api/danhmuc/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Lấy thông tin danh mục thất bại.");
    }
  },

  // Tạo danh mục mới
  create: async (
    credentials: CreateCategoryCredentials
  ): Promise<SingleCategoryResponse> => {
    try {
      const response = await axios.post<SingleCategoryResponse>(
        "https://luanvan-7wv1.onrender.com/api/danhmuc",
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        "Tạo danh mục thất bại. Vui lòng kiểm tra lại thông tin."
      );
    }
  },

  // Cập nhật danh mục
  update: async (
    id: number,
    credentials: UpdateCategoryCredentials
  ): Promise<SingleCategoryResponse> => {
    try {
      const response = await axios.put<SingleCategoryResponse>(
        `https://luanvan-7wv1.onrender.com/api/danhmuc/${id}`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        "Cập nhật danh mục thất bại. Vui lòng kiểm tra lại thông tin."
      );
    }
  },

  // Xóa danh mục
  delete: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await axios.delete<{ message: string }>(
        `https://luanvan-7wv1.onrender.com/api/danhmuc/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Xóa danh mục thất bại.");
    }
  },
};

export default categoryApi;
