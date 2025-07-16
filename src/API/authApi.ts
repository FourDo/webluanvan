import apiClient from "../ultis/apiClient"; // Correct path and name
import type {
  RegisterCredentials,
  RegisterResponse,
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
  UpdateUserCredentials,
  UpdateUserResponse,
  ResetPasswordCredentials,
  GetUserInfoResponse,
} from "../types/auth";

const authApi = {
  register: (credentials: RegisterCredentials): Promise<RegisterResponse> =>
    apiClient
      .post("/auth/register", credentials)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Đăng ký thất bại…");
      }),

  login: (credentials: LoginCredentials): Promise<LoginResponse> =>
    apiClient
      .post("/auth/login", credentials)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Đăng nhập thất bại…");
      }),

  logout: (): Promise<LogoutResponse> =>
    apiClient
      .post("/auth/logout", {})
      .then((res) => res.data)
      .catch((error) => {
        console.error("Logout error:", error);
        throw new Error("Đăng xuất sai, nhưng client vẫn được logout.");
      }),

  forgotPasswordSendOtp: (email: string): Promise<{ message: string }> =>
    apiClient
      .post("/forgot-password/send-otp", { email })
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Gửi OTP thất bại…");
      }),

  forgotPasswordVerifyOtp: (
    email: string,
    otp: string
  ): Promise<{ message: string }> =>
    apiClient
      .post("/forgot-password/verify-otp", { email, otp })
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Xác thực OTP thất bại…");
      }),

  forgotPasswordReset: (
    email: string,
    new_password: string,
    new_password_confirmation: string
  ): Promise<{ message: string }> =>
    apiClient
      .post("/forgot-password/reset", {
        email,
        new_password,
        new_password_confirmation,
      })
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Reset mật khẩu thất bại…");
      }),

  updateUser: (
    credentials: UpdateUserCredentials
  ): Promise<UpdateUserResponse> =>
    apiClient
      .put("/auth/update", credentials)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Cập nhật thông tin thất bại…");
      }),
  resetpassword: (
    resetpasswordCredentials: ResetPasswordCredentials
  ): Promise<{ message: string }> =>
    apiClient
      .post("/auth/doi-mat-khau", resetpasswordCredentials)
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Đặt lại mật khẩu thất bại…");
      }),

  getUserInfo: (): Promise<GetUserInfoResponse> =>
    apiClient
      .get("/auth/me")
      .then((res) => res.data)
      .catch(() => {
        throw new Error("Lấy thông tin người dùng thất bại…");
      }),
};

export default authApi;
