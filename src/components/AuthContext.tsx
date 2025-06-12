import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../API/authApi";

interface Client {
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

interface AuthContextType {
  isLoggedIn: boolean;
  client: Client | null;
  setIsLoggedIn: (value: boolean) => void;
  setClient: (client: Client | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  client: null,
  setIsLoggedIn: () => {},
  setClient: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("user_token")
  );
  const [client, setClient] = useState<Client | null>(
    localStorage.getItem("user_data")
      ? JSON.parse(localStorage.getItem("user_data")!)
      : null
  );
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout("user");
      setIsLoggedIn(false);
      setClient(null);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      localStorage.removeItem("user_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("client_rememberMe");
      localStorage.removeItem("client_rememberMeEmail");
      setIsLoggedIn(false);
      setClient(null);
      navigate("/", { replace: true });
    }
  };

  // Phát hiện khi localStorage bị xóa
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        (e.key === "user_token" || e.key === "user_data") &&
        !localStorage.getItem("user_token")
      ) {
        setIsLoggedIn(false);
        setClient(null);
        navigate("/", { replace: true });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  // Kiểm tra trạng thái cookie định kỳ
  const checkAuthStatus = async () => {
    try {
      const response = await fetch(
        "https://luanvan-7wv1.onrender.com/api/auth/check-auth",
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
          },
        }
      );
      const data = await response.json();
      if (!data.isAuthenticated) {
        localStorage.removeItem("user_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("client_rememberMe");
        localStorage.removeItem("client_rememberMeEmail");
        setIsLoggedIn(false);
        setClient(null);
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái đăng nhập:", error);
      localStorage.removeItem("user_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("client_rememberMe");
      localStorage.removeItem("client_rememberMeEmail");
      setIsLoggedIn(false);
      setClient(null);
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 10000); // Kiểm tra mỗi 10 giây
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        client,
        setIsLoggedIn,
        setClient,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
