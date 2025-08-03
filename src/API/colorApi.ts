import apiClient from "../ultis/apiClient";
import type { Color } from "../types/Color";

export const colorApi = {
  fetchColors: () =>
    apiClient
      .get<Color[]>("/mau-sac")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy danh sách màu sắc thất bại.");
      }),

  deleteColor: (id: number) =>
    apiClient
      .delete(`/mau-sac/${id}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Xóa màu sắc thất bại.");
      }),

  saveColor: (formData: {
    ten_mau_sac: string;
    mo_ta: string;
    hex_code: string;
  }) =>
    apiClient
      .post<Color>("/mau-sac", formData)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lưu màu sắc thất bại.");
      }),
};

export default colorApi;
