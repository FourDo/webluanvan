import axios, { type AxiosResponse } from "axios";
import Cookies from "js-cookie";

const instance = axios.create({
  baseURL: "https://luanvan-7wv1.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("Không tìm thấy token trong cookie");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchColors = async () => {
  try {
    const response: AxiosResponse = await instance.get("/mau-sac");
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Lỗi khi tải màu sắc:", error.response || error);
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy danh sách màu sắc"
    );
  }
};

export const deleteColor = async (id: number) => {
  if (!confirm("Bạn có chắc chắn muốn xóa màu sắc này?")) {
    return { success: false };
  }

  try {
    await instance.delete(`/mau-sac/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi khi xóa màu sắc:", error.response || error);
    throw new Error(error.response?.data?.message || "Lỗi khi xóa màu sắc");
  }
};

export const saveColor = async (
  formData: { ten_mau_sac: string; mo_ta: string; hex_code: string },
  editingItem: { ma_mau_sac: number } | null
) => {
  if (
    !formData.ten_mau_sac.trim() ||
    !formData.mo_ta.trim() ||
    !formData.hex_code.trim()
  ) {
    return { success: false, error: "Vui lòng điền đầy đủ thông tin!" };
  }

  try {
    const payload = {
      ten_mau_sac: formData.ten_mau_sac.trim(),
      mo_ta: formData.mo_ta.trim(),
      hex_code: formData.hex_code.trim(),
    };

    let response: AxiosResponse;
    if (editingItem) {
      // Update existing color
      response = await instance.put(
        `/mau-sac/${editingItem.ma_mau_sac}`,
        payload
      );
    } else {
      // Create new color
      response = await instance.post("/mau-sac", payload);
    }
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Lỗi khi lưu màu sắc:", error.response || error);
    throw new Error(error.response?.data?.message || "Lỗi khi lưu màu sắc");
  }
};
