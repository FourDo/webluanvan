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
        {}, // Logout thường không cần gửi body
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Rất quan trọng để gửi cookie/token lên server
        }
      );
      return response.data;
    } catch (error) {
      // Ngay cả khi server báo lỗi (ví dụ token đã hết hạn),
      // chúng ta vẫn muốn tiếp tục quá trình đăng xuất ở client.
      // Vì vậy, có thể ném ra lỗi để component xử lý hoặc trả về một giá trị mặc định.
      console.error("Lỗi khi gọi API đăng xuất:", error);
      throw new Error(
        "Yêu cầu đăng xuất đến server thất bại, nhưng sẽ tiếp tục đăng xuất ở client."
      );
    }
  },
};

export default authApi;
