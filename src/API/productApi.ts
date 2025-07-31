import apiClient from "../ultis/apiClient";
import type { Product, ProductResponse, InputVariant } from "../types/Product";

export const productApi = {
  getProducts: async (): Promise<ProductResponse> =>
    apiClient
      .get("/san-pham")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy danh sách sản phẩm thất bại.");
      }),
  searchProducts: async (searchTerm: string): Promise<ProductResponse> =>
    apiClient
      .get(`/san-pham?search=${encodeURIComponent(searchTerm)}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Tìm kiếm sản phẩm thất bại.");
      }),
  getProductById: async (productId: number): Promise<Product> =>
    apiClient
      .get(`/san-pham/${productId}`)
      .then((res) => res.data.data)
      .catch(() => {
        throw new Error("Lấy thông tin sản phẩm thất bại.");
      }),

  addProduct: async (
    product: Omit<Product, "ma_san_pham" | "ngay_tao" | "ngay_cap_nhat">
  ): Promise<ProductResponse> =>
    apiClient
      .post("/san-pham", product)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Thêm sản phẩm thất bại.");
      }),
  updateProduct: async (
    ma_san_pham: number,
    product: Omit<
      Product,
      "ma_san_pham" | "ngay_tao" | "ngay_cap_nhat" | "bienthe"
    >
  ): Promise<ProductResponse> =>
    apiClient
      .put(`/san-pham/${ma_san_pham}`, product)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Cập nhật sản phẩm thất bại.");
      }),
  deleteProduct: async (ma_san_pham: number): Promise<void> =>
    apiClient
      .delete(`/san-pham/${ma_san_pham}`)
      .then(() => {})
      .catch(() => {
        throw new Error("Xóa sản phẩm thất bại.");
      }),

  addVariant: async (
    variantId: number,
    variant: InputVariant
  ): Promise<ProductResponse> =>
    apiClient
      .post(`/bien-the/${variantId}`, variant)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Thêm biến thể thất bại.");
      }),
  updateVariant: async (
    variantId: number,
    variant: InputVariant
  ): Promise<ProductResponse> =>
    apiClient
      .put(`/bien-the/${variantId}`, variant)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Cập nhật biến thể thất bại.");
      }),
  deleteVariant: async (variantId: number): Promise<void> =>
    apiClient
      .delete(`/bien-the/${variantId}`)
      .then(() => {})
      .catch(() => {
        throw new Error("Xóa biến thể thất bại.");
      }),
};
