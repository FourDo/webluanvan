import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute: React.FC = () => {
  const userDataString = localStorage.getItem("user");
  let isAuthenticated = false;

  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      isAuthenticated = !!userData; // Kiểm tra userData tồn tại
    } catch (e) {
      console.error("Lỗi parse dữ liệu user:", e);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/dangnhap" replace />;
};

export default PrivateRoute;
