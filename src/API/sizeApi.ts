import axios, { type AxiosResponse } from "axios";
import Cookies from "js-cookie";

// Tạo một instance của axios với cấu hình chung
const instance = axios.create({
  baseURL: "https://luanvan-7wv1.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
// Thêm interceptor để tự động thêm token vào header của mỗi request
instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Lấy danh sách tất cả kích thước
 */
export const fetchSizes = async () => {
  try {
    const response: AxiosResponse = await instance.get("/kich-thuoc");
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách kích thước:", error.response || error);
    // Ném lỗi để component gọi nó có thể bắt và xử lý
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy danh sách kích thước"
    );
  }
};

/**
 * Xóa một kích thước theo ID
 */
export const deleteSize = async (id: number) => {
  // Phần confirm này có thể giữ lại hoặc chuyển ra component tùy vào logic
  if (!confirm("Bạn có chắc chắn muốn xóa kích thước này?")) {
    // Trả về để không thực hiện hành động xóa
    return { success: false, cancelled: true };
  }

  try {
    await instance.delete(`/kich-thuoc/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi khi xóa kích thước:", error.response || error);
    throw new Error(error.response?.data?.message || "Lỗi khi xóa kích thước");
  }
};

/**
 * Lưu (thêm mới hoặc cập nhật) một kích thước
 */
export const saveSize = async (
  formData: { ten_kich_thuoc: string; mo_ta: string },
  editingItem: { ma_kich_thuoc: number } | null
) => {
  if (!formData.ten_kich_thuoc.trim() || !formData.mo_ta.trim()) {
    // Trả về lỗi validation, không phải lỗi API
    return { success: false, error: "Vui lòng điền đầy đủ thông tin!" };
  }

  try {
    const payload = {
      ten_kich_thuoc: formData.ten_kich_thuoc.trim(),
      mo_ta: formData.mo_ta.trim(),
    };

    let response: AxiosResponse;

    if (editingItem) {
      // Cập nhật kích thước đã có
      response = await instance.put(
        `/kich-thuoc/${editingItem.ma_kich_thuoc}`,
        payload
      );
    } else {
      // Tạo kích thước mới
      response = await instance.post("/kich-thuoc", payload);
    }
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Lỗi khi lưu kích thước:", error.response || error);
    throw new Error(error.response?.data?.message || "Lỗi khi lưu kích thước");
  }
};
