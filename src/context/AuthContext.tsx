import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";

interface AuthContextType {
  isAdmin: boolean;
  user: any;
  login: (userData: any) => void;
  logout: () => void;
  getToken: () => string | undefined;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  user: null,
  login: () => {},
  logout: () => {},
  getToken: () => undefined,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Đồng bộ trạng thái với cookie khi khởi tạo
  useEffect(() => {
    // Ưu tiên admin_data, nếu không có thì lấy user_data
    const storedAdmin = Cookies.get("admin_data");
    const storedUser = Cookies.get("user_data");

    if (storedAdmin) {
      try {
        const userData = JSON.parse(storedAdmin);
        setUser(userData);
        setIsAdmin(userData.vai_tro === "admin");
      } catch (error) {
        logout();
      }
    } else if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAdmin(false);
      } catch (error) {
        logout();
      }
    } else {
      logout();
    }
  }, []);

  // Kiểm tra định kỳ cookie để phát hiện xóa thủ công
  useEffect(() => {
    const checkCookies = () => {
      const storedAdmin = Cookies.get("admin_data");
      const storedUser = Cookies.get("user_data");
      if (!storedAdmin && !storedUser) {
        logout();
      }
    };

    const interval = setInterval(checkCookies, 5000);
    return () => clearInterval(interval);
  }, []);

  // Lưu user vào cookie đúng loại, KHÔNG set domain
  const login = (userData: any, token?: string) => {
    setUser(userData);
    setIsAdmin(userData.vai_tro === "admin");
    if (userData.vai_tro === "admin") {
      Cookies.set("admin_data", JSON.stringify(userData), {
        expires: 7,
        sameSite: "Lax",
        secure: true,
      });
      Cookies.remove("user_data");
    } else {
      Cookies.set("user_data", JSON.stringify(userData), {
        expires: 7,
        sameSite: "Lax",
        secure: true,
      });
      Cookies.remove("admin_data");
    }
    // Lưu token vào cookie nếu có
    if (token) {
      Cookies.set("token", token, {
        expires: 7,
        sameSite: "Lax",
        secure: true,
      });
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    Cookies.remove("admin_data");
    Cookies.remove("user_data");
    Cookies.remove("admin_rememberMe");
    Cookies.remove("admin_rememberMeEmail");
  };

  const getToken = () => {
    return Cookies.get("token");
  };

  return (
    <AuthContext.Provider value={{ isAdmin, user, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
