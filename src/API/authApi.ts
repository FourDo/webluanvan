import axios from "axios";
import type {
  RegisterCredentials,
  RegisterResponse,
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
  UpdateUserCredentials,
  UpdateUserResponse,
} from "../types/auth";

const authApi = {
  register: async (
    credentials: RegisterCredentials
  ): Promise<RegisterResponse> => {
    try {
      const response = await axios.post<RegisterResponse>(
        "https://luanvan-7wv1.onrender.com/api/auth/register",
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
        "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin đăng ký."
      );
    }
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post<LoginResponse>(
        "https://luanvan-7wv1.onrender.com/api/auth/login",
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
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
      );
    }
  },

  logout: async (): Promise<LogoutResponse> => {
    try {
      const response = await axios.post<LogoutResponse>(
        "https://luanvan-7wv1.onrender.com/api/auth/logout",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gọi API đăng xuất:", error);
      throw new Error(
        "Yêu cầu đăng xuất đến server thất bại, nhưng sẽ tiếp tục đăng xuất ở client."
      );
    }
  },

  forgotPasswordSendOtp: async (
    email: string
  ): Promise<{ message: string }> => {
    try {
      const response = await axios.post<{ message: string }>(
        "https://luanvan-7wv1.onrender.com/api/forgot-password/send-otp",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Gửi OTP thất bại. Vui lòng kiểm tra lại email.");
    }
  },

  forgotPasswordVerifyOtp: async (
    email: string,
    otp: string
  ): Promise<{ message: string }> => {
    try {
      const response = await axios.post<{ message: string }>(
        "https://luanvan-7wv1.onrender.com/api/forgot-password/verify-otp",
        { email, otp },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Xác thực OTP thất bại. Vui lòng kiểm tra lại OTP.");
    }
  },

  forgotPasswordReset: async (
    email: string,
    new_password: string,
    new_password_confirmation: string
  ): Promise<{ message: string }> => {
    try {
      const response = await axios.post<{ message: string }>(
        "https://luanvan-7wv1.onrender.com/api/forgot-password/reset",
        { email, new_password, new_password_confirmation },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    }
  },

  updateUser: async (
    credentials: UpdateUserCredentials
  ): Promise<UpdateUserResponse> => {
    try {
      const response = await axios.put<UpdateUserResponse>(
        "https://luanvan-7wv1.onrender.com/api/auth/update",
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        "Cập nhật thông tin thất bại. Vui lòng kiểm tra lại thông tin."
      );
    }
  },
};

export default authApi;
