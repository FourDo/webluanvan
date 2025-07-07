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
  console.log("useAuth - Context:", context); // Debug
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Đồng bộ trạng thái với cookie khi khởi tạo
  useEffect(() => {
    const storedUser = Cookies.get("admin_data");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("userData từ cookie:", userData);
        setUser(userData);
        setIsAdmin(userData.vai_tro === "admin");
        console.log("isAdmin sau khi set:", userData.vai_tro === "admin"); // Debug
      } catch (error) {
        console.error("Lỗi phân tích admin_data:", error);
        logout();
      }
    } else {
      console.log("Không tìm thấy cookie admin_data, gọi logout");
      logout();
    }
  }, []);

  // Kiểm tra định kỳ cookie để phát hiện xóa thủ công
  useEffect(() => {
    const checkCookies = () => {
      const storedUser = Cookies.get("admin_data");

      if (!storedUser) {
        logout();
      }
    };

    const interval = setInterval(checkCookies, 5000); // Kiểm tra mỗi 1 giây
    return () => clearInterval(interval);
  }, []);

  const login = (userData: any) => {
    console.log("Lưu userData vào cookie:", userData); // Debug
    setUser(userData);
    setIsAdmin(userData.vai_tro === "admin");
    Cookies.set("admin_data", JSON.stringify(userData), { expires: 7 });
    console.log("Cookie admin_data sau khi lưu:", Cookies.get("admin_data")); // Debug
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    Cookies.remove("admin_data");
    Cookies.remove("admin_rememberMe");
    Cookies.remove("admin_rememberMeEmail");
    // Không xóa token vì nó là HttpOnly, backend sẽ xử lý
  };

  const getToken = () => {
    return Cookies.get("token"); // Sẽ trả undefined do HttpOnly
  };

  return (
    <AuthContext.Provider value={{ isAdmin, user, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
