import apiClient from "../ultis/apiClient";
import type { Account } from "../types/Account";

// Interface cho response từ API
interface AccountsResponse {
  message: string;
  data: Account[];
}

export const accountApi = {
  // Lấy danh sách tài khoản
  fetchAccounts: () =>
    apiClient
      .get<AccountsResponse>("/qlytaikhoan")
      .then((res) => res.data) // Trả về toàn bộ response object {message, data}
      .catch(() => {
        throw new Error("Lấy danh sách tài khoản thất bại.");
      }),

  // Cập nhật trạng thái tài khoản
  updateAccountStatus: (id: number, trang_thai: string) =>
    apiClient
      .patch(`/qlytaikhoan/${id}`, { trang_thai })
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Cập nhật trạng thái tài khoản thất bại.");
      }),

  // Cấp quyền cho tài khoản
  updateAccountRole: (id: number, vai_tro: string) =>
    apiClient
      .put(`/qlytaikhoan/role/${id}`, { vai_tro })
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Cấp quyền tài khoản thất bại.");
      }),

  // Mở khóa tài khoản (chỉ admin)
  unlockAccount: (id: number) =>
    apiClient
      .patch(`/qlytaikhoan/unlock/${id}`)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Mở khóa tài khoản thất bại.");
      }),
};

export default accountApi;
