import axios, { type AxiosResponse } from "axios";
import Cookies from "js-cookie";
import type { Product, ProductResponse, InputVariant } from "../types/Product";

const instance = axios.create({
  baseURL: "https://luanvan-7wv1.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor để thêm token vào header
instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    console.log("Token từ cookie:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Lấy danh sách sản phẩm
export const getProducts = async (): Promise<ProductResponse> => {
  try {
    const response: AxiosResponse<ProductResponse> =
      await instance.get("/san-pham");
    return response.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi lấy danh sách sản phẩm:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách sản phẩm"
    );
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (productId: number): Promise<Product> => {
  try {
    const response: AxiosResponse<ProductResponse> = await instance.get(
      `/san-pham/${productId}`
    );
    return response.data.data as Product;
  } catch (error: any) {
    console.error(
      "Lỗi khi lấy thông tin sản phẩm:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        `Không thể lấy thông tin sản phẩm ${productId}`
    );
  }
};

// Thêm sản phẩm mới
export const addProduct = async (
  product: Omit<Product, "ma_san_pham" | "ngay_tao" | "ngay_cap_nhat">
): Promise<ProductResponse> => {
  try {
    const payload = {
      ...product,
      ma_danh_muc: product.ten_danh_muc,
    };
    console.log("Dữ liệu gửi đi:", payload);
    const response: AxiosResponse<ProductResponse> = await instance.post(
      "/san-pham",
      payload
    );
    console.log("Phản hồi API:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi thêm sản phẩm:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Không thể thêm sản phẩm");
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (
  ma_san_pham: number,
  product: Omit<
    Product,
    "ma_san_pham" | "ngay_tao" | "ngay_cap_nhat" | "bienthe"
  >
): Promise<ProductResponse> => {
  try {
    const payload = {
      ...product,
      ten_danh_muc: product.ten_danh_muc, // Gửi đúng tên danh mục, không gửi ma_danh_muc
    };
    console.log("Dữ liệu cập nhật:", { ma_san_pham, ...payload });
    const response: AxiosResponse<ProductResponse> = await instance.put(
      `/san-pham/${ma_san_pham}`,
      payload
    );
    console.log("Phản hồi API:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi cập nhật sản phẩm:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        `Không thể cập nhật sản phẩm ${ma_san_pham}`
    );
  }
};

// Thêm biến thể mới
export const addVariant = async (
  productId: number,
  variant: InputVariant
): Promise<ProductResponse> => {
  try {
    const payload = {
      ...variant,
      ma_san_pham: productId,
      gia_ban: Number(variant.gia_ban),
    };
    console.log("Dữ liệu thêm biến thể:", payload);
    const response: AxiosResponse<ProductResponse> = await instance.post(
      "/bien-the",
      payload
    );
    console.log("Phản hồi API:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi thêm biến thể:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Không thể thêm biến thể");
  }
};

// Cập nhật biến thể
export const updateVariant = async (
  variantId: number,
  variant: InputVariant
): Promise<ProductResponse> => {
  try {
    const payload = {
      ...variant,
      gia_ban: Number(variant.gia_ban),
    };
    console.log("Dữ liệu cập nhật biến thể:", { variantId, ...payload });
    const response: AxiosResponse<ProductResponse> = await instance.put(
      `/bien-the/${variantId}`,
      payload
    );
    console.log("Phản hồi API:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Lỗi khi cập nhật biến thể:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        `Không thể cập nhật biến thể ${variantId}`
    );
  }
};

// Xóa biến thể
export const deleteVariant = async (variantId: number): Promise<void> => {
  try {
    await instance.delete(`/bien-the/${variantId}`);
    console.log(`Đã xóa biến thể ${variantId}`);
  } catch (error: any) {
    console.error(
      "Lỗi khi xóa biến thể:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || `Không thể xóa biến thể ${variantId}`
    );
  }
};

// Xóa sản phẩm
export const deleteProduct = async (ma_san_pham: number): Promise<void> => {
  try {
    await instance.delete(`/san-pham/${ma_san_pham}`);
    console.log(`Đã xóa sản phẩm ${ma_san_pham}`);
  } catch (error: any) {
    console.error(
      "Lỗi khi xóa sản phẩm:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || `Không thể xóa sản phẩm ${ma_san_pham}`
    );
  }
};
