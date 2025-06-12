import axios from "axios";

interface LoginResponse {
  success: string;
  user: {
    ma_nguoi_dung: number;
    email: string;
    ho_ten: string;
    so_dien_thoai: string;
    dia_chi: string;
    vai_tro: string;
    google_id: string | null;
    reset_token_expiry: string | null;
    trang_thai: string;
    ngay_tao: string;
    ngay_cap_nhat: string;
  };
}

interface LogoutResponse {
  success: string;
}

interface LoginCredentials {
  email: string;
  mat_khau: string;
}

const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post<LoginResponse>(
        "https://luanvan-7wv1.onrender.com/api/auth/login",
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Để nhận cookie (token) từ phản hồi
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
          },
          withCredentials: true, // Để gửi cookie (token) cùng yêu cầu
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Đăng xuất thất bại. Vui lòng thử lại.");
    }
  },
};

export default authApi;
