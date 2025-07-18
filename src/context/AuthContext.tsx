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
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

    // Đặt loading thành false sau khi đã check cookie
    setIsLoading(false);
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
  const login = (userData: any) => {
    setUser(userData);
    setIsAdmin(userData.vai_tro === "admin");
    setIsLoading(false);

    // Kiểm tra môi trường để set secure flag
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (userData.vai_tro === "admin") {
      Cookies.set("admin_data", JSON.stringify(userData), {
        expires: 7,
        sameSite: "Lax",
        secure: !isLocalhost,
      });
      Cookies.remove("user_data");
    } else {
      Cookies.set("user_data", JSON.stringify(userData), {
        expires: 7,
        sameSite: "Lax",
        secure: !isLocalhost,
      });
      Cookies.remove("admin_data");
    }

    console.log("✅ User data saved to cookies");
  };

  const logout = () => {
    console.log("🚪 AuthContext logout called");
    setUser(null);
    setIsAdmin(false);
    setIsLoading(false);
    Cookies.remove("admin_data");
    Cookies.remove("user_data");
    Cookies.remove("admin_rememberMe");
    Cookies.remove("admin_rememberMeEmail");
    console.log("✅ All cookies cleared");
  };

  return (
    <AuthContext.Provider value={{ isAdmin, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
