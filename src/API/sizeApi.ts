import apiClient from "../ultis/apiClient";
import type { Size } from "../types/Size";

export const sizeApi = {
  fetchSizes: () =>
    apiClient
      .get<Size[]>("/kich-thuoc")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy danh sách kích thước thất bại.");
      }),

  deleteSize: (id: number) =>
    apiClient
      .delete(`/kich-thuoc/${id}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Xóa kích thước thất bại.");
      }),

  saveSize: (formData: { ten_kich_thuoc: string; mo_ta: string }) =>
    apiClient
      .post<Size>("/kich-thuoc", formData)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lưu kích thước thất bại.");
      }),
};

export default sizeApi;
