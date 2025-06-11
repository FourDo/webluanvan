import axios from "axios";

// Define the interface for the user response
interface User {
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
}

// Define the interface for the API response
interface LoginResponse {
  success: string;
  user: User;
  token: string;
}

interface LogoutResponse {
  message: string;
}

export const login = async (credentials: {
  email: string;
  mat_khau: string;
  role?: string;
}): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(
      "https://luanvan-7wv1.onrender.com/api/auth/login",
      {
        email: credentials.email,
        mat_khau: credentials.mat_khau,
      },
      {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    // Kiểm tra vai trò nếu role được chỉ định
    if (credentials.role && response.data.user.vai_tro !== credentials.role) {
      throw new Error(
        `Tài khoản này không có quyền truy cập với vai trò ${credentials.role}`
      );
    }

    // Lưu token theo vai trò
    if (response.data.token) {
      const tokenKey =
        response.data.user.vai_tro === "admin" ? "admin_token" : "user_token";
      localStorage.setItem(tokenKey, response.data.token ?? ""); // Fallback to empty string
      console.log(`Stored ${tokenKey} in localStorage:`, response.data.token);
    }
    // Lưu thông tin người dùng theo vai trò
    const dataKey =
      response.data.user.vai_tro === "admin" ? "admin_data" : "user_data";
    localStorage.setItem(dataKey, JSON.stringify(response.data.user));

    return response.data;
  } catch (err: any) {
    console.error("Login error:", err.response?.data || err.message);
    throw new Error(
      err.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin hoặc cấu hình server."
    );
  }
};

export const logout = async (
  role: "user" | "admin"
): Promise<LogoutResponse> => {
  try {
    const tokenKey = role === "admin" ? "admin_token" : "user_token";
    const dataKey = role === "admin" ? "admin_data" : "user_data";
    const token = localStorage.getItem(tokenKey);

    const response = await axios.post<LogoutResponse>(
      "https://luanvan-7wv1.onrender.com/api/auth/logout",
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      }
    );

    // Xóa dữ liệu theo vai trò
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(dataKey);
    localStorage.removeItem(`${role}_rememberMe`);
    localStorage.removeItem(`${role}_rememberMeEmail`);

    return response.data;
  } catch (err: any) {
    console.error("Logout error:", err.response?.data || err.message);
    // Xóa dữ liệu client-side ngay cả khi API thất bại
    const tokenKey = role === "admin" ? "admin_token" : "user_token";
    const dataKey = role === "admin" ? "admin_data" : "user_data";
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(dataKey);
    localStorage.removeItem(`${role}_rememberMe`);
    localStorage.removeItem(`${role}_rememberMeEmail`);
    return { message: `Đăng xuất ${role} thành công (client-side)` };
  }
};
